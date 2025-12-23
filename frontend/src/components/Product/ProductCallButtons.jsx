import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import { FiVideo, FiLoader, FiX, FiPhoneCall } from "react-icons/fi";
import { BiVideo, BiPhone } from "react-icons/bi";

const ProductCallButtons = ({ product }) => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [showCallModal, setShowCallModal] = useState(false);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [callType, setCallType] = useState(null);

  const fetchSellerInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${server}/video-call/product-seller/${product._id}`,
        { withCredentials: true }
      );
      setSellerInfo(response.data.seller);
    } catch (error) {
      console.error("Error fetching seller info:", error);
      toast.error("Failed to fetch seller information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product && showCallModal) {
      fetchSellerInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, showCallModal]);

  const handleVideoCall = () => {
    if (!isAuthenticated) {
      toast.error("Please login to make a video call");
      return;
    }
    setCallType("video");
    setShowCallModal(true);
  };

  const handlePhoneCall = () => {
    if (!isAuthenticated) {
      toast.error("Please login to access phone number");
      return;
    }
    setCallType("phone");
    setShowCallModal(true);
  };

  const initiateWhatsAppVideoCall = () => {
    if (sellerInfo?.phoneNumber) {
      // Format phone number for WhatsApp
      let phoneNumber = sellerInfo.phoneNumber.toString();

      // Remove any non-digit characters
      phoneNumber = phoneNumber.replace(/\D/g, "");

      // Add country code if not present (assuming India +91)
      if (!phoneNumber.startsWith("91") && phoneNumber.length === 10) {
        phoneNumber = "91" + phoneNumber;
      }

      // Create WhatsApp video call message
      const message = `Hi! I'm interested in your product: ${product.name}. Can we have a video call to discuss?`;
      const encodedMessage = encodeURIComponent(message);

      // WhatsApp video call URL
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

      // Open WhatsApp
      window.open(whatsappUrl, "_blank");

      // Close modal
      setShowCallModal(false);

      toast.success("Redirecting to WhatsApp for video call...");
    } else {
      toast.error("Phone number not available");
    }
  };

  const handlePhoneCallDirect = () => {
    if (sellerInfo?.phoneNumber) {
      // Format phone number for tel: link
      const phoneNumber = sellerInfo.phoneNumber.toString();
      window.location.href = `tel:${phoneNumber}`;
    } else {
      toast.error("Phone number not available");
    }
  };

  return (
    <>
      {/* Call Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4">
        <button
          onClick={handleVideoCall}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 text-sm shadow-md hover:shadow-lg min-h-[48px]"
        >
          <BiVideo className="w-5 h-5 mr-2" />
          <span>WhatsApp Video Call</span>
        </button>

        <button
          onClick={handlePhoneCall}
          className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 text-sm shadow-md hover:shadow-lg min-h-[48px]"
        >
          <BiPhone className="w-5 h-5 mr-2" />
          <span>Call Seller</span>
        </button>
      </div>

      {/* Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {callType === "video" ? "Video Call" : "Phone Call"}
              </h3>
              <button
                onClick={() => setShowCallModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <FiLoader className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">
                    Loading seller information...
                  </span>
                </div>
              ) : sellerInfo ? (
                <div className="space-y-6">
                  {/* Seller Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      {sellerInfo.avatar?.url ? (
                        <img
                          src={sellerInfo.avatar.url}
                          alt={sellerInfo.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 text-xl">
                          {sellerInfo.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {sellerInfo.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {sellerInfo.email}
                      </p>
                      {sellerInfo.phoneNumber && (
                        <p className="text-sm text-gray-600">
                          📞 {sellerInfo.phoneNumber}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">
                      Product Inquiry
                    </h5>
                    <p className="text-sm text-gray-600">{product.name}</p>
                  </div>

                  {/* Call Type Options */}
                  {callType === "video" ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Start a WhatsApp video call to discuss this product with
                        the seller.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setShowCallModal(false)}
                          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={initiateWhatsAppVideoCall}
                          className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FiVideo className="w-4 h-4 mr-2" />
                          WhatsApp Video Call
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Choose how you want to contact the seller:
                      </p>

                      {/* Phone Call Options */}
                      <div className="space-y-3">
                        {/* Direct Phone Call */}
                        {sellerInfo.phoneNumber && (
                          <button
                            onClick={handlePhoneCallDirect}
                            className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          >
                            <FiPhoneCall className="w-5 h-5 mr-3" />
                            <div className="text-left">
                              <div className="font-medium">Call Directly</div>
                              <div className="text-sm opacity-90">
                                {sellerInfo.phoneNumber}
                              </div>
                            </div>
                          </button>
                        )}

                        {/* WhatsApp Video Call Option */}
                        <button
                          onClick={initiateWhatsAppVideoCall}
                          className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <FiVideo className="w-5 h-5 mr-3" />
                          <div className="text-left">
                            <div className="font-medium">
                              WhatsApp Video Call
                            </div>
                            <div className="text-sm opacity-90">
                              Start video conversation via WhatsApp
                            </div>
                          </div>
                        </button>
                      </div>

                      <div className="flex justify-center pt-4">
                        <button
                          onClick={() => setShowCallModal(false)}
                          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    Failed to load seller information
                  </p>
                  <button
                    onClick={fetchSellerInfo}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCallButtons;
