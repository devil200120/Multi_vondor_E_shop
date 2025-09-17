const generateOrderConfirmationEmail = (order, user) => {
  const orderNumber = order._id.toString().slice(-8).toUpperCase();
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate total items
  const totalItems = order.cart.reduce((sum, item) => sum + item.qty, 0);
  
  // Backend URL for images (fallback if env var not available)
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Generate product details HTML
  const productDetails = order.cart.map(item => {
    const itemTotal = item.discountPrice * item.qty;
    const originalTotal = item.originalPrice ? item.originalPrice * item.qty : itemTotal;
    const savings = originalTotal > itemTotal ? originalTotal - itemTotal : 0;
    
    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 16px 0; vertical-align: top;">
          <div style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="width: 80px; height: 80px; background-color: #f3f4f6; border-radius: 8px; overflow: hidden; flex-shrink: 0;">
              ${item.images && item.images[0] ? 
                `<img src="${backendUrl}${item.images[0]}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
                `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">No Image</div>`
              }
            </div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827; line-height: 1.4;">${item.name}</h4>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; line-height: 1.4;">${item.description || 'No description available'}</p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
                <span style="background-color: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">${item.category || 'General'}</span>
                <span style="background-color: #f0fdf4; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">Qty: ${item.qty}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px; font-weight: 700; color: #059669;">₹${item.discountPrice.toLocaleString('en-IN')}</span>
                ${item.originalPrice && item.originalPrice > item.discountPrice ? 
                  `<span style="font-size: 14px; color: #9ca3af; text-decoration: line-through;">₹${item.originalPrice.toLocaleString('en-IN')}</span>` : ''
                }
              </div>
              ${savings > 0 ? 
                `<div style="margin-top: 4px; color: #059669; font-size: 12px; font-weight: 500;">You saved ₹${savings.toLocaleString('en-IN')} on this item!</div>` : ''
              }
            </div>
            <div style="text-align: right; flex-shrink: 0;">
              <div style="font-size: 16px; font-weight: 700; color: #111827;">₹${itemTotal.toLocaleString('en-IN')}</div>
              ${item.stock < 10 ? 
                `<div style="margin-top: 4px; color: #dc2626; font-size: 12px; font-weight: 500;">Only ${item.stock} left!</div>` : ''
              }
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Calculate totals
  const subtotal = order.cart.reduce((sum, item) => sum + (item.discountPrice * item.qty), 0);
  const originalSubtotal = order.cart.reduce((sum, item) => sum + ((item.originalPrice || item.discountPrice) * item.qty), 0);
  const totalSavings = originalSubtotal - subtotal;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Order #${orderNumber}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; }
            .container { max-width: 800px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
            .content { padding: 30px; }
            .section { margin-bottom: 30px; }
            .section h2 { color: #1f2937; font-size: 20px; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .info-card { background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; }
            .info-card h3 { color: #374151; font-size: 14px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-card p { color: #6b7280; font-size: 14px; margin-bottom: 4px; }
            .products-table { width: 100%; border-collapse: collapse; }
            .total-section { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 20px; }
            .total-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
            .total-row.final { font-size: 18px; font-weight: 700; color: #059669; border-top: 2px solid #e5e7eb; padding-top: 16px; margin-top: 8px; }
            .footer { background-color: #1f2937; color: #d1d5db; padding: 30px; text-align: center; }
            .footer h3 { color: #ffffff; margin-bottom: 16px; }
            .footer p { font-size: 14px; margin-bottom: 8px; }
            .btn { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 16px 8px 0 0; }
            .btn:hover { background-color: #2563eb; }
            .highlight { background-color: #fef3c7; color: #92400e; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
            @media (max-width: 600px) {
                .info-grid { grid-template-columns: 1fr; }
                .container { margin: 0; }
                .header, .content, .footer { padding: 20px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <h1 style="font-size: 28px; margin-bottom: 8px;">🎉 Order Confirmed!</h1>
                <p style="font-size: 18px; opacity: 0.9;">Thank you for your order, ${user.name}!</p>
                <p style="font-size: 16px; opacity: 0.8; margin-top: 8px;">Order #${orderNumber}</p>
            </div>

            <!-- Content -->
            <div class="content">
                <!-- Order Summary -->
                <div class="highlight">
                    <h3 style="margin-bottom: 8px; color: #92400e;">🚀 Great News!</h3>
                    <p style="color: #92400e; margin: 0;">Your order has been successfully placed and is being prepared for shipment. You'll receive tracking information soon!</p>
                </div>

                <!-- Order & Delivery Info -->
                <div class="section">
                    <h2>📋 Order & Delivery Information</h2>
                    <div class="info-grid">
                        <div class="info-card">
                            <h3>Order Details</h3>
                            <p><strong>Order Number:</strong> #${orderNumber}</p>
                            <p><strong>Order Date:</strong> ${orderDate}</p>
                            <p><strong>Total Items:</strong> ${totalItems} item${totalItems > 1 ? 's' : ''}</p>
                            <p><strong>Order Status:</strong> <span style="color: #059669; font-weight: 600;">${order.status}</span></p>
                        </div>
                        <div class="info-card">
                            <h3>Delivery Address</h3>
                            <p><strong>${order.shippingAddress.fullName || user.name}</strong></p>
                            <p>${order.shippingAddress.address1}</p>
                            ${order.shippingAddress.address2 ? `<p>${order.shippingAddress.address2}</p>` : ''}
                            <p>${order.shippingAddress.city}, ${order.shippingAddress.country}</p>
                            <p><strong>ZIP:</strong> ${order.shippingAddress.zipCode}</p>
                            <p><strong>Phone:</strong> ${order.shippingAddress.phoneNumber}</p>
                        </div>
                    </div>
                </div>

                <!-- Product Details -->
                <div class="section">
                    <h2>🛍️ Product Details</h2>
                    <table class="products-table">
                        <tbody>
                            ${productDetails}
                        </tbody>
                    </table>
                </div>

                <!-- Order Total -->
                <div class="total-section">
                    <h3 style="color: #374151; margin-bottom: 16px;">💰 Order Summary</h3>
                    <div class="total-row">
                        <span>Subtotal (${totalItems} item${totalItems > 1 ? 's' : ''}):</span>
                        <span>₹${subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    ${totalSavings > 0 ? `
                    <div class="total-row" style="color: #059669;">
                        <span>Total Savings:</span>
                        <span>-₹${totalSavings.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    <div class="total-row">
                        <span>Shipping:</span>
                        <span style="color: #059669;">FREE</span>
                    </div>
                    <div class="total-row final">
                        <span>Total Amount Paid:</span>
                        <span>₹${order.totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <!-- Payment Info -->
                <div class="section">
                    <h2>💳 Payment Information</h2>
                    <div class="info-card">
                        <h3>Payment Method</h3>
                        <p><strong>Method:</strong> ${order.paymentInfo?.type || 'Cash on Delivery'}</p>
                        <p><strong>Status:</strong> <span style="color: #059669; font-weight: 600;">${order.paymentInfo?.status || 'Pending'}</span></p>
                        ${order.paymentInfo?.id ? `<p><strong>Transaction ID:</strong> ${order.paymentInfo.id}</p>` : ''}
                    </div>
                </div>

                <!-- Next Steps -->
                <div class="section">
                    <h2>🚚 What's Next?</h2>
                    <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                        <h4 style="color: #1e40af; margin-bottom: 12px;">📦 Order Processing</h4>
                        <p style="color: #374151; margin-bottom: 16px;">Your order is currently being processed by our team. Here's what happens next:</p>
                        <ul style="color: #374151; margin-left: 20px;">
                            <li style="margin-bottom: 8px;">✅ Order confirmation (You are here!)</li>
                            <li style="margin-bottom: 8px;">📦 Order processing & packaging (1-2 business days)</li>
                            <li style="margin-bottom: 8px;">🚚 Shipment & tracking details sent to your email</li>
                            <li style="margin-bottom: 8px;">🏠 Delivery to your doorstep</li>
                        </ul>
                        <p style="color: #374151; margin-top: 16px; font-weight: 500;">Expected delivery: 3-7 business days</p>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${frontendUrl}/user/track-order/${order._id}" class="btn">📱 Track Your Order</a>
                    <a href="${frontendUrl}/user/order/${order._id}" class="btn">📋 View Order Details</a>
                </div>

                <!-- Customer Support -->
                <div class="section">
                    <h2>🤝 Need Help?</h2>
                    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; text-align: center;">
                        <h4 style="color: #0369a1; margin-bottom: 12px;">We're here to help!</h4>
                        <p style="color: #374151; margin-bottom: 16px;">Have questions about your order? Our customer support team is ready to assist you.</p>
                        <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
                            <a href="mailto:support@yourstore.com" style="color: #0369a1; text-decoration: none; font-weight: 500;">📧 Email Support</a>
                            <a href="tel:+1234567890" style="color: #0369a1; text-decoration: none; font-weight: 500;">📞 Call Us</a>
                            <a href="${frontendUrl}/contact" style="color: #0369a1; text-decoration: none; font-weight: 500;">💬 Live Chat</a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <h3>Thank you for choosing us! 🙏</h3>
                <p>We appreciate your business and look forward to serving you again.</p>
                <p>Follow us on social media for updates and exclusive deals!</p>
                <div style="margin-top: 20px;">
                    <a href="#" style="color: #60a5fa; text-decoration: none; margin: 0 8px;">Facebook</a>
                    <a href="#" style="color: #60a5fa; text-decoration: none; margin: 0 8px;">Twitter</a>
                    <a href="#" style="color: #60a5fa; text-decoration: none; margin: 0 8px;">Instagram</a>
                </div>
                <p style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                    This email was sent to ${user.email}. If you have any questions, please contact our support team.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;

  return htmlTemplate;
};

module.exports = {
  generateOrderConfirmationEmail
};