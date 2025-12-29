const axios = require('axios');

/**
 * Get PayPal OAuth access token
 */
const getPayPalAccessToken = async () => {
  try {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_SECRET;
    const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.paypal.com';

    if (!clientId || !secret) {
      throw new Error('PayPal credentials not configured');
    }

    const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

    const response = await axios.post(
      `${apiUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('❌ PayPal Auth Error:', error.response?.data || error.message);
    throw new Error(`Failed to get PayPal access token: ${error.message}`);
  }
};

/**
 * Create PayPal payout to seller
 * @param {Object} payoutData - { recipientEmail, amount, note, withdrawalId }
 * @returns {Object} - { success, batchId, payoutItemId, status }
 */
const createPayPalPayout = async (payoutData) => {
  try {
    const { recipientEmail, amount, note, withdrawalId } = payoutData;

    // Validate inputs
    if (!recipientEmail || !amount || amount <= 0) {
      throw new Error('Invalid payout data: recipientEmail and amount are required');
    }

    // Get access token
    const accessToken = await getPayPalAccessToken();
    const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.paypal.com';

    // Generate unique sender_batch_id
    const senderBatchId = `withdraw_${withdrawalId}_${Date.now()}`;

    // Prepare payout request
    const payoutRequest = {
      sender_batch_header: {
        sender_batch_id: senderBatchId,
        email_subject: 'You have received a payment from Wanttar',
        email_message: note || 'Congratulations! You have received a withdrawal payment.',
      },
      items: [
        {
          recipient_type: 'EMAIL',
          amount: {
            value: amount.toFixed(2),
            currency: 'USD', // Change to your currency (USD, INR, etc.)
          },
          note: note || `Withdrawal payment for request #${withdrawalId}`,
          sender_item_id: withdrawalId,
          receiver: recipientEmail,
        },
      ],
    };

    console.log('📤 Sending PayPal payout request:', {
      recipientEmail,
      amount: amount.toFixed(2),
      senderBatchId,
    });

    // Make payout request
    const response = await axios.post(
      `${apiUrl}/v1/payments/payouts`,
      payoutRequest,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const batchId = response.data.batch_header.payout_batch_id;
    const payoutItemId = response.data.links.find(link => link.rel === 'items')?.href;

    console.log('✅ PayPal payout created successfully:', {
      batchId,
      status: response.data.batch_header.batch_status,
    });

    return {
      success: true,
      batchId,
      payoutItemId: response.data.items?.[0]?.payout_item_id,
      status: response.data.batch_header.batch_status,
      message: 'Payout initiated successfully',
    };
  } catch (error) {
    console.error('❌ PayPal Payout Error:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      details: error.response?.data?.details || null,
    };
  }
};

/**
 * Get payout batch status
 * @param {String} batchId - PayPal payout batch ID
 * @returns {Object} - Batch status details
 */
const getPayoutBatchStatus = async (batchId) => {
  try {
    const accessToken = await getPayPalAccessToken();
    const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.paypal.com';

    const response = await axios.get(
      `${apiUrl}/v1/payments/payouts/${batchId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      batchStatus: response.data.batch_header.batch_status,
      items: response.data.items,
    };
  } catch (error) {
    console.error('❌ Error fetching payout status:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get payout item details
 * @param {String} payoutItemId - PayPal payout item ID
 * @returns {Object} - Item status details
 */
const getPayoutItemStatus = async (payoutItemId) => {
  try {
    const accessToken = await getPayPalAccessToken();
    const apiUrl = process.env.PAYPAL_API_URL || 'https://api-m.paypal.com';

    const response = await axios.get(
      `${apiUrl}/v1/payments/payouts-item/${payoutItemId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      transactionStatus: response.data.transaction_status,
      amount: response.data.payout_item.amount,
      receiver: response.data.payout_item.receiver,
    };
  } catch (error) {
    console.error('❌ Error fetching payout item status:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  createPayPalPayout,
  getPayoutBatchStatus,
  getPayoutItemStatus,
  getPayPalAccessToken,
};
