import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { MdVideoLibrary, MdImage, MdClose } from "react-icons/md";

const EditVideoBanner = () => {
  const { seller } = useSelector((state) => state.seller);
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    productId: "",
    priority: 1,
    startDate: "",
    endDate: "",
    targetAudience: "all",
  });

  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axios.get(
          `${server}/video-banner/get-video-banner/${id}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          const bannerData = response.data.videoBanner;
          setBanner(bannerData);

          // Format dates for input fields
          const formatDate = (dateString) => {
            if (!dateString) return "";
            return new Date(dateString).toISOString().split("T")[0];
          };

          setFormData({
            title: bannerData.title || "",
            description: bannerData.description || "",
            productId: bannerData.productId?._id || "",
            priority: bannerData.priority || 1,
            startDate: formatDate(bannerData.startDate),
            endDate: formatDate(bannerData.endDate),
            targetAudience: bannerData.targetAudience || "all",
          });

          setCurrentVideoUrl(bannerData.videoUrl || "");
          setCurrentThumbnailUrl(bannerData.thumbnailUrl || "");
        }
      } catch (error) {
        console.error("Error fetching banner:", error);
        toast.error("Failed to fetch banner details");
        navigate("/dashboard-video-banners");
      } finally {
        setInitialLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${server}/product/get-all-products-shop/${seller._id}`,
          { withCredentials: true }
        );
        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Failed to fetch products");
      }
    };

    const loadData = async () => {
      await fetchProducts();
      await fetchBanner();
    };
    loadData();
  }, [id, seller._id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        // 100MB limit
        toast.error("Video file size should be less than 100MB");
        return;
      }

      const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid video file (MP4, WebM, or OGG)");
        return;
      }

      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Thumbnail file size should be less than 5MB");
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, or WebP)");
        return;
      }

      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const uploadFiles = async () => {
    const uploadFormData = new FormData();
    if (videoFile) uploadFormData.append("video", videoFile);
    if (thumbnailFile) uploadFormData.append("thumbnail", thumbnailFile);

    const response = await axios.post(
      `${server}/video-banner/upload-files`,
      uploadFormData,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      }
    );

    return response.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      let bannerData = {
        ...formData,
        // Set endDate to null if it's empty or the same as startDate
        endDate:
          formData.endDate && formData.endDate !== formData.startDate
            ? formData.endDate
            : null,
      };

      // Upload new files if they exist
      if (videoFile || thumbnailFile) {
        const uploadResponse = await uploadFiles();
        if (uploadResponse.urls.videoUrl) {
          bannerData.videoUrl = uploadResponse.urls.videoUrl;
        }
        if (uploadResponse.urls.thumbnailUrl) {
          bannerData.thumbnailUrl = uploadResponse.urls.thumbnailUrl;
        }
      }

      // Keep existing URLs if no new files uploaded
      if (!videoFile && currentVideoUrl) {
        bannerData.videoUrl = currentVideoUrl;
      }
      if (!thumbnailFile && currentThumbnailUrl) {
        bannerData.thumbnailUrl = currentThumbnailUrl;
      }

      await axios.put(
        `${server}/video-banner/seller/update-video-banner/${id}`,
        bannerData,
        { withCredentials: true }
      );

      toast.success("Video banner updated successfully!");
      navigate("/dashboard-video-banners");
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update video banner";
      toast.error(message);
      console.error("Error updating video banner:", error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview("");
    if (videoPreview) URL.revokeObjectURL(videoPreview);
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
  };

  if (initialLoading) {
    return (
      <div className="w-full mx-8 pt-1 mt-8 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="w-full mx-8 pt-1 mt-8 bg-white">
        <div className="text-center py-16">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Banner not found
          </h3>
          <p className="text-gray-500 mb-6">
            The requested video banner could not be found.
          </p>
          <button
            onClick={() => navigate("/dashboard-video-banners")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Video Banners
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-8 pt-1 mt-8 bg-white">
      <div className="w-full p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Video Banner
          </h1>
          <p className="text-gray-600">
            Update your promotional video banner details
          </p>
          {banner && (
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  banner.approvalStatus === "approved"
                    ? "bg-green-100 text-green-800"
                    : banner.approvalStatus === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : banner.approvalStatus === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                Status: {banner.approvalStatus || "Pending"}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form Fields */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter banner title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter banner description"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Linked Product <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="productId"
                      value={formData.productId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Display Settings */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Display Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority (1-10)
                    </label>
                    <input
                      type="number"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Higher priority banners are shown first
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Audience
                    </label>
                    <select
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Users</option>
                      <option value="new_users">New Users</option>
                      <option value="returning_users">Returning Users</option>
                      <option value="mobile_users">Mobile Users</option>
                      <option value="desktop_users">Desktop Users</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - File Uploads */}
            <div className="space-y-6">
              {/* Video Upload */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Video Upload
                </h2>

                {!videoFile && !currentVideoUrl ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <MdVideoLibrary className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Upload your video file</p>
                    <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700">
                      <AiOutlineCloudUpload className="mr-2" />
                      Choose Video
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      MP4, WebM, OGG up to 100MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      src={videoFile ? videoPreview : currentVideoUrl}
                      controls
                      className="w-full rounded-lg"
                      style={{ maxHeight: "200px" }}
                    />
                    {videoFile && (
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <MdClose size={16} />
                      </button>
                    )}
                    <div className="mt-2">
                      {videoFile ? (
                        <p className="text-sm text-green-600">
                          ✅ New video selected
                        </p>
                      ) : (
                        <p className="text-sm text-blue-600">
                          📹 Current video
                        </p>
                      )}
                      {!videoFile && (
                        <label className="inline-flex items-center px-3 py-1 mt-2 text-sm bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
                          Change Video
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Upload */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Thumbnail Upload
                </h2>

                {!thumbnailFile && !currentThumbnailUrl ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <MdImage className="text-4xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Upload thumbnail image</p>
                    <label className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md cursor-pointer hover:bg-green-700">
                      <AiOutlineCloudUpload className="mr-2" />
                      Choose Thumbnail
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      JPEG, PNG, WebP up to 5MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={
                        thumbnailFile ? thumbnailPreview : currentThumbnailUrl
                      }
                      alt="Thumbnail preview"
                      className="w-full rounded-lg"
                      style={{ maxHeight: "200px", objectFit: "cover" }}
                    />
                    {thumbnailFile && (
                      <button
                        type="button"
                        onClick={removeThumbnail}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <MdClose size={16} />
                      </button>
                    )}
                    <div className="mt-2">
                      {thumbnailFile ? (
                        <p className="text-sm text-green-600">
                          ✅ New thumbnail selected
                        </p>
                      ) : (
                        <p className="text-sm text-blue-600">
                          🖼️ Current thumbnail
                        </p>
                      )}
                      {!thumbnailFile && (
                        <label className="inline-flex items-center px-3 py-1 mt-2 text-sm bg-green-600 text-white rounded cursor-pointer hover:bg-green-700">
                          Change Thumbnail
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {loading && uploadProgress > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload Progress
                  </h3>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {uploadProgress}% uploaded
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/dashboard-video-banners")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-medium ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
              }`}
            >
              {loading ? "Updating..." : "Update Video Banner"}
            </button>
          </div>

          {/* Information Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Please Note
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>
                    Changes to your video banner may require admin review before
                    they go live.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVideoBanner;
