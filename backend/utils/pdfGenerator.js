const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Function to get company logo as base64
const getCompanyLogoBase64 = () => {
  try {
    const logoPath = path.join(__dirname, '../../frontend/public/Branding_logo.jpg');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      return `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
    }
    return null;
  } catch (error) {
    console.error('Error loading company logo:', error);
    return null;
  }
};

// Generate HTML template for invoice
const generateInvoiceHTML = (order, shop) => {
  // Get company logo
  const logoBase64 = getCompanyLogoBase64();
  
  const formatDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '0.00';
    return parseFloat(amount).toFixed(2);
  };

  const safeGet = (obj, path, defaultValue = undefined) => {
    if (!obj) return defaultValue;
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      result = result?.[key];
    }
    return result || defaultValue;
  };

  const orderNumber = order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`; // Use orderNumber if available
  const invoiceNumber = `INV${order.orderNumber || order._id.toString().slice(-12).toUpperCase()}`;
  
  // Use real order pricing if available, otherwise calculate from cart
  let subtotal = safeGet(order, 'subTotalPrice') || 0;
  let shippingPrice = safeGet(order, 'shippingPrice') || 0;
  let taxAmount = safeGet(order, 'tax') || 0;
  let discountPrice = safeGet(order, 'discountPrice') || 0;
  let grandTotalFromOrder = safeGet(order, 'totalPrice') || 0;
  
  // If order doesn't have pricing fields, calculate from cart
  if (!subtotal && order.cart && order.cart.length > 0) {
    order.cart.forEach(item => {
      subtotal += (item.qty || 1) * (item.discountPrice || 0);
    });
  }
  
  // Calculate tax breakdown (assuming 18% GST split equally between CGST and SGST)
  const cgst = taxAmount / 2;
  const sgst = taxAmount / 2;
  
  // Use order's total price or calculate it
  const grandTotal = grandTotalFromOrder || (subtotal + shippingPrice + taxAmount - discountPrice);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tax Invoice #${invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #000;
            background: #fff;
            font-size: 12px;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #000;
        }
        
        .company-logo {
            flex-shrink: 0;
            margin-right: 20px;
        }
        
        .company-logo img {
            width: 80px;
            height: 80px;
            object-fit: contain;
        }
        
        .invoice-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .company-details {
            font-size: 11px;
            line-height: 1.3;
            margin-bottom: 10px;
        }
        
        .gstin {
            font-weight: bold;
            margin-top: 10px;
        }
        
        .invoice-number {
            text-align: right;
            border: 2px solid #000;
            padding: 10px;
            margin-left: 20px;
        }
        
        .invoice-number-label {
            font-size: 12px;
            font-weight: bold;
        }
        
        .invoice-number-value {
            font-size: 14px;
            font-weight: bold;
            margin-top: 5px;
        }
        
        .order-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        
        .order-info {
            flex: 1;
        }
        
        .customer-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
        }
        
        .bill-to, .ship-to {
            flex: 1;
            margin-right: 20px;
        }
        
        .section-title {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .customer-details {
            font-size: 11px;
            line-height: 1.4;
        }
        
        .warranty-note {
            text-align: right;
            font-style: italic;
            font-size: 10px;
            margin-bottom: 20px;
        }
        
        .items-section {
            margin-bottom: 20px;
        }
        
        .items-header {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 14px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #000;
        }
        
        .items-table th {
            background-color: #f5f5f5;
            border: 1px solid #000;
            padding: 8px 4px;
            text-align: center;
            font-weight: bold;
            font-size: 11px;
        }
        
        .items-table td {
            border: 1px solid #000;
            padding: 8px 4px;
            text-align: center;
            font-size: 11px;
        }
        
        .product-cell {
            text-align: left !important;
            max-width: 120px;
        }
        
        .title-cell {
            text-align: left !important;
            max-width: 200px;
        }
        
        .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
        }
        
        .grand-total {
            text-align: right;
            margin-top: 20px;
            font-size: 16px;
            font-weight: bold;
        }
        
        .company-footer {
            text-align: right;
            margin-top: 10px;
            font-weight: bold;
            font-size: 12px;
        }
        
        .product-code {
            font-size: 10px;
            color: #666;
            margin-top: 2px;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-title">Tax Invoice</div>
        
        <div class="invoice-header">
            ${logoBase64 ? `<div class="company-logo">
                <img src="${logoBase64}" alt="Company Logo" />
            </div>` : ''}
            <div class="company-info">
                <div class="company-name">Sold By: ${safeGet(shop, 'name') || 'WantTar Platform'}</div>
                <div class="company-details">
                    <strong>Ship-from Address:</strong> ${safeGet(shop, 'address')}<br>
                    Email: ${safeGet(shop, 'email')}<br>
                    Phone: ${safeGet(shop, 'phoneNumber')}
                </div>
                <div class="gstin">GSTIN - ${safeGet(shop, 'gstNumber')}</div>
            </div>
            
            <div class="invoice-number">
                <div class="invoice-number-label">Invoice Number</div>
                <div class="invoice-number-value"># ${invoiceNumber}</div>
            </div>
        </div>
        
        <div class="order-details">
            <div class="order-info">
                <strong>Order ID:</strong> ${orderNumber}<br>
                <strong>Order Date:</strong> ${formatDate(order.createdAt)}<br>
                <strong>Invoice Date:</strong> ${formatDate(new Date())}<br>
                <strong>Payment Status:</strong> ${safeGet(order, 'paymentInfo.status')}<br>
                <strong>Delivery Status:</strong> ${safeGet(order, 'status')}
            </div>
        </div>
        
        <div class="customer-section">
            <div class="bill-to">
                <div class="section-title">Bill To</div>
                <div class="customer-details">
                    ${safeGet(order, 'user.name')}<br>
                    ${safeGet(order, 'shippingAddress.address1')}<br>
                    ${safeGet(order, 'shippingAddress.address2') ? safeGet(order, 'shippingAddress.address2') + '<br>' : ''}
                    ${safeGet(order, 'shippingAddress.city')}, ${safeGet(order, 'shippingAddress.state')} ${safeGet(order, 'shippingAddress.zipCode')}<br>
                    ${safeGet(order, 'shippingAddress.country')}<br>
                    Phone: ${safeGet(order, 'user.phoneNumber') || safeGet(order, 'shippingAddress.phoneNumber')}
                </div>
            </div>
            
            <div class="ship-to">
                <div class="section-title">Ship To</div>
                <div class="customer-details">
                    ${safeGet(order, 'user.name')}<br>
                    ${safeGet(order, 'shippingAddress.address1')}<br>
                    ${safeGet(order, 'shippingAddress.address2') ? safeGet(order, 'shippingAddress.address2') + '<br>' : ''}
                    ${safeGet(order, 'shippingAddress.city')}, ${safeGet(order, 'shippingAddress.state')} ${safeGet(order, 'shippingAddress.zipCode')}<br>
                    ${safeGet(order, 'shippingAddress.country')}<br>
                    Phone: ${safeGet(order, 'user.phoneNumber') || safeGet(order, 'shippingAddress.phoneNumber')}
                </div>
            </div>
        </div>
        
        <div class="warranty-note">
            *Keep this invoice and<br>
            manufacturer box for<br>
            warranty purposes.
        </div>
        
        <div class="items-section">
            <div class="items-header">Total items: ${order.cart.length}</div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Title</th>
                        <th>Qty</th>
                        <th>Gross<br>Amount ₹</th>
                        <th>Discount ₹</th>
                        <th>Taxable<br>Value ₹</th>
                        <th>CGST<br>₹</th>
                        <th>SGST<br>/UTGST<br>₹</th>
                        <th>Total ₹</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.cart.map(item => {
                      const itemQty = item.qty || 1;
                      const itemDiscountPrice = item.discountPrice || 0; // Final price after discount
                      const itemOriginalPrice = item.originalPrice || item.discountPrice || 0; // MRP/List price
                      
                      // Standard invoice calculations:
                      const itemGross = itemQty * itemOriginalPrice; // Gross = Qty × Original Price (MRP)
                      const itemDiscount = itemQty * (itemOriginalPrice - itemDiscountPrice); // Total discount amount
                      const itemTaxableValue = itemQty * itemDiscountPrice; // Amount on which tax is calculated
                      
                      // Calculate GST (18% total: 9% CGST + 9% SGST)
                      const taxRate = 0.18;
                      const itemCGST = (itemTaxableValue * taxRate) / 2; // 9% CGST
                      const itemSGST = (itemTaxableValue * taxRate) / 2; // 9% SGST
                      const itemTotal = itemTaxableValue + itemCGST + itemSGST; // Final amount including tax
                      
                      return `
                        <tr>
                            <td class="product-cell">
                                ${item.name || 'Product Name'}<br>
                                <div class="product-code">
                                    SKU: ${item._id ? item._id.toString().slice(-8).toUpperCase() : 'N/A'}<br>
                                    HSN/SAC: ${item.category || '62052000'}
                                </div>
                            </td>
                            <td class="title-cell">
                                ${item.name || 'Product Name'}<br>
                                ${item.size ? `<strong>Size:</strong> ${item.size}<br>` : ''}
                                ${item.color ? `<strong>Color:</strong> ${item.color}<br>` : ''}
                                <strong>Unit Price:</strong> ₹${formatCurrency(itemDiscountPrice)}<br>
                                <strong>CGST:</strong> ${(taxRate * 50).toFixed(1)}% | <strong>SGST:</strong> ${(taxRate * 50).toFixed(1)}%
                            </td>
                            <td>${itemQty}</td>
                            <td>₹${formatCurrency(itemGross)}</td>
                            <td>-₹${formatCurrency(itemDiscount)}</td>
                            <td>₹${formatCurrency(itemTaxableValue)}</td>
                            <td>₹${formatCurrency(itemCGST)}</td>
                            <td>₹${formatCurrency(itemSGST)}</td>
                            <td>₹${formatCurrency(itemTotal)}</td>
                        </tr>
                      `;
                    }).join('')}
                    
                    <tr class="total-row">
                        <td colspan="2"><strong>Subtotal</strong></td>
                        <td><strong>${order.cart.reduce((sum, item) => sum + (item.qty || 1), 0)}</strong></td>
                        <td><strong>₹${formatCurrency(subtotal + discountPrice)}</strong></td>
                        <td><strong>-₹${formatCurrency(discountPrice)}</strong></td>
                        <td><strong>₹${formatCurrency(subtotal)}</strong></td>
                        <td><strong>₹${formatCurrency(cgst)}</strong></td>
                        <td><strong>₹${formatCurrency(sgst)}</strong></td>
                        <td><strong>₹${formatCurrency(subtotal + cgst + sgst)}</strong></td>
                    </tr>
                    ${shippingPrice > 0 ? `
                    <tr>
                        <td colspan="8"><strong>Shipping Charges</strong></td>
                        <td><strong>₹${formatCurrency(shippingPrice)}</strong></td>
                    </tr>
                    ` : ''}
                </tbody>
            </table>
        </div>
        
        ${shippingPrice > 0 || discountPrice > 0 ? `
        <div style="text-align: right; margin-top: 10px; font-size: 12px;">
            ${subtotal > 0 ? `<div>Subtotal: ₹${formatCurrency(subtotal)}</div>` : ''}
            ${shippingPrice > 0 ? `<div>Shipping: ₹${formatCurrency(shippingPrice)}</div>` : ''}
            ${discountPrice > 0 ? `<div>Discount: -₹${formatCurrency(discountPrice)}</div>` : ''}
            ${taxAmount > 0 ? `<div>Tax (GST): ₹${formatCurrency(taxAmount)}</div>` : ''}
        </div>
        ` : ''}
        
        <div class="grand-total">
            Grand Total &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ₹ ${formatCurrency(grandTotal)}
        </div>
        
        <div class="company-footer">
            ${safeGet(shop, 'name') || 'WantTar E-Commerce Platform'}
        </div>
    </div>
</body>
</html>
  `;
};

// Generate PDF from order data
const generateInvoicePDF = async (order, shop = null) => {
  let browser;
  try {
    console.log(`🔄 Starting PDF generation for order ${order._id}`);
    
    // Launch browser with proper configuration
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1200, height: 800 });
    
    // Generate HTML content
    console.log(`📄 Generating HTML content for order ${order._id}`);
    const htmlContent = generateInvoiceHTML(order, shop);
    
    if (!htmlContent || htmlContent.length === 0) {
      throw new Error('Generated HTML content is empty');
    }
    
    console.log(`📄 HTML content generated: ${htmlContent.length} characters`);
    
    // Set content with proper wait conditions
    await page.setContent(htmlContent, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    });
    
    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');
    
    console.log(`🔄 Generating PDF buffer for order ${order._id}`);
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      preferCSSPageSize: true
    });
    
    await browser.close();
    
    // Validate PDF buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF buffer is empty');
    }
    
    // Convert Uint8Array to Buffer if needed
    const finalBuffer = Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
    
    console.log(`✅ PDF generated successfully for order ${order._id}: ${finalBuffer.length} bytes`);
    return finalBuffer;
    
  } catch (error) {
    console.error(`❌ PDF generation failed for order ${order._id}:`, error);
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

module.exports = {
  generateInvoicePDF,
  generateInvoiceHTML
};