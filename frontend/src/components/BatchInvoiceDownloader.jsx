import React, { useState } from "react";
import { FiDownload, FiPackage, FiCheck, FiX, FiLoader } from "react-icons/fi";
import { downloadBatchInvoices } from "../utils/invoiceGenerator";
import { toast } from "react-toastify";

const BatchInvoiceDownloader = ({
  selectedOrders,
  onClearSelection,
  orders = [],
  className = "",
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);

  const handleBatchDownload = async () => {
    if (selectedOrders.size === 0) {
      toast.error("Please select orders to download invoices");
      return;
    }

    if (selectedOrders.size > 50) {
      toast.error("Maximum 50 invoices can be downloaded at once");
      return;
    }

    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: selectedOrders.size });

    try {
      const selectedOrderIds = Array.from(selectedOrders);

      // Show progress toast
      const progressToast = toast.info(
        `Preparing ${selectedOrderIds.length} invoices for download...`,
        { autoClose: false, hideProgressBar: false }
      );

      await downloadBatchInvoices(selectedOrderIds);

      // Dismiss progress toast and show success
      toast.dismiss(progressToast);
      toast.success(
        `✅ Successfully downloaded ${selectedOrderIds.length} invoices as ZIP file!`,
        { autoClose: 5000 }
      );

      // Clear selection
      if (onClearSelection) {
        onClearSelection();
      }
    } catch (error) {
      console.error("Batch download error:", error);
      toast.error(`❌ Failed to download invoices: ${error.message}`);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  // Calculate total value of selected orders
  const selectedOrdersData = orders.filter((order) =>
    selectedOrders.has(order._id)
  );
  const totalValue = selectedOrdersData.reduce(
    (sum, order) => sum + (order.totalPrice || 0),
    0
  );
  const totalItems = selectedOrdersData.reduce(
    (sum, order) =>
      sum + (order.cart?.reduce((cartSum, item) => cartSum + item.qty, 0) || 0),
    0
  );

  if (selectedOrders.size === 0) {
    return null;
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        {/* Selection Summary */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiPackage className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {selectedOrders.size} Order
                {selectedOrders.size !== 1 ? "s" : ""} Selected
              </div>
              <div className="text-sm text-gray-500">
                {totalItems} items • ₹{totalValue.toFixed(2)} total value
              </div>
            </div>
          </div>

          {/* Selection Indicator */}
          <div className="hidden sm:flex items-center space-x-2">
            {selectedOrders.size <= 50 ? (
              <div className="flex items-center text-green-600 text-sm">
                <FiCheck className="h-4 w-4 mr-1" />
                Ready to download
              </div>
            ) : (
              <div className="flex items-center text-red-600 text-sm">
                <FiX className="h-4 w-4 mr-1" />
                Too many orders (max 50)
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            disabled={isDownloading}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Clear selection"
          >
            Clear
          </button>

          {/* Download Button */}
          <button
            onClick={handleBatchDownload}
            disabled={
              isDownloading ||
              selectedOrders.size === 0 ||
              selectedOrders.size > 50
            }
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            title={`Download ${selectedOrders.size} invoices as ZIP`}
          >
            {isDownloading ? (
              <>
                <FiLoader className="mr-2 h-4 w-4 animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <FiDownload className="mr-2 h-4 w-4" />
                Download Invoices
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {downloadProgress && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Preparing invoices...</span>
            <span>
              {Math.round(
                (downloadProgress.current / downloadProgress.total) * 100
              )}
              %
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (downloadProgress.current / downloadProgress.total) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Warning for large selections */}
      {selectedOrders.size > 25 && selectedOrders.size <= 50 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center text-sm text-yellow-800">
            <FiPackage className="h-4 w-4 mr-2" />
            Large selection detected. Download may take a few minutes.
          </div>
        </div>
      )}

      {/* Error message for too many selections */}
      {selectedOrders.size > 50 && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-sm text-red-800">
            <FiX className="h-4 w-4 mr-2" />
            Maximum 50 invoices can be downloaded at once. Please reduce your
            selection.
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchInvoiceDownloader;
