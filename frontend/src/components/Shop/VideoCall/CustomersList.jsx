import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";

const CustomersList = ({ customers, onInitiateCall, loading }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "recent" &&
        customer.lastOrderDate &&
        new Date(customer.lastOrderDate) >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) ||
      (filterType === "frequent" && customer.totalOrders >= 3);

    return matchesSearch && matchesFilter;
  });

  const handleCallCustomer = (customerId, orderId = null) => {
    onInitiateCall(customerId, orderId);
  };

  const formatLastSeen = (date) => {
    if (!date) return "Never";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Customers</option>
            <option value="recent">Recent Orders</option>
            <option value="frequent">Frequent Customers</option>
          </select>
        </div>
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-users text-gray-400 text-xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No customers found
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "No customers available for video calls"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div
              key={customer._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              {/* Customer Avatar and Basic Info */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {customer.name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {customer.email}
                  </p>
                </div>
              </div>

              {/* Customer Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {customer.totalOrders || 0}
                  </div>
                  <div className="text-xs text-gray-500">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{(customer.totalSpent || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Spent</div>
                </div>
              </div>

              {/* Last Activity */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Last Order:</span>
                  <span>{formatLastSeen(customer.lastOrderDate)}</span>
                </div>
                {customer.lastCallDate && (
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <span>Last Call:</span>
                    <span>{formatLastSeen(customer.lastCallDate)}</span>
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              {customer.recentOrders && customer.recentOrders.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Recent Orders
                  </h4>
                  <div className="space-y-2 max-h-20 overflow-y-auto">
                    {customer.recentOrders.slice(0, 2).map((order) => (
                      <div
                        key={order._id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-gray-600 truncate">
                          #{order.orderNumber}
                        </span>
                        <button
                          onClick={() =>
                            handleCallCustomer(customer._id, order._id)
                          }
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          title="Call about this order"
                        >
                          <i className="fas fa-phone text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCallCustomer(customer._id)}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Calling...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-video mr-2"></i>
                      Video Call
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedCustomer(customer)}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title="View details"
                >
                  <i className="fas fa-info text-gray-500"></i>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="mt-3 flex items-center justify-center">
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    customer.isOnline ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                <span className="text-xs text-gray-500">
                  {customer.isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Customer Details
              </h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-gray-600">{selectedCustomer.email}</p>
                  {selectedCustomer.phoneNumber && (
                    <p className="text-gray-600">
                      {selectedCustomer.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedCustomer.totalOrders || 0}
                  </div>
                  <div className="text-sm text-gray-500">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{(selectedCustomer.totalSpent || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedCustomer.totalCalls || 0}
                  </div>
                  <div className="text-sm text-gray-500">Video Calls</div>
                </div>
              </div>

              {/* Recent Orders */}
              {selectedCustomer.recentOrders &&
                selectedCustomer.recentOrders.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">
                      Recent Orders
                    </h4>
                    <div className="space-y-2">
                      {selectedCustomer.recentOrders.map((order) => (
                        <div
                          key={order._id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">
                              #{order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ₹{order.totalPrice}
                            </div>
                            <div
                              className={`text-sm ${
                                order.orderStatus === "Delivered"
                                  ? "text-green-600"
                                  : order.orderStatus === "Cancelled"
                                  ? "text-red-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {order.orderStatus}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              handleCallCustomer(
                                selectedCustomer._id,
                                order._id
                              );
                              setSelectedCustomer(null);
                            }}
                            disabled={loading}
                            className="ml-3 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            <i className="fas fa-video"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4 border-t">
                <button
                  onClick={() => {
                    handleCallCustomer(selectedCustomer._id);
                    setSelectedCustomer(null);
                  }}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  <i className="fas fa-video mr-2"></i>
                  Start Video Call
                </button>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersList;
