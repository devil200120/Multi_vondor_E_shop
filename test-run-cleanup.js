const axios = require('axios');

async function runCleanupOrphanedProducts() {
    try {
        console.log('Running cleanup for orphaned products...');
        
        const response = await axios.post('http://localhost:8000/api/v2/product/admin-cleanup-orphaned-products');
        
        console.log('Cleanup Response:', response.data);
        
        if (response.data.success) {
            console.log(`✅ Cleanup completed successfully!`);
            console.log(`Orphaned products deleted: ${response.data.deletedCount || 0}`);
            console.log(`Products fixed: ${response.data.fixedCount || 0}`);
        }
        
        // Now check the updated state
        console.log('\n--- Checking updated product state ---');
        const productsResponse = await axios.get('http://localhost:8000/api/v2/product/get-all-products');
        
        if (productsResponse.data && productsResponse.data.products) {
            console.log(`\nRemaining products: ${productsResponse.data.products.length}`);
            
            productsResponse.data.products.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name} - isSellerProduct: ${product.isSellerProduct} - shop: ${product.shop ? product.shop.name : 'No shop'}`);
            });
        }
        
    } catch (error) {
        console.error('Error running cleanup:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

runCleanupOrphanedProducts();