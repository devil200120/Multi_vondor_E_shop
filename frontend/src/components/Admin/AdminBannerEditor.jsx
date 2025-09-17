import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
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
        setImagePreview(data.banner.image);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        submitData.append(key, formData[key]);
      });

      if (imageFile) {
        submitData.append("image", imageFile);
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
                  <img
                    src={imagePreview || banner.image}
                    alt="Banner"
                    className="w-full h-auto rounded-2xl shadow-lg"
                  />
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
                  Banner Image
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload New Image
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
