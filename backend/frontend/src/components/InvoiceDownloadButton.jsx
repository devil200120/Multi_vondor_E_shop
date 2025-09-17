import React, { useState, useRef, useEffect } from "react";
import { FiDownload, FiChevronDown, FiFileText } from "react-icons/fi";
import { BsFiletypeCsv, BsFiletypePdf } from "react-icons/bs";
import { downloadInvoice, previewInvoice } from "../utils/invoiceGenerator";
import { downloadInvoiceCSV } from "../utils/csvExporter";
import { toast } from "react-toastify";

const InvoiceDownloadButton = ({
  order,
  variant = "download",
  className = "",
  showDropdown = true,
  children,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePDFAction = () => {
    try {
      if (variant === "preview") {
        previewInvoice(order);
        toast.success("Invoice preview opened!");
      } else {
        downloadInvoice(order);
        toast.success("PDF invoice downloaded successfully!");
      }
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Error with PDF invoice:", error);
      toast.error(
        `Error ${
          variant === "preview" ? "previewing" : "downloading"
        } PDF invoice`
      );
    }
  };

  const handleCSVDownload = () => {
    try {
      downloadInvoiceCSV(order);
      toast.success("CSV invoice downloaded successfully!");
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Error with CSV invoice:", error);
      toast.error("Error downloading CSV invoice");
    }
  };

  const handleSingleAction = () => {
    if (showDropdown) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      handlePDFAction(); // Default to PDF if no dropdown
    }
  };

  const baseClasses =
    "inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 relative";
  const variantClasses =
    variant === "preview"
      ? "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500"
      : "bg-green-600 border border-transparent text-white hover:bg-green-700 focus:ring-green-500";
  const focusClasses = "focus:outline-none focus:ring-2 focus:ring-offset-2";

  if (!showDropdown) {
    // Simple single button without dropdown
    return (
      <button
        onClick={handleSingleAction}
        className={`${baseClasses} ${variantClasses} ${focusClasses} ${className}`}
        title={variant === "preview" ? "Preview Invoice" : "Download Invoice"}
      >
        {children || (
          <>
            <FiDownload className="mr-1 h-4 w-4" />
            {variant === "preview" ? "Preview" : "Download"} Invoice
          </>
        )}
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleSingleAction}
        className={`${baseClasses} ${variantClasses} ${focusClasses} ${className} group`}
        title="Download Invoice"
      >
        {children || (
          <>
            <FiDownload className="mr-2 h-4 w-4" />
            Download Invoice
            <FiChevronDown
              className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="py-1">
            {/* PDF Option */}
            <button
              onClick={handlePDFAction}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center group"
            >
              <div className="p-2 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors">
                <BsFiletypePdf className="h-4 w-4 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {variant === "preview" ? "Preview PDF" : "Download PDF"}
                </div>
                <div className="text-xs text-gray-500">
                  {variant === "preview"
                    ? "Open PDF in new tab"
                    : "Download as PDF file"}
                </div>
              </div>
            </button>

            {/* CSV Option */}
            <button
              onClick={handleCSVDownload}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center group"
            >
              <div className="p-2 bg-green-100 rounded-lg mr-3 group-hover:bg-green-200 transition-colors">
                <BsFiletypeCsv className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  Download CSV
                </div>
                <div className="text-xs text-gray-500">
                  Download as spreadsheet file
                </div>
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* Info */}
            <div className="px-4 py-2">
              <div className="flex items-center text-xs text-gray-500">
                <FiFileText className="h-3 w-3 mr-1" />
                <span>Choose your preferred format</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDownloadButton;
