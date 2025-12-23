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
const generateInvoiceHTML = async (order, shop) => {
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

  // Helper function to extract product attributes from cart item
  const getProductAttributes = (item) => {
    let attributes = [];
    
    // Check for various attribute naming conventions
    const attributeKeys = [
      'size', 'selectedSize', 'Size', 'product_size',
      'color', 'selectedColor', 'Color', 'product_color',
      'variant', 'selectedVariant', 'Variant',
      'model', 'selectedModel', 'Model',
      'brand', 'selectedBrand', 'Brand',
      'material', 'selectedMaterial', 'Material',
      'style', 'selectedStyle', 'Style'
    ];
    
    // Check direct attributes
    attributeKeys.forEach(key => {
      if (item[key] && typeof item[key] === 'string' && item[key].trim() !== '') {
        const attributeName = key.replace(/^selected/, '').toLowerCase();
        const capitalizedName = attributeName.charAt(0).toUpperCase() + attributeName.slice(1);
        if (!attributes.some(attr => attr.includes(capitalizedName))) {
          attributes.push(`<strong>${capitalizedName}:</strong> ${item[key]}`);
        }
      }
    });
    
    // Check if item has attributes object
    if (item.attributes && typeof item.attributes === 'object') {
      Object.keys(item.attributes).forEach(key => {
        if (item.attributes[key] && typeof item.attributes[key] === 'string' && item.attributes[key].trim() !== '') {
          const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
          if (!attributes.some(attr => attr.includes(capitalizedKey))) {
            attributes.push(`<strong>${capitalizedKey}:</strong> ${item.attributes[key]}`);
          }
        }
      });
    }
    
    // Check if item has selectedAttributes object
    if (item.selectedAttributes && typeof item.selectedAttributes === 'object') {
      Object.keys(item.selectedAttributes).forEach(key => {
        if (item.selectedAttributes[key] && typeof item.selectedAttributes[key] === 'string' && item.selectedAttributes[key].trim() !== '') {
          const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
          if (!attributes.some(attr => attr.includes(capitalizedKey))) {
            attributes.push(`<strong>${capitalizedKey}:</strong> ${item.selectedAttributes[key]}`);
          }
        }
      });
    }
    
    // Check if item has variants array (for complex attribute structures)
    if (item.selectedVariant && typeof item.selectedVariant === 'object') {
      Object.keys(item.selectedVariant).forEach(key => {
        if (item.selectedVariant[key] && typeof item.selectedVariant[key] === 'string' && item.selectedVariant[key].trim() !== '' && key !== '_id' && key !== 'id') {
          const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
          if (!attributes.some(attr => attr.includes(capitalizedKey))) {
            attributes.push(`<strong>${capitalizedKey}:</strong> ${item.selectedVariant[key]}`);
          }
        }
      });
    }
    
    // If no attributes found, try to get from product configuration
    if (attributes.length === 0 && item.productConfiguration) {
      if (item.productConfiguration.size) {
        attributes.push(`<strong>Size:</strong> ${item.productConfiguration.size}`);
      }
      if (item.productConfiguration.color) {
        attributes.push(`<strong>Color:</strong> ${item.productConfiguration.color}`);
      }
    }
    
    return attributes.length > 0 ? attributes.join('<br>') + '<br>' : '';
  };

  const orderNumber = order.orderNumber || `#${order._id.toString().slice(-8).toUpperCase()}`; // Use orderNumber if available
  const invoiceNumber = `INV${order.orderNumber || order._id.toString().slice(-12).toUpperCase()}`;
  
  // Use real order pricing if available, otherwise calculate from cart
  let subtotal = safeGet(order, 'subTotalPrice') || 0;
  let shippingPrice = safeGet(order, 'shippingPrice') || 0;
  let taxAmount = safeGet(order, 'tax') || 0;
  let discountPrice = safeGet(order, 'discountPrice') || 0;
  let grandTotalFromOrder = safeGet(order, 'totalPrice') || 0;
  
  // Calculate GST from product configurations
  let productGSTTotal = 0;
  
  // If order doesn't have pricing fields, calculate from cart
  if (!subtotal && order.cart && order.cart.length > 0) {
    order.cart.forEach(item => {
      const itemQty = item.qty || 1;
      const itemDiscountPrice = item.discountPrice || 0;
      const itemTaxableValue = itemQty * itemDiscountPrice;
      subtotal += itemTaxableValue;
      
      // Calculate GST for this item
      const gstConfig = item.gstConfiguration || { isGstApplicable: false };
      if (gstConfig.isGstApplicable) {
        if (gstConfig.gstType === 'separate') {
          productGSTTotal += (itemTaxableValue * (gstConfig.cgstRate || 0)) / 100;
          productGSTTotal += (itemTaxableValue * (gstConfig.sgstRate || 0)) / 100;
        } else {
          productGSTTotal += (itemTaxableValue * (gstConfig.combinedGstRate || 0)) / 100;
        }
      }
    });
  } else if (order.cart && order.cart.length > 0) {
    // Even if we have order pricing, calculate product GST for display
    order.cart.forEach(item => {
      const itemQty = item.qty || 1;
      const itemDiscountPrice = item.discountPrice || 0;
      const itemTaxableValue = itemQty * itemDiscountPrice;
      
      const gstConfig = item.gstConfiguration || { isGstApplicable: false };
      if (gstConfig.isGstApplicable) {
        if (gstConfig.gstType === 'separate') {
          productGSTTotal += (itemTaxableValue * (gstConfig.cgstRate || 0)) / 100;
          productGSTTotal += (itemTaxableValue * (gstConfig.sgstRate || 0)) / 100;
        } else {
          productGSTTotal += (itemTaxableValue * (gstConfig.combinedGstRate || 0)) / 100;
        }
      }
    });
  }
  
  // Use order's total price or calculate it (include product GST in calculation)
  const grandTotal = grandTotalFromOrder || (subtotal + shippingPrice + productGSTTotal - discountPrice);

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
                ${safeGet(shop, 'gstNumber') ? `<div class="gstin">GSTIN - ${safeGet(shop, 'gstNumber')}</div>` : ''}
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
            <div style="text-align: center; font-style: italic; margin-bottom: 10px; font-size: 11px;">
                <strong>Note:</strong> All prices shown include applicable GST
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Gross<br>Amount ₹</th>
                        <th>Discount ₹</th>
                        <th>Taxable<br>Value ₹</th>
                        <th>CGST ₹</th>
                        <th>SGST ₹</th>
                        <th>Total ₹</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.cart.map(item => {
                      // Debug log to see what attributes are available
                      console.log(`[PDF Generator] Item attributes for ${item.name}:`, {
                        size: item.size,
                        selectedSize: item.selectedSize,
                        color: item.color,
                        selectedColor: item.selectedColor,
                        attributes: item.attributes,
                        selectedAttributes: item.selectedAttributes,
                        selectedVariant: item.selectedVariant,
                        productConfiguration: item.productConfiguration,
                        allKeys: Object.keys(item)
                      });
                      
                      const itemQty = item.qty || 1;
                      
                      // Check for attribute-specific pricing first
                      let itemDiscountPrice = item.discountPrice || 0;
                      let itemOriginalPrice = item.originalPrice || item.discountPrice || 0;
                      
                      // If there's a selected variant with pricing, use that
                      if (item.selectedVariant && item.selectedVariant.price) {
                        itemDiscountPrice = item.selectedVariant.price;
                        itemOriginalPrice = item.selectedVariant.originalPrice || item.selectedVariant.price;
                      }
                      // Check for attribute configuration pricing
                      else if (item.productConfiguration && item.productConfiguration.price) {
                        itemDiscountPrice = item.productConfiguration.price;
                        itemOriginalPrice = item.productConfiguration.originalPrice || item.productConfiguration.price;
                      }
                      // Check for final calculated price (common when attributes affect pricing)
                      else if (item.finalPrice) {
                        itemDiscountPrice = item.finalPrice;
                        itemOriginalPrice = item.finalOriginalPrice || item.finalPrice;
                      }
                      
                      console.log(`[PDF Generator] Price calculation for ${item.name}:`, {
                        baseDiscountPrice: item.discountPrice,
                        baseOriginalPrice: item.originalPrice,
                        selectedVariantPrice: item.selectedVariant?.price,
                        configurationPrice: item.productConfiguration?.price,
                        finalPrice: item.finalPrice,
                        usedDiscountPrice: itemDiscountPrice,
                        usedOriginalPrice: itemOriginalPrice
                      });
                      
                      // GST breakdown calculations (since GST is included in the price)
                      const gstConfig = item.gstConfiguration || { isGstApplicable: false };
                      console.log(`[PDF Generator] Processing item: ${item.name}, GST Config:`, gstConfig);
                      
                      let itemCGST = 0;
                      let itemSGST = 0;
                      let itemGST = 0;
                      let gstDisplay = 'Not Applicable';
                      let priceWithoutGST = itemDiscountPrice; // Default to full price if no GST
                      let itemTaxableValueForBreakdown = itemDiscountPrice;
                      
                      if (gstConfig.isGstApplicable) {
                        if (gstConfig.gstType === 'separate') {
                          const totalGSTRate = (gstConfig.cgstRate || 0) + (gstConfig.sgstRate || 0);
                          // Extract GST from inclusive price: Price without GST = Inclusive Price ÷ (1 + GST Rate/100)
                          priceWithoutGST = itemDiscountPrice / (1 + totalGSTRate / 100);
                          itemTaxableValueForBreakdown = priceWithoutGST;
                          itemCGST = (priceWithoutGST * (gstConfig.cgstRate || 0)) / 100;
                          itemSGST = (priceWithoutGST * (gstConfig.sgstRate || 0)) / 100;
                          itemGST = itemCGST + itemSGST;
                          gstDisplay = `CGST: ${(gstConfig.cgstRate || 0).toFixed(1)}% (₹${formatCurrency(itemCGST)}) | SGST: ${(gstConfig.sgstRate || 0).toFixed(1)}% (₹${formatCurrency(itemSGST)})`;
                        } else {
                          const totalGSTRate = gstConfig.combinedGstRate || 0;
                          priceWithoutGST = itemDiscountPrice / (1 + totalGSTRate / 100);
                          itemTaxableValueForBreakdown = priceWithoutGST;
                          itemGST = itemDiscountPrice - priceWithoutGST;
                          itemCGST = itemGST / 2; // Split combined GST equally
                          itemSGST = itemGST / 2;
                          gstDisplay = `Total GST: ${(totalGSTRate || 0).toFixed(1)}% | CGST: ₹${formatCurrency(itemCGST)} | SGST: ₹${formatCurrency(itemSGST)}`;
                        }
                      }
                      
                      // Apply quantity to all calculations
                      const itemGrossWithoutGST = itemQty * priceWithoutGST;
                      const itemTotalCGST = itemQty * itemCGST;
                      const itemTotalSGST = itemQty * itemSGST;
                      const itemTaxableValueFinal = itemQty * itemTaxableValueForBreakdown;
                      
                      // Standard invoice calculations with GST breakdown
                      const itemGross = itemQty * itemOriginalPrice; // Gross = Qty × Original Price (MRP)
                      const itemDiscount = itemQty * (itemOriginalPrice - itemDiscountPrice); // Total discount amount
                      const itemTotal = itemDiscountPrice * itemQty; // Final total (GST inclusive)
                      
                      return `
                        <tr>
                            <td class="product-cell">
                                ${item.name || 'Product Name'}<br>
                                <div class="product-code">
                                    SKU: ${item._id ? item._id.toString().slice(-8).toUpperCase() : 'N/A'}<br>
                                    HSN/SAC: ${gstConfig.hsnCode || item.category || '62052000'}
                                </div>
                            </td>
                            <td class="title-cell">
                                ${item.name || 'Product Name'}<br>
                                ${getProductAttributes(item)}
                                <strong>Unit Price:</strong> ₹${formatCurrency(itemDiscountPrice)} <em>(GST Included)</em><br>
                                HSN: ${gstConfig.hsnCode || item.category || '9920'} | ${gstDisplay}
                            </td>
                            <td>${itemQty}</td>
                            <td>₹${formatCurrency(itemGross)}</td>
                            <td>-₹${formatCurrency(itemDiscount)}</td>
                            <td>₹${formatCurrency(itemTaxableValueFinal)}</td>
                            <td>₹${formatCurrency(itemTotalCGST)}</td>
                            <td>₹${formatCurrency(itemTotalSGST)}</td>
                            <td>₹${formatCurrency(itemTotal)}</td>
                        </tr>
                      `;
                    }).join('')}
                    
                    <tr class="total-row">
                        <td colspan="2"><strong>Subtotal</strong></td>
                        <td><strong>${order.cart.reduce((sum, item) => sum + (item.qty || 1), 0)}</strong></td>
                        <td><strong>₹${formatCurrency(subtotal + discountPrice)}</strong></td>
                        <td><strong>-₹${formatCurrency(discountPrice)}</strong></td>
                        <td><strong>₹${formatCurrency(order.cart.reduce((sum, item) => {
                          const itemQty = item.qty || 1;
                          
                          // Use the same price logic as individual rows
                          let itemDiscountPrice = item.discountPrice || 0;
                          if (item.selectedVariant && item.selectedVariant.price) {
                            itemDiscountPrice = item.selectedVariant.price;
                          } else if (item.productConfiguration && item.productConfiguration.price) {
                            itemDiscountPrice = item.productConfiguration.price;
                          } else if (item.finalPrice) {
                            itemDiscountPrice = item.finalPrice;
                          }
                          
                          const gstConfig = item.gstConfiguration || { isGstApplicable: false };
                          if (gstConfig.isGstApplicable) {
                            const totalGSTRate = gstConfig.gstType === 'separate' 
                              ? (gstConfig.cgstRate || 0) + (gstConfig.sgstRate || 0)
                              : (gstConfig.combinedGstRate || 0);
                            const priceWithoutGST = itemDiscountPrice / (1 + totalGSTRate / 100);
                            return sum + (itemQty * priceWithoutGST);
                          }
                          return sum + (itemQty * itemDiscountPrice);
                        }, 0))}</strong></td>
                        <td><strong>₹${formatCurrency(order.cart.reduce((sum, item) => {
                          const itemQty = item.qty || 1;
                          
                          // Use the same price logic as individual rows
                          let itemDiscountPrice = item.discountPrice || 0;
                          if (item.selectedVariant && item.selectedVariant.price) {
                            itemDiscountPrice = item.selectedVariant.price;
                          } else if (item.productConfiguration && item.productConfiguration.price) {
                            itemDiscountPrice = item.productConfiguration.price;
                          } else if (item.finalPrice) {
                            itemDiscountPrice = item.finalPrice;
                          }
                          
                          const gstConfig = item.gstConfiguration || { isGstApplicable: false };
                          if (gstConfig.isGstApplicable) {
                            const cgstRate = gstConfig.cgstRate || (gstConfig.combinedGstRate || 0) / 2;
                            const totalGSTRate = gstConfig.gstType === 'separate' 
                              ? (gstConfig.cgstRate || 0) + (gstConfig.sgstRate || 0)
                              : (gstConfig.combinedGstRate || 0);
                            const priceWithoutGST = itemDiscountPrice / (1 + totalGSTRate / 100);
                            return sum + (itemQty * priceWithoutGST * cgstRate / 100);
                          }
                          return sum;
                        }, 0))}</strong></td>
                        <td><strong>₹${formatCurrency(order.cart.reduce((sum, item) => {
                          const itemQty = item.qty || 1;
                          
                          // Use the same price logic as individual rows
                          let itemDiscountPrice = item.discountPrice || 0;
                          if (item.selectedVariant && item.selectedVariant.price) {
                            itemDiscountPrice = item.selectedVariant.price;
                          } else if (item.productConfiguration && item.productConfiguration.price) {
                            itemDiscountPrice = item.productConfiguration.price;
                          } else if (item.finalPrice) {
                            itemDiscountPrice = item.finalPrice;
                          }
                          
                          const gstConfig = item.gstConfiguration || { isGstApplicable: false };
                          if (gstConfig.isGstApplicable) {
                            const sgstRate = gstConfig.sgstRate || (gstConfig.combinedGstRate || 0) / 2;
                            const totalGSTRate = gstConfig.gstType === 'separate' 
                              ? (gstConfig.cgstRate || 0) + (gstConfig.sgstRate || 0)
                              : (gstConfig.combinedGstRate || 0);
                            const priceWithoutGST = itemDiscountPrice / (1 + totalGSTRate / 100);
                            return sum + (itemQty * priceWithoutGST * sgstRate / 100);
                          }
                          return sum;
                        }, 0))}</strong></td>
                        <td><strong>₹${formatCurrency(subtotal)}</strong></td>
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
        </div>
        ` : ''}
        
        <!-- GST Breakdown Section -->
        ${order.cart.some(item => (item.gstConfiguration || {}).isGstApplicable) ? `
        <div style="text-align: right; margin-top: 15px; font-size: 12px; border-top: 1px solid #ddd; padding-top: 10px;">
            <div style="font-weight: bold; margin-bottom: 8px;">📊 GST Breakdown:</div>
            ${order.cart.map(item => {
              const itemQty = item.qty || 1;
              let itemDiscountPrice = item.discountPrice || 0;
              if (item.selectedVariant && item.selectedVariant.price) {
                itemDiscountPrice = item.selectedVariant.price;
              } else if (item.productConfiguration && item.productConfiguration.price) {
                itemDiscountPrice = item.productConfiguration.price;
              } else if (item.finalPrice) {
                itemDiscountPrice = item.finalPrice;
              }
              
              const gstConfig = item.gstConfiguration || { isGstApplicable: false };
              if (!gstConfig.isGstApplicable) return '';
              
              const totalGSTRate = gstConfig.gstType === 'separate' 
                ? (gstConfig.cgstRate || 0) + (gstConfig.sgstRate || 0)
                : (gstConfig.combinedGstRate || 0);
              const priceWithoutGST = itemDiscountPrice / (1 + totalGSTRate / 100);
              const cgstRate = gstConfig.cgstRate || (gstConfig.combinedGstRate || 0) / 2;
              const sgstRate = gstConfig.sgstRate || (gstConfig.combinedGstRate || 0) / 2;
              const itemCGST = (priceWithoutGST * cgstRate) / 100;
              const itemSGST = (priceWithoutGST * sgstRate) / 100;
              
              return `
                <div style="margin-bottom: 5px;">
                  <strong>${item.name}:</strong><br>
                  &nbsp;&nbsp;• Base Price: ₹${formatCurrency(priceWithoutGST * itemQty)} (excl. GST)<br>
                  &nbsp;&nbsp;• CGST ${cgstRate.toFixed(1)}%: ₹${formatCurrency(itemCGST * itemQty)}<br>
                  &nbsp;&nbsp;• SGST ${sgstRate.toFixed(1)}%: ₹${formatCurrency(itemSGST * itemQty)}<br>
                  &nbsp;&nbsp;• <strong>Total with GST: ₹${formatCurrency(itemDiscountPrice * itemQty)}</strong>
                </div>
              `;
            }).join('')}
              <div style="border-top: 1px solid #ccc; margin-top: 8px; padding-top: 5px; font-weight: bold;">
              Total CGST: ₹${formatCurrency(order.cart.reduce((sum, item) => {
                const itemQty = item.qty || 1;
                let itemDiscountPrice = item.discountPrice || 0;
                if (item.selectedVariant && item.selectedVariant.price) {
                  itemDiscountPrice = item.selectedVariant.price;
                } else if (item.productConfiguration && item.productConfiguration.price) {
                  itemDiscountPrice = item.productConfiguration.price;
                } else if (item.finalPrice) {
                  itemDiscountPrice = item.finalPrice;
                }

                const gstConfig = item.gstConfiguration || { isGstApplicable: false };
                if (!gstConfig.isGstApplicable) return sum;

                const totalGSTRate = gstConfig.gstType === 'separate' 
                  ? (gstConfig.cgstRate || 0) + (gstConfig.sgstRate || 0)
                  : (gstConfig.combinedGstRate || 0);
                const priceWithoutGST = itemDiscountPrice / (1 + totalGSTRate / 100);
                const cgstRate = gstConfig.cgstRate || (gstConfig.combinedGstRate || 0) / 2;
                return sum + (itemQty * priceWithoutGST * cgstRate / 100);
              }, 0))} | Total SGST: ₹${formatCurrency(order.cart.reduce((sum, item) => {
                const itemQty = item.qty || 1;
                let itemDiscountPrice = item.discountPrice || 0;
                if (item.selectedVariant && item.selectedVariant.price) {
                  itemDiscountPrice = item.selectedVariant.price;
                } else if (item.productConfiguration && item.productConfiguration.price) {
                  itemDiscountPrice = item.productConfiguration.price;
                } else if (item.finalPrice) {
                  itemDiscountPrice = item.finalPrice;
                }

                const gstConfig = item.gstConfiguration || { isGstApplicable: false };
                if (!gstConfig.isGstApplicable) return sum;

                const totalGSTRate = gstConfig.gstType === 'separate' 
                  ? (gstConfig.cgstRate || 0) + (gstConfig.sgstRate || 0)
                  : (gstConfig.combinedGstRate || 0);
                const priceWithoutGST = itemDiscountPrice / (1 + totalGSTRate / 100);
                const sgstRate = gstConfig.sgstRate || (gstConfig.combinedGstRate || 0) / 2;
                return sum + (itemQty * priceWithoutGST * sgstRate / 100);
              }, 0))}
            </div>
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
    const htmlContent = await generateInvoiceHTML(order, shop);
    
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