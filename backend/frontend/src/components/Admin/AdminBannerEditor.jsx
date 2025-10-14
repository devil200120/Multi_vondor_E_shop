import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { getBannerImageUrl } from "../../utils/mediaUtils";
import {
  HiOutlinePhotograph,
  HiOutlineSave,
  HiOutlineRefresh,
  HiOutlineEye,
} from "react-icons/hi";

const AdminBannerEditor = () => {
  const { user } = useSelector((state) => state.user);
  const [banner, setBanner] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // New state for sliding functionality
  const [slidingImages, setSlidingImages] = useState([]);
  const [slidingImageFiles, setSlidingImageFiles] = useState([]);
  const [displayMode, setDisplayMode] = useState("single");
  const [slidingSettings, setSlidingSettings] = useState({
    autoSlide: true,
    slideDuration: 5000,
    showDots: true,
    showArrows: true,
    transitionEffect: "fade",
  });

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    secondaryButtonText: "",
    customerCount: "",
    customerLabel: "",
    productCount: "",
    productLabel: "",
    satisfactionCount: "",
    satisfactionLabel: "",
  });

  useEffect(() => {
    fetchBannerData();
  }, []);

  const fetchBannerData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/banner/admin/get-banner`, {
        withCredentials: true,
      });

      if (data.success) {
        setBanner(data.banner);
        setDisplayMode(data.banner.displayMode || "single");

        // Set sliding settings
        // Load sliding settings from individual fields
        setSlidingSettings({
          autoSlideInterval: data.banner.autoSlideInterval || 7,
          transitionEffect: data.banner.transitionEffect || "slide",
        });

        // Set sliding images and clear file state when loading existing data
        if (data.banner.images && data.banner.images.length > 0) {
          setSlidingImages(data.banner.images);
          // Important: Clear the file state when loading existing images
          setSlidingImageFiles([]);
          console.log(
            "Loaded existing images from database:",
            data.banner.images.length
          );
        } else {
          setSlidingImages([]);
          setSlidingImageFiles([]);
        }

        setFormData({
          title: data.banner.title || "",
          subtitle: data.banner.subtitle || "",
          description: data.banner.description || "",
          buttonText: data.banner.buttonText || "",
          secondaryButtonText: data.banner.secondaryButtonText || "",
          customerCount: data.banner.stats?.customers?.count || "",
          customerLabel: data.banner.stats?.customers?.label || "",
          productCount: data.banner.stats?.products?.count || "",
          productLabel: data.banner.stats?.products?.label || "",
          satisfactionCount: data.banner.stats?.satisfaction?.count || "",
          satisfactionLabel: data.banner.stats?.satisfaction?.label || "",
        });

        // Set single image preview
        if (data.banner.image) {
          setImagePreview(getBannerImageUrl(data.banner.image, server));
        }
      }
    } catch (error) {
      toast.error("Failed to fetch banner data");
      console.error("Error fetching banner:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // New handlers for sliding functionality
  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode);
    if (mode === "single") {
      setSlidingImages([]);
      setSlidingImageFiles([]);
    }
  };

  const handleSlidingImagesChange = (e) => {
    const files = Array.from(e.target.files);
    console.log(
      "New files selected:",
      files.length,
      files.map((f) => f.name)
    );

    if (files.length > 0) {
      // ADD to existing files (additive behavior)
      const existingFiles = [...slidingImageFiles];
      const newFiles = [...existingFiles, ...files];
      console.log("Existing files:", existingFiles.length);
      console.log("Adding files:", files.length);
      console.log("Total files after adding:", newFiles.length);

      setSlidingImageFiles(newFiles);

      // Create previews for NEW files only (don't duplicate existing ones)
      const newImagePreviews = [];
      let filesProcessed = 0;

      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          newImagePreviews.push({
            url: e.target.result,
            title: "",
            description: "",
            isNew: true,
            fileIndex: existingFiles.length + index, // Track which file this preview corresponds to
          });

          filesProcessed++;

          // When all new files are processed, update the state
          if (filesProcessed === files.length) {
            setSlidingImages((prev) => {
              const updated = [...prev, ...newImagePreviews];
              console.log("Preview images updated. Total:", updated.length);
              return updated;
            });
          }
        };
        reader.readAsDataURL(file);
      });

      console.log("Files added. Total files now:", newFiles.length);

      // Clear the input value to allow re-selecting the same files
      e.target.value = "";
    }
  };

  const handleRemoveSlidingImage = (index) => {
    console.log("Removing image at index:", index);

    // Get the image being removed to check if it's a new file
    const imageToRemove = slidingImages[index];

    // Remove from preview
    setSlidingImages((prev) => prev.filter((_, i) => i !== index));

    // If it's a new file (has fileIndex), also remove from files array
    if (
      imageToRemove &&
      imageToRemove.isNew &&
      typeof imageToRemove.fileIndex === "number"
    ) {
      // Calculate the actual file index to remove
      const newFileImages = slidingImages.filter((img) => img.isNew);
      const newFileIndex = newFileImages.findIndex(
        (img) => img.fileIndex === imageToRemove.fileIndex
      );

      if (newFileIndex >= 0) {
        setSlidingImageFiles((prev) =>
          prev.filter((_, i) => i !== newFileIndex)
        );
        console.log("Removed corresponding file from files array");
      }
    }

    console.log("Image removed from preview and files array");
  };

  const handleSlidingImageTextChange = (index, field, value) => {
    setSlidingImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    );
  };

  const handleSlidingSettingsChange = (field, value) => {
    setSlidingSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const submitData = new FormData();

      // Add display mode and sliding settings
      submitData.append("displayMode", displayMode);
      submitData.append("autoSlideInterval", slidingSettings.autoSlideInterval);
      submitData.append("transitionEffect", slidingSettings.transitionEffect);

      // Add form data
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      // Add sliding images if in sliding mode
      if (displayMode === "sliding") {
        console.log("=== FORM SUBMISSION DEBUG ===");
        console.log(
          "slidingImageFiles array length:",
          slidingImageFiles.length
        );
        console.log(
          "slidingImageFiles array:",
          slidingImageFiles.map((f) => ({ name: f.name, size: f.size }))
        );
        console.log("slidingImages array length:", slidingImages.length);
        console.log(
          "slidingImages array:",
          slidingImages.map((img, i) => ({
            index: i,
            isNew: img.isNew,
            hasUrl: !!img.url,
            title: img.title,
            fileIndex: img.fileIndex,
          }))
        );

        // Only append files if there are NEW files to upload
        if (slidingImageFiles.length > 0) {
          console.log(
            "Sending sliding images:",
            slidingImageFiles.length,
            "new files"
          );
          slidingImageFiles.forEach((file, index) => {
            console.log(`Adding file ${index}:`, file.name, file.size, "bytes");
            submitData.append("slidingImages", file);
          });
        } else {
          console.log("No new files to upload, keeping existing images");
        }

        // Add sliding images data (text content for ALL images - existing + new)
        const slidingImagesData = slidingImages.map((img) => ({
          title: img.title || "",
          description: img.description || "",
        }));
        console.log(
          "Sliding images text data length:",
          slidingImagesData.length
        );
        console.log("Sliding images text data:", slidingImagesData);
        submitData.append(
          "slidingImagesData",
          JSON.stringify(slidingImagesData)
        );
      }

      // Add single image if in single mode (not sliding)
      if (displayMode === "single" && imageFile) {
        submitData.append("slidingImages", imageFile); // Backend expects 'slidingImages' array
      }

      const { data } = await axios.put(
        `${server}/banner/update-banner`,
        submitData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("Banner updated successfully!");
        setBanner(data.banner);
        setImageFile(null);

        // Clear any cached data to ensure home page gets fresh data
        console.log("Banner updated - clearing cache");

        // Optional: You can add a mechanism to notify other components
        // that the banner has been updated
        window.dispatchEvent(
          new CustomEvent("bannerUpdated", {
            detail: data.banner,
          })
        );
      }
    } catch (error) {
      toast.error("Failed to update banner");
      console.error("Error updating banner:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset to default settings?")) {
      try {
        setSaving(true);
        const { data } = await axios.post(
          `${server}/banner/reset-banner`,
          {},
          {
            withCredentials: true,
          }
        );

        if (data.success) {
          toast.success("Banner reset to default successfully!");
          fetchBannerData();
        }
      } catch (error) {
        toast.error("Failed to reset banner");
        console.error("Error resetting banner:", error);
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                <HiOutlinePhotograph className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Home Banner Management
                </h1>
                <p className="text-gray-500">
                  Customize your home page banner content and appearance
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                  previewMode
                    ? "bg-gray-500 text-white hover:bg-gray-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                <HiOutlineEye className="h-4 w-4" />
                <span>{previewMode ? "Edit Mode" : "Preview"}</span>
              </button>
              <button
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <HiOutlineRefresh className="h-4 w-4" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>
        </div>

        {previewMode ? (
          /* Preview Mode */
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Banner Preview
            </h2>
            <div className="relative min-h-[70vh] w-full bg-gradient-to-br from-blue-50 to-purple-100 overflow-hidden rounded-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full p-8 h-full">
                {/* Left Content */}
                <div className="space-y-8 text-center lg:text-left">
                  <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                      {formData.title}
                      <span className="block text-blue-500">
                        {formData.subtitle}
                      </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                      {formData.description}
                    </p>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button className="px-8 py-4 text-lg bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      {formData.buttonText}
                    </button>
                    <button className="px-8 py-4 text-lg border-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors">
                      {formData.secondaryButtonText}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-center lg:justify-start space-x-8 pt-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {formData.customerCount}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formData.customerLabel}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {formData.productCount}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formData.productLabel}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-500">
                        {formData.satisfactionCount}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formData.satisfactionLabel}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Content - Hero Image */}
                <div className="relative">
                  {displayMode === "sliding" && slidingImages.length > 0 ? (
                    <div className="relative w-full h-96 overflow-hidden rounded-2xl">
                      <img
                        src={
                          slidingImages[0]?.url ||
                          getBannerImageUrl(banner.image, server)
                        }
                        alt="Sliding Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        Sliding Mode - {slidingImages.length} images
                      </div>
                    </div>
                  ) : (
                    <img
                      src={
                        imagePreview || getBannerImageUrl(banner.image, server)
                      }
                      alt="Banner"
                      className="w-full h-auto rounded-2xl shadow-lg"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Text Content */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Banner Content
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter main title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle (Highlighted)
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter subtitle"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter description"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Button Text
                      </label>
                      <input
                        type="text"
                        name="buttonText"
                        value={formData.buttonText}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Primary button"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Button Text
                      </label>
                      <input
                        type="text"
                        name="secondaryButtonText"
                        value={formData.secondaryButtonText}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Secondary button"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Banner Images
                </h2>

                {/* Display Mode Toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Display Mode
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="displayMode"
                        value="single"
                        checked={displayMode === "single"}
                        onChange={(e) => setDisplayMode(e.target.value)}
                        className="mr-2 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Single Image
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="displayMode"
                        value="sliding"
                        checked={displayMode === "sliding"}
                        onChange={(e) => setDisplayMode(e.target.value)}
                        className="mr-2 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        Sliding Images
                      </span>
                    </label>
                  </div>
                </div>

                {displayMode === "single" ? (
                  /* Single Image Upload */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Banner Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended size: 800x600px or larger. Max size: 5MB
                      </p>
                    </div>

                    {/* Image Preview */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Banner preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center text-gray-400">
                          <HiOutlinePhotograph className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Sliding Images Management */
                  <div className="space-y-6">
                    {/* Sliding Settings */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Sliding Settings
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Auto Slide Interval (seconds)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={slidingSettings.autoSlideInterval}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty value during editing, but ensure it's a valid number when complete
                              if (value === "" || value === "0") {
                                setSlidingSettings((prev) => ({
                                  ...prev,
                                  autoSlideInterval: "",
                                }));
                              } else {
                                const numValue = parseInt(value);
                                if (
                                  !isNaN(numValue) &&
                                  numValue >= 1 &&
                                  numValue <= 10
                                ) {
                                  setSlidingSettings((prev) => ({
                                    ...prev,
                                    autoSlideInterval: numValue,
                                  }));
                                }
                              }
                            }}
                            onBlur={(e) => {
                              // Ensure we have a valid value when user finishes editing
                              const value = e.target.value;
                              if (
                                value === "" ||
                                isNaN(parseInt(value)) ||
                                parseInt(value) < 1
                              ) {
                                setSlidingSettings((prev) => ({
                                  ...prev,
                                  autoSlideInterval: 5,
                                }));
                              }
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Transition Effect
                          </label>
                          <select
                            value={slidingSettings.transitionEffect}
                            onChange={(e) =>
                              setSlidingSettings((prev) => ({
                                ...prev,
                                transitionEffect: e.target.value,
                              }))
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="fade">Fade</option>
                            <option value="slide">Slide</option>
                            <option value="zoom">Zoom</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Add Sliding Images */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Add Sliding Images
                        </label>
                        {slidingImages.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSlidingImages([]);
                              setSlidingImageFiles([]);
                              console.log("Cleared all sliding images");
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Clear All ({slidingImages.length})
                          </button>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleSlidingImagesChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Select multiple images or add them one by one. Current:{" "}
                        {slidingImages.length} images,{" "}
                        {slidingImageFiles.length} files ready to upload.
                      </p>

                      {/* Debug Button - Remove this in production */}
                      <button
                        type="button"
                        onClick={() => {
                          console.log("=== DEBUG STATE ===");
                          console.log(
                            "slidingImages:",
                            slidingImages.length,
                            slidingImages
                          );
                          console.log(
                            "slidingImageFiles:",
                            slidingImageFiles.length,
                            slidingImageFiles.map((f) => ({
                              name: f.name,
                              size: f.size,
                            }))
                          );
                        }}
                        className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                      >
                        Debug State
                      </button>
                    </div>

                    {/* Sliding Images List */}
                    {slidingImages.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">
                          Sliding Images ({slidingImages.length})
                        </h4>
                        <div className="max-h-96 overflow-y-auto space-y-3">
                          {slidingImages.map((image, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-3"
                            >
                              <div className="flex items-start space-x-3">
                                <img
                                  src={image.url}
                                  alt={`Slide ${index + 1}`}
                                  className="w-20 h-16 object-cover rounded"
                                />
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    placeholder="Image title (optional)"
                                    value={image.title || ""}
                                    onChange={(e) =>
                                      handleSlidingImageTextChange(
                                        index,
                                        "title",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Image description (optional)"
                                    value={image.description || ""}
                                    onChange={(e) =>
                                      handleSlidingImageTextChange(
                                        index,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                  />
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                      Slide {index + 1}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveSlidingImage(index)
                                      }
                                      className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Statistics Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Statistics Section
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Customers Stat</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Count
                    </label>
                    <input
                      type="text"
                      name="customerCount"
                      value={formData.customerCount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 10K+"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label
                    </label>
                    <input
                      type="text"
                      name="customerLabel"
                      value={formData.customerLabel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Happy Customers"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Products Stat</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Count
                    </label>
                    <input
                      type="text"
                      name="productCount"
                      value={formData.productCount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 5K+"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label
                    </label>
                    <input
                      type="text"
                      name="productLabel"
                      value={formData.productLabel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Products"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">
                    Satisfaction Stat
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Count
                    </label>
                    <input
                      type="text"
                      name="satisfactionCount"
                      value={formData.satisfactionCount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 99%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Label
                    </label>
                    <input
                      type="text"
                      name="satisfactionLabel"
                      value={formData.satisfactionLabel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Satisfaction"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiOutlineSave className="h-5 w-5" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminBannerEditor;
