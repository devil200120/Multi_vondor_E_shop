import React, { useState } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  FiMapPin,
  FiCheck,
  FiX,
  FiLoader,
  FiTruck,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";

const PincodeService = ({
  onLocationSelect,
  onPincodeValidate,
  savedAddresses = [],
  show = false,
  onClose,
}) => {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const checkPincodeDelivery = async (pincodeValue) => {
    if (!pincodeValue || pincodeValue.length !== 6) {
      setIsValid(false);
      setDeliveryInfo(null);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `${server}/pincode/check/${pincodeValue}`
      );

      if (response.data.success && response.data.deliveryAvailable) {
        setIsValid(true);
        setDeliveryInfo(response.data.data);

        if (onPincodeValidate) {
          onPincodeValidate(response.data.data);
        }

        toast.success(response.data.message);
      } else {
        setIsValid(false);
        setDeliveryInfo(null);
        toast.error(response.data.message);
      }
    } catch (error) {
      setIsValid(false);
      setDeliveryInfo(null);
      toast.error("Error checking pincode. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only numbers
    if (value.length <= 6) {
      setPincode(value);

      if (value.length === 6) {
        checkPincodeDelivery(value);
      } else {
        setIsValid(null);
        setDeliveryInfo(null);
      }
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setPincode(address.zipCode || "");
    if (address.zipCode) {
      checkPincodeDelivery(address.zipCode.toString());
    }

    if (onLocationSelect) {
      onLocationSelect({
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        state: "Karnataka", // Default to Karnataka
        country: address.country || "India",
        zipCode: address.zipCode,
        addressType: address.addressType,
        latitude: address.latitude,
        longitude: address.longitude,
      });
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                <FiMapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Select Delivery Location
                </h2>
                <p className="text-indigo-100 text-sm">
                  Check delivery availability
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <FiX className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Pincode Input */}
          <div className="space-y-3">
            <div className="relative">
              <div className="flex items-center">
                <input
                  type="text"
                  value={pincode}
                  onChange={handlePincodeChange}
                  placeholder="560180"
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-lg font-mono"
                  maxLength={6}
                />

                {/* Loading/Status Icon */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {loading ? (
                    <FiLoader className="w-5 h-5 text-indigo-500 animate-spin" />
                  ) : isValid === true ? (
                    <FiCheck className="w-5 h-5 text-green-500" />
                  ) : isValid === false ? (
                    <FiX className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              </div>

              <button
                onClick={() => checkPincodeDelivery(pincode)}
                disabled={pincode.length !== 6 || loading}
                className="w-full mt-3 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? "Checking..." : "Check Pincode"}
              </button>
            </div>

            {/* Error Message */}
            {isValid === false && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FiX className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800 text-sm">
                      Delivery Not Available
                    </h4>
                    <p className="text-red-700 text-sm mt-1">
                      Sorry, we do not ship to this pincode. Try another one!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message with Delivery Info */}
            {isValid === true && deliveryInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-green-800 text-sm">
                      Delivery Available!
                    </h4>
                    <p className="text-green-700 text-sm mt-1">
                      {deliveryInfo.area}, {deliveryInfo.district},{" "}
                      {deliveryInfo.state}
                    </p>

                    {/* Delivery Details */}
                    <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center space-x-1">
                        <FiClock className="w-3 h-3 text-green-600" />
                        <span className="text-green-700">
                          {deliveryInfo.estimatedDeliveryDays} days
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiTruck className="w-3 h-3 text-green-600" />
                        <span className="text-green-700">
                          ₹{deliveryInfo.shippingCharge}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiDollarSign className="w-3 h-3 text-green-600" />
                        <span className="text-green-700">
                          {deliveryInfo.cashOnDelivery ? "COD" : "Prepaid"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-sm text-gray-500 bg-white">Or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Saved Addresses */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Select Saved Address
            </h3>

            {savedAddresses.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {savedAddresses.map((address, index) => (
                  <div
                    key={index}
                    onClick={() => handleAddressSelect(address)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedAddress === address
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                            {address.addressType || "OFFICE"}
                          </span>
                          {selectedAddress === address && (
                            <FiCheck className="w-4 h-4 text-indigo-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-800 mt-2 font-medium">
                          Manoha..., {address.zipCode || "560..."}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {address.address1}, {address.address2}
                        </p>
                        {address.city && (
                          <p className="text-xs text-gray-500 mt-1">
                            {address.city}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiMapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm">No saved addresses found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Add an address in your profile
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <button
              onClick={handleClose}
              className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleClose}
              disabled={!isValid && !selectedAddress}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PincodeService;
