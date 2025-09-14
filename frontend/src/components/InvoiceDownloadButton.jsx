import React from "react";
import { FiDownload } from "react-icons/fi";
import { downloadInvoice, previewInvoice } from "../utils/invoiceGenerator";
import { toast } from "react-toastify";

const InvoiceDownloadButton = ({
  order,
  variant = "download",
  className = "",
}) => {
  const handleInvoiceAction = () => {
    try {
      if (variant === "preview") {
        previewInvoice(order);
      } else {
        downloadInvoice(order);
        toast.success("Invoice downloaded successfully!");
      }
    } catch (error) {
      console.error("Error with invoice:", error);
      toast.error(
        `Error ${variant === "preview" ? "previewing" : "downloading"} invoice`
      );
    }
  };

  const baseClasses =
    "inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200";
  const variantClasses =
    variant === "preview"
      ? "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500"
      : "bg-green-600 border border-transparent text-white hover:bg-green-700 focus:ring-green-500";
  const focusClasses = "focus:outline-none focus:ring-2 focus:ring-offset-2";

  return (
    <button
      onClick={handleInvoiceAction}
      className={`${baseClasses} ${variantClasses} ${focusClasses} ${className}`}
      title={variant === "preview" ? "Preview Invoice" : "Download Invoice"}
    >
      <FiDownload className="mr-1 h-4 w-4" />
      {variant === "preview" ? "Preview" : "Download"} Invoice
    </button>
  );
};

export default InvoiceDownloadButton;
