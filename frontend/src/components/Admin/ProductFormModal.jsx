import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { AiOutlineCloudUpload, AiOutlineClose } from "react-icons/ai";
import { BiImageAdd, BiVideoPlus } from "react-icons/bi";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { getSubcategoriesPublic } from "../../redux/actions/category";
import axios from "axios";
import { server } from "../../server";
import ProductAttributesForm from "../Shop/ProductAttributesForm";

const ProductFormModal = ({
  open,
  onClose,
  product,
  onSubmit,
  isEdit = false,
  loading = false,
  categories = [],
}) => {
  const dispatch = useDispatch();
  const { subcategories, subcategoriesLoading } = useSelector(
    (state) => state.categories
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    tags: "",
    originalPrice: "",
    discountPrice: "",
    stock: "",
    isSellerProduct: false,
    sellerShop: "",
  });

  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(false);

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videos, setVideos] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [attributes, setAttributes] = useState([]);

  // Fetch sellers when component mounts
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoadingSellers(true);
        const { data } = await axios.get(`${server}/shop/admin-all-sellers`, {
          withCredentials: true,
        });
        setSellers(data.sellers);
      } catch (error) {
        console.error("Error fetching sellers:", error);
        toast.error("Failed to fetch sellers");
      } finally {
        setLoadingSellers(false);
      }
    };

    if (open) {
      fetchSellers();
    }
  }, [open]);

  useEffect(() => {
    if (isEdit && product) {
      // Pre-fill form for editing
      setFormData({
        name: product.name || "",
        description: product.description || "",
        category: product.category?._id || product.category || "",
        subcategory: product.subcategory?._id || product.subcategory || "",
        tags: product.tags || "",
        originalPrice: product.originalPrice || "",
        discountPrice: product.discountPrice || "",
        stock: product.stock || "",
        isSellerProduct: product.isSellerProduct || false,
        sellerShop: product.sellerShop?._id || product.sellerShop || "",
      });

      // Set existing images
      if (product.images && product.images.length > 0) {
        setImagePreviews(product.images.map((img) => img.url));
      }

      // Set existing videos
      if (product.videos && product.videos.length > 0) {
        setVideoPreviews(product.videos.map((video) => video.url));
      }

      // Set existing attributes
      if (product.attributes && product.attributes.length > 0) {
        setAttributes(product.attributes);
      } else {
        setAttributes([]);
      }
    } else {
      // Reset form for creating new product
      resetForm();
    }
  }, [product, isEdit, open]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      subcategory: "",
      tags: "",
      originalPrice: "",
      discountPrice: "",
      stock: "",
      isSellerProduct: false,
      sellerShop: "",
    });
    setImages([]);
    setImagePreviews([]);
    setVideos([]);
    setVideoPreviews([]);
    setAttributes([]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // If category changes, fetch subcategories and reset subcategory
    if (name === "category" && value) {
      dispatch(getSubcategoriesPublic(value));
      setFormData((prev) => ({
        ...prev,
        subcategory: "", // Reset subcategory when category changes
      }));
    }

    // If seller product is unchecked, clear seller fields
    if (name === "isSellerProduct" && !checked) {
      setFormData((prev) => ({
        ...prev,
        sellerShop: "",
      }));
    }
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

  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate file types
    const validTypes = ["video/mp4", "video/webm", "video/ogg"];
    const invalidFiles = files.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      toast.error("Please select only video files (MP4, WebM, OGG)");
      return;
    }

    // Validate file sizes (max 50MB per file)
    const maxSize = 50 * 1024 * 1024; // 50MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      toast.error("Please select videos smaller than 50MB");
      return;
    }

    setVideos(files);

    // Create previews
    const previewPromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then((previews) => {
      setVideoPreviews(previews);
    });
  };

  const removeVideo = (index) => {
    const newVideos = videos.filter((_, i) => i !== index);
    const newPreviews = videoPreviews.filter((_, i) => i !== index);
    setVideos(newVideos);
    setVideoPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter product name");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter product description");
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

    if (!formData.stock || formData.stock < 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    // Seller validation
    if (formData.isSellerProduct && !formData.sellerShop) {
      toast.error("Please select a seller for seller product");
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

    // Add videos
    videos.forEach((video) => {
      submitData.append("videos", video);
    });

    // Add attributes (filter out empty ones)
    const validAttributes = attributes.filter((attr) => {
      // Only include attributes that have a name and at least one valid value
      if (!attr.name || attr.name.trim() === "") {
        return false;
      }

      if (!attr.values || !Array.isArray(attr.values)) {
        return false;
      }

      const validValues = attr.values.filter(
        (val) => val.value && val.value.trim() !== ""
      );

      return validValues.length > 0;
    });

    submitData.append("attributes", JSON.stringify(validAttributes));

    console.log("Submitting product data:", {
      formData,
      imageCount: images.length,
      videoCount: videos.length,
      imageDetails: images.map((img) => ({
        name: img.name,
        size: img.size,
        type: img.type,
      })),
      videoDetails: videos.map((video) => ({
        name: video.name,
        size: video.size,
        type: video.type,
      })),
    });

    try {
      await onSubmit(submitData, product?._id);
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
      maxWidth="md"
      fullWidth
      aria-labelledby="product-form-title"
    >
      <DialogTitle
        id="product-form-title"
        className="flex justify-between items-center"
      >
        <span className="text-xl font-bold">
          {isEdit ? "Edit Product" : "Create New Product"}
        </span>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <AiOutlineClose size={24} />
        </button>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          {formData.category && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory
              </label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={subcategoriesLoading}
              >
                <option value="">
                  {subcategoriesLoading
                    ? "Loading subcategories..."
                    : "Select Subcategory (Optional)"}
                </option>
                {subcategories &&
                  subcategories.map((subcat) => (
                    <option key={subcat._id} value={subcat._id}>
                      {subcat.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="Enter tags (comma separated)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Seller Product Option */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isSellerProduct"
                name="isSellerProduct"
                checked={formData.isSellerProduct}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="isSellerProduct"
                className="text-sm font-medium text-gray-700"
              >
                This is a seller product
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Check this if you're creating a product sourced from a
              seller/vendor
            </p>
          </div>

          {/* Seller Selection (shown only when isSellerProduct is true) */}
          {formData.isSellerProduct && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-3">
                Select Seller/Vendor
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seller Shop *
                </label>
                <select
                  name="sellerShop"
                  value={formData.sellerShop}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={formData.isSellerProduct}
                  disabled={loadingSellers}
                >
                  <option value="">
                    {loadingSellers ? "Loading sellers..." : "Select a seller"}
                  </option>
                  {sellers.map((seller) => (
                    <option key={seller._id} value={seller._id}>
                      {seller.name} - {seller.email}
                    </option>
                  ))}
                </select>

                {/* Selected Seller Info */}
                {formData.sellerShop && (
                  <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                    {(() => {
                      const selectedSeller = sellers.find(
                        (s) => s._id === formData.sellerShop
                      );
                      return selectedSeller ? (
                        <div className="text-xs text-gray-600">
                          <p>
                            <strong>Shop:</strong> {selectedSeller.name}
                          </p>
                          <p>
                            <strong>Email:</strong> {selectedSeller.email}
                          </p>
                          <p>
                            <strong>Phone:</strong> {selectedSeller.phoneNumber}
                          </p>
                          <p>
                            <strong>Address:</strong> {selectedSeller.address}
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Price Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price *
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price *
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>

          {/* Product Attributes */}
          <ProductAttributesForm
            attributes={attributes}
            onChange={setAttributes}
          />

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>

            {/* Image Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="product-images"
              />
              <label
                htmlFor="product-images"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <BiImageAdd size={48} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload product images
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, WebP up to 5MB each
                </p>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </p>
                <div className="grid grid-cols-2 400px:grid-cols-3 800px:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <AiOutlineClose size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Video Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Videos (Optional)
            </label>

            {/* Video Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={handleVideoChange}
                className="hidden"
                id="product-videos"
              />
              <label
                htmlFor="product-videos"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <BiVideoPlus size={48} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to upload product videos
                </p>
                <p className="text-xs text-gray-400">
                  MP4, WebM, OGG up to 50MB each
                </p>
              </label>
            </div>

            {/* Video Previews */}
            {videoPreviews.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Video Preview:
                </p>
                <div className="grid grid-cols-1 400px:grid-cols-2 gap-4">
                  {videoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <video
                        src={preview}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        controls
                        muted
                      />
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <AiOutlineClose size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions className="px-6 py-4 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEdit ? "Updating..." : "Creating..."}
              </div>
            ) : isEdit ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductFormModal;
