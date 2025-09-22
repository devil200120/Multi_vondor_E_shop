const { uploadImageToCloudinary, uploadVideoToCloudinary } = require('./config/cloudinary');
const fs = require('fs');
const path = require('path');

// Test Cloudinary configuration
const testCloudinary = async () => {
  console.log('Testing Cloudinary configuration...');
  
  try {
    // Check if cloudinary config is loaded
    const cloudinary = require('cloudinary').v2;
    console.log('Cloudinary config:');
    console.log('Cloud name:', cloudinary.config().cloud_name);
    console.log('API key:', cloudinary.config().api_key);
    console.log('API secret:', cloudinary.config().api_secret ? 'Set' : 'Not set');
    
    // Test uploading a simple image if available
    const uploadsDir = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const imageFiles = files.filter(file => 
        file.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i)
      );
      
      if (imageFiles.length > 0) {
        const testFile = path.join(uploadsDir, imageFiles[0]);
        console.log(`Testing upload with file: ${testFile}`);
        
        const result = await uploadImageToCloudinary(testFile);
        console.log('Upload successful!');
        console.log('URL:', result.url);
        console.log('Public ID:', result.public_id);
      } else {
        console.log('No test images found in uploads directory');
      }
    } else {
      console.log('Uploads directory not found');
    }
    
  } catch (error) {
    console.error('Cloudinary test failed:', error.message);
    console.error('Full error:', error);
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  // Load environment variables
  require('dotenv').config({ path: './config/.env' });
  testCloudinary();
}

module.exports = { testCloudinary };