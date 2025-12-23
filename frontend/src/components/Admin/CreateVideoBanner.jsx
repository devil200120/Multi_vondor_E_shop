import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { MdVideoLibrary } from "react-icons/md";
import styles from "../../styles/styles";

const CreateVideoBanner = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    productId: "",
    priority: 1,
    startDate: "",
    endDate: "",
    targetAudience: "all",
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { user } = useSelector((state) => state.user);
  const { seller } = useSelector((state) => state.seller);
  const navigate = useNavigate();

  const isAdmin = user && user.role === "Admin";

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      let url = `${server}/product/get-all-products`;

      // If seller, fetch only their products
      if (!isAdmin && seller) {
        url = `${server}/product/get-all-products-shop/${seller._id}`;
      }

      const response = await axios.get(url);
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (file, type) => {
    try {
      setUploading(true);

      // Use our backend upload endpoint
      const uploadFormData = new FormData();
      if (type === "videoUrl") {
        uploadFormData.append("video", file);
      } else {
        uploadFormData.append("thumbnail", file);
      }

      const response = await axios.post(
        `${server}/video-banner/upload-files`,
        uploadFormData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const uploadedUrl =
          type === "videoUrl"
            ? response.data.urls.videoUrl
            : response.data.urls.thumbnailUrl;

        if (uploadedUrl) {
          setFormData((prev) => ({
            ...prev,
            [type]: uploadedUrl,
          }));

          toast.success(
            `${
              type === "videoUrl" ? "Video" : "Thumbnail"
            } uploaded successfully`
          );
        } else {
          throw new Error("No URL returned from server");
        }
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        `Upload failed: ${error.response?.data?.message || error.message}`
      );

      // Fallback to blob URL for development/testing
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        [type]: url,
      }));

      toast.warn(
        "Using temporary URL - files won't persist after page refresh"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.videoUrl ||
      !formData.thumbnailUrl ||
      !formData.productId
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${server}/video-banner/create-video-banner`,
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        if (isAdmin) {
          navigate("/admin-video-banners");
        } else {
          navigate("/dashboard-video-banners");
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create video banner";
      toast.error(errorMessage);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  return (
    <div className="w-full mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <MdVideoLibrary size={28} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">
          Create Video Banner
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter banner title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter banner description"
            />
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {formData.videoUrl ? (
                <div className="space-y-3">
                  <video
                    src={formData.videoUrl}
                    controls
                    className="w-full h-48 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, videoUrl: "" }))
                    }
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Video
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <AiOutlineCloudUpload
                    size={48}
                    className="mx-auto text-gray-400 mb-3"
                  />
                  <p className="text-gray-500 mb-3">
                    Upload your promotional video
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      e.target.files[0] &&
                      handleFileUpload(e.target.files[0], "videoUrl")
                    }
                    className="hidden"
                    id="videoUpload"
                  />
                  <label
                    htmlFor="videoUpload"
                    className={`${styles.button} bg-blue-600 hover:bg-blue-700 text-white cursor-pointer`}
                  >
                    {uploading ? "Uploading..." : "Choose Video"}
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    Supported: MP4, AVI, MOV (Max 50MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              {formData.thumbnailUrl ? (
                <div className="space-y-3">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Thumbnail"
                    className="w-full h-48 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, thumbnailUrl: "" }))
                    }
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove Thumbnail
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <AiOutlineCloudUpload
                    size={48}
                    className="mx-auto text-gray-400 mb-3"
                  />
                  <p className="text-gray-500 mb-3">Upload thumbnail image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files[0] &&
                      handleFileUpload(e.target.files[0], "thumbnailUrl")
                    }
                    className="hidden"
                    id="thumbnailUpload"
                  />
                  <label
                    htmlFor="thumbnailUpload"
                    className={`${styles.button} bg-green-600 hover:bg-green-700 text-white cursor-pointer`}
                  >
                    {uploading ? "Uploading..." : "Choose Image"}
                  </label>
                  <p className="text-xs text-gray-400 mt-2">
                    Supported: JPG, PNG, WebP (Max 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Product *
            </label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name} - ₹{product.discountPrice}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Users will be redirected to this product when they click the video
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority (Admin only) */}
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}{" "}
                      {i === 0 ? "(Lowest)" : i === 9 ? "(Highest)" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Higher priority videos appear first
                </p>
              </div>
            )}

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <select
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="new_users">New Users</option>
                <option value="existing_users">Existing Users</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formatDateForInput(formData.startDate)}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formatDateForInput(formData.endDate)}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for no expiration
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading || uploading}
              className={`${
                styles.button
              } bg-blue-600 hover:bg-blue-700 text-white flex-1 ${
                loading || uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Creating..." : "Create Video Banner"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`${styles.button} bg-gray-500 hover:bg-gray-600 text-white px-8`}
            >
              Cancel
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Guidelines:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Keep videos under 30 seconds for better engagement</li>
              <li>• Use high-quality thumbnails (1920x1080 recommended)</li>
              <li>• Ensure videos are mobile-friendly</li>
              <li>
                •{" "}
                {isAdmin
                  ? "Admin videos are auto-approved"
                  : "Seller videos require admin approval"}
              </li>
              <li>• Videos should comply with platform guidelines</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVideoBanner;
