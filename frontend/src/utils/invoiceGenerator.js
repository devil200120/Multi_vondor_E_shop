import jsPDF from 'jspdf';

export const generateInvoice = (order) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Unacademy-style Colors
    const primaryPurple = [108, 92, 231]; // #6C5CE7
    const secondaryBlue = [74, 144, 226]; // #4A90E2
    const accentGreen = [0, 184, 148]; // #00B894
    const darkGray = [45, 52, 54]; // #2D3436
    const lightGray = [245, 246, 250]; // #F5F6FA
    const mediumGray = [99, 110, 114]; // #636E72
    const white = [255, 255, 255];
    const orange = [253, 121, 69]; // #FD7945
    
    // Background gradient effect
    doc.setFillColor(...lightGray);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Header with gradient-like effect
    doc.setFillColor(...primaryPurple);
    doc.rect(0, 0, pageWidth, 55, 'F');
    
    // Secondary header layer for depth
    doc.setFillColor(118, 102, 241); // Lighter purple
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Modern Logo Design
    doc.setFillColor(...white);
    doc.roundedRect(20, 12, 60, 25, 4, 4, 'F');
    
    // Logo text with modern styling
    doc.setTextColor(...primaryPurple);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Manohar Enterprises', 30, 95);
    doc.setTextColor(...secondaryBlue);
    doc.text('Shop', 25, 30);
    
    // Modern badge for invoice
    doc.setFillColor(...accentGreen);
    doc.roundedRect(pageWidth - 80, 10, 65, 18, 9, 9, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 47, 21, { align: 'center' });
    
    // Invoice number with modern styling
    doc.setFillColor(...white);
    doc.roundedRect(pageWidth - 80, 32, 65, 15, 3, 3, 'F');
    doc.setTextColor(...darkGray);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`#${order._id.slice(-8).toUpperCase()}`, pageWidth - 47, 42, { align: 'center' });
    
    // Main content area with white background and shadow effect
    doc.setFillColor(...white);
    doc.roundedRect(15, 65, pageWidth - 30, pageHeight - 120, 8, 8, 'F');
    
    // Content sections with modern cards
    
    // Company Info Card
    doc.setFillColor(250, 251, 255); // Very light purple
    doc.roundedRect(25, 75, 75, 65, 6, 6, 'F');
    
    doc.setTextColor(...primaryPurple);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FROM', 30, 85);
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Manohar Enterprises', 30, 95);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mediumGray);
    doc.text('5-25 , 15th main road,3rd stage,4th block, Basaveswaranagar,', 30, 103);
    doc.text('near Guru sagar hotel, Bangalore 560079', 30, 110);
    doc.text('+91 7349727270', 30, 124);
    doc.text('support@wanttar.com', 30, 131);
    
    // Date Info Card
    doc.setFillColor(248, 252, 255); // Very light blue
    doc.roundedRect(pageWidth - 90, 75, 75, 65, 6, 6, 'F');
    
    doc.setTextColor(...secondaryBlue);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILS', pageWidth - 85, 85);
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Date:', pageWidth - 85, 95);
    doc.text('Due Date:', pageWidth - 85, 103);
    doc.text('Order Date:', pageWidth - 85, 111);
    doc.text('Payment:', pageWidth - 85, 119);
    doc.text('Status:', pageWidth - 85, 127);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mediumGray);
    doc.text(new Date().toLocaleDateString(), pageWidth - 85, 99);
    doc.text(new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString(), pageWidth - 85, 107);
    doc.text(new Date(order.createdAt).toLocaleDateString(), pageWidth - 85, 115);
    doc.text(order.paymentInfo?.type || 'Card', pageWidth - 85, 123);
    
    // Status with modern badge
    const status = order.status || 'Processing';
    if (status === 'Delivered') {
      doc.setFillColor(...accentGreen);
    } else if (status === 'Processing') {
      doc.setFillColor(...orange);
    } else {
      doc.setFillColor(...primaryPurple);
    }
    doc.roundedRect(pageWidth - 85, 130, 35, 8, 4, 4, 'F');
    doc.setTextColor(...white);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text(status.toUpperCase(), pageWidth - 67, 135, { align: 'center' });
    
    // Bill To Section
    doc.setTextColor(...primaryPurple);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 25, 160);
    
    // Customer Card
    doc.setFillColor(248, 250, 252); // Very light gray
    doc.roundedRect(25, 170, 160, 50, 6, 6, 'F');
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(order.user?.name || 'Valued Customer', 35, 185);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mediumGray);
    
    if (order.shippingAddress) {
      const address = order.shippingAddress;
      let yPos = 195;
      
      if (address.address1) {
        doc.text(address.address1, 35, yPos);
        yPos += 8;
      }
      if (address.address2) {
        doc.text(address.address2, 35, yPos);
        yPos += 8;
      }
      doc.text(`${address.city}, ${address.zipCode}`, 35, yPos);
      yPos += 8;
      doc.text(address.country, 35, yPos);
      
      if (address.phoneNumber) {
        yPos += 8;
        doc.text(`📱 ${address.phoneNumber}`, 35, yPos);
      }
    }
    
    // Items Section Header
    const tableStartY = 240;
    doc.setTextColor(...primaryPurple);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEMS ORDERED', 25, tableStartY - 10);
    
    // Modern Table Header
    doc.setFillColor(...primaryPurple);
    doc.roundedRect(25, tableStartY, pageWidth - 50, 18, 4, 4, 'F');
    
    doc.setTextColor(...white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('#', 30, tableStartY + 11);
    doc.text('PRODUCT', 45, tableStartY + 11);
    doc.text('QTY', 130, tableStartY + 11, { align: 'center' });
    doc.text('PRICE', 155, tableStartY + 11, { align: 'center' });
    doc.text('TOTAL', pageWidth - 35, tableStartY + 11, { align: 'right' });
    
    // Items with modern card design
    let yPos = tableStartY + 25;
    let totalAmount = 0;
    
    order.cart.forEach((item, index) => {
      const price = item.discountPrice || item.originalPrice || 0;
      const qty = item.qty || 1;
      const lineTotal = price * qty;
      totalAmount += lineTotal;
      
      // Item card with hover-like effect
      doc.setFillColor(index % 2 === 0 ? 255 : 252, index % 2 === 0 ? 255 : 253, index % 2 === 0 ? 255 : 255);
      doc.roundedRect(25, yPos - 8, pageWidth - 50, 16, 3, 3, 'F');
      
      // Item number with colored circle
      doc.setFillColor(...accentGreen);
      doc.circle(35, yPos - 1, 6, 'F');
      doc.setTextColor(...white);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text((index + 1).toString(), 35, yPos + 1, { align: 'center' });
      
      // Product name with truncation
      doc.setTextColor(...darkGray);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const itemName = item.name || 'Product';
      const truncatedName = itemName.length > 30 ? itemName.substring(0, 30) + '...' : itemName;
      doc.text(truncatedName, 50, yPos);
      
      // Quantity with modern styling
      doc.setTextColor(...mediumGray);
      doc.setFontSize(9);
      doc.text(`×${qty}`, 130, yPos, { align: 'center' });
      
      // Price
      doc.text(`$${price.toFixed(2)}`, 155, yPos, { align: 'center' });
      
      // Total with bold styling
      doc.setTextColor(...darkGray);
      doc.setFont('helvetica', 'bold');
      doc.text(`$${lineTotal.toFixed(2)}`, pageWidth - 35, yPos, { align: 'right' });
      
      yPos += 20;
    });
    
    // Summary Section with modern design
    const summaryY = yPos + 15;
    
    // Summary card
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(pageWidth - 95, summaryY, 80, 60, 6, 6, 'F');
    
    // Subtotal
    doc.setTextColor(...mediumGray);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal', pageWidth - 85, summaryY + 15);
    doc.setTextColor(...darkGray);
    doc.text(`$${totalAmount.toFixed(2)}`, pageWidth - 30, summaryY + 15, { align: 'right' });
    
    // Shipping
    const shippingCost = order.shippingPrice || 0;
    doc.setTextColor(...mediumGray);
    doc.text('Shipping', pageWidth - 85, summaryY + 25);
    doc.setTextColor(...darkGray);
    doc.text(`$${shippingCost.toFixed(2)}`, pageWidth - 30, summaryY + 25, { align: 'right' });
    
    // Tax
    const tax = order.tax || 0;
    if (tax > 0) {
      doc.setTextColor(...mediumGray);
      doc.text('Tax', pageWidth - 85, summaryY + 35);
      doc.setTextColor(...darkGray);
      doc.text(`$${tax.toFixed(2)}`, pageWidth - 30, summaryY + 35, { align: 'right' });
    }
    
    // Divider line
    doc.setDrawColor(...primaryPurple);
    doc.setLineWidth(1);
    doc.line(pageWidth - 85, summaryY + (tax > 0 ? 42 : 32), pageWidth - 25, summaryY + (tax > 0 ? 42 : 32));
    
    // Total with gradient-like background
    const finalTotal = totalAmount + shippingCost + tax;
    doc.setFillColor(...primaryPurple);
    doc.roundedRect(pageWidth - 90, summaryY + (tax > 0 ? 45 : 35), 75, 12, 4, 4, 'F');
    
    doc.setTextColor(...white);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', pageWidth - 80, summaryY + (tax > 0 ? 53 : 43));
    doc.setFontSize(14);
    doc.text(`$${finalTotal.toFixed(2)}`, pageWidth - 30, summaryY + (tax > 0 ? 53 : 43), { align: 'right' });
    
    // Modern Footer
    const footerY = pageHeight - 45;
    
    // Footer background with gradient effect
    doc.setFillColor(...primaryPurple);
    doc.rect(0, footerY, pageWidth, 45, 'F');
    
    // Thank you message
    doc.setTextColor(...white);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for choosing Wanttar! 🎉', pageWidth / 2, footerY + 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Your order has been processed successfully. We appreciate your business!', pageWidth / 2, footerY + 25, { align: 'center' });
    
    // Contact info with icons
    doc.setFontSize(9);
    doc.text('📧 support@wanttar.com  |  📞 +91 7349727270  |  � Manohar Enterprises, Bangalore', pageWidth / 2, footerY + 35, { align: 'center' });
    
    return doc;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error('Failed to generate invoice PDF');
  }
};

// Download the invoice
export const downloadInvoice = (order) => {
  try {
    const doc = generateInvoice(order);
    const fileName = `invoice-${order._id.slice(-8).toUpperCase()}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};

// Preview the invoice in a new tab
export const previewInvoice = (order) => {
  try {
    const doc = generateInvoice(order);
    const pdfOutput = doc.output('bloburl');
    window.open(pdfOutput, '_blank');
  } catch (error) {
    console.error('Error previewing invoice:', error);
    throw error;
  }
};