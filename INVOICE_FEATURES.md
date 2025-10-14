# Admin Invoice Management Features

## Overview
This document describes the new PDF invoice generation features added to the admin panel for order management.

## Features

### 1. Single Invoice Download
Download a PDF invoice for any individual order.

**Endpoint:** `GET /api/v2/order/admin-invoice-pdf/:orderId`
- **Authentication:** Admin only
- **Response:** PDF file download
- **Filename Format:** `Invoice_XXXXXXXX_YYYY-MM-DD.pdf`

**Usage Example:**
```javascript
// Frontend API call
const downloadInvoice = async (orderId) => {
  const response = await fetch(`${server}/order/admin-invoice-pdf/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${orderId.slice(-8)}.pdf`;
    a.click();
  }
};
```

### 2. Invoice Preview
Preview the invoice HTML before generating PDF (useful for debugging).

**Endpoint:** `GET /api/v2/order/admin-invoice-preview/:orderId`
- **Authentication:** Admin only
- **Response:** HTML content
- **Usage:** Open in browser to preview invoice layout

### 3. Batch Invoice Download
Download multiple invoices as a single ZIP file.

**Endpoint:** `POST /api/v2/order/admin-batch-invoices-zip`
- **Authentication:** Admin only
- **Request Body:** 
  ```json
  {
    "orderIds": ["order1", "order2", "order3"]
  }
  ```
- **Limitations:** Maximum 50 invoices per batch
- **Response:** ZIP file download containing:
  - Individual PDF invoices for each order
  - `batch_summary.json` with order details
  - Error logs (if any failures occur)

**Usage Example:**
```javascript
const downloadBatchInvoices = async (orderIds) => {
  const response = await fetch(`${server}/order/admin-batch-invoices-zip`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ orderIds })
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_batch_${Date.now()}.zip`;
    a.click();
  }
};
```

### 4. Enhanced Orders Summary
Get paginated orders list with filtering options for the admin dashboard.

**Endpoint:** `GET /api/v2/order/admin-orders-summary`
- **Authentication:** Admin only
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20, max: 100)
  - `status`: Filter by order status
  - `startDate`: Filter orders from date
  - `endDate`: Filter orders until date
  - `search`: Search by customer name, email, or order ID
  - `sortBy`: Sort field (default: 'createdAt')
  - `sortOrder`: 'asc' or 'desc' (default: 'desc')

**Response Format:**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "order_id",
      "orderNumber": "ABCD1234",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "totalAmount": 2500,
      "status": "Processing",
      "paymentMethod": "UPI",
      "paymentStatus": "captured",
      "itemCount": 3,
      "createdAt": "2024-01-15T10:30:00Z",
      "canDownloadInvoice": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalOrders": 100,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## Invoice Template Features

### Professional Design
- Clean, modern layout with gradient headers
- Responsive design that works on all screen sizes
- Print-friendly styling
- Company branding placeholder

### Comprehensive Information
- **Order Details**: Order ID, date, status, tracking number
- **Customer Information**: Name, email, phone, full shipping address
- **Seller Information**: Shop details (if available)
- **Product Details**: Name, quantity, price, variations (size/color)
- **Pricing Breakdown**: Subtotal, discounts, shipping, tax, grand total
- **Payment Information**: Payment method, status, transaction ID

### Smart Features
- Automatic currency formatting (₹ INR)
- Status badges with color coding
- Responsive table layouts
- Error handling for missing data
- Professional typography

## Frontend Integration Guide

### 1. Add Download Buttons to Order List
```jsx
const OrderRow = ({ order }) => {
  const handleDownloadInvoice = async () => {
    try {
      const response = await fetch(`${server}/order/admin-invoice-pdf/${order._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Invoice_${order._id.slice(-8)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <tr>
      <td>{order.orderNumber}</td>
      <td>{order.customerName}</td>
      <td>₹{order.totalAmount}</td>
      <td>
        <button onClick={handleDownloadInvoice}>
          📄 Download Invoice
        </button>
      </td>
    </tr>
  );
};
```

### 2. Add Batch Download Feature
```jsx
const OrdersTable = ({ orders }) => {
  const [selectedOrders, setSelectedOrders] = useState([]);

  const handleBatchDownload = async () => {
    if (selectedOrders.length === 0) {
      alert('Please select orders to download');
      return;
    }

    try {
      const response = await fetch(`${server}/order/admin-batch-invoices-zip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderIds: selectedOrders })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `batch_invoices_${Date.now()}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Batch download failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleBatchDownload} disabled={selectedOrders.length === 0}>
        📦 Download Selected ({selectedOrders.length})
      </button>
      {/* Order table with checkboxes */}
    </div>
  );
};
```

## Error Handling

The system includes comprehensive error handling:

1. **Missing Orders**: Returns 404 if order not found
2. **Permission Denied**: Returns 403 for non-admin users
3. **PDF Generation Failures**: Graceful fallback with error logging
4. **Batch Processing Errors**: Individual order failures don't stop the entire batch
5. **File System Errors**: Proper cleanup and error reporting

## Performance Considerations

1. **PDF Generation**: Typically takes 2-6 seconds per invoice
2. **Batch Processing**: Processes orders sequentially to avoid memory issues
3. **Memory Management**: Puppeteer instances are properly closed
4. **File Cleanup**: No temporary files left on server (uses memory storage)

## Security Features

1. **Admin Authentication**: All routes require admin privileges
2. **Input Validation**: Order IDs and parameters are validated
3. **Rate Limiting**: Batch downloads limited to 50 invoices
4. **Error Sanitization**: Sensitive information filtered from error messages

## Testing

A test script is available to verify PDF generation:
```bash
node test-pdf-simple.js
```

This will generate a sample invoice PDF and HTML preview for testing purposes.

## Support

For any issues or customization requests:
1. Check the console logs for detailed error messages
2. Verify admin authentication is working
3. Ensure all required dependencies are installed
4. Test with the provided sample script first