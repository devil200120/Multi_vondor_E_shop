import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineClose, AiOutlineLink } from "react-icons/ai";
import { BsInfoCircle, BsShop, BsBox } from "react-icons/bs";

const CreateAdvertisement = () => {
  const { seller } = useSelector((state) => state.seller);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedType = searchParams.get("type");

  const [adType, setAdType] = useState(preselectedType || "leaderboard");
  const [slotNumber, setSlotNumber] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(1);
  const [autoRenew, setAutoRenew] = useState(true);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState("image"); // 'image' or 'video'
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Product linking
  const [linkType, setLinkType] = useState("shop"); // 'shop' or 'product'
  const [selectedProduct, setSelectedProduct] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Ad Pre-Approval (Gold Plan feature)
  const [hasAdPreApproval, setHasAdPreApproval] = useState(false);

  // Ad type information
  const adTypes = {
    leaderboard: {
      name: "Leaderboard",
      size: "728×120",
      price: 600,
      hasSlots: true,
    },
    top_sidebar: {
      name: "Top Sidebar",
      size: "200×120",
      price: 200,
      hasSlots: true,
    },
    right_sidebar_top: {
      name: "Right Sidebar Top",
      size: "300×200",
      price: 300,
      hasSlots: true,
    },
    right_sidebar_middle: {
      name: "Right Sidebar Middle",
      size: "300×200",
      price: 250,
      hasSlots: true,
    },
    right_sidebar_bottom: {
      name: "Right Sidebar Bottom",
      size: "300×200",
      price: 200,
      hasSlots: true,
    },
    featured_store: {
      name: "Featured Store",
      size: "N/A",
      price: 100,
      hasSlots: false,
    },
    featured_product: {
      name: "Featured Product",
      size: "N/A",
      price: 50,
      hasSlots: false,
    },
    newsletter_inclusion: {
      name: "Newsletter Inclusion",
      size: "N/A",
      price: 100,
      hasSlots: false,
    },
    editorial_writeup: {
      name: "Editorial Write-up",
      size: "N/A",
      price: 300,
      hasSlots: false,
    },
  };

  // Set ad type from URL parameter on mount
  useEffect(() => {
    if (preselectedType && adTypes[preselectedType]) {
      setAdType(preselectedType);
    }
  }, [preselectedType]);

  // Check if seller has Ad Pre-Approval feature (Gold plan)
  useEffect(() => {
    const checkAdPreApproval = async () => {
      try {
        const { data } = await axios.get(`${server}/subscription/my-subscription`, {
          withCredentials: true,
        });
        if (data.subscription?.features?.adPreApproval) {
          setHasAdPreApproval(true);
        }
      } catch (error) {
        console.log("No subscription found");
      }
    };
    checkAdPreApproval();
  }, []);

  // Fetch seller's products for linking
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const { data } = await axios.get(
          `${server}/product/get-all-products-shop/${seller._id}`,
          {
            withCredentials: true,
          }
        );
        if (data.success) {
          setProducts(data.products || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (seller?._id) {
      fetchProducts();
    }
  }, [seller?._id]);

  // Calculate pricing when ad type or duration changes
  useEffect(() => {
    calculatePrice();
    if (adTypes[adType]?.hasSlots) {
      fetchAvailableSlots();
    }
  }, [adType, duration]);

  const calculatePrice = async () => {
    try {
      const { data } = await axios.post(
        `${server}/advertisement/calculate-price`,
        {
          adType,
          duration: parseInt(duration),
        }
      );

      if (data.success) {
        setPricing(data.pricing);
      }
    } catch (error) {
      console.error("Error calculating price:", error);
    }
  };

  const [slotInfo, setSlotInfo] = useState([]);

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const { data } = await axios.get(
        `${server}/advertisement/available-slots/${adType}`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setAvailableSlots(data.availableSlots || []);
        setSlotInfo(data.slotInfo || []);
        if (data.availableSlots?.length > 0) {
          setSlotNumber(data.availableSlots[0].toString());
        }
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isVideo = file.type.startsWith("video/");
      setMediaType(isVideo ? "video" : "image");
      setMedia(file);

      if (isVideo) {
        // For video, create object URL
        setMediaPreview(URL.createObjectURL(file));
      } else {
        // For image, use FileReader
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

    if (adTypes[adType].hasSlots && !slotNumber) {
      toast.error("Please select a slot number");
      return;
    }

    if (!media) {
      toast.error("Please upload an ad image or video");
      return;
    }

    if (linkType === "product" && !selectedProduct) {
      toast.error("Please select a product to link to");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("adType", adType);
      if (adTypes[adType].hasSlots) {
        formData.append("slotNumber", slotNumber);
      }
      formData.append("title", title);
      formData.append("description", description);
      formData.append("duration", duration);
      formData.append("autoRenew", autoRenew);
      formData.append("image", media); // Using 'image' field name for both image and video

      // Add product ID if linking to specific product
      if (linkType === "product" && selectedProduct) {
        formData.append("productId", selectedProduct);
      }

      const { data } = await axios.post(
        `${server}/advertisement/create`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (data.success) {
        // Check if this is a free ad (for testing) or auto-approved
        if (data.autoApproved) {
          toast.success(
            "🎉 Advertisement created and AUTO-APPROVED! Your ad is now LIVE!"
          );
          setTimeout(() => {
            navigate(`/dashboard-advertisements`);
          }, 1500);
        } else if (pricing?.isFree) {
          toast.success(
            "🎉 Advertisement created successfully (FREE MODE)! Awaiting admin approval."
          );
          setTimeout(() => {
            navigate(`/dashboard-advertisements`);
          }, 1500);
        } else {
          toast.success("Advertisement created! Redirecting to payment...");
          // Redirect to payment page with advertisement ID
          setTimeout(() => {
            navigate(
              `/dashboard-advertisement-payment/${data.advertisement._id}`
            );
          }, 1500);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create advertisement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-md">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Create New Advertisement
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Promote your store to thousands of customers
            </p>
          </div>
          {hasAdPreApproval && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg shadow-md">
              <span className="text-lg">⚡</span>
              <div>
                <div className="text-sm font-bold">Auto-Approval Active</div>
                <div className="text-xs opacity-90">Gold Plan Benefit</div>
              </div>
            </div>
          )}
        </div>
        {hasAdPreApproval && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              🎉 <strong>Gold Plan Benefit:</strong> Your ads will be automatically approved after payment - no waiting for admin review!
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Ad Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Advertisement Type *
              </label>
              <select
                value={adType}
                onChange={(e) => setAdType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {Object.entries(adTypes).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.name} - {info.size} - ${info.price}/month
                  </option>
                ))}
              </select>
            </div>

            {/* Slot Number (for banner types) */}
            {adTypes[adType].hasSlots && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Slot Number *{" "}
                  {loadingSlots && (
                    <span className="text-xs text-gray-500">(Loading...)</span>
                  )}
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  🔄 Multiple sellers can book the same slot - ads rotate in a
                  carousel every 10 seconds
                </p>
                {availableSlots.length > 0 ? (
                  <>
                    <select
                      value={slotNumber}
                      onChange={(e) => setSlotNumber(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      {slotInfo
                        .filter((s) => s.available)
                        .map((slot) => (
                          <option key={slot.slot} value={slot.slot}>
                            Slot {slot.slot}{" "}
                            {slot.adsCount > 0
                              ? `(${slot.adsCount} ad${
                                  slot.adsCount > 1 ? "s" : ""
                                } in rotation)`
                              : "(Empty - Your ad only!)"}
                          </option>
                        ))}
                    </select>
                    {slotInfo.length > 0 && (
                      <div className="mt-3 grid grid-cols-6 gap-2">
                        {slotInfo.map((slot) => (
                          <div
                            key={slot.slot}
                            className={`text-center p-2 rounded-lg text-xs ${
                              slot.sellerHasAd
                                ? "bg-yellow-100 border border-yellow-300 text-yellow-700"
                                : slot.adsCount > 0
                                ? "bg-blue-50 border border-blue-200 text-blue-600"
                                : "bg-green-50 border border-green-200 text-green-600"
                            }`}
                          >
                            <div className="font-bold">#{slot.slot}</div>
                            <div className="text-[10px]">
                              {slot.sellerHasAd
                                ? "Your Ad"
                                : `${slot.adsCount} ads`}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                    ⚠️ You already have ads in all slots for this type. Wait for
                    them to expire or try another ad type.
                  </div>
                )}
              </div>
            )}

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {title.length}/100 characters
              </div>
            </div>

            {/* Link Destination */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                🔗 Where should this ad link to?
              </label>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="linkType"
                    value="shop"
                    checked={linkType === "shop"}
                    onChange={(e) => {
                      setLinkType(e.target.value);
                      setSelectedProduct("");
                    }}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    My Shop Page
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="linkType"
                    value="product"
                    checked={linkType === "product"}
                    onChange={(e) => setLinkType(e.target.value)}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Specific Product
                  </span>
                </label>
              </div>

              {linkType === "product" && (
                <div>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required={linkType === "product"}
                  >
                    <option value="">-- Select a Product --</option>
                    {loadingProducts ? (
                      <option disabled>Loading products...</option>
                    ) : (
                      products.map((product) => (
                        <option key={product._id} value={product._id}>
                          {product.name} - ₹
                          {product.discountPrice || product.originalPrice}
                        </option>
                      ))
                    )}
                  </select>
                  {products.length === 0 && !loadingProducts && (
                    <p className="text-xs text-yellow-600 mt-2">
                      ⚠️ No products found. Add products to your shop first.
                    </p>
                  )}
                  {selectedProduct && (
                    <div className="mt-2 flex items-center gap-2 bg-white p-2 rounded border">
                      {products.find((p) => p._id === selectedProduct)
                        ?.images?.[0]?.url && (
                        <img
                          src={
                            products.find((p) => p._id === selectedProduct)
                              ?.images[0].url
                          }
                          alt="Product"
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="text-sm">
                        <p className="font-semibold text-gray-800">
                          {
                            products.find((p) => p._id === selectedProduct)
                              ?.name
                          }
                        </p>
                        <p className="text-xs text-green-600">
                          ✓ Ad will link to this product page
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {linkType === "shop" && (
                <p className="text-xs text-gray-600">
                  ✓ Clicking this ad will take customers to your shop page
                </p>
              )}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/500 characters
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration *
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={1}>1 Month (0% discount)</option>
                <option value={3}>3 Months (10% discount)</option>
                <option value={6}>6 Months (15% discount)</option>
                <option value={12}>12 Months (20% discount)</option>
              </select>
            </div>

            {/* Auto-Renew */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="autoRenew"
                checked={autoRenew}
                onChange={(e) => setAutoRenew(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="autoRenew" className="ml-3">
                <span className="block text-sm font-semibold text-gray-700">
                  Enable Auto-Renewal
                </span>
                <span className="block text-xs text-gray-500">
                  Automatically renew this ad when it expires (recommended)
                </span>
              </label>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Media Upload (Image or Video) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ad Media * ({adTypes[adType].size})
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                {mediaPreview ? (
                  <div className="relative">
                    {mediaType === "video" ? (
                      <video
                        src={mediaPreview}
                        controls
                        className="max-w-full h-auto rounded mx-auto max-h-[300px]"
                      />
                    ) : (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="max-w-full h-auto rounded mx-auto"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMedia(null);
                        setMediaPreview(null);
                        setMediaType("image");
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <AiOutlineClose />
                    </button>
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
                  <div>
                    <input
                      type="file"
                      id="adMedia"
                      accept="image/*,video/*"
                      onChange={handleMediaChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="adMedia"
                      className="cursor-pointer inline-flex flex-col items-center"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                        Click to upload image or video
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, MP4, WEBM
                      </span>
                    </label>
                  </div>
                )}
              </div>
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <BsInfoCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <strong>Media Requirements:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>
                        <strong>Images:</strong> {adTypes[adType].size} pixels,
                        JPG/PNG, max 500KB
                      </li>
                      <li>
                        <strong>Videos:</strong> MP4/WEBM, max 10MB, 30 seconds
                        recommended
                      </li>
                      <li>High quality media works best for engagement</li>
                      <li>Videos will autoplay muted on the homepage</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            {pricing && (
              <div
                className={`border-2 rounded-lg p-6 ${
                  pricing.isFree
                    ? "bg-gradient-to-br from-green-50 to-green-100 border-green-400"
                    : "bg-gradient-to-br from-primary-50 to-primary-100 border-primary-300"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    Pricing Summary
                  </h3>
                  {pricing.isFree && (
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                      🎁 FREE MODE
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Base Price (per month):
                    </span>
                    <span
                      className={`font-semibold ${
                        pricing.isFree ? "line-through text-gray-400" : ""
                      }`}
                    >
                      ${pricing.basePrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">
                      {pricing.duration} month(s)
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span
                      className={`font-semibold ${
                        pricing.isFree ? "line-through text-gray-400" : ""
                      }`}
                    >
                      ${pricing.totalMonthlyPrice}
                    </span>
                  </div>
                  {pricing.discount > 0 && !pricing.isFree && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({pricing.discount}%):</span>
                      <span className="font-semibold">
                        -${pricing.discountAmount}
                      </span>
                    </div>
                  )}
                  <div className="border-t-2 border-primary-300 pt-2 mt-2">
                    <div className="flex justify-between text-lg">
                      <span className="font-bold text-gray-800">Total:</span>
                      {pricing.isFree ? (
                        <span className="font-bold text-green-600 text-xl">
                          FREE!
                        </span>
                      ) : (
                        <span className="font-bold text-primary-600">
                          ${pricing.totalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {pricing.isFree ? (
                  <div className="mt-4 text-xs text-green-700 bg-white/70 rounded p-2">
                    🎉 <strong>Testing Mode Active!</strong> This ad type is
                    currently free. No payment required - ad will go directly
                    for admin approval.
                  </div>
                ) : (
                  <div className="mt-4 text-xs text-gray-600 bg-white/50 rounded p-2">
                    💡 Save more with longer durations! 12 months gets you 20%
                    off.
                  </div>
                )}
              </div>
            )}

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-yellow-800 mb-2">
                📋 Important Notes
              </h4>
              <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                <li>All ads require admin approval before going live</li>
                <li>Ads link directly to your store only</li>
                <li>Banner ads rotate every 10 seconds</li>
                <li>Expiry warning sent 7 days before end date</li>
                <li>Payment is processed before approval</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/shop-dashboard?tab=advertisements")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                (adTypes[adType].hasSlots && availableSlots.length === 0)
              }
              className={`px-8 py-3 text-white rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${
                pricing?.isFree
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-primary-600 hover:bg-primary-700"
              }`}
            >
              {loading
                ? "Creating..."
                : pricing?.isFree
                ? "Create Ad (Free)"
                : "Create & Proceed to Payment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateAdvertisement;
