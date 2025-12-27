# Vendor Business Model Implementation

## Overview
This document outlines the complete vendor business model system implemented for Mall of Cayman, including subscription plans, revenue sharing, payment processing, inventory management, and review systems.

## 1. Subscription Plans

### 1.1 Available Plans

#### Bronze Plan ($100/month)
- Maximum 5 products
- Features:
  - Business profile
  - Logo upload
  - PDF upload capability
  - 3 images per product

#### Silver Plan ($200/month)
- Maximum 15 products
- All Bronze features PLUS:
  - Video upload option
  - 6 images per product
  - Contact seller button

#### Gold Plan ($300/month)
- Maximum 30 products
- All Silver features PLUS:
  - HTML/CSS editor for product descriptions
  - Ad pre-approval (faster approval for advertisements)

#### Revenue Share Plan ($25/month minimum)
- Unlimited products (999 maximum)
- Features:
  - All Silver plan features
  - 10% commission to Mall of Cayman
  - 90% to vendor
  - $25 minimum monthly payment (non-refundable, applied as credit)
  - Commission split shown during product setup
  - Automatic split attempted at checkout

### 1.2 Billing Cycles and Discounts

| Billing Cycle | Discount |
|---------------|----------|
| Monthly       | 0%       |
| 3 Months      | 10%      |
| 6 Months      | 15%      |
| 12 Months     | 20%      |

**Important**: Plan changes are only allowed at the end of the current billing cycle.

## 2. Commission System (Revenue Share Model)

### 2.1 Commission Split
- **Platform Commission**: 10% to Mall of Cayman
- **Vendor Earnings**: 90% to vendor
- **Minimum Monthly Payment**: $25 (non-refundable)

### 2.2 Payment Processing
- Commission split is calculated automatically during checkout
- Vendor earnings are credited to their available balance
- Platform commission is tracked separately
- Automatic payment attempt at checkout

### 2.3 Refunds and Chargebacks
- **Vendor Responsibility**: Vendors are responsible for handling refunds and chargebacks
- Refund amount is proportionally deducted from vendor balance (90% of refund)
- Platform commission is also adjusted (10% of refund)
- Refund tracking:
  - None: No refund issued
  - Partial: Partial refund processed
  - Full: Full refund processed

## 3. Payment Integration

### 3.1 PayPal Configuration
**Live Credentials** (stored in backend/.env):
```
PAYPAL_CLIENT_ID=AW3P72fNSIFlkCnT3gaKSxCKKaTL09YBLL3d45J5Uc7JaXCNrYJoUiza6OqL87Kj7Sg7UbufGwCrQ7yA
PAYPAL_SECRET=EH0vP4NgiaX9xhw8LDoZJaPkh6sw1lostSYjeQJQxjegPWyHlCYLQxlONQ11B03W3SrxzvKB6pD-gsdI
PAYPAL_API_URL=https://api-m.paypal.com
FRONTEND_URL=http://localhost:3000
```

### 3.2 Payment Methods
- **Primary**: PayPal (mandatory for vendors)
- **Currency**: USD only
- **Checkout Rules**: Single-vendor cart only (no mixed vendor carts)

### 3.3 Failed Payments
When a payment fails:
1. Vendor is notified via email
2. Store is automatically paused
3. Advertisements are suspended
4. Store/ads remain paused until payment is resolved

## 4. Inventory Management

### 4.1 Product Types
- **Physical Goods**: Standard inventory tracking
- **Digital Goods**: Manual fulfillment process
- **Services**: Purchase creates a request

### 4.2 Inventory Tracking
- **Auto-Deduction**: Inventory is automatically deducted on successful sale
- **Baseline Stock**: Set when product is created or restocked
- **Restock**: Baseline resets when inventory is replenished

### 4.3 Inventory Alerts

#### Low Stock Alert (20% threshold)
- Triggered when stock reaches 20% of baseline
- Warning email sent to vendor
- Flag: `lowStockAlertSent` set to true

#### Critical Stock Alert (10% threshold)
- Triggered when stock reaches 10% of baseline
- Critical warning email sent to vendor
- Flag: `criticalStockAlertSent` set to true

**Example**:
- Baseline: 100 units
- Low stock alert: 20 units remaining
- Critical alert: 10 units remaining

## 5. Reviews & Ratings System

### 5.1 Rating System
- **Scale**: 1-5 stars
- **Verified Purchasers Only**: Only users who have purchased the product can leave reviews
- **Admin Approval Required**: All reviews must be approved by admin before appearing
- **Multiple Reviews**: Users can leave multiple reviews per vendor (different products)

### 5.2 Review Process
1. Customer purchases product
2. Review prompt sent at:
   - Immediately after checkout
   - 1 month post-sale reminder
3. Customer writes review
4. Admin reviews and approves/rejects
5. Review appears on product page
6. Vendor can reply publicly to review

### 5.3 Review Features
- **Verified Purchase Badge**: Shows if review is from verified buyer
- **Vendor Reply**: Vendors can publicly reply to reviews
- **Review Tracking**: Links review to specific order ID
- **Admin Moderation**: Admin can delete inappropriate reviews

## 6. Database Models

### 6.1 Subscription Model
```javascript
{
  shop: ObjectId (ref: Shop),
  plan: 'bronze' | 'silver' | 'gold' | 'revenue-share',
  maxProducts: Number,
  features: { ... },
  monthlyPrice: Number,
  billingCycle: 'monthly' | '3-months' | '6-months' | '12-months',
  discountPercent: Number,
  finalPrice: Number,
  status: 'active' | 'expired' | 'cancelled' | 'suspended',
  startDate: Date,
  endDate: Date,
  nextBillingDate: Date,
  paymentHistory: [ ... ],
  cancellationRequested: Boolean,
  cancellationDate: Date
}
```

### 6.2 Commission Model
```javascript
{
  order: ObjectId (ref: Order),
  shop: ObjectId (ref: Shop),
  totalAmount: Number,
  platformCommissionPercent: 10,
  platformCommissionAmount: Number,
  vendorAmount: Number,
  vendorPaymentStatus: 'pending' | 'processing' | 'paid' | 'failed',
  refundStatus: 'none' | 'partial' | 'full',
  refundAmount: Number,
  paypalOrderId: String,
  paypalPayerId: String
}
```

### 6.3 Product Model Updates
```javascript
{
  // ... existing fields ...
  inventoryAlerts: {
    lowStockThreshold: 20, // 20% of baseline
    criticalStockThreshold: 10, // 10% of baseline
    baselineStock: Number,
    lastRestockDate: Date,
    lowStockAlertSent: Boolean,
    criticalStockAlertSent: Boolean
  },
  reviews: [{
    user: Object,
    rating: Number (1-5),
    comment: String,
    isVerifiedPurchase: Boolean,
    isApprovedByAdmin: Boolean,
    vendorReply: String,
    vendorReplyDate: Date,
    orderId: ObjectId (ref: Order),
    createdAt: Date
  }]
}
```

### 6.4 Shop Model Updates
```javascript
{
  // ... existing fields ...
  subscriptionPlan: 'bronze' | 'silver' | 'gold' | 'revenue-share',
  currentSubscription: ObjectId (ref: Subscription),
  revenueShare: {
    monthlyMinimum: 25,
    isPaid: Boolean,
    lastPaymentDate: Date,
    currentMonthRevenue: Number
  },
  paypalEmail: String,
  paypalMerchantId: String
}
```

## 7. API Endpoints

### 7.1 Subscription Endpoints
- `GET /api/v2/subscription/get-plans` - Get available subscription plans
- `GET /api/v2/subscription/my-subscription` - Get seller's current subscription
- `POST /api/v2/subscription/create-paypal-subscription` - Create PayPal subscription
- `POST /api/v2/subscription/activate-subscription` - Activate subscription after payment
- `POST /api/v2/subscription/cancel-subscription` - Cancel subscription (end of cycle)
- `GET /api/v2/subscription/admin/all-subscriptions` - Admin: Get all subscriptions
- `GET /api/v2/subscription/admin/subscription-stats` - Admin: Get subscription statistics

### 7.2 Commission Endpoints
- `POST /api/v2/commission/create-commission` - Create commission record after order
- `GET /api/v2/commission/seller/my-commissions` - Get seller's commission history
- `GET /api/v2/commission/seller/revenue-share-status` - Get revenue share status
- `POST /api/v2/commission/handle-refund` - Handle refund/chargeback
- `GET /api/v2/commission/admin/all-commissions` - Admin: Get all commissions
- `PUT /api/v2/commission/admin/mark-payment-paid/:id` - Admin: Mark payment as paid

## 8. Implementation Steps

### 8.1 Backend Setup
1. Add PayPal credentials to `backend/config/.env`
2. Restart backend server to load new routes
3. Test subscription creation flow
4. Test commission calculation

### 8.2 Frontend Setup (To Be Implemented)
1. Create subscription plan selection page
2. Integrate PayPal payment UI
3. Add commission dashboard for sellers
4. Add inventory alert notifications
5. Implement review submission and approval UI

### 8.3 Testing Checklist
- [ ] Bronze plan subscription creation
- [ ] Silver plan subscription creation
- [ ] Gold plan subscription creation
- [ ] Revenue share plan setup
- [ ] 10% commission calculation
- [ ] Inventory low stock alert (20%)
- [ ] Inventory critical alert (10%)
- [ ] Review submission (verified purchase)
- [ ] Review admin approval
- [ ] Vendor reply to review
- [ ] Refund commission adjustment

## 9. Security Considerations

### 9.1 PayPal Credentials
- **NEVER** commit credentials to version control
- Store in environment variables only
- Use `.gitignore` to exclude `.env` files
- Rotate credentials periodically

### 9.2 Payment Security
- All transactions go through PayPal's secure gateway
- No credit card data stored on servers
- HTTPS required for all payment endpoints

### 9.3 Review Security
- Admin approval prevents spam
- Verified purchase check prevents fake reviews
- Rate limiting on review submissions

## 10. Monitoring & Analytics

### 10.1 Subscription Metrics
- Active subscriptions by plan
- Subscription revenue by billing cycle
- Churn rate and cancellations
- Expiring subscriptions (7-day warning)

### 10.2 Commission Metrics
- Total platform revenue
- Total vendor payouts
- Average commission per order
- Revenue share compliance (minimum $25/month)

### 10.3 Inventory Metrics
- Products with low stock
- Products with critical stock
- Stock-out frequency
- Restock patterns

## 11. Next Steps

### 11.1 Immediate Tasks
1. Add PayPal credentials to production environment
2. Create seller subscription management UI
3. Implement inventory alert emails
4. Create review approval admin panel

### 11.2 Future Enhancements
1. Automated subscription renewals
2. Subscription upgrade/downgrade flow
3. Commission payout automation
4. Advanced inventory forecasting
5. Review analytics dashboard

## 12. Support & Documentation

For implementation questions or issues:
1. Check this documentation first
2. Review PayPal API documentation
3. Test in sandbox environment before production
4. Contact development team for assistance

---

**Last Updated**: December 27, 2025
**Version**: 1.0.0
**Status**: Backend Implemented, Frontend Pending
