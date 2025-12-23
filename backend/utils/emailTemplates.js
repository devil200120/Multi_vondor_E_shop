const generateOrderConfirmationEmail = (order, user) => {
  // Use new orderNumber if available, otherwise fall back to old format
  const orderNumber = order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`;
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

  // Calculate estimated delivery date (7 days from now)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
  const deliveryDate = estimatedDelivery.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate product details HTML with enhanced styling
  const productDetails = order.cart.map(item => {
    const itemTotal = item.discountPrice * item.qty;
    const originalTotal = item.originalPrice ? item.originalPrice * item.qty : itemTotal;
    const savings = originalTotal > itemTotal ? originalTotal - itemTotal : 0;
    const discountPercentage = savings > 0 ? Math.round((savings / originalTotal) * 100) : 0;
    
    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 20px 0; vertical-align: top;">
          <div style="display: flex; align-items: flex-start; gap: 16px;">
            <div style="width: 100px; height: 100px; background: linear-gradient(45deg, #f3f4f6, #e5e7eb); border-radius: 12px; overflow: hidden; flex-shrink: 0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              ${item.images && item.images[0] ? 
                `<img src="${backendUrl}${item.images[0]}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
                `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 14px; font-weight: 500;">📦</div>`
              }
              ${discountPercentage > 0 ? 
                `<div style="position: absolute; top: 8px; right: 8px; background: linear-gradient(45deg, #ef4444, #dc2626); color: white; padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${discountPercentage}% OFF</div>` : ''
              }
            </div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #111827; line-height: 1.3;">${item.name}</h4>
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; line-height: 1.5;">${item.description || 'Premium quality product with excellent features'}</p>
              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                <span style="background: linear-gradient(45deg, #dbeafe, #bfdbfe); color: #1e40af; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; border: 1px solid #93c5fd;">${item.category || 'Premium'}</span>
                <span style="background: linear-gradient(45deg, #dcfce7, #bbf7d0); color: #166534; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; border: 1px solid #86efac;">Qty: ${item.qty}</span>
                ${item.stock < 10 ? 
                  `<span style="background: linear-gradient(45deg, #fee2e2, #fecaca); color: #dc2626; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; border: 1px solid #fca5a5;">Limited Stock</span>` : 
                  `<span style="background: linear-gradient(45deg, #f0fdf4, #dcfce7); color: #166534; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; border: 1px solid #86efac;">✅ In Stock</span>`
                }
              </div>
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 20px; font-weight: 800; color: #059669; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">₹${item.discountPrice.toLocaleString('en-IN')}</span>
                ${item.originalPrice && item.originalPrice > item.discountPrice ? 
                  `<span style="font-size: 16px; color: #9ca3af; text-decoration: line-through; opacity: 0.8;">₹${item.originalPrice.toLocaleString('en-IN')}</span>` : ''
                }
              </div>
              ${savings > 0 ? 
                `<div style="background: linear-gradient(45deg, #ecfdf5, #d1fae5); color: #065f46; padding: 6px 12px; border-radius: 8px; font-size: 13px; font-weight: 600; border-left: 3px solid #10b981;">💰 You saved ₹${savings.toLocaleString('en-IN')} (${discountPercentage}% off)!</div>` : ''
              }
            </div>
            <div style="text-align: right; flex-shrink: 0; padding-left: 16px;">
              <div style="font-size: 20px; font-weight: 800; color: #111827; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">₹${itemTotal.toLocaleString('en-IN')}</div>
              <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Total for ${item.qty} item${item.qty > 1 ? 's' : ''}</div>
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
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .container { max-width: 800px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 50px 30px; text-align: center; position: relative; overflow: hidden; }
            .header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="60" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>'); opacity: 0.3; }
            .header-content { position: relative; z-index: 1; }
            .logo { width: 80px; height: 80px; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 32px; backdrop-filter: blur(10px); }
            .content { padding: 40px 30px; }
            .section { margin-bottom: 40px; }
            .section h2 { color: #1f2937; font-size: 24px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 3px solid #e5e7eb; display: flex; align-items: center; gap: 12px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
            .info-card { background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 24px; border-radius: 12px; border-left: 4px solid #3b82f6; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: transform 0.2s; }
            .info-card:hover { transform: translateY(-2px); }
            .info-card h3 { color: #374151; font-size: 14px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
            .info-card p { color: #6b7280; font-size: 15px; margin-bottom: 6px; line-height: 1.5; }
            .products-table { width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .total-section { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 28px; border-radius: 16px; margin-top: 24px; border: 2px solid #bae6fd; }
            .total-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; font-size: 16px; }
            .total-row.final { font-size: 24px; font-weight: 800; background: linear-gradient(45deg, #059669, #047857); -webkit-background-clip: text; -webkit-text-fill-color: transparent; border-top: 3px solid #059669; padding-top: 20px; margin-top: 12px; }
            .footer { background: linear-gradient(135deg, #1f2937, #111827); color: #d1d5db; padding: 40px 30px; text-align: center; }
            .footer h3 { color: #ffffff; margin-bottom: 20px; font-size: 24px; }
            .footer p { font-size: 14px; margin-bottom: 10px; line-height: 1.6; }
            .btn { display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 700; margin: 20px 12px 0 0; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4); transition: all 0.3s; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4); }
            .highlight { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #92400e; padding: 24px; border-radius: 16px; border-left: 6px solid #f59e0b; margin: 24px 0; box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2); }
            .success-badge { background: linear-gradient(45deg, #10b981, #059669); color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; }
            .progress-bar { background: #e5e7eb; height: 6px; border-radius: 3px; overflow: hidden; margin: 16px 0; }
            .progress-fill { background: linear-gradient(45deg, #10b981, #059669); height: 100%; width: 25%; border-radius: 3px; animation: progressFill 2s ease-in-out; }
            @keyframes progressFill { from { width: 0%; } to { width: 25%; } }
            .social-icons { margin-top: 24px; }
            .social-icons a { color: #60a5fa; text-decoration: none; margin: 0 12px; font-size: 16px; transition: color 0.3s; }
            .social-icons a:hover { color: #3b82f6; }
            @media (max-width: 600px) {
                .info-grid { grid-template-columns: 1fr; }
                .container { margin: 10px; border-radius: 12px; }
                .header, .content, .footer { padding: 24px 20px; }
                .section h2 { font-size: 20px; }
                .btn { display: block; margin: 12px 0; text-align: center; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="header-content">
                    <div class="logo">🛍️</div>
                    <h1 style="font-size: 36px; margin-bottom: 12px; font-weight: 800;">🎉 Order Confirmed!</h1>
                    <p style="font-size: 20px; opacity: 0.95; font-weight: 500;">Thank you for choosing Samrudhi Group, ${user.name}!</p>
                    <div class="success-badge" style="margin-top: 16px;">Order #${orderNumber}</div>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <p style="font-size: 14px; opacity: 0.8; margin-top: 8px;">Order Processing Started</p>
                </div>
            </div>

            <!-- Content -->
            <div class="content">
                <!-- Order Summary -->
                <div class="highlight">
                    <h3 style="margin-bottom: 12px; color: #92400e; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                        🚀 <span>Fantastic News!</span>
                    </h3>
                    <p style="color: #92400e; margin: 0; font-size: 16px; line-height: 1.6;">Your order has been successfully placed and is being prepared for shipment. You'll receive tracking information within 24 hours. Estimated delivery: <strong>${deliveryDate}</strong></p>
                </div>

                <!-- Order & Delivery Info -->
                <div class="section">
                    <h2>📋 Order & Delivery Information</h2>
                    <div class="info-grid">
                        <div class="info-card">
                            <h3>📦 Order Details</h3>
                            <p><strong>Order Number:</strong> #${orderNumber}</p>
                            <p><strong>Order Date:</strong> ${orderDate}</p>
                            <p><strong>Total Items:</strong> ${totalItems} item${totalItems > 1 ? 's' : ''}</p>
                            <p><strong>Order Status:</strong> <span style="color: #059669; font-weight: 700; background: #dcfce7; padding: 4px 8px; border-radius: 6px;">${order.status}</span></p>
                            <p><strong>Expected Delivery:</strong> <span style="color: #059669; font-weight: 600;">${deliveryDate}</span></p>
                        </div>
                        <div class="info-card">
                            <h3>🏠 Delivery Address</h3>
                            <p><strong>${order.shippingAddress.fullName || user.name}</strong></p>
                            <p>${order.shippingAddress.address1}</p>
                            ${order.shippingAddress.address2 ? `<p>${order.shippingAddress.address2}</p>` : ''}
                            <p>${order.shippingAddress.city}, ${order.shippingAddress.country}</p>
                            <p><strong>ZIP:</strong> ${order.shippingAddress.zipCode}</p>
                            <p><strong>📞 Phone:</strong> ${order.shippingAddress.phoneNumber}</p>
                        </div>
                    </div>
                </div>

                <!-- Product Details -->
                <div class="section">
                    <h2>🛍️ Your Amazing Products</h2>
                    <table class="products-table">
                        <tbody>
                            ${productDetails}
                        </tbody>
                    </table>
                </div>

                <!-- Order Total -->
                <div class="total-section">
                    <h3 style="color: #374151; margin-bottom: 20px; font-size: 22px; display: flex; align-items: center; gap: 8px;">💰 <span>Order Summary</span></h3>
                    <div class="total-row">
                        <span style="font-size: 16px;">Subtotal (${totalItems} item${totalItems > 1 ? 's' : ''}):</span>
                        <span style="font-weight: 600;">₹${subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    ${totalSavings > 0 ? `
                    <div class="total-row" style="color: #059669; background: #ecfdf5; margin: 8px -12px; padding: 8px 12px; border-radius: 8px;">
                        <span style="font-weight: 600;">🎉 Total Savings:</span>
                        <span style="font-weight: 700;">-₹${totalSavings.toLocaleString('en-IN')}</span>
                    </div>` : ''}
                    <div class="total-row">
                        <span>🚚 Shipping:</span>
                        <span style="color: #059669; font-weight: 700; background: #dcfce7; padding: 4px 8px; border-radius: 6px;">FREE</span>
                    </div>
                    <div class="total-row">
                        <span>🏷️ Taxes & Fees:</span>
                        <span style="color: #059669; font-weight: 600;">Included</span>
                    </div>
                    <div class="total-row final">
                        <span>💳 Total Amount Paid:</span>
                        <span>₹${order.totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    ${totalSavings > 0 ? `
                    <div style="text-align: center; margin-top: 16px; padding: 12px; background: linear-gradient(45deg, #ecfdf5, #d1fae5); border-radius: 8px; border: 2px dashed #10b981;">
                        <p style="color: #065f46; font-weight: 600; margin: 0;">🎊 Congratulations! You saved ₹${totalSavings.toLocaleString('en-IN')} on this order!</p>
                    </div>` : ''}
                </div>

                <!-- Payment Info -->
                <div class="section">
                    <h2>💳 Payment Information</h2>
                    <div class="info-card" style="border-left-color: #10b981;">
                        <h3>💰 Payment Details</h3>
                        <p><strong>Method:</strong> ${order.paymentInfo?.type || 'Cash on Delivery'}</p>
                        <p><strong>Status:</strong> <span style="color: #059669; font-weight: 700; background: #dcfce7; padding: 4px 8px; border-radius: 6px;">${order.paymentInfo?.status || 'Confirmed'}</span></p>
                        ${order.paymentInfo?.id ? `<p><strong>Transaction ID:</strong> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${order.paymentInfo.id}</code></p>` : ''}
                        <p><strong>Security:</strong> <span style="color: #059669;">🔒 Secured & Encrypted</span></p>
                    </div>
                </div>

                <!-- Order Timeline -->
                <div class="section">
                    <h2>📈 Order Timeline & What's Next</h2>
                    <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); padding: 28px; border-radius: 16px; border-left: 6px solid #3b82f6;">
                        <h4 style="color: #1e40af; margin-bottom: 16px; font-size: 18px; display: flex; align-items: center; gap: 8px;">
                            📦 <span>Your Order Journey</span>
                        </h4>
                        <p style="color: #374151; margin-bottom: 20px; font-size: 16px;">Track your order as it moves through our fulfillment process:</p>
                        <div style="position: relative;">
                            <div style="position: absolute; left: 15px; top: 0; bottom: 0; width: 3px; background: linear-gradient(to bottom, #10b981, #e5e7eb); border-radius: 2px;"></div>
                            <div style="margin-left: 40px;">
                                <div style="margin-bottom: 20px; position: relative;">
                                    <div style="position: absolute; left: -28px; top: 2px; width: 12px; height: 12px; background: #10b981; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
                                    <h5 style="color: #059669; font-weight: 700; margin-bottom: 4px;">✅ Order Confirmed</h5>
                                    <p style="color: #6b7280; font-size: 14px; margin: 0;">Your order has been received and payment processed</p>
                                    <p style="color: #374151; font-size: 12px; margin: 4px 0 0 0; font-weight: 500;">Completed: ${orderDate}</p>
                                </div>
                                <div style="margin-bottom: 20px; position: relative;">
                                    <div style="position: absolute; left: -28px; top: 2px; width: 12px; height: 12px; background: #3b82f6; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
                                    <h5 style="color: #3b82f6; font-weight: 700; margin-bottom: 4px;">📦 Processing & Packaging</h5>
                                    <p style="color: #6b7280; font-size: 14px; margin: 0;">Your items are being carefully packed for shipment</p>
                                    <p style="color: #374151; font-size: 12px; margin: 4px 0 0 0; font-weight: 500;">Expected: 1-2 business days</p>
                                </div>
                                <div style="margin-bottom: 20px; position: relative;">
                                    <div style="position: absolute; left: -28px; top: 2px; width: 12px; height: 12px; background: #e5e7eb; border-radius: 50%; border: 3px solid #ffffff;"></div>
                                    <h5 style="color: #6b7280; font-weight: 700; margin-bottom: 4px;">🚚 Shipped & In Transit</h5>
                                    <p style="color: #6b7280; font-size: 14px; margin: 0;">Your package is on its way to you</p>
                                    <p style="color: #374151; font-size: 12px; margin: 4px 0 0 0; font-weight: 500;">Expected: 2-3 business days</p>
                                </div>
                                <div style="margin-bottom: 0; position: relative;">
                                    <div style="position: absolute; left: -28px; top: 2px; width: 12px; height: 12px; background: #e5e7eb; border-radius: 50%; border: 3px solid #ffffff;"></div>
                                    <h5 style="color: #6b7280; font-weight: 700; margin-bottom: 4px;">🏠 Delivered</h5>
                                    <p style="color: #6b7280; font-size: 14px; margin: 0;">Your order arrives at your doorstep</p>
                                    <p style="color: #374151; font-size: 12px; margin: 4px 0 0 0; font-weight: 500;">Expected: ${deliveryDate}</p>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top: 24px; padding: 16px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border: 1px solid #bfdbfe;">
                            <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 600; text-align: center;">
                                📱 You'll receive SMS and email updates at each step!
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div style="text-align: center; margin: 40px 0; padding: 24px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 16px;">
                    <h3 style="color: #374151; margin-bottom: 20px; font-size: 20px;">Quick Actions</h3>
                    <a href="${frontendUrl}/user/track-order/${order._id}" class="btn" style="background: linear-gradient(135deg, #10b981, #059669);">📱 Track Your Order</a>
                    <a href="${frontendUrl}/user/order/${order._id}" class="btn">📋 View Order Details</a>
                    <a href="${frontendUrl}/products" class="btn" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">🛍️ Continue Shopping</a>
                </div>

                <!-- Customer Support -->
                <div class="section">
                    <h2>🤝 Need Help? We're Here For You!</h2>
                    <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 28px; border-radius: 16px; text-align: center; border: 2px solid #bae6fd;">
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #0369a1; margin-bottom: 12px; font-size: 20px;">💬 24/7 Customer Support</h4>
                            <p style="color: #374151; margin-bottom: 20px; font-size: 16px; line-height: 1.6;">Have questions about your order? Our dedicated customer support team is ready to assist you anytime!</p>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
                            <a href="mailto:support@wanttar.in" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 16px 20px; text-decoration: none; border-radius: 12px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                📧 Email Support
                            </a>
                            <a href="tel:+91-XXX-XXX-XXXX" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 16px 20px; text-decoration: none; border-radius: 12px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.4); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                📞 Call Us Now
                            </a>
                            <a href="${frontendUrl}/contact" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 16px 20px; text-decoration: none; border-radius: 12px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.4); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                                💬 Live Chat
                            </a>
                        </div>
                        <div style="background: rgba(59, 130, 246, 0.1); padding: 16px; border-radius: 8px; border: 1px solid #bfdbfe;">
                            <p style="color: #1e40af; margin: 0; font-size: 14px; font-weight: 600;">
                                🕐 Average Response Time: Under 30 minutes | 🌟 Customer Satisfaction: 99.8%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="footer">
                <div style="margin-bottom: 30px;">
                    <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 36px; backdrop-filter: blur(10px);">🏢</div>
                    <h3 style="font-size: 28px; margin-bottom: 8px;">Thank you for choosing Samrudhi Group! 🙏</h3>
                    <p style="font-size: 16px; line-height: 1.6; max-width: 600px; margin: 0 auto 20px;">We're committed to providing you with the best products and exceptional service. Your trust means everything to us!</p>
                </div>
                
                <div style="background: rgba(255,255,255,0.1); padding: 24px; border-radius: 12px; margin-bottom: 24px; backdrop-filter: blur(10px);">
                    <h4 style="color: #ffffff; margin-bottom: 16px; font-size: 18px;">🎁 Exclusive Benefits</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; text-align: center;">
                        <div>
                            <div style="font-size: 24px; margin-bottom: 8px;">🚚</div>
                            <p style="margin: 0; font-size: 14px; font-weight: 500;">Free Shipping on Orders Above ₹999</p>
                        </div>
                        <div>
                            <div style="font-size: 24px; margin-bottom: 8px;">🔄</div>
                            <p style="margin: 0; font-size: 14px; font-weight: 500;">30-Day Easy Returns</p>
                        </div>
                        <div>
                            <div style="font-size: 24px; margin-bottom: 8px;">🏆</div>
                            <p style="margin: 0; font-size: 14px; font-weight: 500;">Premium Quality Guarantee</p>
                        </div>
                    </div>
                </div>

                <div class="social-icons">
                    <h4 style="color: #ffffff; margin-bottom: 16px;">Follow Us for Updates & Exclusive Deals!</h4>
                    <a href="#" style="margin: 0 12px;">📘 Facebook</a>
                    <a href="#" style="margin: 0 12px;">📷 Instagram</a>
                    <a href="#" style="margin: 0 12px;">🐦 Twitter</a>
                    <a href="#" style="margin: 0 12px;">🔗 LinkedIn</a>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <p style="margin-bottom: 8px; font-size: 14px; opacity: 0.8;">
                        This email was sent to <strong>${user.email}</strong>
                    </p>
                    <p style="margin: 0; font-size: 12px; opacity: 0.7;">
                        © 2025 Samrudhi Group. All rights reserved. | 🌐 www.wanttar.in
                    </p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;

  return htmlTemplate;
};

// Generate order cancellation email
const generateOrderCancellationEmail = (order, user, reason) => {
  // Use new orderNumber if available, otherwise fall back to old format
  const orderNumber = order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const cancelDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate total items
  const totalItems = order.cart.reduce((sum, item) => sum + item.qty, 0);
  
  // Backend URL for images
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Generate product details HTML
  const productDetails = order.cart.map(item => {
    const itemTotal = item.discountPrice * item.qty;
    
    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 20px 0; vertical-align: top;">
          <div style="display: flex; align-items: flex-start; gap: 16px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(45deg, #f3f4f6, #e5e7eb); border-radius: 12px; overflow: hidden; flex-shrink: 0;">
              ${item.images && item.images[0] ? 
                `<img src="${backendUrl}${item.images[0]}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
                `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 14px;">📦</div>`
              }
            </div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">${item.name}</h4>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; color: #6b7280;">Qty: ${item.qty}</span>
                <span style="font-size: 16px; font-weight: 700; color: #111827;">₹${itemTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Cancelled - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">Order Cancelled</h1>
      <p style="margin: 10px 0 0 0; color: #fecaca; font-size: 16px;">We're sorry to inform you about this cancellation</p>
    </div>

    <!-- Cancellation Notice -->
    <div style="padding: 30px; background-color: #fef2f2; border-left: 4px solid #dc2626; margin: 20px;">
      <h2 style="margin: 0 0 10px 0; color: #dc2626; font-size: 20px; font-weight: 600;">⚠️ Order Cancellation Notice</h2>
      <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
        Your order <strong>#${orderNumber}</strong> has been cancelled by our admin team. 
        ${reason ? `Reason: ${reason}` : 'Please contact customer support for more details.'}
      </p>
    </div>

    <!-- Order Details -->
    <div style="padding: 0 30px;">
      <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px; font-weight: 700;">Cancelled Order Details</h2>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div>
            <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">ORDER NUMBER</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; color: #111827; font-weight: 700;">#${orderNumber}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">ORDER DATE</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #111827; font-weight: 600;">${orderDate}</p>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
          <div>
            <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">CANCELLED ON</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #dc2626; font-weight: 600;">${cancelDate}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">TOTAL ITEMS</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #111827; font-weight: 600;">${totalItems} items</p>
          </div>
        </div>
      </div>

      <!-- Products -->
      <div style="margin-bottom: 30px;">
        <h3 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600;">Cancelled Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${productDetails}
        </table>
      </div>

      <!-- Refund Information -->
      <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
        <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: 600;">💳 Refund Information</h3>
        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
          Your refund of <strong>₹${order.totalPrice.toLocaleString('en-IN')}</strong> will be processed within 5-7 business days to your original payment method.
        </p>
      </div>

      <!-- Customer Support -->
      <div style="background-color: #f3f4f6; padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px; font-weight: 600;">Need Help?</h3>
        <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
          If you have any questions about this cancellation or need assistance, our customer support team is here to help.
        </p>
        <a href="mailto:support@yourstore.com" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">Contact Support</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #111827; padding: 30px; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">Thank you for choosing our platform</p>
      <p style="margin: 0; color: #6b7280; font-size: 12px;">This is an automated email. Please do not reply to this email.</p>
      <div style="margin-top: 20px;">
        <a href="${frontendUrl}" style="color: #60a5fa; text-decoration: none; font-size: 14px; font-weight: 600;">Visit Our Store</a>
      </div>
    </div>

  </div>
</body>
</html>
  `;

  return htmlTemplate;
};

// Generate refund success email
const generateRefundSuccessEmail = (order, user) => {
  // Use new orderNumber if available, otherwise fall back to old format
  const orderNumber = order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const refundDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate total items
  const totalItems = order.cart.reduce((sum, item) => sum + item.qty, 0);
  
  // Backend URL for images
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Generate product details HTML
  const productDetails = order.cart.map(item => {
    const itemTotal = item.discountPrice * item.qty;
    
    return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 20px 0; vertical-align: top;">
          <div style="display: flex; align-items: flex-start; gap: 16px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(45deg, #f3f4f6, #e5e7eb); border-radius: 12px; overflow: hidden; flex-shrink: 0;">
              ${item.images && item.images[0] ? 
                `<img src="${backendUrl}${item.images[0]}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">` :
                `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 14px;">📦</div>`
              }
            </div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">${item.name}</h4>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 14px; color: #6b7280;">Qty: ${item.qty}</span>
                <span style="font-size: 16px; font-weight: 700; color: #111827;">₹${itemTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refund Processed - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">Refund Processed</h1>
      <p style="margin: 10px 0 0 0; color: #a7f3d0; font-size: 16px;">Your refund has been successfully processed</p>
    </div>

    <!-- Refund Success Notice -->
    <div style="padding: 30px; background-color: #f0fdf4; border-left: 4px solid #10b981; margin: 20px;">
      <h2 style="margin: 0 0 10px 0; color: #059669; font-size: 20px; font-weight: 600;">✅ Refund Confirmation</h2>
      <p style="margin: 0; color: #166534; font-size: 14px; line-height: 1.6;">
        Great news! Your refund for order <strong>${orderNumber}</strong> has been processed successfully. 
        The amount will be credited to your original payment method within 5-7 business days.
      </p>
    </div>

    <!-- Order Details -->
    <div style="padding: 0 30px;">
      <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px; font-weight: 700;">Refund Details</h2>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div>
            <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">ORDER NUMBER</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; color: #111827; font-weight: 700;">${orderNumber}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">ORDER DATE</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #111827; font-weight: 600;">${orderDate}</p>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
          <div>
            <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">REFUND PROCESSED</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #059669; font-weight: 600;">${refundDate}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">TOTAL ITEMS</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #111827; font-weight: 600;">${totalItems} items</p>
          </div>
        </div>
      </div>

      <!-- Products -->
      <div style="margin-bottom: 30px;">
        <h3 style="margin: 0 0 20px 0; color: #111827; font-size: 18px; font-weight: 600;">Refunded Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${productDetails}
        </table>
      </div>

      <!-- Refund Amount -->
      <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #3b82f6; text-center;">
        <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: 600;">💰 Refund Amount</h3>
        <p style="margin: 0 0 10px 0; color: #1e40af; font-size: 32px; font-weight: 700;">₹${order.totalPrice.toLocaleString('en-IN')}</p>
        <p style="margin: 0; color: #1e40af; font-size: 14px;">
          This amount will be credited to your original payment method within 5-7 business days.
        </p>
      </div>

      <!-- Customer Support -->
      <div style="background-color: #f3f4f6; padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
        <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px; font-weight: 600;">Need Help?</h3>
        <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
          If you have any questions about your refund or need assistance, our customer support team is here to help.
        </p>
        <a href="mailto:support@yourstore.com" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">Contact Support</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #111827; padding: 30px; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">Thank you for shopping with us</p>
      <p style="margin: 0; color: #6b7280; font-size: 12px;">This is an automated email. Please do not reply to this email.</p>
      <div style="margin-top: 20px;">
        <a href="${frontendUrl}" style="color: #60a5fa; text-decoration: none; font-size: 14px; font-weight: 600;">Visit Our Store</a>
      </div>
    </div>

  </div>
</body>
</html>
  `;

  return htmlTemplate;
};

// Generate refund request email (for seller notification)
const generateRefundRequestEmail = (order, user) => {
  // Use new orderNumber if available, otherwise fall back to old format
  const orderNumber = order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const requestDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refund Request - ${orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 40px 30px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">Refund Request</h1>
      <p style="margin: 10px 0 0 0; color: #fef3c7; font-size: 16px;">A customer has requested a refund</p>
    </div>

    <!-- Request Notice -->
    <div style="padding: 30px; background-color: #fffbeb; border-left: 4px solid #f59e0b; margin: 20px;">
      <h2 style="margin: 0 0 10px 0; color: #d97706; font-size: 20px; font-weight: 600;">⚠️ Action Required</h2>
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
        Customer <strong>${user.name}</strong> has requested a refund for order <strong>${orderNumber}</strong>. 
        Please review this request and take appropriate action.
      </p>
    </div>

    <!-- Order Details -->
    <div style="padding: 0 30px;">
      <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 22px; font-weight: 700;">Order Information</h2>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
          <div>
            <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">ORDER NUMBER</p>
            <p style="margin: 5px 0 0 0; font-size: 18px; color: #111827; font-weight: 700;">${orderNumber}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">ORDER DATE</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #111827; font-weight: 600;">${orderDate}</p>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
          <div>
            <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">REFUND REQUESTED</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #d97706; font-weight: 600;">${requestDate}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 14px; color: #6b7280; font-weight: 600;">ORDER VALUE</p>
            <p style="margin: 5px 0 0 0; font-size: 16px; color: #111827; font-weight: 600;">₹${order.totalPrice.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      <!-- Customer Info -->
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
        <h3 style="margin: 0 0 15px 0; color: #111827; font-size: 18px; font-weight: 600;">Customer Information</h3>
        <div>
          <p style="margin: 0 0 8px 0; color: #374151;"><strong>Name:</strong> ${user.name}</p>
          <p style="margin: 0 0 8px 0; color: #374151;"><strong>Email:</strong> ${user.email}</p>
          <p style="margin: 0; color: #374151;"><strong>Order Total:</strong> ₹${order.totalPrice.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <!-- Action Required -->
      <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #3b82f6; text-center;">
        <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px; font-weight: 600;">👆 Action Required</h3>
        <p style="margin: 0 0 20px 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
          Please review this refund request and update the order status accordingly.
        </p>
        <a href="${frontendUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">Review Order</a>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #111827; padding: 30px; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 14px;">Seller Dashboard Notification</p>
      <p style="margin: 0; color: #6b7280; font-size: 12px;">This is an automated email. Please do not reply to this email.</p>
    </div>

  </div>
</body>
</html>
  `;

  return htmlTemplate;
};

module.exports = {
  generateOrderConfirmationEmail,
  generateOrderCancellationEmail,
  generateRefundSuccessEmail,
  generateRefundRequestEmail
};