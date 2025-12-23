const express = require("express");
const router = express.Router();
const LegalPage = require("../model/legalPage");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { uploadDocument } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const mammoth = require("mammoth"); // For Word document processing
const fs = require("fs");
const path = require("path");

// Get all legal pages (public)
router.get(
  "/get-all-pages",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const pages = await LegalPage.find({ isActive: true })
        .select("pageType title metaDescription lastPublished")
        .sort({ pageType: 1 });

      res.status(200).json({
        success: true,
        pages,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get specific legal page by type (public)
router.get(
  "/get-page/:pageType",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { pageType } = req.params;
      
      const page = await LegalPage.findOne({ 
        pageType: pageType, 
        isActive: true 
      }).populate("lastUpdatedBy", "name email");

      if (!page) {
        return next(new ErrorHandler("Page not found", 404));
      }

      res.status(200).json({
        success: true,
        page,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get all legal pages for admin management
router.get(
  "/admin-get-all-pages",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const pages = await LegalPage.find()
        .populate("lastUpdatedBy", "name email")
        .sort({ pageType: 1 });

      res.status(200).json({
        success: true,
        pages,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get specific legal page for admin editing
router.get(
  "/admin-get-page/:pageType",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { pageType } = req.params;
      
      const page = await LegalPage.findOne({ pageType: pageType })
        .populate("lastUpdatedBy", "name email");

      if (!page) {
        return next(new ErrorHandler("Page not found", 404));
      }

      res.status(200).json({
        success: true,
        page,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Create or update legal page
router.post(
  "/admin-create-update-page",
  isAuthenticated,
  isAdmin("Admin"),
  uploadDocument.single("document"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        pageType,
        title,
        content,
        contentType,
        metaDescription,
        metaKeywords,
        isActive,
      } = req.body;

      let processedContent = content;
      let documentFile = null;

      // Process uploaded Word document if provided
      if (req.file) {
        try {
          if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // Configure mammoth with better style mapping to preserve formatting
            const mammothOptions = {
              buffer: req.file.buffer,
              styleMap: [
                // Preserve headings with proper styling
                "p[style-name='Heading 1'] => h1:fresh",
                "p[style-name='Heading 2'] => h2:fresh", 
                "p[style-name='Heading 3'] => h3:fresh",
                "p[style-name='Heading 4'] => h4:fresh",
                "p[style-name='Heading 5'] => h5:fresh",
                "p[style-name='Heading 6'] => h6:fresh",
                
                // Preserve text alignment
                "p[style-name='Center'] => p.text-center:fresh",
                "p[style-name='Right'] => p.text-right:fresh",
                "p[style-name='Justify'] => p.text-justify:fresh",
                
                // Preserve lists
                "p[style-name='List Paragraph'] => li:fresh",
                
                // Preserve bold and italic
                "b => strong",
                "i => em",
                
                // Preserve underline
                "u => span.underline",
                
                // Map common Word styles to HTML equivalents
                "p[style-name='Title'] => h1.title:fresh",
                "p[style-name='Subtitle'] => h2.subtitle:fresh",
                "p[style-name='Quote'] => blockquote:fresh",
                "p[style-name='Caption'] => p.caption:fresh",
                
                // Default paragraph mapping with better styling
                "p => p:fresh"
              ],
              
              // Transform functions to preserve more formatting
              transformDocument: mammoth.transforms.paragraph(function(paragraph) {
                // Preserve text alignment from Word
                if (paragraph.alignment) {
                  paragraph.styleName = paragraph.alignment;
                }
                return paragraph;
              }),
              
              // Include embedded styles
              includeEmbeddedStyleMap: true,
              
              // Include default styles
              includeDefaultStyleMap: true
            };

            // Process Word document to extract HTML content with better formatting
            const result = await mammoth.convertToHtml(mammothOptions);
            
            // Post-process the HTML to add more styling
            let enhancedContent = result.value;
            
            // Add CSS classes for better styling
            enhancedContent = enhancedContent
              // Add spacing to paragraphs
              .replace(/<p>/g, '<p style="margin-bottom: 1em; line-height: 1.6;">')
              // Style headings
              .replace(/<h1>/g, '<h1 style="font-size: 2em; font-weight: bold; margin: 1.5em 0 1em 0; line-height: 1.2;">')
              .replace(/<h2>/g, '<h2 style="font-size: 1.7em; font-weight: bold; margin: 1.3em 0 0.8em 0; line-height: 1.3;">')
              .replace(/<h3>/g, '<h3 style="font-size: 1.5em; font-weight: bold; margin: 1.2em 0 0.7em 0; line-height: 1.4;">')
              .replace(/<h4>/g, '<h4 style="font-size: 1.3em; font-weight: bold; margin: 1em 0 0.6em 0; line-height: 1.4;">')
              .replace(/<h5>/g, '<h5 style="font-size: 1.1em; font-weight: bold; margin: 1em 0 0.5em 0; line-height: 1.4;">')
              .replace(/<h6>/g, '<h6 style="font-size: 1em; font-weight: bold; margin: 1em 0 0.5em 0; line-height: 1.4;">')
              // Style lists
              .replace(/<ul>/g, '<ul style="margin: 1em 0; padding-left: 2em;">')
              .replace(/<ol>/g, '<ol style="margin: 1em 0; padding-left: 2em;">')
              .replace(/<li>/g, '<li style="margin-bottom: 0.5em; line-height: 1.5;">')
              // Style blockquotes
              .replace(/<blockquote>/g, '<blockquote style="margin: 1.5em 0; padding: 1em 1.5em; border-left: 4px solid #ccc; background-color: #f9f9f9; font-style: italic;">')
              // Add classes for alignment
              .replace(/class="text-center"/g, 'style="text-align: center;"')
              .replace(/class="text-right"/g, 'style="text-align: right;"')
              .replace(/class="text-justify"/g, 'style="text-align: justify;"')
              // Style strong and em
              .replace(/<strong>/g, '<strong style="font-weight: bold;">')
              .replace(/<em>/g, '<em style="font-style: italic;">')
              // Style underline spans
              .replace(/class="underline"/g, 'style="text-decoration: underline;"');
            
            processedContent = enhancedContent;
            
            // Save document info locally (not uploading to Cloudinary as it doesn't support .docx)
            const filename = `${pageType}-${Date.now()}-${req.file.originalname}`;
            const filepath = path.join(__dirname, '../uploads', filename);
            
            // Save file locally for backup
            await fs.promises.writeFile(filepath, req.file.buffer);

            documentFile = {
              filename: filename,
              originalname: req.file.originalname,
              mimetype: req.file.mimetype,
              size: req.file.size,
              localPath: filepath,
              uploadedAt: new Date()
            };

            console.log(`Document processed successfully: ${req.file.originalname}`);
            console.log(`HTML content extracted, length: ${processedContent.length} characters`);
          } else {
            return next(new ErrorHandler("Only Word documents (.docx) are supported", 400));
          }
        } catch (uploadError) {
          console.error("Document processing error:", uploadError);
          return next(new ErrorHandler(`Failed to process document: ${uploadError.message}`, 400));
        }
      }

      // Check if page exists
      let page = await LegalPage.findOne({ pageType });

      if (page) {
        // Update existing page
        if (page.documentFile?.localPath && documentFile) {
          // Delete old document from local storage
          try {
            if (fs.existsSync(page.documentFile.localPath)) {
              await fs.promises.unlink(page.documentFile.localPath);
              console.log(`Deleted old document: ${page.documentFile.localPath}`);
            }
          } catch (deleteError) {
            console.error("Error deleting old document:", deleteError);
          }
        }

        page.title = title;
        page.content = processedContent;
        page.contentType = contentType || 'html';
        page.metaDescription = metaDescription;
        page.metaKeywords = metaKeywords ? metaKeywords.split(',').map(k => k.trim()) : [];
        page.isActive = isActive !== undefined ? isActive : true;
        page.lastUpdatedBy = req.user._id;
        page.version += 1;
        page.lastPublished = new Date();
        
        if (documentFile) {
          page.documentFile = documentFile;
        }

        await page.save();
      } else {
        // Create new page
        page = await LegalPage.create({
          pageType,
          title,
          content: processedContent,
          contentType: contentType || 'html',
          metaDescription,
          metaKeywords: metaKeywords ? metaKeywords.split(',').map(k => k.trim()) : [],
          isActive: isActive !== undefined ? isActive : true,
          lastUpdatedBy: req.user._id,
          documentFile,
        });
      }

      const populatedPage = await LegalPage.findById(page._id)
        .populate("lastUpdatedBy", "name email");

      res.status(200).json({
        success: true,
        message: page.version === 1 ? "Legal page created successfully" : "Legal page updated successfully",
        page: populatedPage,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Delete legal page
router.delete(
  "/admin-delete-page/:pageType",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { pageType } = req.params;

      const page = await LegalPage.findOne({ pageType });
      if (!page) {
        return next(new ErrorHandler("Page not found", 404));
      }

      // Delete document from local storage if exists
      if (page.documentFile?.localPath) {
        try {
          if (fs.existsSync(page.documentFile.localPath)) {
            await fs.promises.unlink(page.documentFile.localPath);
            console.log(`Deleted document: ${page.documentFile.localPath}`);
          }
        } catch (deleteError) {
          console.error("Error deleting document from local storage:", deleteError);
        }
      }

      await LegalPage.deleteOne({ pageType });

      res.status(200).json({
        success: true,
        message: "Legal page deleted successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Toggle page active status
router.put(
  "/admin-toggle-status/:pageType",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { pageType } = req.params;

      const page = await LegalPage.findOne({ pageType });
      if (!page) {
        return next(new ErrorHandler("Page not found", 404));
      }

      page.isActive = !page.isActive;
      page.lastUpdatedBy = req.user._id;
      await page.save();

      const populatedPage = await LegalPage.findById(page._id)
        .populate("lastUpdatedBy", "name email");

      res.status(200).json({
        success: true,
        message: `Page ${page.isActive ? 'activated' : 'deactivated'} successfully`,
        page: populatedPage,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get page statistics
router.get(
  "/admin-page-stats",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const totalPages = await LegalPage.countDocuments();
      const activePages = await LegalPage.countDocuments({ isActive: true });
      const inactivePages = await LegalPage.countDocuments({ isActive: false });
      
      const recentUpdates = await LegalPage.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("lastUpdatedBy", "name")
        .select("pageType title updatedAt lastUpdatedBy");

      res.status(200).json({
        success: true,
        stats: {
          total: totalPages,
          active: activePages,
          inactive: inactivePages,
          recentUpdates,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Migration endpoint to split terms-of-service into buyer and seller terms
router.post(
  "/admin-migrate-terms",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Check if old terms-of-service exists
      const oldTerms = await LegalPage.findOne({ pageType: "terms-of-service" });
      
      if (!oldTerms) {
        return next(new ErrorHandler("No existing terms-of-service found to migrate", 404));
      }

      // Check if buyer and seller terms already exist
      const buyerTerms = await LegalPage.findOne({ pageType: "buyer-terms-of-service" });
      const sellerTerms = await LegalPage.findOne({ pageType: "seller-terms-of-service" });

      const results = [];

      // Create buyer terms if doesn't exist
      if (!buyerTerms) {
        const buyerTermsData = {
          pageType: "buyer-terms-of-service",
          title: "Buyer Terms of Service",
          content: oldTerms.content,
          contentType: oldTerms.contentType,
          lastUpdatedBy: req.user._id,
          metaDescription: "Terms and conditions for buyers on our platform",
          metaKeywords: ["buyer", "terms", "conditions", "purchase", "rights"],
          isActive: true,
        };

        const newBuyerTerms = await LegalPage.create(buyerTermsData);
        results.push({ type: "buyer-terms-of-service", created: true, id: newBuyerTerms._id });
      } else {
        results.push({ type: "buyer-terms-of-service", created: false, message: "Already exists" });
      }

      // Create seller terms if doesn't exist
      if (!sellerTerms) {
        const sellerTermsData = {
          pageType: "seller-terms-of-service",
          title: "Seller Terms of Service",
          content: oldTerms.content,
          contentType: oldTerms.contentType,
          lastUpdatedBy: req.user._id,
          metaDescription: "Terms and conditions for sellers on our platform",
          metaKeywords: ["seller", "terms", "conditions", "vendor", "marketplace"],
          isActive: true,
        };

        const newSellerTerms = await LegalPage.create(sellerTermsData);
        results.push({ type: "seller-terms-of-service", created: true, id: newSellerTerms._id });
      } else {
        results.push({ type: "seller-terms-of-service", created: false, message: "Already exists" });
      }

      res.status(200).json({
        success: true,
        message: "Terms migration completed",
        results,
        note: "Original terms-of-service page preserved for reference",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;