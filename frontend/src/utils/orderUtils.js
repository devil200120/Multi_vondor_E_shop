// Helper function to get order number for display
export const getOrderNumber = (order) => {
  if (order?.orderNumber) {
    return order.orderNumber; // Return formatted number like "wanttar-00001"
  }
  
  // Fallback for existing orders without orderNumber field
  if (order?._id) {
    if (typeof order._id === 'string') {
      return `#${order._id.slice(-8).toUpperCase()}`;
    } else if (order._id.toString) {
      return `#${order._id.toString().slice(-8).toUpperCase()}`;
    }
  }
  
  return '#UNKNOWN';
};

// Helper function to get order ID for tracking links (always use _id)
export const getOrderId = (order) => {
  return order?._id;
};