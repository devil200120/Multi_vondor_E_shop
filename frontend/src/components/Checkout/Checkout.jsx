import React, { useState } from "react";
import { Country, State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  FiMapPin,
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiTag,
  FiCreditCard,
  FiCheck,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi";
import PincodeService from "../PincodeService/PincodeService";
import { usePincodeService } from "../../hooks/usePincodeService";
import { useShippingService } from "../../hooks/useShippingService";
import CouponSuggestions from "./CouponSuggestions";
import ShippingBreakdown from "./ShippingBreakdown";

const Checkout = () => {
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [userInfo, setUserInfo] = useState(false);
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [zipCode, setZipCode] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponCodeData, setCouponCodeData] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(null);
  const [buyNowOrder, setBuyNowOrder] = useState(null);
  const [showPincodeService, setShowPincodeService] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [shippingCalculation, setShippingCalculation] = useState(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const navigate = useNavigate();
  const { validatePincode } = usePincodeService();
  const { calculateCartShipping, loading: shippingLoading } =
    useShippingService();

  // Validate pincode when manually entered
  const handleZipCodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only numbers
    if (value.length <= 6) {
      setZipCode(value);

      // Clear previous delivery info if pincode is being changed
      if (value !== deliveryInfo?.pincode) {
        setDeliveryInfo(null);
      }

      // Auto-validate when 6 digits are entered
      if (value.length === 6) {
        try {
          const result = await validatePincode(value);
          if (result.isValid && result.data) {
            setDeliveryInfo({
              ...result.data,
              deliveryAvailable: true,
            });
            setCountry("IN");
            setCity(result.data.district || "");
            setLatitude(result.data.latitude || "");
            setLongitude(result.data.longitude || "");
            toast.success(result.message);
          } else {
            setDeliveryInfo(null);
            toast.error(
              result.message || "Delivery not available for this pincode"
            );
          }
        } catch (error) {
          console.error("Error validating pincode:", error);
          setDeliveryInfo(null);
        }
      }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    // Check for Buy Now order data in localStorage
    const storedOrder = localStorage.getItem("latestOrder");
    if (storedOrder) {
      try {
        const orderData = JSON.parse(storedOrder);
        console.log("Found buyNowOrder in localStorage:", orderData);

        // Only use buyNowOrder if cart is empty (user came from Buy Now)
        // If cart has items, user came from cart checkout, so ignore buyNowOrder
        if (cart && cart.length === 0) {
          setBuyNowOrder(orderData);
        } else {
          // Cart has items, clear the buyNowOrder to avoid confusion
          console.log("Cart has items, clearing buyNowOrder");
          localStorage.removeItem("latestOrder");
          setBuyNowOrder(null);
        }
      } catch (error) {
        console.error("Error parsing stored order:", error);
        localStorage.removeItem("latestOrder");
      }
    }
  }, [cart]);

  const paymentSubmit = () => {
    // Basic form validation
    if (
      address1 === "" ||
      address2 === "" ||
      zipCode === null ||
      country === "" ||
      city === ""
    ) {
      toast.error("Please choose your delivery address!");
      return;
    }

    // Pincode validation - must be 6 digits
    if (!zipCode || zipCode.length !== 6 || !/^\d{6}$/.test(zipCode)) {
      toast.error("Please enter a valid 6-digit pincode!");
      return;
    }

    // Check if delivery is available for this pincode
    if (!deliveryInfo || !deliveryInfo.deliveryAvailable) {
      toast.error(
        "Delivery is not available for this pincode. Please check delivery location first!"
      );
      setShowPincodeService(true); // Open pincode service modal
      return;
    }

    // Validate if the pincode is in Karnataka (our serviceable area)
    if (
      !deliveryInfo.state ||
      !deliveryInfo.state.toLowerCase().includes("karnataka")
    ) {
      toast.error(
        "We currently deliver only within Karnataka. Please select a Karnataka address!"
      );
      setShowPincodeService(true);
      return;
    }

    // Additional validation - check if the entered zipCode matches validated pincode
    if (zipCode !== deliveryInfo.pincode) {
      toast.error(
        "The entered pincode doesn't match the validated delivery location. Please verify!"
      );
      setShowPincodeService(true);
      return;
    }

    const shippingAddress = {
      address1,
      address2,
      zipCode,
      country,
      city,
      latitude,
      longitude,
      // Add delivery info for order tracking
      deliveryInfo: {
        area: deliveryInfo.area,
        district: deliveryInfo.district,
        state: deliveryInfo.state,
        estimatedDeliveryDays: deliveryInfo.estimatedDeliveryDays,
        shippingCharge: deliveryInfo.shippingCharge,
      },
    };

    const orderData = {
      cart: activeCart,
      totalPrice,
      subTotalPrice,
      shipping,
      discountPrice,
      shippingAddress,
      user,
    };

    localStorage.setItem("latestOrder", JSON.stringify(orderData));

    // Clear Buy Now order data after creating final order
    if (buyNowOrder) {
      setBuyNowOrder(null);
    }

    navigate("/payment");
  };

  // Use Buy Now order data if available, otherwise use cart
  const activeCart = buyNowOrder ? buyNowOrder.cart : cart;
  console.log("buyNowOrder:", buyNowOrder);
  console.log("cart:", cart);
  console.log("activeCart:", activeCart);

  const subTotalPrice = buyNowOrder
    ? buyNowOrder.subTotalPrice
    : cart.reduce((acc, item) => {
        // Use discountPrice if available, otherwise use originalPrice
        const price =
          item.discountPrice || item.originalPrice || item.price || 0;
        console.log(
          "Cart item:",
          item.name,
          "Price:",
          price,
          "Qty:",
          item.qty,
          "Total:",
          item.qty * price
        );
        return acc + item.qty * price;
      }, 0);

  console.log("Final subTotalPrice:", subTotalPrice);

  // Calculate dynamic shipping when location changes
  const calculateDynamicShipping = async (userLocation) => {
    if (!activeCart || activeCart.length === 0) {
      setShippingCalculation(null);
      return;
    }

    try {
      setCalculatingShipping(true);

      const result = await calculateCartShipping(
        activeCart,
        userLocation,
        user?._id
      );

      if (result.success) {
        setShippingCalculation(result);
      } else {
        console.error("Shipping calculation failed:", result.error);
        toast.error(result.error || "Failed to calculate shipping");
        setShippingCalculation(null);
      }
    } catch (error) {
      console.error("Error calculating shipping:", error);
      toast.error("Failed to calculate shipping costs");
      setShippingCalculation(null);
    } finally {
      setCalculatingShipping(false);
    }
  };

  // Calculate shipping based on delivery info or use dynamic calculation
  const shipping = React.useMemo(() => {
    // If we have dynamic shipping calculation, use it
    if (shippingCalculation && shippingCalculation.success) {
      return shippingCalculation.totalShipping;
    }

    // Fallback to old static calculation for Buy Now orders or when dynamic fails
    if (deliveryInfo && deliveryInfo.shippingCharge !== undefined) {
      // Free shipping for orders above ₹999
      return subTotalPrice >= 999 ? 0 : deliveryInfo.shippingCharge;
    }

    // Default fallback
    return buyNowOrder ? buyNowOrder.shipping : subTotalPrice * 0.1;
  }, [shippingCalculation, deliveryInfo, subTotalPrice, buyNowOrder]);

  // Handle pincode validation and location selection
  const handleLocationSelect = (locationData) => {
    setAddress1(locationData.address1 || "");
    setAddress2(locationData.address2 || "");
    setCity(locationData.city || "");
    setCountry(locationData.country || "IN");
    setZipCode(locationData.zipCode || "");
    setLatitude(locationData.latitude || "");
    setLongitude(locationData.longitude || "");
    setShowPincodeService(false);

    // Calculate dynamic shipping with the selected location
    if (
      locationData.latitude &&
      locationData.longitude &&
      locationData.zipCode
    ) {
      const userLocation = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        pincode: locationData.zipCode,
        address: `${locationData.address1}, ${locationData.address2}, ${locationData.city}`,
      };

      calculateDynamicShipping(userLocation);
    }
  };

  const handlePincodeValidate = (pincodeData) => {
    setDeliveryInfo(pincodeData);
    setCountry("IN"); // India
    setCity(pincodeData.district || "");
    setLatitude(pincodeData.latitude || "");
    setLongitude(pincodeData.longitude || "");

    // Calculate dynamic shipping with the validated location
    const userLocation = {
      latitude: pincodeData.latitude,
      longitude: pincodeData.longitude,
      pincode: zipCode,
      address: `${address1}, ${address2}, ${pincodeData.district}`,
    };

    calculateDynamicShipping(userLocation);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = couponCode;

    await axios.get(`${server}/coupon/get-coupon-value/${name}`).then((res) => {
      const shopId = res.data.couponCode?.shopId;
      const couponCodeValue = res.data.couponCode?.value;

      if (res.data.couponCode !== null) {
        const isCouponValid =
          activeCart && activeCart.filter((item) => item.shopId === shopId);

        if (isCouponValid.length === 0) {
          toast.error("Coupon code is not valid for this shop");
          setCouponCode("");
        } else {
          const eligiblePrice = isCouponValid.reduce(
            (acc, item) => acc + item.qty * item.discountPrice,
            0
          );
          const discountPrice = (eligiblePrice * couponCodeValue) / 100;
          setDiscountPrice(discountPrice);
          setCouponCodeData(res.data.couponCode);
          setCouponCode("");
        }
      }
      if (res.data.couponCode === null) {
        toast.error("Coupon code doesn't exists!");
        setCouponCode("");
      }
    });
  };

  // Handle coupon application from suggestions
  const handleApplyCouponFromSuggestion = async (couponName) => {
    try {
      const response = await axios.get(
        `${server}/coupon/get-coupon-value/${couponName}`
      );
      const shopId = response.data.couponCode?.shopId;
      const couponCodeValue = response.data.couponCode?.value;

      if (response.data.couponCode !== null) {
        const isCouponValid =
          activeCart && activeCart.filter((item) => item.shopId === shopId);

        if (isCouponValid.length === 0) {
          toast.error("Coupon code is not valid for this shop");
        } else {
          const eligiblePrice = isCouponValid.reduce(
            (acc, item) => acc + item.qty * item.discountPrice,
            0
          );
          const discountPrice = (eligiblePrice * couponCodeValue) / 100;
          setDiscountPrice(discountPrice);
          setCouponCodeData(response.data.couponCode);
          toast.success(`Coupon "${couponName}" applied successfully!`);
        }
      } else {
        toast.error("Coupon code doesn't exist!");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      toast.error("Failed to apply coupon");
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    setDiscountPrice(null);
    setCouponCodeData(null);
    setCouponCode("");
    toast.success("Coupon removed successfully!");
  };

  const discountPercentenge = couponCodeData ? discountPrice : "";

  const totalPrice = couponCodeData
    ? (subTotalPrice + shipping - discountPercentenge).toFixed(2)
    : (subTotalPrice + shipping).toFixed(2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipping Information */}
          <div className="lg:col-span-2">
            <ShippingInfo
              user={user}
              country={country}
              setCountry={setCountry}
              city={city}
              setCity={setCity}
              userInfo={userInfo}
              setUserInfo={setUserInfo}
              address1={address1}
              setAddress1={setAddress1}
              address2={address2}
              setAddress2={setAddress2}
              zipCode={zipCode}
              onZipCodeChange={handleZipCodeChange}
              latitude={latitude}
              setLatitude={setLatitude}
              longitude={longitude}
              setLongitude={setLongitude}
              onShowPincodeService={() => setShowPincodeService(true)}
              deliveryInfo={deliveryInfo}
              handleZipCodeValidation={handleZipCodeChange}
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartData
              handleSubmit={handleSubmit}
              totalPrice={totalPrice}
              shipping={shipping}
              subTotalPrice={subTotalPrice}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              discountPercentenge={discountPercentenge}
              paymentSubmit={paymentSubmit}
              deliveryInfo={deliveryInfo}
              activeCart={activeCart}
              handleApplyCouponFromSuggestion={handleApplyCouponFromSuggestion}
              couponCodeData={couponCodeData}
              handleRemoveCoupon={handleRemoveCoupon}
              shippingCalculation={shippingCalculation}
              calculatingShipping={calculatingShipping}
            />
          </div>
        </div>
      </div>

      {/* Pincode Service Modal */}
      <PincodeService
        show={showPincodeService}
        onClose={() => setShowPincodeService(false)}
        onLocationSelect={handleLocationSelect}
        onPincodeValidate={handlePincodeValidate}
        savedAddresses={user?.addresses || []}
      />
    </div>
  );
};

const ShippingInfo = ({
  user,
  country,
  setCountry,
  city,
  setCity,
  userInfo,
  setUserInfo,
  address1,
  setAddress1,
  address2,
  setAddress2,
  zipCode,
  onZipCodeChange,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  onShowPincodeService,
  deliveryInfo,
  handleZipCodeValidation,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
            <FiMapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Delivery Address
            </h2>
            <p className="text-indigo-100 text-sm">
              Where should we deliver your order?
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <form className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiUser className="w-5 h-5 mr-2 text-indigo-600" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={user && user.name}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={user && user.email}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    required
                    value={user && user.phoneNumber}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Zip Code *
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={zipCode || ""}
                    onChange={onZipCodeChange}
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="Enter 6-digit pincode"
                  />
                  <button
                    type="button"
                    onClick={onShowPincodeService}
                    className="w-full py-2 px-3 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                  >
                    <FiMapPin className="w-4 h-4 inline mr-2" />
                    Check Delivery Location
                  </button>

                  {/* Delivery Info Display */}
                  {deliveryInfo && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-green-800">
                            Delivery Available
                          </p>
                          <p className="text-green-700">
                            {deliveryInfo.area}, {deliveryInfo.district}
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Estimated delivery:{" "}
                            {deliveryInfo.estimatedDeliveryDays} days |
                            Shipping: ₹{deliveryInfo.shippingCharge}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiMapPin className="w-5 h-5 mr-2 text-indigo-600" />
              Location Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="">Select your country</option>
                  {Country &&
                    Country.getAllCountries().map((item) => (
                      <option key={item.isoCode} value={item.isoCode}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  State/City *
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">Select your state/city</option>
                  {State &&
                    State.getStatesOfCountry(country).map((item) => (
                      <option key={item.isoCode} value={item.isoCode}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address Line 1 *
                </label>
                <div className="relative">
                  <FiHome className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="House number, street name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address Line 2 *
                </label>
                <input
                  type="text"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Apartment, suite, building"
                />
              </div>
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setUserInfo(!userInfo)}
              className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
            >
              <HiSparkles className="w-5 h-5" />
              <span>Use saved address</span>
            </button>

            {userInfo && (
              <div className="bg-indigo-50 rounded-xl p-4 space-y-3">
                <h4 className="font-medium text-gray-800">Saved Addresses</h4>
                {user &&
                  user.addresses.map((item, index) => (
                    <label
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-white rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        className="mt-1 text-indigo-600 focus:ring-indigo-500"
                        onChange={() => {
                          setAddress1(item.address1);
                          setAddress2(item.address2);
                          onZipCodeChange({
                            target: { value: item.zipCode.toString() },
                          });
                          setCountry(item.country);
                          setCity(item.city);
                          setLatitude(item.latitude || "");
                          setLongitude(item.longitude || "");

                          // Trigger pincode validation for saved address
                          if (
                            item.zipCode &&
                            item.zipCode.toString().length === 6
                          ) {
                            handleZipCodeValidation({
                              target: { value: item.zipCode.toString() },
                            });
                          }
                        }}
                      />
                      <div>
                        <div className="font-medium text-gray-800">
                          {item.addressType}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.address1}, {item.address2}
                        </div>
                      </div>
                    </label>
                  ))}
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const CartData = ({
  handleSubmit,
  totalPrice,
  shipping,
  subTotalPrice,
  couponCode,
  setCouponCode,
  discountPercentenge,
  paymentSubmit,
  deliveryInfo,
  activeCart,
  handleApplyCouponFromSuggestion,
  couponCodeData,
  handleRemoveCoupon,
  shippingCalculation,
  calculatingShipping,
}) => {
  return (
    <div className="sticky top-6 space-y-4">
      {/* Order Summary Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
              <FiCreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Order Summary
              </h2>
              <p className="text-purple-100 text-xs">
                Review your order details
              </p>
            </div>
          </div>
        </div>

        {/* Summary Content */}
        <div className="p-4 space-y-4">
          {/* Price Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-800">
                ₹{subTotalPrice}
              </span>
            </div>

            {/* Dynamic Shipping Breakdown */}
            {shippingCalculation ? (
              <ShippingBreakdown
                shippingCalculation={shippingCalculation}
                calculatingShipping={calculatingShipping}
              />
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Shipping & Handling
                </span>
                <span className="font-semibold text-gray-800">
                  {calculatingShipping ? (
                    <span className="text-xs text-gray-500">
                      Calculating...
                    </span>
                  ) : shipping === 0 ? (
                    "FREE"
                  ) : (
                    `₹${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
            )}

            {/* Free Shipping Message */}
            {!shippingCalculation && shipping === 0 && subTotalPrice >= 999 && (
              <div className="text-xs text-green-600 -mt-2">
                🎉 Free shipping on orders above ₹999
              </div>
            )}

            {/* Delivery Info */}
            {deliveryInfo && (
              <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
                <div className="flex items-center space-x-2">
                  <FiMapPin className="w-3 h-3" />
                  <span>
                    Delivery to {deliveryInfo.area}, {deliveryInfo.district}
                  </span>
                </div>
                <div className="mt-1">
                  Estimated delivery: {deliveryInfo.estimatedDeliveryDays} days
                </div>
              </div>
            )}

            {discountPercentenge && (
              <div className="flex justify-between items-center text-green-600">
                <span className="flex items-center text-sm">
                  <FiTag className="w-3 h-3 mr-1" />
                  Discount Applied
                </span>
                <span className="font-semibold">
                  -₹{discountPercentenge.toFixed(2)}
                </span>
              </div>
            )}

            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">
                  Total
                </span>
                <span className="text-xl font-bold text-indigo-600">
                  ₹{totalPrice}
                </span>
              </div>
            </div>
          </div>

          {/* Coupon Suggestions */}
          <CouponSuggestions
            cart={activeCart}
            onApplyCoupon={handleApplyCouponFromSuggestion}
            appliedCoupon={couponCodeData?.name}
            onRemoveCoupon={handleRemoveCoupon}
          />

          {/* Manual Coupon Code */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-800 flex items-center text-sm">
              <FiTag className="w-4 h-4 mr-1 text-indigo-600" />
              Have a specific coupon code?
            </h3>

            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="relative">
                <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Apply Coupon
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Proceed to Payment Button */}
      <button
        onClick={paymentSubmit}
        disabled={!deliveryInfo || !deliveryInfo.deliveryAvailable}
        className={`w-full py-3 font-semibold text-base rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 ${
          deliveryInfo && deliveryInfo.deliveryAvailable
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {deliveryInfo && deliveryInfo.deliveryAvailable ? (
          <>
            <FiCheck className="w-4 h-4" />
            <span>Proceed to Payment</span>
          </>
        ) : (
          <>
            <FiMapPin className="w-4 h-4" />
            <span>Please Verify Delivery Location</span>
          </>
        )}
      </button>

      {/* Delivery Validation Message */}
      {!deliveryInfo && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <FiMapPin className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 text-sm">
                Delivery Location Required
              </h4>
              <p className="text-yellow-700 text-xs mt-1">
                Please enter a valid Karnataka pincode to check delivery
                availability before proceeding to payment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <FiCheck className="w-3 h-3 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-green-800 text-sm">
              Secure Checkout
            </h4>
            <p className="text-xs text-green-700 mt-0.5">
              Your payment information is encrypted and secure. We never store
              your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
