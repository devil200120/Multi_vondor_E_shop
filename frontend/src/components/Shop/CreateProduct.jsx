import React, { useEffect, useState } from "react";
import {
  AiOutlineCamera,
  AiOutlineClose,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createProduct, clearSuccess } from "../../redux/actions/product";
import {
  getAllCategoriesPublic,
  getSubcategoriesPublic,
} from "../../redux/actions/category";
import { toast } from "react-toastify";
import { FiPackage, FiDollarSign, FiImage, FiVideo } from "react-icons/fi";
import ProductAttributesForm from "./ProductAttributesForm";

const CreateProduct = () => {
  const { seller } = useSelector((state) => state.seller);
  const { success, error, isLoading } = useSelector((state) => state.products);
  const { categories, subcategories } = useSelector(
    (state) => state.categories
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [tags, setTags] = useState("");
  const [originalPrice, setOriginalPrice] = useState();
  const [discountPrice, setDiscountPrice] = useState();
  const [stock, setStock] = useState();
  const [attributes, setAttributes] = useState([]);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(getAllCategoriesPublic());
  }, [dispatch]);

  // Handle category selection and fetch subcategories
  const handleCategoryChange = (selectedCategoryId) => {
    setCategory(selectedCategoryId);
    setSubcategory(""); // Reset subcategory when category changes

    if (selectedCategoryId) {
      // Fetch subcategories for the selected category
      dispatch(getSubcategoriesPublic(selectedCategoryId));
    }
  };

  // Filter root categories (categories without parent)
  const rootCategories = categories
    ? categories.filter((cat) => !cat.parent)
    : [];

  // Get selected category object to check if it has subcategories
  const selectedCategoryObj = categories
    ? categories.find((cat) => cat._id === category)
    : null;

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (success) {
      toast.success(
        "Product submitted for approval! It will be visible after admin approval."
      );
      // Reset form fields
      setImages([]);
      setVideos([]);
      setName("");
      setDescription("");
      setCategory("");
      setSubcategory("");
      setTags("");
      setOriginalPrice("");
      setDiscountPrice("");
      setStock("");
      // Clear the success state to prevent re-triggering
      dispatch(clearSuccess());
      // Navigate to products page without reload
      navigate("/dashboard-products");
    }
  }, [dispatch, error, success, navigate]);

  const handleImageChange = (e) => {
    e.preventDefault();

    let files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const handleVideoChange = (e) => {
    e.preventDefault();

    let files = Array.from(e.target.files);
    // Validate video files
    const validVideoTypes = [
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/wmv",
      "video/flv",
      "video/webm",
    ];
    const maxVideoSize = 100 * 1024 * 1024; // 100MB

    const validFiles = files.filter((file) => {
      if (!validVideoTypes.includes(file.type)) {
        toast.error(
          `${file.name} is not a valid video format. Please upload MP4, AVI, MOV, WMV, FLV, or WebM files.`
        );
        return false;
      }
      if (file.size > maxVideoSize) {
        toast.error(`${file.name} is too large. Maximum file size is 100MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setVideos((prevVideos) => [...prevVideos, ...validFiles]);
    }
  };

  console.log(images, videos);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Show upload start toast
    toast.info(
      "Starting product creation and uploading media to cloud storage...",
      {
        autoClose: 3000,
      }
    );

    const newForm = new FormData();

    images.forEach((image) => {
      newForm.append("images", image);
    });
    videos.forEach((video) => {
      newForm.append("videos", video);
    });
    newForm.append("name", name);
    newForm.append("description", description);
    // Use subcategory if selected, otherwise use category
    const finalCategory = subcategory || category;
    newForm.append("category", finalCategory);
    newForm.append("tags", tags);
    newForm.append("originalPrice", originalPrice);
    newForm.append("discountPrice", discountPrice);
    newForm.append("stock", stock);
    newForm.append("shopId", seller._id);
    newForm.append("attributes", JSON.stringify(attributes));
    dispatch(createProduct(newForm));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 p-3 md:p-6 ">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <FiPackage className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                Create New Product
              </h1>
              <p className="text-sm md:text-base text-gray-600">
                Add a new product to your store with detailed information
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-xl relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
              <div className="text-center">
                <AiOutlineLoading3Quarters
                  className="animate-spin text-blue-600 mx-auto mb-4"
                  size={48}
                />
                <p className="text-lg font-semibold text-gray-700">
                  Creating Product...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Please wait, uploading images and videos to cloud storage
                </p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="p-4 md:p-8 space-y-6 md:space-y-8"
          >
            {/* Basic Information Section */}
            <div className="space-y-4 md:space-y-6">
              <div className="border-b border-gray-200/50 pb-3 md:pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FiPackage className="text-white" size={16} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      Basic Information
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600">
                      Essential details about your product
                    </p>
                  </div>
                </div>
              </div>

              {/* Product Name */}
              <div className="space-y-2">
                <label className="text-sm md:text-base font-bold text-gray-700 flex items-center">
                  Product Name <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  required
                  className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a descriptive product name"
                />
              </div>

              {/* Product Description */}
              <div className="space-y-2">
                <label className="text-sm md:text-base font-bold text-gray-700 flex items-center">
                  Description <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={description}
                  required
                  className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a detailed description of your product..."
                />
              </div>

              {/* Category and Subcategory Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-sm md:text-base font-bold text-gray-700 flex items-center">
                    Category <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    required
                  >
                    <option value="">Choose a category</option>
                    {rootCategories.map((cat) => (
                      <option value={cat._id} key={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subcategory Selection - Only show if category is selected and has subcategories */}
                {category && subcategories && subcategories.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm md:text-base font-bold text-gray-700 flex items-center">
                      Subcategory
                      <span className="text-xs text-gray-500 ml-2">
                        (Optional)
                      </span>
                    </label>
                    <select
                      className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                    >
                      <option value="">Choose a subcategory (optional)</option>
                      {subcategories.map((subcat) => (
                        <option value={subcat._id} key={subcat._id}>
                          {subcat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Tags - Move to second column or create new row if subcategory is shown */}
                <div
                  className={`space-y-2 ${
                    category && subcategories && subcategories.length > 0
                      ? "lg:col-span-2"
                      : ""
                  }`}
                >
                  <label className="text-sm md:text-base font-bold text-gray-700">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={tags}
                    className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., electronics, mobile, smartphone"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4 md:space-y-6">
              <div className="border-b border-gray-200/50 pb-3 md:pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="text-white" size={16} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      Pricing & Inventory
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600">
                      Set pricing and stock information
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-sm md:text-base font-bold text-gray-700 flex items-center">
                    Original Price <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      name="originalPrice"
                      value={originalPrice}
                      required
                      className="w-full pl-8 pr-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm md:text-base font-bold text-gray-700">
                    Discount Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      name="discountPrice"
                      value={discountPrice}
                      className="w-full pl-8 pr-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                      onChange={(e) => setDiscountPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <label className="text-sm md:text-base font-bold text-gray-700 flex items-center">
                    Stock Quantity <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={stock}
                    required
                    className="w-full px-4 py-3 md:py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Product Attributes Section */}
            <ProductAttributesForm
              attributes={attributes}
              onChange={setAttributes}
            />

            {/* Product Images Section */}
            <div className="space-y-4 md:space-y-6">
              <div className="border-b border-gray-200/50 pb-3 md:pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                    <FiImage className="text-white" size={16} />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">
                      Product Images
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600">
                      Upload high-quality images of your product
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gradient-to-br from-gray-50 to-blue-50/50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group shadow-sm hover:shadow-lg">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                      <AiOutlineCamera className="text-white" size={20} />
                    </div>
                    <p className="text-sm md:text-base text-gray-700 font-bold mb-1">
                      Upload Images
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    name="upload"
                    className="hidden"
                    multiple
                    onChange={handleImageChange}
                  />
                </label>

                {/* Image Preview */}
                {images && images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Product preview"
                          className="w-full h-20 md:h-24 object-cover rounded-xl border border-gray-300 shadow-sm group-hover:shadow-lg transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setImages(images.filter((_, i) => i !== index))
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200"
                        >
                          <AiOutlineClose size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Video Upload Section */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200/50 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <FiVideo className="text-white" size={16} />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">
                  Product Videos
                </h3>
              </div>

              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gradient-to-br from-gray-50 to-purple-50/50 hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group shadow-sm hover:shadow-lg">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200">
                      <FiVideo className="text-white" size={20} />
                    </div>
                    <p className="text-sm md:text-base text-gray-700 font-bold mb-1">
                      Upload Videos
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                      MP4, AVI, MOV up to 100MB
                    </p>
                  </div>
                  <input
                    type="file"
                    name="upload"
                    className="hidden"
                    multiple
                    accept="video/*"
                    onChange={handleVideoChange}
                  />
                </label>

                {/* Video Preview */}
                {videos && videos.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {videos.map((video, index) => (
                      <div key={index} className="relative group">
                        <video
                          className="w-full h-32 md:h-36 object-cover rounded-xl border border-gray-300 shadow-sm group-hover:shadow-lg transition-all duration-200"
                          controls
                          preload="metadata"
                        >
                          <source
                            src={URL.createObjectURL(video)}
                            type={video.type}
                          />
                          Your browser does not support the video tag.
                        </video>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {video.name.length > 15
                            ? `${video.name.substring(0, 15)}...`
                            : video.name}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setVideos(videos.filter((_, i) => i !== index))
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200"
                        >
                          <AiOutlineClose size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 md:pt-8 border-t border-gray-200/50">
              <button
                type="button"
                onClick={() => !isLoading && navigate("/dashboard")}
                disabled={isLoading}
                className={`flex-1 sm:flex-none px-6 md:px-8 py-3 md:py-4 border font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                  isLoading
                    ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 sm:flex-none px-6 md:px-8 py-3 md:py-4 font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl transform active:scale-95 flex items-center justify-center gap-2 ${
                  isLoading
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 hover:scale-105"
                }`}
              >
                {isLoading ? (
                  <>
                    <AiOutlineLoading3Quarters
                      className="animate-spin"
                      size={20}
                    />
                    Creating Product...
                  </>
                ) : (
                  "Create Product"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProduct;
