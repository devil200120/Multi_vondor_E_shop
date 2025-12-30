import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineClose, AiOutlineArrowLeft } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";

const EditAdvertisement = () => {
  const { seller } = useSelector((state) => state.seller);
  const navigate = useNavigate();
  const { id } = useParams();

  const [advertisement, setAdvertisement] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [autoRenew, setAutoRenew] = useState(true);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Ad type information for display
  const adTypes = {
    leaderboard: { name: "Leaderboard", size: "728×120" },
    top_sidebar: { name: "Top Sidebar", size: "200×120" },
    right_sidebar_top: { name: "Right Sidebar Top", size: "300×200" },
    right_sidebar_middle: { name: "Right Sidebar Middle", size: "300×200" },
    right_sidebar_bottom: { name: "Right Sidebar Bottom", size: "300×200" },
    featured_store: { name: "Featured Store", size: "N/A" },
    featured_product: { name: "Featured Product", size: "N/A" },
    newsletter_inclusion: { name: "Newsletter Inclusion", size: "N/A" },
    editorial_writeup: { name: "Editorial Write-up", size: "N/A" },
  };

  useEffect(() => {
    fetchAdvertisement();
  }, [id]);

  const fetchAdvertisement = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${server}/advertisement/vendor/ad/${id}`,
        { withCredentials: true }
      );

      if (data.success) {
        const ad = data.advertisement;
        setAdvertisement(ad);
        setTitle(ad.title);
        setDescription(ad.description || "");
        setAutoRenew(ad.autoRenew);
        setMediaType(ad.mediaType || "image");
        if (ad.mediaType === "video" && ad.video?.url) {
          setMediaPreview(ad.video.url);
        } else if (ad.image?.url) {
          setMediaPreview(ad.image.url);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load advertisement"
      );
      navigate("/dashboard-advertisements");
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isVideo = file.type.startsWith("video/");
      setMediaType(isVideo ? "video" : "image");
      setMedia(file);

      if (isVideo) {
        setMediaPreview(URL.createObjectURL(file));
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("autoRenew", autoRenew);
      if (media) {
        formData.append("image", media);
      }

      const { data } = await axios.put(
        `${server}/advertisement/vendor/update/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/dashboard-advertisements");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update advertisement"
      );
    } finally {
      setSaving(false);
    }
  };

  const canEdit =
    advertisement && ["pending", "rejected"].includes(advertisement.status);

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!advertisement) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <p className="text-gray-600">Advertisement not found</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <button
          onClick={() => navigate("/dashboard-advertisements")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <AiOutlineArrowLeft className="mr-2" /> Back to Advertisements
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Edit Advertisement</h2>
        <p className="text-sm text-gray-500 mt-1">
          Update your advertisement details
        </p>
      </div>

      {/* Status Banner */}
      {advertisement.status === "rejected" && (
        <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-red-500 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-red-800">
                Advertisement Rejected
              </h3>
              <p className="text-sm text-red-700 mt-1">
                <strong>Reason:</strong>{" "}
                {advertisement.rejectionReason || "No reason provided"}
              </p>
              <p className="text-xs text-red-600 mt-2">
                Please update your advertisement and resubmit for approval. Once
                updated, it will be sent for admin review again.
              </p>
            </div>
          </div>
        </div>
      )}

      {advertisement.status === "pending" && (
        <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-yellow-500 text-xl">⏳</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-yellow-800">
                Pending Approval
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                This advertisement is currently waiting for admin approval. You
                can still make changes before it's approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {!canEdit && (
        <div className="mx-6 mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-blue-500 text-xl">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-blue-800">
                Cannot Edit Active/Expired Advertisement
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                Active or expired advertisements cannot be edited. If you need
                to make changes, please cancel the current ad and create a new
                one.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Editable Fields */}
          <div className="space-y-6">
            {/* Ad Type (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Advertisement Type
              </label>
              <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                {adTypes[advertisement.adType]?.name || advertisement.adType} -{" "}
                {adTypes[advertisement.adType]?.size || "N/A"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ad type cannot be changed after creation
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ad Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="Enter catchy ad title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                disabled={!canEdit}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {title.length}/100 characters
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Describe your advertisement"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                disabled={!canEdit}
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </div>
            </div>

            {/* Duration (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration
              </label>
              <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                {advertisement.duration} Month(s)
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Duration cannot be changed. You can renew when expired.
              </p>
            </div>

            {/* Auto-Renew */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="autoRenew"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                disabled={!canEdit}
              />
              <label htmlFor="autoRenew" className="ml-3">
                <span className="block text-sm font-semibold text-gray-700">
                  Enable Auto-Renewal
                </span>
                <span className="block text-xs text-gray-500">
                  Automatically renew this ad when it expires
                </span>
              </label>
            </div>
          </div>

          {/* Right Column - Media & Info */}
          <div className="space-y-6">
            {/* Media Upload (Image or Video) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ad Media ({adTypes[advertisement.adType]?.size || "N/A"})
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                {mediaPreview ? (
                  <div className="relative">
                    {mediaType === "video" ? (
                      <video
                        src={mediaPreview}
                        controls
                        className="max-w-full h-auto rounded mx-auto max-h-[250px]"
                      />
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="max-w-full h-auto rounded mx-auto"
                      />
                    )}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          setMedia(null);
                          // Reset to original media
                          if (
                            advertisement.mediaType === "video" &&
                            advertisement.video?.url
                          ) {
                            setMediaPreview(advertisement.video.url);
                            setMediaType("video");
                          } else {
                            setMediaPreview(advertisement.image?.url || null);
                            setMediaType("image");
                          }
                        }}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <AiOutlineClose />
                      </button>
                    )}
                    <div className="mt-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          mediaType === "video"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {mediaType === "video" ? "🎬 Video" : "🖼️ Image"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">No media uploaded</div>
                )}

                {canEdit && (
                  <div className="mt-4">
                    <input
                      type="file"
                      id="adMedia"
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="adMedia"
                      className="cursor-pointer inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {mediaPreview ? "Change Media" : "Upload Image/Video"}
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Info (Read-only) */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Payment Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price (per month):</span>
                  <span className="font-semibold">
                    ${advertisement.basePrice}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">
                    {advertisement.duration} month(s)
                  </span>
                </div>
                {advertisement.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span className="font-semibold">
                      {advertisement.discount}%
                    </span>
                  </div>
                )}
                <div className="border-t-2 border-primary-300 pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold text-gray-800">Total Paid:</span>
                    <span className="font-bold text-primary-600">
                      ${advertisement.totalPrice}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs">
                  <span
                    className={`px-2 py-1 rounded-full font-semibold ${
                      advertisement.paymentStatus === "completed"
                        ? "bg-green-100 text-green-800"
                        : advertisement.paymentStatus === "refunded"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    Payment: {advertisement.paymentStatus?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-blue-800 mb-2 flex items-center">
                <BsInfoCircle className="mr-2" /> Edit Rules
              </h4>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>
                  Only <strong>pending</strong> or <strong>rejected</strong> ads
                  can be edited
                </li>
                <li>Active ads cannot be modified to ensure ad integrity</li>
                <li>If rejected, updating will resubmit for admin approval</li>
                <li>Ad type, duration, and pricing cannot be changed</li>
                <li>
                  You can update the title, description, image, and auto-renew
                  setting
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {canEdit && (
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate("/dashboard-advertisements")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {saving
                  ? "Saving..."
                  : advertisement.status === "rejected"
                  ? "Update & Resubmit for Approval"
                  : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EditAdvertisement;
