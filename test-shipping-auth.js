const axios = require('axios');

const testShippingAuth = async () => {
  try {
    console.log('Testing product shipping authentication fix...');
    
    // Test the endpoint that was having issues
    const server = 'http://localhost:8000/api/v2';
    
    // First, let's test if the server is running
    try {
      const healthCheck = await axios.get(`${server}/shop/getSeller`, {
        withCredentials: true,
        timeout: 5000
      });
      console.log('✅ Server is responding');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Server is running - got expected 401 (not logged in)');
      } else {
        console.log('❌ Server connection issue:', error.message);
        return;
      }
    }

    console.log('\n🔧 The following fixes have been applied:');
    console.log('1. Removed duplicate authentication (isAuthenticated + isSeller) from shipping routes');
    console.log('2. Fixed cookie settings for development environment:');
    console.log('   - sameSite: "lax" (instead of "none") in development');
    console.log('   - secure: false (instead of true) in development');
    console.log('3. Applied consistent cookie settings across all logout routes');

    console.log('\n📝 To test the fix:');
    console.log('1. Restart your backend server');
    console.log('2. Login as a seller in Chrome');
    console.log('3. Try to update product shipping configuration');
    console.log('4. The 401 "Please login to continue" error should be resolved');

    console.log('\n🔍 Routes affected:');
    console.log('- PUT /api/v2/product/update-shipping/:productId');
    console.log('- PUT /api/v2/product/bulk-update-shipping');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testShippingAuth();