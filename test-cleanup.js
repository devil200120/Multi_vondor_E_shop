const axios = require('axios');

// Test the cleanup endpoint to see orphaned products
async function testCleanup() {
  try {
    console.log('Testing cleanup endpoint...');
    
    // You'll need to replace this with actual admin login token
    const response = await axios.delete('http://localhost:8000/api/v2/product/admin-cleanup-orphaned-products', {
      headers: {
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE', // Replace with actual admin token
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Cleanup result:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Also test getting all products to see what's showing
async function getAllProducts() {
  try {
    console.log('\nGetting all products...');
    
    const response = await axios.get('http://localhost:8000/api/v2/product/get-all-products');
    
    console.log(`Found ${response.data.products.length} products`);
    
    // Show details of products with potential shop issues
    response.data.products.forEach((product, index) => {
      console.log(`Product ${index + 1}: ${product.name}`);
      console.log(`  ID: ${product._id}`);
      console.log(`  isSellerProduct: ${product.isSellerProduct}`);
      console.log(`  shopId: ${product.shopId}`);
      console.log(`  sellerShop: ${product.sellerShop ? product.sellerShop.name : 'null'}`);
      console.log(`  shop: ${product.shop ? (product.shop.name || product.shop._id) : 'null'}`);
      console.log('---');
    });
  } catch (error) {
    console.error('Error getting products:', error.response?.data || error.message);
  }
}

// Run tests
getAllProducts();
// testCleanup(); // Uncomment this after adding admin token