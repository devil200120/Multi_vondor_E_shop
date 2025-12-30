import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  FiCode,
  FiSave,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
  FiCheck,
  FiRefreshCw,
  FiCopy,
  FiDownload,
  FiUpload,
} from "react-icons/fi";
import { HiOutlineCode, HiOutlineColorSwatch } from "react-icons/hi";
import { BiCodeBlock } from "react-icons/bi";

const HtmlCssEditor = () => {
  const { seller } = useSelector((state) => state.seller);
  const [customHtml, setCustomHtml] = useState("");
  const [customCss, setCustomCss] = useState("");
  const [customHtmlEnabled, setCustomHtmlEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("html"); // 'html' or 'css'
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState({ html: "", css: "", enabled: false });

  // Fetch existing custom HTML/CSS
  useEffect(() => {
    const fetchCustomHtmlCss = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${server}/shop/get-custom-html-css`, {
          withCredentials: true,
        });
        setCustomHtml(data.customHtml || "");
        setCustomCss(data.customCss || "");
        setCustomHtmlEnabled(data.customHtmlEnabled || false);
        setOriginalData({
          html: data.customHtml || "",
          css: data.customCss || "",
          enabled: data.customHtmlEnabled || false,
        });
      } catch (error) {
        console.error("Error fetching custom HTML/CSS:", error);
        if (error.response?.status === 403) {
          toast.error("HTML/CSS Editor is not available in your subscription plan. Please upgrade to Gold plan.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomHtmlCss();
  }, []);

  // Track changes
  useEffect(() => {
    const changed =
      customHtml !== originalData.html ||
      customCss !== originalData.css ||
      customHtmlEnabled !== originalData.enabled;
    setHasChanges(changed);
  }, [customHtml, customCss, customHtmlEnabled, originalData]);

  // Save custom HTML/CSS
  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await axios.put(
        `${server}/shop/update-custom-html-css`,
        {
          customHtml,
          customCss,
          customHtmlEnabled,
        },
        { withCredentials: true }
      );
      toast.success(data.message || "Custom HTML/CSS saved successfully!");
      setOriginalData({
        html: data.customHtml,
        css: data.customCss,
        enabled: data.customHtmlEnabled,
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Error saving custom HTML/CSS:", error);
      toast.error(error.response?.data?.message || "Failed to save custom HTML/CSS");
    } finally {
      setSaving(false);
    }
  };

  // Reset to original
  const handleReset = () => {
    setCustomHtml(originalData.html);
    setCustomCss(originalData.css);
    setCustomHtmlEnabled(originalData.enabled);
    toast.info("Changes reverted");
  };

  // Copy to clipboard
  const handleCopy = (content, type) => {
    navigator.clipboard.writeText(content);
    toast.success(`${type} copied to clipboard!`);
  };

  // Export as file
  const handleExport = () => {
    const data = {
      customHtml,
      customCss,
      exportedAt: new Date().toISOString(),
      shopId: seller?._id,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shop-custom-code-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Custom code exported!");
  };

  // Import from file
  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.customHtml !== undefined) setCustomHtml(data.customHtml);
        if (data.customCss !== undefined) setCustomCss(data.customCss);
        toast.success("Custom code imported successfully!");
      } catch (error) {
        toast.error("Invalid file format");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Reset input
  };

  // Preview HTML with CSS
  const getPreviewContent = useCallback(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              margin: 0; 
              padding: 20px;
              background: #fff;
            }
            ${customCss}
          </style>
        </head>
        <body>
          ${customHtml}
        </body>
      </html>
    `;
  }, [customHtml, customCss]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <FiCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">HTML/CSS Editor</h1>
              <p className="text-blue-100 text-sm">
                Customize your shop page with custom HTML and CSS (Gold Plan Feature)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-semibold">
              GOLD FEATURE
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={customHtmlEnabled}
                  onChange={(e) => setCustomHtmlEnabled(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">
                {customHtmlEnabled ? "Custom content enabled" : "Custom content disabled"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showPreview
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {showPreview ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>

              <label className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition-all">
                <FiUpload className="w-4 h-4" />
                Import
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                <FiDownload className="w-4 h-4" />
                Export
              </button>

              {hasChanges && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                >
                  <FiRefreshCw className="w-4 h-4" />
                  Reset
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  hasChanges
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {hasChanges && (
            <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm">
              <FiAlertTriangle className="w-4 h-4" />
              You have unsaved changes
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("html")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === "html"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <HiOutlineCode className="w-5 h-5" />
            HTML
            <span className="text-xs text-gray-400">({customHtml.length} chars)</span>
          </button>
          <button
            onClick={() => setActiveTab("css")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === "css"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <HiOutlineColorSwatch className="w-5 h-5" />
            CSS
            <span className="text-xs text-gray-400">({customCss.length} chars)</span>
          </button>
        </div>

        {/* Editor Area */}
        <div className="relative">
          {/* HTML Editor */}
          {activeTab === "html" && (
            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={() => handleCopy(customHtml, "HTML")}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  title="Copy HTML"
                >
                  <FiCopy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <textarea
                value={customHtml}
                onChange={(e) => setCustomHtml(e.target.value)}
                className="w-full h-[400px] p-4 font-mono text-sm bg-gray-50 border-0 focus:ring-0 focus:outline-none resize-none"
                placeholder={`<!-- Enter your custom HTML here -->
<div class="custom-banner">
  <h2>Welcome to Our Shop!</h2>
  <p>Check out our latest products and deals.</p>
</div>

<!-- You can add promotional sections, custom layouts, etc. -->
<div class="featured-section">
  <h3>Featured Items</h3>
  <!-- Add your content here -->
</div>`}
                spellCheck={false}
              />
              <div className="absolute bottom-2 left-4 text-xs text-gray-400">
                Max: 50,000 characters | Current: {customHtml.length}
              </div>
            </div>
          )}

          {/* CSS Editor */}
          {activeTab === "css" && (
            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <button
                  onClick={() => handleCopy(customCss, "CSS")}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                  title="Copy CSS"
                >
                  <FiCopy className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <textarea
                value={customCss}
                onChange={(e) => setCustomCss(e.target.value)}
                className="w-full h-[400px] p-4 font-mono text-sm bg-gray-50 border-0 focus:ring-0 focus:outline-none resize-none"
                placeholder={`/* Add your custom CSS styles here */

.custom-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;
}

.custom-banner h2 {
  font-size: 28px;
  margin-bottom: 10px;
}

.featured-section {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 8px;
}

/* Add more styles as needed */`}
                spellCheck={false}
              />
              <div className="absolute bottom-2 left-4 text-xs text-gray-400">
                Max: 20,000 characters | Current: {customCss.length}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BiCodeBlock className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-800">Live Preview</h3>
            </div>
            <span className="text-xs text-gray-500">This is how your custom content will appear on your shop page</span>
          </div>
          <div className="p-4 bg-gray-50 min-h-[300px]">
            <iframe
              srcDoc={getPreviewContent()}
              title="Preview"
              className="w-full min-h-[300px] border border-gray-200 rounded-lg bg-white"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <FiAlertTriangle className="w-5 h-5" />
          Tips & Guidelines
        </h3>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start gap-2">
            <FiCheck className="w-4 h-4 mt-0.5 text-green-600" />
            Your custom HTML will appear above your products on your shop page
          </li>
          <li className="flex items-start gap-2">
            <FiCheck className="w-4 h-4 mt-0.5 text-green-600" />
            Use CSS classes to style your HTML elements
          </li>
          <li className="flex items-start gap-2">
            <FiCheck className="w-4 h-4 mt-0.5 text-green-600" />
            Script tags and event handlers are automatically removed for security
          </li>
          <li className="flex items-start gap-2">
            <FiCheck className="w-4 h-4 mt-0.5 text-green-600" />
            Use the preview to see how your content will look before saving
          </li>
          <li className="flex items-start gap-2">
            <FiAlertTriangle className="w-4 h-4 mt-0.5 text-amber-600" />
            Toggle "Custom content enabled" to show/hide your content on the shop page
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HtmlCssEditor;
