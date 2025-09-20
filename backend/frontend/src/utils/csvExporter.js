// CSV Export Utility for Invoices
export const generateInvoiceCSV = (order) => {
  try {
    // Prepare CSV data
    const csvData = [];
    
    // Header information
    csvData.push(['Invoice Information']);
    csvData.push(['Invoice Number', `INV-${order._id.slice(-8).toUpperCase()}`]);
    csvData.push(['Order ID', order._id]);
    csvData.push(['Invoice Date', new Date().toLocaleDateString()]);
    csvData.push(['Order Date', new Date(order.createdAt).toLocaleDateString()]);
    csvData.push(['Status', order.status]);
    csvData.push(['Payment Status', order.paymentInfo?.status || 'Pending']);
    csvData.push(['Payment Method', order.paymentInfo?.type || 'N/A']);
    csvData.push([]);

    // Customer information
    csvData.push(['Customer Information']);
    csvData.push(['Name', order.user?.name || 'N/A']);
    csvData.push(['Email', order.user?.email || 'N/A']);
    csvData.push(['Phone', order.user?.phoneNumber || 'N/A']);
    csvData.push([]);

    // Shipping address
    csvData.push(['Shipping Address']);
    csvData.push(['Address Line 1', order.shippingAddress?.address1 || 'N/A']);
    csvData.push(['Address Line 2', order.shippingAddress?.address2 || 'N/A']);
    csvData.push(['City', order.shippingAddress?.city || 'N/A']);
    csvData.push(['Country', order.shippingAddress?.country || 'N/A']);
    csvData.push(['Postal Code', order.shippingAddress?.zipCode || 'N/A']);
    csvData.push([]);

    // Order items header
    csvData.push(['Order Items']);
    csvData.push(['Item Name', 'Quantity', 'Unit Price', 'Total Price']);
    
    // Order items
    let subtotal = 0;
    order.cart?.forEach((item) => {
      const itemTotal = item.discountPrice * item.qty;
      subtotal += itemTotal;
      csvData.push([
        item.name,
        item.qty,
        `₹${item.discountPrice}`,
        `₹${itemTotal.toFixed(2)}`
      ]);
    });

    csvData.push([]);

    // Order summary
    csvData.push(['Order Summary']);
    csvData.push(['Subtotal', `₹${subtotal.toFixed(2)}`]);
    
    if (order.shippingPrice && order.shippingPrice > 0) {
      csvData.push(['Shipping', `₹${order.shippingPrice.toFixed(2)}`]);
    }
    
    if (order.tax && order.tax > 0) {
      csvData.push(['Tax', `₹${order.tax.toFixed(2)}`]);
    }
    
    if (order.discountPrice && order.discountPrice > 0) {
      csvData.push(['Discount', `-₹${order.discountPrice.toFixed(2)}`]);
    }
    
    csvData.push(['Total Amount', `₹${order.totalPrice}`]);
    csvData.push([]);

    // Additional information
    csvData.push(['Additional Information']);
    csvData.push(['Company', 'Wanttar']);
    csvData.push(['Website', 'www.wanttar.com']);
    csvData.push(['Support Email', 'support@wanttar.com']);
    csvData.push(['Support Phone', '+91 7349727270']);

    return csvData;
  } catch (error) {
    console.error('Error generating CSV data:', error);
    throw new Error('Failed to generate invoice CSV data');
  }
};

// Convert array data to CSV string
export const arrayToCSV = (data) => {
  return data
    .map(row => 
      row.map(field => {
        // Escape fields that contain commas, quotes, or newlines
        if (typeof field === 'string' && (field.includes(',') || field.includes('"') || field.includes('\n'))) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      }).join(',')
    )
    .join('\n');
};

// Download CSV file
export const downloadInvoiceCSV = (order) => {
  try {
    const csvData = generateInvoiceCSV(order);
    const csvString = arrayToCSV(csvData);
    
    // Create blob and download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `invoice-${order._id.slice(-8).toUpperCase()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL object
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  } catch (error) {
    console.error('Error downloading CSV invoice:', error);
    throw error;
  }
};

// Generate CSV for multiple orders (bulk export)
export const generateBulkOrderCSV = (orders) => {
  try {
    const csvData = [];
    
    // Headers
    csvData.push([
      'Order ID',
      'Invoice Number', 
      'Customer Name',
      'Customer Email',
      'Order Date',
      'Status',
      'Payment Status',
      'Payment Method',
      'Items Count',
      'Total Amount',
      'Shipping Address',
      'City',
      'Country'
    ]);

    // Data rows
    orders.forEach(order => {
      csvData.push([
        order._id,
        `INV-${order._id.slice(-8).toUpperCase()}`,
        order.user?.name || 'N/A',
        order.user?.email || 'N/A',
        new Date(order.createdAt).toLocaleDateString(),
        order.status,
        order.paymentInfo?.status || 'Pending',
        order.paymentInfo?.type || 'N/A',
        order.cart?.length || 0,
        `₹${order.totalPrice}`,
        order.shippingAddress?.address1 || 'N/A',
        order.shippingAddress?.city || 'N/A',
        order.shippingAddress?.country || 'N/A'
      ]);
    });

    return csvData;
  } catch (error) {
    console.error('Error generating bulk CSV data:', error);
    throw new Error('Failed to generate bulk CSV data');
  }
};

// Download bulk orders CSV
export const downloadBulkOrderCSV = (orders, filename = 'orders-export') => {
  try {
    const csvData = generateBulkOrderCSV(orders);
    const csvString = arrayToCSV(csvData);
    
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  } catch (error) {
    console.error('Error downloading bulk CSV:', error);
    throw error;
  }
};