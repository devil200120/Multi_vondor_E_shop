const multer = require("multer");
const path = require("path");

// Use memory storage for Cloudinary uploads
const storage = multer.memoryStorage();

// Alternative disk storage for local development/backup
const diskStorage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, path.join(__dirname, "./uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.originalname.split(".")[0];
    const extension = path.extname(file.originalname);
    cb(null, filename + "-" + uniqueSuffix + extension);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed!'), false);
  }
};

// File filter for documents (Word, PDF, etc.)
const documentFilter = (req, file, cb) => {
  // Allow Word documents and PDFs
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/pdf', // .pdf
    'text/plain' // .txt
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Word documents (.docx, .doc), PDF files, and text files are allowed!'), false);
  }
};

// Primary upload configuration using memory storage for Cloudinary
exports.upload = multer({ 
  storage: storage, // Use memory storage
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
});

// Create separate upload handlers for specific field names
exports.uploadFields = multer({ 
  storage: storage, // Use memory storage
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]);

// Disk storage version for local development if needed
exports.uploadToDisk = multer({ 
  storage: diskStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  }
});

// Document upload configuration for legal pages
exports.uploadDocument = multer({
  storage: storage, // Use memory storage for Cloudinary
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for documents
  }
});

// Document upload to disk (backup option)
exports.uploadDocumentToDisk = multer({
  storage: diskStorage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for documents
  }
});
