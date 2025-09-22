const mongoose = require('mongoose');
const User = require('../model/user');
const Shop = require('../model/shop');
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

// Migration function to update existing users with avatar structure
const migrateUserAvatars = async () => {
  try {
    console.log('Starting user avatar migration...');
    
    // Find all users with old avatar format (string)
    const users = await User.find({ 
      avatar: { $type: 'string' }
    });

    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      const updateData = {
        avatar: {
          url: user.avatar.startsWith('http') ? user.avatar : `${process.env.BACKEND_URL || 'http://localhost:8000'}/uploads/${user.avatar}`,
          public_id: `migrated_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      };

      await User.findByIdAndUpdate(user._id, updateData);
      console.log(`Migrated user avatar: ${user.name} (ID: ${user._id})`);
    }

    console.log('User avatar migration completed successfully');
  } catch (error) {
    console.error('User avatar migration error:', error);
  }
};

// Migration function to update existing shops with avatar structure
const migrateShopAvatars = async () => {
  try {
    console.log('Starting shop avatar migration...');
    
    // Find all shops with old avatar format (string)
    const shops = await Shop.find({ 
      avatar: { $type: 'string' }
    });

    console.log(`Found ${shops.length} shops to migrate`);

    for (const shop of shops) {
      const updateData = {
        avatar: {
          url: shop.avatar.startsWith('http') ? shop.avatar : `${process.env.BACKEND_URL || 'http://localhost:8000'}/uploads/${shop.avatar}`,
          public_id: `migrated_shop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      };

      await Shop.findByIdAndUpdate(shop._id, updateData);
      console.log(`Migrated shop avatar: ${shop.name} (ID: ${shop._id})`);
    }

    console.log('Shop avatar migration completed successfully');
  } catch (error) {
    console.error('Shop avatar migration error:', error);
  }
};

// Run migration
const runAvatarMigration = async () => {
  await connectDB();
  await migrateUserAvatars();
  await migrateShopAvatars();
  mongoose.connection.close();
  console.log('Avatar migration completed and database connection closed');
};

// Check if this script is run directly
if (require.main === module) {
  runAvatarMigration();
}

module.exports = { migrateUserAvatars, migrateShopAvatars };