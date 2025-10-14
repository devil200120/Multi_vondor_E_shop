const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dqnhnh4ui',
  api_key: process.env.CLOUDINARY_API_KEY || '268697133277383',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'FtESff8YUxx6em8eG5uvK-2_E4o'
});

// Helper function to detect file type
const getFileType = (filePath, mimetype) => {
  const extension = path.extname(filePath).toLowerCase();
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
  
  if (mimetype) {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
  }
  
  if (imageExtensions.includes(extension)) return 'image';
  if (videoExtensions.includes(extension)) return 'video';
  
  return 'unknown';
};

// Upload image to Cloudinary
const uploadImageToCloudinary = async (filePath, options = {}) => {
  try {
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'image',
      folder: 'products/images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'],
      ...options
    });
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error(`Cloudinary image upload error for ${filePath}:`, error);
    throw new Error(`Cloudinary image upload failed: ${error.message}`);
  }
};

// Upload video to Cloudinary
const uploadVideoToCloudinary = async (filePath, options = {}) => {
  try {
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 'products/videos',
      allowed_formats: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'],
      ...options
    });
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error(`Cloudinary video upload error for ${filePath}:`, error);
    throw new Error(`Cloudinary video upload failed: ${error.message}`);
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

// Auto-upload function that detects file type and uploads accordingly
const uploadFileToCloudinary = async (filePath, mimetype, options = {}) => {
  try {
    const fileType = getFileType(filePath, mimetype);
    
    console.log(`Detected file type: ${fileType} for file: ${filePath} (mimetype: ${mimetype})`);
    
    if (fileType === 'image') {
      return await uploadImageToCloudinary(filePath, options);
    } else if (fileType === 'video') {
      return await uploadVideoToCloudinary(filePath, options);
    } else {
      throw new Error(`Unsupported file type: ${fileType}. File: ${filePath}, Mimetype: ${mimetype}`);
    }
  } catch (error) {
    console.error(`Auto-upload error for ${filePath}:`, error);
    throw error;
  }
};

// Upload buffer to Cloudinary (for multer memory storage)
const uploadToCloudinary = async (buffer, options = {}) => {
  try {
    console.log('Uploading buffer to Cloudinary, size:', buffer?.length || 0);
    
    // Check if buffer is valid
    if (!buffer || buffer.length === 0) {
      throw new Error('Buffer is empty or invalid');
    }

    return new Promise((resolve, reject) => {
      // Set appropriate formats based on resource type
      let allowedFormats;
      if (options.resource_type === 'video') {
        allowedFormats = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
      } else {
        allowedFormats = options.allowed_formats || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: options.resource_type || 'image',
          folder: options.folder || 'uploads',
          allowed_formats: allowedFormats,
          ...options
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            console.log('Cloudinary upload success:', result.public_id);
            console.log('Full Cloudinary result:', JSON.stringify(result, null, 2));
            console.log('Secure URL:', result.secure_url);
            console.log('Public ID:', result.public_id);
            resolve({
              url: result.secure_url,
              public_id: result.public_id
            });
          }
        }
      );
      
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Cloudinary buffer upload error:', error);
    throw new Error(`Cloudinary buffer upload failed: ${error.message}`);
  }
};

module.exports = {
  cloudinary,
  uploadImageToCloudinary,
  uploadVideoToCloudinary,
  deleteFromCloudinary,
  uploadFileToCloudinary,
  uploadToCloudinary, // Buffer upload function
  getFileType
};