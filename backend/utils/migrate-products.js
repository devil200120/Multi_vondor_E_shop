const mongoose = require('mongoose');
const Product = require('../model/product');
require('dotenv').config({ path: './config/.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Migration function to update existing products
const migrateProducts = async () => {
  try {
    console.log('Starting product migration...');
    
    // Find all products with old image/video format (string arrays)
    const products = await Product.find({
      $or: [
        { 'images.0': { $type: 'string' } },
        { 'videos.0': { $type: 'string' } }
      ]
    });

    console.log(`Found ${products.length} products to migrate`);

    for (const product of products) {
      const updateData = {};

      // Migrate images if they're in old format (strings)
      if (product.images && product.images.length > 0 && typeof product.images[0] === 'string') {
        updateData.images = product.images.map(imageUrl => ({
          url: imageUrl.startsWith('http') ? imageUrl : `${process.env.BACKEND_URL || 'http://localhost:8000'}/uploads/${imageUrl}`,
          public_id: `migrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));
      }

      // Migrate videos if they're in old format (strings)
      if (product.videos && product.videos.length > 0 && typeof product.videos[0] === 'string') {
        updateData.videos = product.videos.map(videoUrl => ({
          url: videoUrl.startsWith('http') ? videoUrl : `${process.env.BACKEND_URL || 'http://localhost:8000'}/uploads/${videoUrl}`,
          public_id: `migrated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }));
      }

      if (Object.keys(updateData).length > 0) {
        await Product.findByIdAndUpdate(product._id, updateData);
        console.log(`Migrated product: ${product.name} (ID: ${product._id})`);
      }
    }

    console.log('Product migration completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  }
};

// Run migration
const runMigration = async () => {
  await connectDB();
  await migrateProducts();
  mongoose.connection.close();
  console.log('Migration completed and database connection closed');
};

// Check if this script is run directly
if (require.main === module) {
  runMigration();
}

module.exports = { migrateProducts };