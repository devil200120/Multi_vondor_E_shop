import jsPDF from 'jspdf';

// Function to load and convert image to base64
const loadImageAsBase64 = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = this.width;
      canvas.height = this.height;
      ctx.drawImage(this, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataURL);
    };
    img.onerror = () => resolve(null); // Return null if image fails to load
    img.src = imagePath;
  });
};

export const generateInvoice = async (order) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Modern Color Palette (similar to your design)
    const primaryGreen = [52, 168, 83]; // #34A853 - Modern green
    const darkGreen = [25, 135, 84]; // Darker green for accents
    const lightGreen = [232, 245, 233]; // Light green background
    const veryLightGreen = [248, 252, 249]; // Very light green
    const darkGray = [33, 37, 41]; // #212529
    const mediumGray = [108, 117, 125]; // #6C757D
    const lightGray = [248, 249, 250]; // #F8F9FA
    const white = [255, 255, 255];
    
    // Clean white background
    doc.setFillColor(...white);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Modern header with brand colors
    doc.setFillColor(...primaryGreen);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    // Try to load and add brand logo
    try {
      const logoBase64 = await loadImageAsBase64('/Branding_logo.jpg');
      if (logoBase64) {
        doc.addImage(logoBase64, 'JPEG', 20, 15, 40, 30);
      } else {
        // Fallback logo design if image fails to load
        doc.setFillColor(...white);
        doc.roundedRect(20, 15, 50, 30, 5, 5, 'F');
        doc.setTextColor(...primaryGreen);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('WANTTAR', 25, 28);
        doc.setFontSize(8);
        doc.text('E-COMMERCE', 25, 37);
      }
    } catch (logoError) {
      console.log('Logo loading failed, using text fallback');
      // Fallback logo design
      doc.setFillColor(...white);
      doc.roundedRect(20, 15, 50, 30, 5, 5, 'F');
      doc.setTextColor(...primaryGreen);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('WANTTAR', 25, 28);
      doc.setFontSize(8);
      doc.text('E-COMMERCE', 25, 37);
    }
    
    // Brand name text next to logo
    doc.setTextColor(...white);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('WANTTAR', 75, 25);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Multi-Vendor E-commerce Platform', 75, 35);
    
    // Invoice title and number
    doc.setFillColor(...white);
    doc.roundedRect(pageWidth - 90, 15, 70, 30, 5, 5, 'F');
    
    doc.setTextColor(...primaryGreen);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 55, 30, { align: 'center' });
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(12);
    doc.text(`# ${order._id.slice(-8).toUpperCase()}`, pageWidth - 55, 40, { align: 'center' });
    
    // Invoice details section
    const detailsY = 80;
    
    // Company information
    doc.setTextColor(...darkGray);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FROM:', 20, detailsY);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Wanttar E-commerce', 20, detailsY + 12);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mediumGray);
    doc.text('Manohar Enterprises', 20, detailsY + 22);
    doc.text('5-25, 15th main road, 3rd stage', 20, detailsY + 32);
    doc.text('4th block, Basaveswaranagar', 20, detailsY + 42);
    doc.text('Bangalore - 560079', 20, detailsY + 52);
    doc.text('Phone: +91 7349727270', 20, detailsY + 62);
    doc.text('Email: support@samrudhigroup.in', 20, detailsY + 72);
    
    // Date and payment information
    doc.setTextColor(...darkGray);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE DETAILS:', pageWidth - 100, detailsY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Invoice No:', pageWidth - 100, detailsY + 12);
    doc.text('Order Date:', pageWidth - 100, detailsY + 22);
    doc.text('Order Status:', pageWidth - 100, detailsY + 32);
    doc.text('Payment Method:', pageWidth - 100, detailsY + 42);
    doc.text('Payment Status:', pageWidth - 100, detailsY + 52);
    
    // Values - Dynamic data from order
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text(`INV-${order._id.slice(-8).toUpperCase()}`, pageWidth - 20, detailsY + 12, { align: 'right' });
    doc.text(new Date(order.createdAt).toLocaleDateString(), pageWidth - 20, detailsY + 22, { align: 'right' });
    doc.text(order.status || 'Processing', pageWidth - 20, detailsY + 32, { align: 'right' });
    doc.text(order.paymentInfo?.type || 'Cash on Delivery', pageWidth - 20, detailsY + 42, { align: 'right' });
    doc.text(order.paymentInfo?.status || 'Pending', pageWidth - 20, detailsY + 52, { align: 'right' });
    
    // Payment info box with dynamic data
    doc.setFillColor(...lightGreen);
    doc.roundedRect(pageWidth - 100, detailsY + 65, 80, 25, 5, 5, 'F');
    
    doc.setTextColor(...darkGreen);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT INFO', pageWidth - 60, detailsY + 75, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    const paymentMethod = order.paymentInfo?.type || 'COD';
    doc.text(`Method: ${paymentMethod}`, pageWidth - 60, detailsY + 83, { align: 'center' });
    
    // Bill To section with real customer data
    const billToY = detailsY + 105;
    doc.setTextColor(...darkGray);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO:', 20, billToY);
    
    doc.setFillColor(...veryLightGreen);
    doc.roundedRect(20, billToY + 5, pageWidth - 40, 55, 5, 5, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkGray);
    doc.text(order.user?.name || 'Valued Customer', 25, billToY + 18);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mediumGray);
    
    // Customer contact details
    if (order.user?.email) {
      doc.text(`Email: ${order.user.email}`, 25, billToY + 28);
    }
    if (order.user?.phoneNumber) {
      doc.text(`Phone: ${order.user.phoneNumber}`, 25, billToY + 38);
    }
    
    // Shipping address
    if (order.shippingAddress) {
      const address = order.shippingAddress;
      let addressText = '';
      if (address.address1) addressText += address.address1;
      if (address.address2) addressText += `, ${address.address2}`;
      if (address.city) addressText += `, ${address.city}`;
      if (address.zipCode) addressText += ` - ${address.zipCode}`;
      if (address.country) addressText += `, ${address.country}`;
      
      if (addressText) {
        doc.text(`Address: ${addressText}`, 25, billToY + 48);
      }
    }
    
    // Products table header
    const tableY = billToY + 80;
    
    // Table header with modern design
    doc.setFillColor(...primaryGreen);
    doc.rect(20, tableY, pageWidth - 40, 20, 'F');
    
    doc.setTextColor(...white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('NO', 25, tableY + 12);
    doc.text('PRODUCT DESCRIPTION', 45, tableY + 12);
    doc.text('UNIT PRICE', 120, tableY + 12, { align: 'center' });
    doc.text('QTY', 150, tableY + 12, { align: 'center' });
    doc.text('TOTAL', pageWidth - 25, tableY + 12, { align: 'right' });
    
    // Products rows with real data
    let currentY = tableY + 25;
    let calculatedSubtotal = 0;
    
    if (order.cart && order.cart.length > 0) {
      order.cart.forEach((item, index) => {
        // Use multiple price fields for backward compatibility
        const price = item.discountPrice || item.originalPrice || item.price || 0;
        const qty = item.qty || 1;
        const total = price * qty;
        calculatedSubtotal += total;
        
        // Alternating row colors
        if (index % 2 === 0) {
          doc.setFillColor(...lightGray);
          doc.rect(20, currentY - 5, pageWidth - 40, 18, 'F');
        }
        
        doc.setTextColor(...darkGray);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        
        // Row number
        doc.text(String(index + 1).padStart(2, '0'), 25, currentY + 5);
        
        // Product name with shop info and additional details
        let productName = item.name || 'Product';
        
        // Add shop name if available
        if (item.shop?.name) {
          productName += ` (${item.shop.name})`;
        }
        
        // Add size/color if available
        if (item.size) {
          productName += ` - Size: ${item.size}`;
        }
        if (item.color) {
          productName += ` - Color: ${item.color}`;
        }
        
        // Split long product names into multiple lines if needed
        const maxWidth = 70; // characters
        if (productName.length > maxWidth) {
          const firstLine = productName.substring(0, maxWidth) + '...';
          doc.text(firstLine, 45, currentY + 5);
          // Optional: Add second line for very long names
          // const secondLine = productName.substring(maxWidth, maxWidth * 2);
          // doc.setFontSize(8);
          // doc.text(secondLine, 45, currentY + 12);
          // doc.setFontSize(9);
        } else {
          doc.text(productName, 45, currentY + 5);
        }
        
        // Unit price
        doc.text(`₹${price.toFixed(2)}`, 120, currentY + 5, { align: 'center' });
        
        // Quantity
        doc.text(String(qty), 150, currentY + 5, { align: 'center' });
        
        // Total
        doc.setFont('helvetica', 'bold');
        doc.text(`₹${total.toFixed(2)}`, pageWidth - 25, currentY + 5, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        
        currentY += 18;
        
        // Add product description or SKU if available
        if (item.description || item.sku) {
          doc.setFontSize(8);
          doc.setTextColor(...mediumGray);
          let additionalInfo = '';
          if (item.sku) additionalInfo += `SKU: ${item.sku}`;
          if (item.description && item.description.length > 0) {
            if (additionalInfo) additionalInfo += ' | ';
            const shortDesc = item.description.length > 50 
              ? item.description.substring(0, 50) + '...' 
              : item.description;
            additionalInfo += shortDesc;
          }
          if (additionalInfo) {
            doc.text(additionalInfo, 45, currentY - 8);
          }
          doc.setFontSize(9);
          doc.setTextColor(...darkGray);
        }
      });
    } else {
      // No items fallback
      doc.setTextColor(...mediumGray);
      doc.setFontSize(10);
      doc.text('No items found in this order', 25, currentY + 5);
      currentY += 15;
    }
    
    // Use saved order values or calculated values as fallback
    const subtotal = order.subTotalPrice || calculatedSubtotal;
    
    // Summary section with real order data
    const summaryY = currentY + 20;
    
    // Summary background - make it larger to accommodate all fields
    doc.setFillColor(...veryLightGreen);
    doc.roundedRect(pageWidth - 100, summaryY - 10, 80, 100, 5, 5, 'F');
    
    // Subtotal (use saved value or calculated)
    doc.setTextColor(...mediumGray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sub Total', pageWidth - 95, summaryY);
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text(`₹${subtotal.toFixed(2)}`, pageWidth - 25, summaryY, { align: 'right' });
    
    // Shipping charges (from order data with fallback)
    const shippingPrice = order.shippingPrice || 0;
    doc.setTextColor(...mediumGray);
    doc.setFont('helvetica', 'normal');
    doc.text('Shipping', pageWidth - 95, summaryY + 12);
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text(`₹${shippingPrice.toFixed(2)}`, pageWidth - 25, summaryY + 12, { align: 'right' });
    
    // Tax (from order data with fallback)
    const taxAmount = order.tax || 0;
    doc.setTextColor(...mediumGray);
    doc.setFont('helvetica', 'normal');
    doc.text('Tax', pageWidth - 95, summaryY + 24);
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text(`₹${taxAmount.toFixed(2)}`, pageWidth - 25, summaryY + 24, { align: 'right' });
    
    // Discount (from order data with fallback)
    const discountAmount = order.discountPrice || 0;
    doc.setTextColor(...mediumGray);
    doc.setFont('helvetica', 'normal');
    doc.text('Discount', pageWidth - 95, summaryY + 36);
    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');
    if (discountAmount > 0) {
      doc.text(`-₹${discountAmount.toFixed(2)}`, pageWidth - 25, summaryY + 36, { align: 'right' });
    } else {
      doc.text(`₹0.00`, pageWidth - 25, summaryY + 36, { align: 'right' });
    }
    
    // Add a separator line
    doc.setDrawColor(...mediumGray);
    doc.line(pageWidth - 95, summaryY + 45, pageWidth - 25, summaryY + 45);
    
    // Grand total with green background (from order totalPrice with fallback)
    const totalAmount = order.totalPrice || (subtotal + shippingPrice + taxAmount - discountAmount);
    doc.setFillColor(...primaryGreen);
    doc.rect(pageWidth - 100, summaryY + 52, 80, 18, 'F');
    
    doc.setTextColor(...white);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total', pageWidth - 95, summaryY + 63);
    doc.text(`₹${totalAmount.toFixed(2)}`, pageWidth - 25, summaryY + 63, { align: 'right' });
    
    // Order summary section (additional info)
    const orderSummaryY = summaryY + 80;
    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDER SUMMARY', 20, orderSummaryY);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mediumGray);
    
    const itemCount = order.cart ? order.cart.reduce((total, item) => total + (item.qty || 1), 0) : 0;
    doc.text(`Total Items: ${itemCount}`, 20, orderSummaryY + 12);
    
    if (order.createdAt) {
      doc.text(`Order Placed: ${new Date(order.createdAt).toLocaleString()}`, 20, orderSummaryY + 22);
    }
    
    if (order.deliveredAt) {
      doc.text(`Delivered: ${new Date(order.deliveredAt).toLocaleString()}`, 20, orderSummaryY + 32);
    } else if (order.status) {
      doc.text(`Current Status: ${order.status}`, 20, orderSummaryY + 32);
    }
    
    // Terms & Conditions
    const termsY = orderSummaryY + 50;
    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS', 20, termsY);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mediumGray);
    doc.text('1. All returns must be made within 7 days of delivery with original packaging.', 20, termsY + 12);
    doc.text('2. COD orders may incur additional handling charges.', 20, termsY + 20);
    doc.text('3. Delivery times may vary based on location and product availability.', 20, termsY + 28);
    
    // Thank you message
    doc.setTextColor(...primaryGreen);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('THANK YOU FOR SHOPPING WITH WANTTAR!', 20, termsY + 45);
    
    // Footer with contact info
    const footerY = pageHeight - 30;
    doc.setFillColor(...lightGreen);
    doc.rect(0, footerY, pageWidth, 30, 'F');
    
    doc.setTextColor(...darkGreen);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('support@samrudhigroup.in', 20, footerY + 12);
    doc.text('www.samrudhigroup.in', pageWidth/2, footerY + 12, { align: 'center' });
    doc.text('+91 7349727270', pageWidth - 20, footerY + 12, { align: 'right' });
    
    // Signature area
    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.text('Signature', pageWidth - 40, termsY + 50);
    doc.line(pageWidth - 80, termsY + 55, pageWidth - 20, termsY + 55);
    
    return doc;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error('Failed to generate invoice PDF');
  }
};

// Download the invoice
export const downloadInvoice = async (order) => {
  try {
    const doc = await generateInvoice(order);
    const fileName = `invoice-${order._id.slice(-8).toUpperCase()}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};

// Preview the invoice in a new tab
export const previewInvoice = async (order) => {
  try {
    const doc = await generateInvoice(order);
    const pdfOutput = doc.output('bloburl');
    window.open(pdfOutput, '_blank');
  } catch (error) {
    console.error('Error previewing invoice:', error);
    throw error;
  }
};