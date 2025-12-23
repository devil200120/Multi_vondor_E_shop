const axios = require('axios');

async function testSellerProductCreation() {
    try {
        console.log('Testing seller product creation...');
        console.log('Getting all products to check current state...');
        
        const response = await axios.get('http://localhost:8000/api/v2/product/get-all-products');
        
        if (response.data && response.data.products) {
            console.log(`\nFound ${response.data.products.length} products:`);
            
            response.data.products.forEach((product, index) => {
                console.log(`\nProduct ${index + 1}: ${product.name}`);
                console.log(`  ID: ${product._id}`);
                console.log(`  isSellerProduct: ${product.isSellerProduct}`);
                console.log(`  shopId: ${product.shopId}`);
                console.log(`  sellerShop: ${product.sellerShop}`);
                console.log(`  shop: ${product.shop ? product.shop.name : 'No shop name'}`);
                
                // Check if this product has a valid shop
                if (product.shopId && product.shopId !== 'admin') {
                    if (product.isSellerProduct === true) {
                        console.log(`  ✅ SELLER PRODUCT (correctly tagged)`);
                    } else if (product.isSellerProduct === false) {
                        console.log(`  ⚠️ ADMIN PRODUCT (check if correct)`);
                    }
                } else if (product.shopId === 'admin') {
                    console.log(`  ✅ ADMIN PRODUCT (platform admin)`);
                }
                console.log('---');
            });
            
            // Summary
            const sellerProducts = response.data.products.filter(p => p.isSellerProduct === true);
            const adminProducts = response.data.products.filter(p => p.isSellerProduct === false);
            
            console.log(`\n📊 SUMMARY:`);
            console.log(`Total Products: ${response.data.products.length}`);
            console.log(`Seller Products: ${sellerProducts.length}`);
            console.log(`Admin Products: ${adminProducts.length}`);
            
        } else {
            console.log('No products found or unexpected response format');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

testSellerProductCreation();