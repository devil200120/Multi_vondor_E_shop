import React, { useEffect, useState } from "react";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import styles from "../../styles/styles";
import { RxCross1 } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiFileText,
  FiUpload,
  FiSave,
  FiToggleLeft,
  FiToggleRight,
  FiPlus,
} from "react-icons/fi";
import { HiOutlineDocument } from "react-icons/hi";
import { MdVerified, MdBlock } from "react-icons/md";
import Loader from "../Layout/Loader";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Custom styles for Quill editor
const quillStyles = `
  .ql-editor {
    min-height: 250px;
    font-size: 16px;
    line-height: 1.6;
    padding: 15px;
  }
  
  /* Font size styles */
  .ql-size-small {
    font-size: 0.75em;
  }
  
  .ql-size-large {
    font-size: 1.5em;
  }
  
  .ql-size-huge {
    font-size: 2.25em;
  }
  
  /* Better toolbar styling */
  .ql-toolbar {
    border-top: 1px solid #e1e5e9;
    border-left: 1px solid #e1e5e9;
    border-right: 1px solid #e1e5e9;
    background: #f8f9fa;
    border-radius: 8px 8px 0 0;
    padding: 8px;
  }
  
  .ql-container {
    border-bottom: 1px solid #e1e5e9;
    border-left: 1px solid #e1e5e9;
    border-right: 1px solid #e1e5e9;
    border-radius: 0 0 8px 8px;
    font-family: inherit;
  }
  
  /* Dropdown styling */
  .ql-picker-label {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 2px 8px;
    background: white;
  }
  
  .ql-picker-label:hover {
    background: #f1f3f4;
  }
  
  /* Size dropdown specific styling */
  .ql-size .ql-picker-label[data-value="small"]::before {
    content: 'Small';
    font-size: 12px;
  }
  
  .ql-size .ql-picker-label[data-value=""]::before {
    content: 'Normal';
    font-size: 14px;
  }
  
  .ql-size .ql-picker-label[data-value="large"]::before {
    content: 'Large';
    font-size: 18px;
  }
  
  .ql-size .ql-picker-label[data-value="huge"]::before {
    content: 'Huge';
    font-size: 24px;
  }
  
  /* Active button styling */
  .ql-toolbar button.ql-active {
    background: #0066cc;
    color: white;
    border-radius: 4px;
  }
  
  /* Format results in editor */
  .ql-editor .ql-size-small {
    font-size: 12px;
  }
  
  .ql-editor .ql-size-large {
    font-size: 20px;
  }
  
  .ql-editor .ql-size-huge {
    font-size: 28px;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = quillStyles;
  if (!document.head.querySelector("style[data-quill-custom]")) {
    styleElement.setAttribute("data-quill-custom", "true");
    document.head.appendChild(styleElement);
  }
}

const LegalPagesManager = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({});

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    pageType: "",
    title: "",
    content: "",
    contentType: "html",
    metaDescription: "",
    metaKeywords: "",
    isActive: true,
  });
  const [uploadedFile, setUploadedFile] = useState(null);

  const pageTypes = [
    { value: "buyer-terms-of-service", label: "Buyer Terms of Service" },
    { value: "seller-terms-of-service", label: "Seller Terms of Service" },
    { value: "terms-of-service", label: "General Terms of Service (Legacy)" },
    { value: "privacy-policy", label: "Privacy Policy" },
    { value: "return-refund", label: "Return & Refund Policy" },
    { value: "shipping-policy", label: "Shipping Policy" },
    { value: "about-us", label: "About Us" },
  ];

  useEffect(() => {
    fetchPages();
    fetchStats();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${server}/legal-page/admin-get-all-pages`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setPages(response.data.pages);
      }
    } catch (error) {
      toast.error("Failed to fetch legal pages");
      console.error("Error fetching legal pages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${server}/legal-page/admin-page-stats`,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleEdit = (page) => {
    setSelectedPage(page);
    setFormData({
      pageType: page.pageType,
      title: page.title,
      content: page.content,
      contentType: page.contentType,
      metaDescription: page.metaDescription || "",
      metaKeywords: page.metaKeywords ? page.metaKeywords.join(", ") : "",
      isActive: page.isActive,
    });
    setEditModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPage(null);
    setFormData({
      pageType: "",
      title: "",
      content: "",
      contentType: "html",
      metaDescription: "",
      metaKeywords: "",
      isActive: true,
    });
    setUploadedFile(null);
    setEditModalOpen(true);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setUploadedFile(file);
        toast.success(
          "Word document selected. It will be processed when you save."
        );
      } else {
        toast.error("Only Word documents (.docx) are supported");
        event.target.value = "";
      }
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.pageType ||
      !formData.title ||
      (!formData.content && !uploadedFile)
    ) {
      toast.error("Please fill in all required fields or upload a document");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append("pageType", formData.pageType);
      submitFormData.append("title", formData.title);
      submitFormData.append("content", formData.content);
      submitFormData.append("contentType", formData.contentType);
      submitFormData.append("metaDescription", formData.metaDescription);
      submitFormData.append("metaKeywords", formData.metaKeywords);
      submitFormData.append("isActive", formData.isActive);

      if (uploadedFile) {
        submitFormData.append("document", uploadedFile);
      }

      const response = await axios.post(
        `${server}/legal-page/admin-create-update-page`,
        submitFormData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setEditModalOpen(false);
        setUploadedFile(null);
        fetchPages();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save page");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (page) => {
    try {
      const response = await axios.put(
        `${server}/legal-page/admin-toggle-status/${page.pageType}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchPages();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleDelete = async () => {
    if (!selectedPage) return;

    setIsSubmitting(true);
    try {
      const response = await axios.delete(
        `${server}/legal-page/admin-delete-page/${selectedPage.pageType}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setDeleteModalOpen(false);
        setSelectedPage(null);
        fetchPages();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete page");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMigrateTerms = async () => {
    setIsMigrating(true);
    try {
      const response = await axios.post(
        `${server}/legal-page/admin-migrate-terms`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchPages();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Migration failed");
      console.error("Migration error:", error);
    } finally {
      setIsMigrating(false);
    }
  };

  const columns = [
    {
      field: "pageType",
      headerName: "Page Type",
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <div className="flex items-center space-x-2">
          <HiOutlineDocument className="text-blue-600" size={16} />
          <span className="capitalize">{params.value.replace(/-/g, " ")}</span>
        </div>
      ),
    },
    {
      field: "title",
      headerName: "Title",
      minWidth: 200,
      flex: 1.2,
      renderCell: (params) => (
        <span className="font-medium text-gray-900" title={params.value}>
          {params.value}
        </span>
      ),
    },
    {
      field: "lastUpdated",
      headerName: "Last Updated",
      minWidth: 150,
      flex: 0.8,
      renderCell: (params) => (
        <div className="text-sm">
          <div className="text-gray-900">{params.value}</div>
          <div className="text-gray-500 text-xs">
            by {params.row.lastUpdatedBy}
          </div>
        </div>
      ),
    },
    {
      field: "version",
      headerName: "Version",
      minWidth: 80,
      flex: 0.5,
      align: "center",
      renderCell: (params) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
          v{params.value}
        </span>
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      minWidth: 100,
      flex: 0.6,
      align: "center",
      renderCell: (params) => (
        <div className="flex justify-center">
          {params.value ? (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center space-x-1">
              <MdVerified size={12} />
              <span>Active</span>
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center space-x-1">
              <MdBlock size={12} />
              <span>Inactive</span>
            </span>
          )}
        </div>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      minWidth: 200,
      flex: 1,
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <div className="flex justify-center space-x-1">
          <Button
            onClick={() => {
              setSelectedPage(params.row);
              setPreviewModalOpen(true);
            }}
            className="!min-w-0 !p-2 !text-blue-600 hover:!bg-blue-50 !rounded-lg"
            title="Preview"
          >
            <FiEye size={16} />
          </Button>

          <Button
            onClick={() => handleEdit(params.row)}
            className="!min-w-0 !p-2 !text-green-600 hover:!bg-green-50 !rounded-lg"
            title="Edit"
          >
            <FiEdit size={16} />
          </Button>

          <Button
            onClick={() => handleToggleStatus(params.row)}
            className="!min-w-0 !p-2 !text-orange-600 hover:!bg-orange-50 !rounded-lg"
            title={params.row.isActive ? "Deactivate" : "Activate"}
          >
            {params.row.isActive ? (
              <FiToggleRight size={16} />
            ) : (
              <FiToggleLeft size={16} />
            )}
          </Button>

          <Button
            onClick={() => {
              setSelectedPage(params.row);
              setDeleteModalOpen(true);
            }}
            className="!min-w-0 !p-2 !text-red-600 hover:!bg-red-50 !rounded-lg"
            title="Delete"
          >
            <FiTrash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const row = pages.map((page) => ({
    id: page._id,
    pageType: page.pageType,
    title: page.title,
    lastUpdated: new Date(page.updatedAt).toLocaleDateString(),
    lastUpdatedBy: page.lastUpdatedBy?.name || "Unknown",
    version: page.version,
    isActive: page.isActive,
    content: page.content,
    contentType: page.contentType,
    metaDescription: page.metaDescription,
    metaKeywords: page.metaKeywords,
    documentFile: page.documentFile,
  }));

  const filteredRows = row.filter(
    (page) =>
      page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.pageType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ size: ["small", false, "large", "huge"] }], // Font size options
      [{ font: [] }], // Font family options
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }], // Text and background colors
      [{ script: "sub" }, { script: "super" }], // Subscript/Superscript
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }], // Text direction
      [{ align: [] }], // Text alignment
      ["blockquote", "code-block"],
      ["link", "image", "video"],
      ["clean"], // Remove formatting
    ],
  };

  const quillFormats = [
    "header",
    "size",
    "font",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "list",
    "bullet",
    "indent",
    "direction",
    "align",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full p-4 800px:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FiFileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl 800px:text-3xl font-bold text-gray-900">
                Legal Pages Manager
              </h1>
              <p className="text-gray-600">
                Manage terms, policies, and legal content
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleMigrateTerms}
              disabled={isMigrating}
              className="!bg-orange-600 !text-white !px-4 !py-2 !rounded-lg hover:!bg-orange-700 disabled:!bg-gray-400"
              startIcon={isMigrating ? null : <FiUpload />}
            >
              {isMigrating ? "Migrating..." : "Migrate Terms"}
            </Button>
            <Button
              onClick={handleCreate}
              className="!bg-blue-600 !text-white !px-4 !py-2 !rounded-lg hover:!bg-blue-700"
              startIcon={<FiPlus />}
            >
              Create Page
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 400px:grid-cols-2 800px:grid-cols-4 gap-4 800px:gap-6 mb-6">
        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pages</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.total || 0}
              </p>
            </div>
            <FiFileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Pages</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active || 0}
              </p>
            </div>
            <MdVerified className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Inactive Pages
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.inactive || 0}
              </p>
            </div>
            <MdBlock className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className={`${styles.card} ${styles.card_padding}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Recent Updates
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.recentUpdates?.length || 0}
              </p>
            </div>
            <FiEdit className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`${styles.card} p-4 mb-6`}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search legal pages by title or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
            style={{ paddingLeft: "2.5rem" }}
          />
        </div>
      </div>

      {/* Pages Table */}
      <div className={`${styles.card} overflow-hidden`}>
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Legal Pages</h2>
          <p className="text-sm text-gray-500">
            {filteredRows.length} page{filteredRows.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>

        <div className="h-[600px] w-full">
          <DataGrid
            rows={filteredRows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            autoHeight={false}
            className="!border-0"
          />
        </div>
      </div>

      {/* Edit/Create Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedPage ? "Edit Legal Page" : "Create Legal Page"}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <RxCross1 size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Page Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Type *
                </label>
                <select
                  value={formData.pageType}
                  onChange={(e) =>
                    setFormData({ ...formData, pageType: e.target.value })
                  }
                  className={styles.input}
                  disabled={!!selectedPage}
                >
                  <option value="">Select page type</option>
                  {pageTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={styles.input}
                  placeholder="Enter page title"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Word Document (.docx)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <FiUpload size={16} />
                    <span>Choose File</span>
                  </label>
                  {uploadedFile && (
                    <span className="text-sm text-green-600">
                      {uploadedFile.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload a Word document to automatically convert to HTML
                  content
                </p>
              </div>

              {/* Content Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  modules={quillModules}
                  formats={quillFormats}
                  style={{ height: "300px", marginBottom: "50px" }}
                />
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metaDescription: e.target.value,
                    })
                  }
                  className={styles.input}
                  rows={3}
                  placeholder="Enter meta description for SEO"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>

              {/* Meta Keywords */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  value={formData.metaKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, metaKeywords: e.target.value })
                  }
                  className={styles.input}
                  placeholder="Enter keywords separated by commas"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Make this page active
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEditModalOpen(false)}
                className={`flex-1 ${styles.button_outline}`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <FiSave size={16} />
                <span>{isSubmitting ? "Saving..." : "Save Page"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModalOpen && selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Preview: {selectedPage.title}
              </h3>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <RxCross1 size={20} />
              </button>
            </div>

            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: selectedPage.content }} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModalOpen && selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Legal Page
              </h3>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <RxCross1 size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete{" "}
                <strong>{selectedPage.title}</strong>? This action cannot be
                undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className={`flex-1 ${styles.button_outline}`}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalPagesManager;
