const axios = require('axios');

async function fixOrphanedProducts() {
    try {
        console.log('Fixing orphaned products - updating isSellerProduct flag...');
        
        // Call the new fix ownership endpoint
        const response = await axios.put('http://localhost:8000/api/v2/product/admin-fix-product-ownership');
        
        if (response.data.success) {
            console.log('✅ Successfully fixed orphaned products!');
            console.log(`Updated ${response.data.updatedCount || 0} products`);
            console.log(`Removed ${response.data.removedCount || 0} products`);
            
            if (response.data.updatedProducts && response.data.updatedProducts.length > 0) {
                console.log('\nUpdated products:');
                response.data.updatedProducts.forEach(product => {
                    console.log(`- ${product.name} (${product._id}) - ${product.action}`);
                });
            }
            
            if (response.data.removedProducts && response.data.removedProducts.length > 0) {
                console.log('\nRemoved products:');
                response.data.removedProducts.forEach(product => {
                    console.log(`- ${product.name} (${product._id}) - shopId: ${product.shopId}`);
                });
            }
        } else {
            console.log('❌ Failed to fix orphaned products');
            console.log('Response:', response.data);
        }
        
        // Now test the results by getting all products again
        console.log('\n--- Checking products after fix ---');
        const productsResponse = await axios.get('http://localhost:8000/api/v2/product/get-all-products');
        
        if (productsResponse.data && productsResponse.data.products) {
            console.log(`Found ${productsResponse.data.products.length} products after fix`);
            productsResponse.data.products.forEach((product, index) => {
                console.log(`Product ${index + 1}: ${product.name}`);
                console.log(`  ID: ${product._id}`);
                console.log(`  isSellerProduct: ${product.isSellerProduct}`);
                console.log(`  shopId: ${product.shopId}`);
                console.log(`  shop: ${product.shop?.name || 'No shop name'}`);
                console.log('---');
            });
        }
        
    } catch (error) {
        console.error('Error fixing orphaned products:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

fixOrphanedProducts();