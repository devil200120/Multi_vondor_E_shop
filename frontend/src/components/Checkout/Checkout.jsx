import React, { useState } from "react";
import { Country, State } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { backend_url } from "../../server";
import { toast } from "react-toastify";
import { getProductImageUrl } from "../../utils/mediaUtils";
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
import CouponSuggestions from "./CouponSuggestions";
import { useCurrency } from "../../context/CurrencyContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const { formatPrice, currency } = useCurrency();
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
  const [shopShippingConfigs, setShopShippingConfigs] = useState({});

  // Use Buy Now order data if available, otherwise use cart
  const activeCart = buyNowOrder ? buyNowOrder.cart : cart;

  // Fetch shipping configurations for shops in cart
  useEffect(() => {
    const fetchShippingConfigs = async () => {
      if (activeCart && activeCart.length > 0) {
        const shopIds = [...new Set(activeCart.map((item) => item.shopId))];
        const configs = {};

        for (const shopId of shopIds) {
          try {
            const response = await axios.get(
              `${server}/shipping/simple-config/${shopId}`,
              {
                withCredentials: true,
              }
            );
            if (response.data.success) {
              configs[shopId] = response.data.config;
            }
          } catch (error) {
            console.log(`No shipping config found for shop ${shopId}`);
          }
        }

        setShopShippingConfigs(configs);
      }
    };

    fetchShippingConfigs();
  }, [activeCart]);

  const { validatePincode } = usePincodeService();

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
    // ===== SINGLE SELLER VALIDATION =====
    // Check if cart has items from multiple sellers
    const uniqueShopIds = [...new Set(activeCart.map((item) => item.shopId))];

    if (uniqueShopIds.length > 1) {
      toast.error(
        "⚠️ You can only checkout items from ONE seller at a time. Please remove items from other sellers to continue."
      );
      return;
    }

    if (uniqueShopIds.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    // Get the single seller's shop ID
    const singleShopId = uniqueShopIds[0];

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
      tax: 0,
      shippingAddress,
      user,
      shopId: singleShopId, // Add the single seller's shop ID
    };

    localStorage.setItem("latestOrder", JSON.stringify(orderData));

    // Clear Buy Now order data after creating final order
    if (buyNowOrder) {
      setBuyNowOrder(null);
    }

    navigate("/payment");
  };

  console.log("buyNowOrder:", buyNowOrder);
  console.log("cart:", cart);
  console.log("activeCart:", activeCart);

  const subTotalPrice = buyNowOrder
    ? buyNowOrder.subTotalPrice
    : cart.reduce((acc, item) => {
        // Use finalPrice if available (for attribute variations), otherwise use discountPrice
        const price =
          item.finalPrice ||
          item.discountPrice ||
          item.originalPrice ||
          item.price ||
          0;
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

  // Calculate shipping based on delivery info or use simple shipping calculation
  const shipping = React.useMemo(() => {
    // For cart items, calculate simple shipping based on shops
    if (!buyNowOrder && activeCart && activeCart.length > 0) {
      const shopGroups = activeCart.reduce((acc, item) => {
        const shopId = item.shopId;
        if (!acc[shopId]) {
          acc[shopId] = {
            items: [],
            totalValue: 0,
            shop: item.shop,
          };
        }
        const price =
          item.finalPrice ||
          item.discountPrice ||
          item.originalPrice ||
          item.price ||
          0;
        acc[shopId].items.push(item);
        acc[shopId].totalValue += price * item.qty;
        return acc;
      }, {});

      // Calculate total shipping with product-specific configurations
      let totalShipping = 0;
      console.log("Shop groups for shipping calculation:", shopGroups);

      Object.values(shopGroups).forEach((group) => {
        const shop = group.shop;
        const shopId = shop._id || shop.id;
        console.log("Processing shop for shipping:", shop.name, "ID:", shopId);

        // Get shipping configuration for this shop
        const shippingConfig = shopShippingConfigs[shopId];
        let shopShippingCost = 0;
        let hasProductSpecificShipping = false;

        // Calculate shipping for each product in this shop
        group.items.forEach((item) => {
          const productShipping = item.shipping;
          let productShippingCost = 0;

          // Check if product has specific shipping configuration
          if (productShipping && productShipping.baseShippingRate > 0) {
            hasProductSpecificShipping = true;
            console.log(
              `Product ${item.name} has specific shipping rate: ₹${productShipping.baseShippingRate}`
            );

            // Check product-level free shipping threshold
            const itemTotal =
              (item.finalPrice ||
                item.discountPrice ||
                item.originalPrice ||
                item.price ||
                0) * item.qty;
            if (
              productShipping.freeShippingThreshold &&
              itemTotal >= productShipping.freeShippingThreshold
            ) {
              console.log(`Free shipping applied for product: ${item.name}`);
              productShippingCost = 0;
            } else {
              productShippingCost = productShipping.baseShippingRate * item.qty;
            }
          } else if (shippingConfig) {
            // Use shop-level configuration for products without specific shipping
            console.log(`Product ${item.name} using shop default shipping`);

            // Check shop-level free shipping threshold for this product
            const itemTotal =
              (item.finalPrice ||
                item.discountPrice ||
                item.originalPrice ||
                item.price ||
                0) * item.qty;
            if (
              shippingConfig.freeShippingThreshold &&
              itemTotal >= shippingConfig.freeShippingThreshold
            ) {
              console.log(
                `Free shipping applied for product (shop threshold): ${item.name}`
              );
              productShippingCost = 0;
            } else {
              const shopShippingRate =
                shippingConfig.baseShippingRate !== undefined
                  ? shippingConfig.baseShippingRate
                  : shippingConfig.shippingCharge !== undefined
                  ? shippingConfig.shippingCharge
                  : 30;
              productShippingCost = shopShippingRate * item.qty;
            }
          } else {
            // Fallback to default shipping
            console.log(`Product ${item.name} using default ₹30 shipping`);
            const itemTotal =
              (item.finalPrice ||
                item.discountPrice ||
                item.originalPrice ||
                item.price ||
                0) * item.qty;
            if (itemTotal >= 999) {
              console.log(
                `Free shipping applied for product (default threshold): ${item.name}`
              );
              productShippingCost = 0;
            } else {
              productShippingCost = 30 * item.qty;
            }
          }

          shopShippingCost += productShippingCost;
        });

        // Check if entire shop order qualifies for free shipping (only if no product-specific shipping)
        if (
          !hasProductSpecificShipping &&
          shippingConfig &&
          shippingConfig.freeShippingThreshold &&
          group.totalValue >= shippingConfig.freeShippingThreshold
        ) {
          console.log(
            "Free shipping applied for entire shop order:",
            shop.name
          );
          shopShippingCost = 0;
        }

        console.log(
          `Total shipping cost for shop ${shop.name}: ₹${shopShippingCost}`
        );
        totalShipping += shopShippingCost;
      });

      console.log("Total calculated shipping:", totalShipping);
      return totalShipping;
    }

    // Fallback to old static calculation for Buy Now orders or when dynamic fails
    if (deliveryInfo && deliveryInfo.shippingCharge !== undefined) {
      // Free shipping for orders above ₹999
      return subTotalPrice >= 999 ? 0 : deliveryInfo.shippingCharge;
    }

    // Default fallback for buy now orders
    return buyNowOrder ? buyNowOrder.shipping : subTotalPrice * 0.1;
  }, [
    deliveryInfo,
    subTotalPrice,
    buyNowOrder,
    activeCart,
    shopShippingConfigs,
  ]);

  // Handle pincode validation and location selection
  const handleLocationSelect = async (locationData) => {
    setAddress1(locationData.address1 || "");
    setAddress2(locationData.address2 || "");
    setCity(locationData.city || "");
    setCountry(locationData.country || "IN");
    setZipCode(locationData.zipCode || "");
    setLatitude(locationData.latitude || "");
    setLongitude(locationData.longitude || "");

    // Validate the pincode for delivery info (crucial for checkout)
    if (locationData.zipCode) {
      try {
        const result = await validatePincode(locationData.zipCode.toString());
        if (result.isValid && result.data) {
          setDeliveryInfo({
            ...result.data,
            deliveryAvailable: true,
          });
          toast.success(result.message || "Delivery location confirmed");
        } else {
          setDeliveryInfo(null);
          toast.error(
            result.message || "Delivery not available for this location"
          );
        }
      } catch (error) {
        console.error("Error validating saved address pincode:", error);
        setDeliveryInfo(null);
        toast.error("Error validating delivery location");
      }
    }

    setShowPincodeService(false);
  };

  const handlePincodeValidate = (pincodeData) => {
    setDeliveryInfo(pincodeData);
    setCountry("IN"); // India
    setCity(pincodeData.district || "");
    setLatitude(pincodeData.latitude || "");
    setLongitude(pincodeData.longitude || "");
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
            (acc, item) =>
              acc + item.qty * (item.finalPrice || item.discountPrice),
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
            (acc, item) =>
              acc + item.qty * (item.finalPrice || item.discountPrice),
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

  // Calculate total price
  const totalPrice = couponCodeData
    ? Number(subTotalPrice + shipping - discountPercentenge).toFixed(2)
    : Number(subTotalPrice + shipping).toFixed(2);

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
  const { formatPrice } = useCurrency();
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
                            Shipping: {formatPrice(deliveryInfo.shippingCharge)}
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
}) => {
  const { formatPrice, currency } = useCurrency();
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
          {/* Order Items */}
          {activeCart && activeCart.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-800 border-b pb-2">
                Order Items ({activeCart.length})
              </h3>
              {activeCart.map((item, index) => {
                console.log("Cart item for checkout:", {
                  name: item.name,
                  images: item.images,
                  imageUrl: getProductImageUrl(item?.images, 0, backend_url),
                });

                return (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={
                        getProductImageUrl(item?.images, 0, backend_url) ||
                        "https://via.placeholder.com/48x48/E5E7EB/6B7280?text=No+Image"
                      }
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md flex-shrink-0 bg-gray-200"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/48x48/E5E7EB/6B7280?text=No+Image";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-800 truncate">
                        {item.name}
                      </h4>
                      <div className="text-xs text-gray-600">
                        Qty: {item.qty}
                      </div>

                      {/* Selected Attributes */}
                      {item.selectedAttributes &&
                        Object.keys(item.selectedAttributes).length > 0 && (
                          <div className="mt-1">
                            {Object.entries(item.selectedAttributes).map(
                              ([key, value]) => (
                                <span
                                  key={key}
                                  className="inline-block mr-2 mb-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
                                >
                                  {key}: {value}
                                </span>
                              )
                            )}
                          </div>
                        )}

                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs text-gray-600">
                          {item.finalPrice &&
                          item.finalPrice !==
                            (item.discountPrice ||
                              item.originalPrice ||
                              item.price) ? (
                            <div>
                              <span className="line-through text-gray-400">
                                {formatPrice(
                                  item.discountPrice ||
                                    item.originalPrice ||
                                    item.price
                                )}
                              </span>
                              <span className="ml-1 text-green-600 font-semibold">
                                {formatPrice(item.finalPrice)}
                              </span>
                              <span className="block text-xs text-green-600">
                                Attribute price applied
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-semibold text-gray-800">
                              {formatPrice(
                                item.finalPrice ||
                                  item.discountPrice ||
                                  item.originalPrice ||
                                  item.price
                              )}
                            </span>
                          )}
                          <span className="ml-1 text-gray-600">
                            × {item.qty}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-indigo-600">
                          {formatPrice(
                            (item.finalPrice ||
                              item.discountPrice ||
                              item.originalPrice ||
                              item.price) * item.qty
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Price Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="font-semibold text-gray-800">
                {formatPrice(subTotalPrice)}
              </span>
            </div>

            {/* Dynamic Shipping Breakdown */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Shipping & Handling</span>
              <span className="font-semibold text-gray-800">
                {shipping === 0 ? "FREE" : formatPrice(shipping)}
              </span>
            </div>

            {/* Free Shipping Message */}
            {shipping === 0 && subTotalPrice >= 999 && (
              <div className="text-xs text-green-600 -mt-2">
                🎉 Free shipping on orders above {formatPrice(999)}
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
                  -{formatPrice(discountPercentenge)}
                </span>
              </div>
            )}

            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">
                  Total
                </span>
                <span className="text-xl font-bold text-indigo-600">
                  {formatPrice(totalPrice)}
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
