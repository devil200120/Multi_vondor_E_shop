// Test Admin Withdrawal API
// This script tests the admin withdrawal request endpoint

const axios = require('axios');

const testAdminWithdrawalAPI = async () => {
  console.log("=== TESTING ADMIN WITHDRAWAL API ===\n");
  
  const baseURL = process.env.BACKEND_URL || 'http://localhost:8000';
  const endpoint = `${baseURL}/api/v2/withdraw/get-all-withdraw-request`;
  
  console.log("🔗 Testing endpoint:", endpoint);
  
  try {
    // Test without authentication (should fail)
    console.log("\n1️⃣ Testing without authentication (should fail):");
    try {
      const response = await axios.get(endpoint);
      console.log("❌ Unexpected success:", response.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("✅ Correctly rejected unauthorized request:", error.response.status);
      } else {
        console.log("❓ Unexpected error:", error.response?.status, error.message);
      }
    }
    
    // Test endpoint accessibility
    console.log("\n2️⃣ Testing server connectivity:");
    try {
      const healthCheck = await axios.get(`${baseURL}/api/v2/health`, { timeout: 5000 });
      console.log("✅ Server is accessible");
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log("❌ Server not running or connection refused");
        console.log("   Make sure the backend server is running on port 8000");
        return;
      } else {
        console.log("✅ Server is accessible (health endpoint may not exist)");
      }
    }
    
    console.log("\n3️⃣ Route Analysis:");
    console.log("   Backend route: GET /api/v2/withdraw/get-all-withdraw-request");
    console.log("   Middleware: isAuthenticated, isAdmin('Admin')");
    console.log("   Controller: Returns Withdraw.find().sort({ createdAt: -1 })");
    
    console.log("\n🔍 DEBUGGING CHECKLIST:");
    console.log("✅ Check if backend server is running");
    console.log("✅ Check if admin is properly logged in");
    console.log("✅ Check browser console for detailed error messages");
    console.log("✅ Check if cookies are properly set");
    console.log("✅ Verify admin user role in database");
    
    console.log("\n💡 COMMON ISSUES:");
    console.log("1. Admin not logged in - Frontend should redirect to login");
    console.log("2. Cookie/session expired - Re-login required");  
    console.log("3. Role mismatch - User might not have Admin role");
    console.log("4. CORS issues - Check withCredentials setting");
    console.log("5. Database connection - Check MongoDB connection");
    
    console.log("\n🛠️ FRONTEND DEBUGGING:");
    console.log("- Open browser Developer Tools");
    console.log("- Go to Network tab");
    console.log("- Access admin withdrawal page");
    console.log("- Check the API request status and response");
    console.log("- Look for authentication headers and cookies");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
};

// Additional helper to check withdrawal model structure
const checkWithdrawalModel = () => {
  console.log("\n📊 WITHDRAWAL MODEL STRUCTURE:");
  console.log("Required fields:");
  console.log("- seller: Object (shop details)");
  console.log("- amount: Number");
  console.log("- status: String (enum: Processing, succeed, failed, etc.)");
  console.log("- createdAt: Date");
  console.log("- updatedAt: Date");
  
  console.log("\nOptional PhonePe fields:");
  console.log("- payoutTransactionId: String");
  console.log("- payoutMethod: String (bank, upi, manual)");
  console.log("- payoutStatus: String (pending, completed, failed)");
  console.log("- payoutError: String");
};

// Run tests
testAdminWithdrawalAPI();
checkWithdrawalModel();

console.log("\n" + "=".repeat(50));
console.log("🎯 NEXT STEPS:");
console.log("1. Run the backend server: npm start or node server.js");
console.log("2. Login as admin in the frontend");
console.log("3. Try accessing the withdrawal page");
console.log("4. Check browser console for error messages");
console.log("5. Use the refresh button we added to retry");
console.log("=".repeat(50));