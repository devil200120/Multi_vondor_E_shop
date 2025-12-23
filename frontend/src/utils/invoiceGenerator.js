import { server } from "../server";
import { toast } from "react-toastify";

// Download single invoice PDF
export const downloadInvoice = async (order, userType = 'user') => {
  try {
    console.log('🔄 Downloading invoice for order:', order._id, 'userType:', userType);
    
    if (!order || !order._id) {
      throw new Error('Order is required');
    }

    // Determine the correct endpoint based on user type
    let endpoint;
    switch (userType) {
      case 'admin':
        endpoint = `${server}/order/admin-invoice-pdf/${order._id}`;
        break;
      case 'seller':
        endpoint = `${server}/order/seller-invoice-pdf/${order._id}`;
        break;
      case 'user':
      default:
        endpoint = `${server}/order/user-invoice-pdf/${order._id}`;
        break;
    }

    const response = await fetch(endpoint, {
      method: "GET",
      credentials: "include"
    });
    
    // Check content type to see if we got JSON error instead of PDF
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorMessage = `Failed to download invoice: ${response.status}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error JSON:', jsonError);
        }
      }
      
      if (response.status === 401 || response.status === 403) {
        if (userType === 'admin') {
          throw new Error("Authentication required. Please login as admin.");
        } else if (userType === 'seller') {
          throw new Error("Authentication required. Please login as seller.");
        } else {
          throw new Error("Authentication required. Please login to download your invoice.");
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // Check if we actually got a PDF
    if (contentType && !contentType.includes('application/pdf')) {
      // We got something other than PDF, probably JSON error
      if (contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Server returned JSON instead of PDF');
        } catch (jsonError) {
          throw new Error('Server returned unexpected content type: ' + contentType);
        }
      } else {
        throw new Error('Server returned unexpected content type: ' + contentType);
      }
    }
    
    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error("Empty PDF file received");
    }
    
    console.log(`📄 PDF size: ${(blob.size / 1024).toFixed(2)} KB`);
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const orderNumber = order._id.slice(-8).toUpperCase();
    const filename = `Invoice_${orderNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Invoice downloaded successfully:', filename);
    toast.success(`Invoice downloaded: ${filename}`);
    
  } catch (error) {
    console.error('❌ Download error:', error);
    toast.error(error.message);
    throw error;
  }
};

// Preview invoice in new window
export const previewInvoice = async (order) => {
  try {
    console.log('👀 Previewing invoice for order:', order._id);
    
    if (!order || !order._id) {
      throw new Error('Order is required');
    }

    const response = await fetch(`${server}/order/admin-invoice-preview/${order._id}`, {
      method: "GET", 
      credentials: "include"
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("Authentication required. Please login as admin.");
      }
      throw new Error(`Failed to preview invoice: ${response.status}`);
    }
    
    const html = await response.text();
    const newWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
      console.log('✅ Invoice preview opened successfully');
      toast.success('Invoice preview opened in new window');
    } else {
      throw new Error('Failed to open preview window. Please check popup blocker.');
    }
    
  } catch (error) {
    console.error('❌ Preview error:', error);
    toast.error(error.message);
    throw error;
  }
};

// Download multiple invoices as ZIP
export const downloadBatchInvoices = async (orderIds) => {
  try {
    console.log('📦 Downloading batch invoices for orders:', orderIds);
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      throw new Error('Please select orders to download');
    }

    if (orderIds.length > 50) {
      throw new Error('Maximum 50 invoices can be downloaded at once');
    }

    // Show loading toast
    const loadingToast = toast.info(`Preparing ${orderIds.length} invoices...`, {
      autoClose: false,
      hideProgressBar: false
    });

    const response = await fetch(`${server}/order/admin-batch-invoices-zip`, {
      method: "POST",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderIds }),
    });

    // Dismiss loading toast
    toast.dismiss(loadingToast);

    // Check content type to see if we got JSON error instead of ZIP
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorMessage = `Failed to generate batch invoices: ${response.status}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error JSON:', jsonError);
        }
      }
      
      if (response.status === 401 || response.status === 403) {
        throw new Error("Authentication required. Please login as admin.");
      }
      
      throw new Error(errorMessage);
    }

    // Check if we actually got a ZIP file
    if (contentType && !contentType.includes('application/zip')) {
      // We got something other than ZIP, probably JSON error
      if (contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Server returned JSON instead of ZIP file');
        } catch (jsonError) {
          throw new Error('Server returned unexpected content type: ' + contentType);
        }
      } else {
        throw new Error('Server returned unexpected content type: ' + contentType);
      }
    }

    const blob = await response.blob();
    
    if (blob.size === 0) {
      throw new Error("Empty ZIP file received");
    }
    
    console.log(`📦 ZIP size: ${(blob.size / 1024).toFixed(2)} KB`);
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const filename = `Invoices_Batch_${new Date().toISOString().split('T')[0]}_${Date.now()}.zip`;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Batch invoices downloaded successfully:', filename);
    toast.success(`${orderIds.length} invoices downloaded: ${filename}`);
    
  } catch (error) {
    console.error('❌ Batch download error:', error);
    toast.error(error.message);
    throw error;
  }
};

// Get enhanced orders summary for admin dashboard
export const getOrdersSummary = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc',
      ...params.filters
    });

    const response = await fetch(`${server}/order/admin-orders-summary?${queryParams}`, {
      method: "GET",
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Orders summary error:', error);
    throw error;
  }
};

// Utility function to format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Utility function to format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Test functions for development
export const testInvoiceDownload = async () => {
  try {
    const sampleOrder = { _id: "67078a1b2c3d4e5f6789abcd" };
    await downloadInvoice(sampleOrder, 'user');
  } catch (error) {
    console.error('Test failed:', error);
  }
};

export const testInvoicePreview = async () => {
  try {
    const sampleOrder = { _id: "67078a1b2c3d4e5f6789abcd" };
    await previewInvoice(sampleOrder);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

export const testBatchDownload = async () => {
  try {
    const sampleOrderIds = ["67078a1b2c3d4e5f6789abcd", "67078a1b2c3d4e5f6789abce"];
    await downloadBatchInvoices(sampleOrderIds);
  } catch (error) {
    console.error('Test failed:', error);
  }
};
