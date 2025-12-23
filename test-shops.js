const axios = require('axios');

async function testShops() {
    try {
        console.log('Getting all shops (without admin auth)...');
        
        // Try to get shop information directly by making a simple call
        // Let's check what shops exist by their IDs from our products
        const shopIds = [
            '690f54bc2cc95bb72601eb34', // Manohar Shop
            '690e488ef17aabd5fcf2492c', // Gandu Shop (might be deleted)
            '6908c45505ecedcdee67efa1'  // GanduShop (might be deleted)
        ];

        for (let shopId of shopIds) {
            try {
                const response = await axios.get(`http://localhost:8000/api/v2/shop/get-shop-info/${shopId}`);
                console.log(`Shop ${shopId}:`, response.data.shop ? response.data.shop.name : 'Not found');
            } catch (error) {
                console.log(`Shop ${shopId}: DELETED or NOT FOUND`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testShops();