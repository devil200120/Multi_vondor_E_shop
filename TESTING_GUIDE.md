# Vendor Business Model - Testing Guide

## 🚀 Quick Start

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```
**Expected Output:**
```
Server is running on http://localhost:8000
MongoDB connected successfully
```

### 2. Start the Frontend Server
```bash
cd frontend
npm start
```
**Expected Output:**
```
Compiled successfully!
Local: http://localhost:3000
```

---

## ✅ Backend API Testing

### Test 1: Check Subscription Routes
```bash
# Test if subscription endpoints are registered
curl http://localhost:8000/api/v2/subscription/plans
```
**Expected Response:**
```json
{
  "success": true,
  "plans": [
    {
      "name": "bronze",
      "price": { "monthly": 100, "quarterly": 270, "annual": 960 },
      "features": { "maxProducts": 5, "commission": "10%" }
    },
    ...
  ]
}
```

### Test 2: Check Commission Routes
```bash
# Test commission endpoint (requires authentication)
curl http://localhost:8000/api/v2/commission/seller/commissions
```

### Test 3: Check PayPal Configuration
Open `backend/config/.env` and verify:
```
PAYPAL_CLIENT_ID=AW3P72fNSIFlkCnT3gaKSxCKKaTL09YBLL3d45J5Uc7JaXCNrYJoUiza6OqL87Kj7Sg7UbufGwCrQ7yA
PAYPAL_SECRET=EH0vP4NgiaX9xhw8LDoZJaPkh6sw1lostSYjeQJQxjegPWyHlCYLQxlONQ11B03W3SrxzvKB6pD-gsdI
PAYPAL_API_URL=https://api-m.paypal.com
```

---

## 🎨 Frontend UI Testing

### Test 4: Subscription Plans Page
1. **Navigate to:** `http://localhost:3000/shop/subscriptions`
2. **What to Check:**
   - [ ] Four subscription plans displayed (Bronze, Silver, Gold, Revenue-Share)
   - [ ] Pricing visible for each plan
   - [ ] Features list shown
   - [ ] "Select Plan" or "Current Plan" button visible
   - [ ] Billing cycle selector (Monthly/Quarterly/Annual)
   - [ ] Discount badges showing (10% quarterly, 20% annual)

### Test 5: PayPal Payment Integration
1. Click "Select Plan" on any subscription
2. **What to Check:**
   - [ ] PayPal buttons load correctly
   - [ ] Billing summary shows correct amount
   - [ ] PayPal sandbox/live environment accessible
   - [ ] Payment completes successfully
   - [ ] Redirects to success page after payment

### Test 6: Commission Dashboard
1. **Navigate to:** `http://localhost:3000/dashboard-commission`
2. **What to Check:**
   - [ ] Total earnings displayed
   - [ ] Platform fee (10%) calculated
   - [ ] Net payout (90%) shown
   - [ ] Commission history table with orders
   - [ ] Status indicators (pending/paid/refunded)
   - [ ] Revenue share minimum ($25) warning if applicable

### Test 7: Inventory Alerts Page
1. **Navigate to:** `http://localhost:3000/dashboard/inventory-alerts`
2. **What to Check:**
   - [ ] Critical alerts section (≤10% stock)
   - [ ] Low stock alerts section (≤20% stock)
   - [ ] Product cards with stock percentages
   - [ ] "Update Stock" button functional
   - [ ] Alert icons (🔴 critical, 🟡 low)
   - [ ] Progress bars showing stock levels

### Test 8: Review Management (Seller)
1. **Navigate to:** `http://localhost:3000/dashboard-reviews`
2. **What to Check:**
   - [ ] Pending reviews list (awaiting admin approval)
   - [ ] Approved reviews list
   - [ ] "Reply" button on each review
   - [ ] Verified purchase badges
   - [ ] Star ratings displayed
   - [ ] Reply form submission works

### Test 9: Admin Subscription Management
1. **Navigate to:** `http://localhost:3000/admin-subscriptions` (admin only)
2. **What to Check:**
   - [ ] All sellers list with subscription details
   - [ ] Filter by plan type
   - [ ] Search by seller name
   - [ ] Subscription status (active/expired/cancelled)
   - [ ] Revenue share tracking
   - [ ] Cancel subscription button

### Test 10: Admin Review Approval
1. **Navigate to:** `http://localhost:3000/admin/reviews` (admin only)
2. **What to Check:**
   - [ ] Pending reviews list
   - [ ] Approve/Reject buttons
   - [ ] Verified purchase indicator
   - [ ] Review details (rating, comment, product)
   - [ ] Bulk actions available

---

## 🔍 Database Verification

### Test 11: Check MongoDB Collections
```javascript
// Connect to MongoDB and run:
db.subscriptions.findOne()
db.commissions.findOne()
db.shops.findOne({ subscriptionPlan: { $exists: true } })
db.products.findOne({ 'inventoryAlerts': { $exists: true } })
```

### Test 12: Verify Schema Fields

**Shop Model:**
```javascript
{
  subscriptionPlan: 'bronze' | 'silver' | 'gold' | 'revenue-share',
  currentSubscription: ObjectId (references Subscription),
  revenueShare: {
    monthlyMinimum: 25,
    isPaid: false,
    currentMonthRevenue: 0
  },
  paypalEmail: 'seller@example.com',
  paypalMerchantId: 'MERCHANT123'
}
```

**Product Model:**
```javascript
{
  inventoryAlerts: {
    lowStockThreshold: 20,
    criticalStockThreshold: 10,
    baselineStock: 100,
    isLowStock: false,
    isCriticalStock: false,
    lastAlertSent: Date
  },
  reviews: [{
    isVerifiedPurchase: true,
    isApprovedByAdmin: true,
    vendorReply: { text: '...', createdAt: Date },
    orderId: ObjectId
  }]
}
```

---

## 🐛 Common Issues & Fixes

### Issue 1: Backend Server Won't Start
**Error:** `Error: Cannot find module 'axios'`
**Fix:**
```bash
cd backend
npm install axios
npm run dev
```

### Issue 2: PayPal Buttons Not Loading
**Causes:**
- PayPal credentials not in `.env`
- `@paypal/react-paypal-js` package missing
**Fix:**
```bash
cd frontend
npm install @paypal/react-paypal-js
```
Then verify `.env` has PayPal credentials.

### Issue 3: Routes Not Found (404)
**Cause:** Routes not imported in `App.js`
**Fix:** Verify in `frontend/src/App.js`:
```javascript
import SubscriptionPlansPage from './pages/SubscriptionPlansPage';
import CommissionDashboardPage from './pages/CommissionDashboardPage';
// ... etc
```

### Issue 4: API Endpoints Return 404
**Cause:** Routes not registered in `backend/server.js`
**Fix:** Verify these lines exist:
```javascript
const subscription = require("./routes/subscription");
const commission = require("./routes/commission");
app.use("/api/v2/subscription", subscription);
app.use("/api/v2/commission", commission);
```

### Issue 5: Database Connection Error
**Error:** `MongooseServerSelectionError`
**Fix:** Check `backend/config/.env`:
```
DB_URL=mongodb://localhost:27017/your_database_name
# or for MongoDB Atlas:
DB_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

---

## 📋 Testing Checklist

### Backend (API)
- [ ] Server starts without errors
- [ ] Subscription routes accessible
- [ ] Commission routes accessible
- [ ] PayPal access token generation works
- [ ] Database models created correctly
- [ ] Middleware authentication works

### Frontend (UI)
- [ ] App compiles without errors
- [ ] All new pages render
- [ ] PayPal integration loads
- [ ] API calls execute successfully
- [ ] Navigation between pages works
- [ ] Forms submit data correctly
- [ ] Toasts show success/error messages

### Integration
- [ ] Subscription creation with PayPal
- [ ] Payment capture and verification
- [ ] Commission calculation on orders
- [ ] Inventory alerts trigger correctly
- [ ] Review submission and approval flow
- [ ] Admin can manage subscriptions
- [ ] Sellers see accurate commission data

---

## 🎯 User Flow Testing

### Seller Journey:
1. **Login** → Navigate to shop dashboard
2. **Subscriptions** → View plans → Select plan → Complete PayPal payment
3. **Commission Dashboard** → View earnings → Check payout status
4. **Inventory Alerts** → See low stock warnings → Update stock
5. **Reviews** → Read customer feedback → Reply to reviews

### Admin Journey:
1. **Login** → Navigate to admin dashboard
2. **Subscriptions** → View all seller subscriptions → Cancel if needed
3. **Reviews** → Approve/reject pending reviews → Monitor quality
4. **Orders** → Commission tracking → Verify 10/90 split

---

## 📊 Expected Data Flow

```
User Places Order
    ↓
Payment Captured (PayPal/PhonePe)
    ↓
Commission Created (10% platform, 90% seller)
    ↓
Inventory Decremented
    ↓
Stock Alert Check (20% low, 10% critical)
    ↓
Order Fulfillment
    ↓
Review Submission (verified purchase)
    ↓
Admin Approval
    ↓
Review Visible on Product Page
```

---

## 🔐 Authentication Testing

### Test Protected Routes:
1. Try accessing `/dashboard-commission` without login → Should redirect to login
2. Try accessing `/admin-subscriptions` as seller → Should show "Unauthorized"
3. Try accessing `/dashboard-reviews` as customer → Should show "Unauthorized"

---

## 💡 Pro Tips

1. **Use Browser DevTools:**
   - Open Network tab → Check API responses
   - Console tab → Look for errors
   - Redux DevTools → Monitor state changes

2. **Test with Different Roles:**
   - Create test accounts: admin, seller, customer
   - Verify permissions for each role

3. **Monitor Backend Logs:**
   - Watch `backend` terminal for API calls
   - Check for 500/400 errors

4. **Clear Browser Cache:**
   - If UI doesn't update, clear cache
   - Hard refresh: Ctrl+Shift+R (Win) or Cmd+Shift+R (Mac)

---

## 📞 Quick Verification Commands

```bash
# Check if backend is running
curl http://localhost:8000/api/v2/subscription/plans

# Check if frontend is accessible
curl http://localhost:3000

# Verify environment variables loaded
cd backend && node -e "require('dotenv').config({path:'./config/.env'}); console.log(process.env.PAYPAL_CLIENT_ID)"
```

---

## ✨ Success Indicators

You'll know the implementation is working when:

✅ Backend starts without errors  
✅ All API endpoints return 200 status  
✅ Frontend pages load without crashes  
✅ PayPal buttons render correctly  
✅ Subscriptions can be created and paid  
✅ Commission dashboard shows accurate data  
✅ Inventory alerts display correctly  
✅ Reviews can be submitted and approved  
✅ Admin panels are accessible and functional  

---

## 🆘 Need Help?

If you encounter issues:
1. Check the error messages in terminal
2. Review browser console for frontend errors
3. Verify all dependencies installed (`npm install`)
4. Ensure `.env` file has correct values
5. Restart both servers after changes
6. Check MongoDB connection is active

**File Locations:**
- Backend routes: `backend/routes/subscription.js`, `backend/routes/commission.js`
- Frontend pages: `frontend/src/pages/`
- Models: `backend/model/subscription.js`, `backend/model/commission.js`
- Controllers: `backend/controller/subscription.js`, `backend/controller/commission.js`
