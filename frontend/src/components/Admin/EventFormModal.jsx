import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { AiOutlineClose } from "react-icons/ai";
import { BiImageAdd } from "react-icons/bi";
import { toast } from "react-toastify";

const EventFormModal = ({
  open,
  onClose,
  event,
  onSubmit,
  isEdit = false,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
    originalPrice: "",
    discountPrice: "",
    stock: "",
    start_Date: "",
    Finish_Date: "",
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (isEdit && event) {
      // Pre-fill form for editing
      setFormData({
        name: event.name || "",
        description: event.description || "",
        category: event.category || "",
        tags: event.tags || "",
        originalPrice: event.originalPrice || "",
        discountPrice: event.discountPrice || "",
        stock: event.stock || "",
        start_Date: event.start_Date
          ? new Date(event.start_Date).toISOString().split("T")[0]
          : "",
        Finish_Date: event.Finish_Date
          ? new Date(event.Finish_Date).toISOString().split("T")[0]
          : "",
      });

      // Set existing images
      if (event.images && event.images.length > 0) {
        setImagePreviews(event.images.map((img) => img.url));
      }
    } else {
      // Reset form for creating new event
      resetForm();
    }
  }, [event, isEdit, open]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      tags: "",
      originalPrice: "",
      discountPrice: "",
      stock: "",
      start_Date: "",
      Finish_Date: "",
    });
    setImages([]);
    setImagePreviews([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate file types
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast.error("Please select only image files (JPEG, PNG, WebP)");
      return;
    }

    // Validate file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast.error("Please select images smaller than 5MB");
      return;
    }

    setImages(files);

    // Create previews
    const previewPromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then((previews) => {
      setImagePreviews(previews);
    });
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter event name");
      return;
    }

    if (!formData.category.trim()) {
      toast.error("Please select a category");
      return;
    }

    if (!formData.originalPrice || formData.originalPrice <= 0) {
      toast.error("Please enter a valid original price");
      return;
    }

    if (!formData.discountPrice || formData.discountPrice <= 0) {
      toast.error("Please enter a valid discount price");
      return;
    }

    if (
      parseFloat(formData.discountPrice) >= parseFloat(formData.originalPrice)
    ) {
      toast.error("Discount price must be less than original price");
      return;
    }

    if (!formData.stock || formData.stock <= 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    if (!formData.start_Date) {
      toast.error("Please select start date");
      return;
    }

    if (!formData.Finish_Date) {
      toast.error("Please select end date");
      return;
    }

    if (new Date(formData.start_Date) >= new Date(formData.Finish_Date)) {
      toast.error("End date must be after start date");
      return;
    }

    // Create FormData for file upload
    const submitData = new FormData();

    // Add text fields
    Object.keys(formData).forEach((key) => {
      submitData.append(key, formData[key]);
    });

    // Add images
    images.forEach((image) => {
      submitData.append("images", image);
    });

    console.log("Submitting event data:", {
      formData,
      imageCount: images.length,
      imageDetails: images.map((img) => ({
        name: img.name,
        size: img.size,
        type: img.type,
      })),
    });

    try {
      await onSubmit(submitData, event?._id);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form");
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      scroll="paper"
      PaperProps={{
        elevation: 0,
        style: {
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          maxHeight: "85vh",
          margin: "16px",
          width: "420px",
          maxWidth: "90vw",
          border: "1px solid #e5e7eb",
          background: "#ffffff",
          transition: "all 0.3s ease-out",
        },
      }}
      BackdropProps={{
        style: {
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          transition: "all 0.3s ease-out",
        },
      }}
      aria-labelledby="event-form-title"
    >
      <DialogTitle
        id="event-form-title"
        style={{
          background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
          color: "white",
          borderRadius: "12px 12px 0 0",
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold mb-0.5">
              {isEdit ? "Edit Event" : "Create Event"}
            </h2>
            <p className="text-violet-100 text-xs opacity-90">
              {isEdit ? "Update details" : "Add new event"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-all duration-200 hover:rotate-90"
          >
            <AiOutlineClose size={18} />
          </button>
        </div>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent
          className="space-y-4"
          style={{
            padding: "20px",
            background: "#fafafa",
          }}
        >
          {/* Event Name */}
          <div>
            <label className="block text-xs font-medium text-gray-800 mb-1.5">
              Event Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter event name"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white transition-all duration-200 hover:border-violet-300 hover:shadow-sm text-sm font-medium"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter event description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white transition-all duration-200 hover:border-gray-400 resize-none text-sm font-medium"
              required
            />
          </div>

          {/* Category and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white transition-all duration-200 hover:border-gray-400 text-sm font-medium"
                required
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Fashion">Fashion</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Sports">Sports</option>
                <option value="Books">Books</option>
                <option value="Health & Beauty">Health & Beauty</option>
                <option value="Food & Beverages">Food & Beverages</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Enter tags (comma separated)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white transition-all duration-200 hover:border-gray-400 text-sm font-medium"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Pricing Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Original Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  placeholder="Enter original price"
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white transition-all duration-200 hover:border-gray-400 text-sm font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Discount Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="discountPrice"
                  value={formData.discountPrice}
                  onChange={handleInputChange}
                  placeholder="Enter discount price"
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white transition-all duration-200 hover:border-gray-400 text-sm font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="Enter stock quantity"
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white transition-all duration-200 hover:border-gray-400 text-sm font-medium"
              required
            />
          </div>

          {/* Dates */}
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Event Duration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="start_Date"
                  value={formData.start_Date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white transition-all duration-200 hover:border-gray-400 text-sm font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="Finish_Date"
                  value={formData.Finish_Date}
                  onChange={handleInputChange}
                  min={
                    formData.start_Date ||
                    new Date().toISOString().split("T")[0]
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white transition-all duration-200 hover:border-gray-400 text-sm font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-3">
              Event Images
            </label>
            <div className="border-2 border-dashed border-violet-300 rounded-lg p-8 text-center hover:border-violet-400 hover:bg-violet-50 transition-all duration-200 bg-white">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-4">
                  <BiImageAdd size={32} className="text-violet-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  Upload Event Images
                </h4>
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload images or drag and drop
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, WebP up to 5MB each
                </p>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-gray-800 mb-3">
                  Preview ({imagePreviews.length} images):
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm group-hover:shadow-md transition-shadow duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                      >
                        <AiOutlineClose size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions className="px-6 py-5 bg-white border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center focus:outline-none focus:ring-2 focus:ring-violet-500 ml-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <BiImageAdd size={18} className="mr-2" />
                {isEdit ? "Update Event" : "Create Event"}
              </>
            )}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventFormModal;
