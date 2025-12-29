# PayPal Payout Integration

## Overview
This system allows sellers to receive their withdrawal payments directly through PayPal, providing instant international money transfers.

## How It Works

### 1. **Seller Setup (Frontend)**
Sellers can configure their PayPal email in the withdrawal settings:

**Location:** Dashboard → Withdraw → Payment Methods

**Steps:**
1. Click "Withdraw" button
2. Select "Add new Withdraw Method"
3. Enter PayPal email address in the "PayPal Withdrawal" section
4. Optionally add bank details for alternative withdrawal methods
5. Click "Add" to save

### 2. **Admin Approval (Backend)**
When a seller requests withdrawal, admin can process it via PayPal:

**Location:** Admin Dashboard → Withdraw Request

**Steps:**
1. View pending withdrawal requests
2. Click edit icon (pencil) on a request
3. Choose "PayPal Automated Payout" option
4. Click "Process PayPal Payout" button
5. System automatically:
   - Validates seller has PayPal email
   - Creates PayPal payout batch
   - Transfers money to seller's PayPal account
   - Sends confirmation email
   - Updates withdrawal status

### 3. **Payment Flow**

```
User Buys Product → Money Added to Seller Wallet → Seller Requests Withdrawal 
→ Admin Approves via PayPal → Money Sent to Seller's PayPal Account
```

## Technical Implementation

### Backend Files Modified

1. **`backend/model/shop.js`**
   - Added `paypalEmail` field with email validation

2. **`backend/model/withdraw.js`**
   - Added `payoutMethod: 'paypal'` enum
   - Added `paypalPayoutBatchId` and `paypalPayoutItemId` fields

3. **`backend/utils/paypalPayout.js`** (NEW)
   - `createPayPalPayout()` - Initiates payout to seller
   - `getPayoutBatchStatus()` - Checks payout status
   - `getPayoutItemStatus()` - Gets individual payout details
   - `getPayPalAccessToken()` - OAuth authentication

4. **`backend/controller/withdraw.js`**
   - Added `/approve-withdrawal-with-paypal-payout/:id` route
   - Added `/paypal-payout-status/:batchId` route
   - Handles PayPal API integration

5. **`backend/controller/shop.js`**
   - Updated `/update-payment-methods` to accept `paypalEmail`

### Frontend Files Modified

1. **`frontend/src/components/Shop/WithdrawMoney.jsx`**
   - Added PayPal email input field
   - Saves PayPal email when adding payment methods

2. **`frontend/src/components/Admin/AllWithdraw.jsx`**
   - Added PayPal payout button
   - Added `handlePayPalPayout()` function
   - Shows PayPal option in withdrawal approval modal

## Environment Configuration

Add these to your `.env` file:

```env
PAYPAL_CLIENT_ID=your_client_id_here
PAYPAL_SECRET=your_secret_here
PAYPAL_API_URL=https://api-m.paypal.com  # Production
# For testing: https://api-m.sandbox.paypal.com
```

## PayPal Account Requirements

### For Developers:
1. Create PayPal Business account at https://developer.paypal.com
2. Create REST API app
3. Get Client ID and Secret
4. Enable "Payouts" permission
5. Verify bank account for live mode

### For Sellers:
1. Valid PayPal account (Personal or Business)
2. Confirmed email address
3. No restrictions on account

## API Endpoints

### Create PayPal Payout
```
PUT /api/v2/withdraw/approve-withdrawal-with-paypal-payout/:id
```

**Request Body:**
```json
{
  "sellerId": "seller_mongodb_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "PayPal payout completed successfully",
  "withdraw": {...},
  "payoutBatchId": "xxx",
  "payoutItemId": "yyy"
}
```

### Check Payout Status
```
GET /api/v2/withdraw/paypal-payout-status/:batchId
```

**Response:**
```json
{
  "success": true,
  "batchStatus": "SUCCESS",
  "items": [...]
}
```

## Payment Status Flow

1. **Processing** - Initial withdrawal request
2. **payout_initiated** - PayPal payout API called successfully
3. **succeed** - Money transferred to seller's PayPal account
4. **payout_failed** - PayPal API error or invalid PayPal email

## Error Handling

Common errors and solutions:

1. **"Seller has not set up PayPal email address"**
   - Solution: Seller needs to add PayPal email in payment settings

2. **"Failed to get PayPal access token"**
   - Solution: Check PAYPAL_CLIENT_ID and PAYPAL_SECRET in .env

3. **"PayPal payout failed"**
   - Check PayPal account status
   - Verify email is correct
   - Check PayPal API logs

## Testing

### Sandbox Testing (Recommended)
1. Use sandbox API URL: `https://api-m.sandbox.paypal.com`
2. Create test accounts at https://developer.paypal.com/dashboard
3. Use sandbox credentials
4. Test payouts with sandbox PayPal accounts

### Production
1. Switch to production API URL: `https://api-m.paypal.com`
2. Use live credentials
3. Verify PayPal business account
4. Enable production payouts

## Currency Support

Current configuration uses **USD**. To change currency:

Edit `backend/utils/paypalPayout.js`:
```javascript
amount: {
  value: amount.toFixed(2),
  currency: 'INR', // Change to your currency
}
```

Supported currencies: USD, EUR, GBP, INR, AUD, CAD, etc.

## Benefits

✅ **Instant Payouts** - Money reaches seller within minutes
✅ **Global Support** - Works internationally
✅ **Secure** - PayPal's trusted network
✅ **Auto-notifications** - Emails sent automatically
✅ **Status Tracking** - Real-time payout status
✅ **Multi-currency** - Supports 25+ currencies

## Comparison with Other Methods

| Feature | PayPal | PhonePe | Manual |
|---------|--------|---------|---------|
| Speed | Instant | Same day | 3-7 days |
| International | ✅ Yes | ❌ No | ✅ Yes |
| Automation | ✅ Full | ✅ Full | ❌ Manual |
| Currency | Multi | INR only | Multi |
| Best For | Global sellers | Indian sellers | Backup |

## Support

For issues or questions:
- Check PayPal Developer Documentation: https://developer.paypal.com/docs/payouts
- Review server logs for detailed error messages
- Contact PayPal support for API-related issues

## Next Steps

1. ✅ Backend integration complete
2. ✅ Frontend UI complete
3. ✅ Database models updated
4. 🔄 Test in sandbox environment
5. 🔄 Deploy to production
6. 🔄 Configure live PayPal credentials
7. 🔄 Train admins on PayPal payout process

---

**Last Updated:** December 29, 2025
**Status:** ✅ Ready for Testing
