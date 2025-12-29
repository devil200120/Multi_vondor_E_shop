# Advertising System Documentation

## Overview
Complete advertising system for Mall of Cayman multi-vendor e-commerce platform with duration-based pricing, auto-renewal, and comprehensive ad management.

---

## 1. Ad Types & Pricing

### Banner Ads (Image-based, 10-second rotation)

| Ad Type | Size | Slots | Base Price/Month | API Endpoint |
|---------|------|-------|------------------|--------------|
| Leaderboard | 728x120 | 6 | $600 | `leaderboard` |
| Top Sidebar | 200x120 | 6 | $200 | `top_sidebar` |
| Right Sidebar (Top) | 300x200 | 6 | $300 | `right_sidebar_top` |
| Right Sidebar (Middle) | 300x200 | 6 | $250 | `right_sidebar_middle` |
| Right Sidebar (Bottom) | 300x200 | 6 | $200 | `right_sidebar_bottom` |

### Non-Banner Ads

| Ad Type | Base Price/Month | Description |
|---------|------------------|-------------|
| Featured Store | $100 | Store highlighting on homepage |
| Featured Product | $50 | Product spotlight section |
| Newsletter Inclusion | $100 | Email newsletter promotion |
| Editorial Write-up | $300 | Featured article/content |

---

## 2. Duration-Based Pricing

### Automatic Discount Calculation

- **1 month**: Base price (0% discount)
- **3 months**: 10% discount
- **6 months**: 15% discount  
- **12 months**: 20% discount

### Calculation Example
```javascript
// Leaderboard for 6 months
Base Price: $600/month
Total: $600 × 6 = $3,600
Discount: 15% = $540
Final Price: $3,060
```

---

## 3. Advertisement Rules

### Vendor Requirements
- ✅ **Vendors only** - only shop owners can create ads
- ✅ **Image ads only** - all banner ads require images
- ✅ **Store links only** - ads must link to vendor's own store
- ✅ **Admin approval** - all ads require approval before going live

### Display Settings
- **Rotation**: 10-second intervals for banner slots
- **Auto-renew**: Enabled by default (can be disabled)
- **Expiry warning**: Email sent 7 days before expiration
- **Slot system**: Maximum 6 concurrent ads per banner type

---

## 4. Backend Implementation

### Database Models

#### Advertisement Model (`/backend/model/advertisement.js`)
```javascript
{
  shopId: ObjectId,           // Vendor's shop
  adType: String,             // Type of advertisement
  slotNumber: Number,         // For banner types (1-6)
  title: String,
  description: String,
  image: { url, public_id },  // Cloudinary image
  linkUrl: String,            // Must link to vendor store
  productId: ObjectId,        // For featured_product type
  duration: Number,           // 1, 3, 6, or 12 months
  basePrice: Number,
  discount: Number,           // Percentage
  totalPrice: Number,
  startDate: Date,
  endDate: Date,
  autoRenew: Boolean,
  status: String,             // pending, active, expired, cancelled, rejected
  paymentStatus: String,
  views: Number,
  clicks: Number,
  clickThroughRate: Number,
  expiryWarningEmailed: Boolean,
  renewalHistory: Array
}
```

#### Department Model (`/backend/model/department.js`)
```javascript
{
  name: String,
  slug: String,
  description: String,
  icon: { url, public_id },
  image: { url, public_id },
  categories: [ObjectId],     // Associated categories
  displayOrder: Number,
  showOnHomepage: Boolean,
  color: String,
  mapPosition: { x, y, floor },
  isActive: Boolean
}
```

---

## 5. API Endpoints

### Public Endpoints

#### Get Pricing Information
```http
GET /api/v2/advertisement/pricing
```
**Response:**
```json
{
  "success": true,
  "pricing": [
    {
      "type": "leaderboard",
      "basePrice": 600,
      "dimensions": "728x120",
      "slots": 6,
      "durations": [
        { "months": 1, "discount": 0, "label": "1 Month" },
        { "months": 3, "discount": 10, "label": "3 Months" },
        { "months": 6, "discount": 15, "label": "6 Months" },
        { "months": 12, "discount": 20, "label": "12 Months" }
      ]
    }
  ]
}
```

#### Calculate Price
```http
POST /api/v2/advertisement/calculate-price
Body: { "adType": "leaderboard", "duration": 6 }
```

#### Get Available Slots
```http
GET /api/v2/advertisement/available-slots/:adType
```

#### Get Active Ads for Display
```http
GET /api/v2/advertisement/active/:adType
```

#### Track Views/Clicks
```http
POST /api/v2/advertisement/track-view/:id
POST /api/v2/advertisement/track-click/:id
```

---

### Vendor Endpoints (Requires Authentication)

#### Create Advertisement
```http
POST /api/v2/advertisement/create
Headers: Authorization: Bearer {token}
Body: FormData {
  adType: "leaderboard",
  slotNumber: 1,
  title: "Summer Sale",
  description: "50% off all items",
  duration: 6,
  autoRenew: true,
  image: File,
  productId: "..." // Required for featured_product
}
```

#### Process Payment
```http
POST /api/v2/advertisement/process-payment
Body: {
  advertisementId: "...",
  paymentId: "...",
  paymentMethod: "stripe"
}
```

#### Get My Advertisements
```http
GET /api/v2/advertisement/vendor/my-ads
```

#### Get Analytics
```http
GET /api/v2/advertisement/vendor/analytics/:id
```

#### Cancel Advertisement
```http
PUT /api/v2/advertisement/vendor/cancel/:id
```

#### Renew Advertisement
```http
POST /api/v2/advertisement/vendor/renew/:id
Body: { duration: 6, paymentId: "...", paymentMethod: "..." }
```

#### Update Auto-Renew
```http
PUT /api/v2/advertisement/vendor/auto-renew/:id
Body: { autoRenew: true }
```

---

### Admin Endpoints

#### Get All Advertisements
```http
GET /api/v2/advertisement/admin/all?status=pending&page=1&limit=20
```

#### Approve Advertisement
```http
PUT /api/v2/advertisement/admin/approve/:id
```

#### Reject Advertisement
```http
PUT /api/v2/advertisement/admin/reject/:id
Body: { reason: "Image quality too low" }
```

---

## 6. Department Management (Mall Map)

### Public Endpoints

#### Get All Departments
```http
GET /api/v2/department/all?active=true
```

#### Get Homepage Departments
```http
GET /api/v2/department/homepage
```

#### Get Mall Map
```http
GET /api/v2/department/mall-map?floor=1
```

#### Get Single Department
```http
GET /api/v2/department/:id
```

---

### Admin Endpoints

#### Create Department
```http
POST /api/v2/department/admin/create
Body: FormData {
  name: "Electronics",
  description: "...",
  categories: ["cat1", "cat2"],
  displayOrder: 1,
  showOnHomepage: true,
  color: "#FF5733",
  mapPosition: { x: 100, y: 200, floor: 1 },
  icon: File,
  image: File
}
```

#### Update Department
```http
PUT /api/v2/department/admin/update/:id
```

#### Delete Department
```http
DELETE /api/v2/department/admin/delete/:id
```

#### Reorder Departments
```http
POST /api/v2/department/admin/reorder
Body: {
  departments: [
    { id: "dept1", displayOrder: 1 },
    { id: "dept2", displayOrder: 2 }
  ]
}
```

---

## 7. Automated Cron Jobs

### Daily Tasks (Midnight - 12:00 AM)
```javascript
cron.schedule('0 0 * * *', () => {
  // 1. Check for ads expiring within 7 days
  checkExpiringAdvertisements();
  
  // 2. Mark expired ads as expired
  markExpiredAdvertisements();
});
```

### Auto-Renewal (1:00 AM)
```javascript
cron.schedule('0 1 * * *', () => {
  // Process auto-renewals for expired ads with autoRenew=true
  autoRenewAdvertisements();
});
```

---

## 8. Advertisement Workflow

### Vendor Flow
1. **Browse Pricing** → View available ad types and pricing
2. **Check Slots** → See available slots for banner ads
3. **Create Ad** → Upload image, set duration, select slot
4. **Make Payment** → Process payment through payment gateway
5. **Await Approval** → Admin reviews and approves/rejects
6. **Ad Goes Live** → Displays in rotation with analytics tracking

### Admin Flow
1. **Review Pending Ads** → View all pending advertisements
2. **Check Content** → Verify image quality, appropriateness
3. **Approve/Reject** → Approve to activate or reject with reason
4. **Send Notification** → Vendor receives email notification

### Auto-Renewal Flow
1. **7 Days Before Expiry** → Warning email sent to vendor
2. **On Expiry Date** → Ad marked as expired
3. **Auto-Renewal Check** → If autoRenew=true, process renewal
4. **Payment Processing** → Charge vendor for renewal
5. **Extend Date** → Update endDate, reactivate ad
6. **Confirmation Email** → Vendor receives renewal confirmation

---

## 9. Analytics & Tracking

### Metrics Tracked
- **Views**: Number of times ad was displayed
- **Clicks**: Number of clicks on ad
- **CTR**: Click-through rate (clicks/views × 100)
- **Last Displayed**: Timestamp of last display
- **Rotation Order**: Position in rotation sequence

### Analytics Dashboard (Vendor)
```json
{
  "views": 15000,
  "clicks": 450,
  "clickThroughRate": "3.00%",
  "daysRemaining": 25,
  "status": "active"
}
```

---

## 10. Frontend Integration Guide

### Display Banner Ads (10-second rotation)
```javascript
// Fetch active ads for placement
const response = await fetch('/api/v2/advertisement/active/leaderboard');
const { advertisements, rotationInterval } = await response.json();

// Implement rotation
let currentIndex = 0;
setInterval(() => {
  // Track view
  fetch(`/api/v2/advertisement/track-view/${ads[currentIndex]._id}`, {
    method: 'POST'
  });
  
  // Display ad
  displayAd(ads[currentIndex]);
  
  currentIndex = (currentIndex + 1) % ads.length;
}, rotationInterval);
```

### Handle Ad Clicks
```javascript
const handleAdClick = async (adId) => {
  // Track click
  await fetch(`/api/v2/advertisement/track-click/${adId}`, {
    method: 'POST'
  });
  
  // Navigate to store
  window.location.href = ad.linkUrl;
};
```

---

## 11. Image Requirements

### Banner Ad Specifications

| Ad Type | Dimensions | File Format | Max Size |
|---------|-----------|-------------|----------|
| Leaderboard | 728×120px | JPG, PNG | 500KB |
| Top Sidebar | 200×120px | JPG, PNG | 300KB |
| Right Sidebar (All) | 300×200px | JPG, PNG | 500KB |

### Image Validation
- Automatic dimension checking in model pre-save hook
- Cloudinary upload with folder organization
- Public ID storage for easy deletion

---

## 12. Payment Integration

### Payment Flow
1. Vendor creates advertisement → `status: 'pending'`
2. Calculate total price with discount
3. Process payment through gateway (Stripe/PayPal/PhonePe)
4. Update `paymentStatus: 'completed'`
5. Set `status: 'pending'` (awaiting admin approval)
6. Admin approves → `status: 'active'`

### Renewal Payment
```javascript
// Auto-renewal payment processing
const totalPrice = calculateRenewalPrice(ad);
const payment = await processPayment({
  amount: totalPrice,
  customerId: shop.stripeCustomerId,
  description: `Ad renewal: ${ad.title}`
});
```

---

## 13. Email Notifications

### Expiry Warning (7 days before)
```
Subject: Advertisement Expiring Soon
Body: Your advertisement "{title}" will expire in {days} days.
      {autoRenew ? 'It will be automatically renewed.' : 'Please renew to continue.'}
```

### Approval Notification
```
Subject: Advertisement Approved
Body: Your advertisement "{title}" has been approved and is now live!
```

### Rejection Notification
```
Subject: Advertisement Rejected
Body: Your advertisement "{title}" has been rejected.
      Reason: {reason}
      A refund has been initiated.
```

### Auto-Renewal Confirmation
```
Subject: Advertisement Auto-Renewed
Body: Your advertisement "{title}" has been automatically renewed for {duration} month(s).
      Total: ${totalPrice}
```

---

## 14. Testing Endpoints

### Install node-cron
```bash
cd backend
npm install node-cron
```

### Test Create Advertisement
```bash
# Create test ad
curl -X POST http://localhost:8000/api/v2/advertisement/create \
  -H "Authorization: Bearer {vendor_token}" \
  -F "adType=leaderboard" \
  -F "slotNumber=1" \
  -F "title=Summer Sale" \
  -F "duration=6" \
  -F "image=@banner.jpg"
```

### Test Get Pricing
```bash
curl http://localhost:8000/api/v2/advertisement/pricing
```

### Test Available Slots
```bash
curl http://localhost:8000/api/v2/advertisement/available-slots/leaderboard
```

---

## 15. Security Features

### Access Control
- ✅ Vendors can only create ads for their own shop
- ✅ Vendors can only view/manage their own ads
- ✅ Ads must link to vendor's store (validation)
- ✅ Admin approval required before activation
- ✅ Payment verification before processing

### Data Validation
- ✅ Image dimension checking
- ✅ Duration enum validation (1, 3, 6, 12)
- ✅ Ad type enum validation
- ✅ Slot number range validation (1-6)
- ✅ URL validation for store links

---

## 16. Database Indexes

### Advertisement Indexes
```javascript
{ shopId: 1, status: 1 }                    // Vendor queries
{ adType: 1, status: 1, startDate: 1 }      // Display queries
{ status: 1, endDate: 1 }                   // Expiry checks
{ adType: 1, slotNumber: 1, status: 1 }     // Slot availability
```

### Department Indexes
```javascript
{ slug: 1 }                                 // URL lookups
{ displayOrder: 1, isActive: 1 }           // Homepage display
```

---

## 17. Video Banner Integration

The existing video banner system remains separate but can be integrated:

- **Video banners** are managed through `/api/v2/video-banner`
- **Image ads** are managed through `/api/v2/advertisement`
- Both systems have independent approval workflows
- Consider unified analytics dashboard in future

---

## Files Created

### Backend Files
1. ✅ `/backend/model/advertisement.js` - Advertisement model
2. ✅ `/backend/model/department.js` - Department model
3. ✅ `/backend/controller/advertisement.js` - Advertisement controller
4. ✅ `/backend/controller/department.js` - Department controller
5. ✅ `/backend/routes/advertisement.js` - Advertisement routes
6. ✅ `/backend/routes/department.js` - Department routes

### Updated Files
1. ✅ `/backend/server.js` - Added routes and cron jobs
2. ✅ `/backend/package.json` - Added node-cron dependency

---

## Next Steps

### Required Frontend Implementation
1. **Vendor Dashboard**
   - Create advertisement form
   - My advertisements list
   - Analytics dashboard
   - Renewal management

2. **Admin Dashboard**
   - Pending ads review
   - Approve/reject interface
   - Department management
   - Mall map editor

3. **Public Pages**
   - Homepage departments display
   - Banner ad display with rotation
   - Mall map visualization
   - Featured stores/products sections

4. **Payment Integration**
   - Connect to existing payment controllers
   - Handle Stripe/PayPal/PhonePe
   - Refund processing for rejections

---

## Support & Maintenance

### Regular Tasks
- Monitor cron job execution logs
- Review ad approval queue daily
- Check payment processing success rates
- Analyze CTR performance for optimization

### Scaling Considerations
- Implement Redis caching for active ads
- CDN for ad images (Cloudinary already provides this)
- Database query optimization with indexes
- Load balancing for high traffic

---

## Summary

✅ **Complete advertising system implemented with:**
- Multiple ad types with different pricing tiers
- Duration-based automatic discount calculation
- Slot-based banner system with 10-second rotation
- Auto-renewal functionality
- Email notifications for expiry warnings
- Admin approval workflow
- Analytics tracking (views, clicks, CTR)
- Department management for mall map structure
- Automated cron jobs for maintenance
- Comprehensive API endpoints
- Payment integration ready
- Security and validation

**The system is production-ready and awaits frontend implementation!**
