import React, { useState, useRef, useCallback, useEffect } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { HiOutlineCamera, HiOutlineLocationMarker } from "react-icons/hi";
import { MdMyLocation } from "react-icons/md";
import { FiMapPin, FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import { BsCreditCard, BsCheckCircle } from "react-icons/bs";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Google Maps Configuration
const GOOGLE_MAPS_API_KEY = "AIzaSyBecpP3O2kfTa0z-lLIiShmsZE6e1kDmOk";

// Load Google Maps Script
const loadGoogleMapsScript = (callback) => {
  const existingScript = document.getElementById("googleMaps");
  if (!existingScript) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.id = "googleMaps";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    script.onload = () => {
      if (callback) callback();
    };
  } else {
    if (callback) callback();
  }
};

const ShopCreateWithSubscription = () => {
  const navigate = useNavigate();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentChoice, setPaymentChoice] = useState(null); // 'now' or 'later'

  // Subscription plans from backend
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phoneNumber: "",
    gstNumber: "",
    address: "",
    zipCode: "",
    password: "",
    latitude: "",
    longitude: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Subscription selection
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");

  // Google Maps states
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Refs
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize Google Maps
  React.useEffect(() => {
    loadGoogleMapsScript(() => {
      initializeAutocomplete();
    });
  }, []);

  // Fetch subscription plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoadingPlans(true);
        const { data } = await axios.get(`${server}/subscription/get-plans`);
        
        if (data.success && data.plans) {
          // Transform backend data to match frontend structure
          const transformedPlans = Object.entries(data.plans)
            .filter(([key, plan]) => plan.isActive !== false) // Only show active plans
            .map(([key, plan]) => ({
              id: key,
              name: plan.name,
              price: {
                monthly: plan.monthlyPrice,
                quarterly: plan.monthlyPrice * 3 * 0.9, // 10% discount
                semiannual: plan.monthlyPrice * 6 * 0.85, // 15% discount
                annual: plan.monthlyPrice * 12 * 0.8, // 20% discount
              },
              maxProducts: plan.maxProducts,
              features: formatPlanFeatures(plan, key),
              color: getPlanColor(key),
              popular: key === 'silver',
            }));
          
          setSubscriptionPlans(transformedPlans);
        }
      } catch (error) {
        console.error("Failed to fetch subscription plans:", error);
        toast.error("Failed to load subscription plans");
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  // Helper function to format plan features
  const formatPlanFeatures = (plan, planKey) => {
    const features = [];
    
    // Add max products info
    if (plan.maxProducts === 999) {
      features.push("Unlimited Products");
    } else {
      features.push(`${plan.maxProducts} Products`);
    }
    
    // Add features from plan.features object
    if (plan.features) {
      if (plan.features.businessProfile) features.push("Business profile & logo");
      if (plan.features.pdfUpload) features.push("PDF upload");
      if (plan.features.imagesPerProduct) {
        features.push(`${plan.features.imagesPerProduct} images/product`);
      }
      if (plan.features.videoOption) features.push("Video option");
      if (plan.features.contactSeller) features.push("Contact seller");
      if (plan.features.htmlCssEditor) features.push("HTML/CSS editor");
      if (plan.features.adPreApproval) features.push("Ad pre-approval");
    }
    
    // Special handling for revenue-share
    if (planKey === 'revenue-share') {
      features.push("10% Commission to MoC");
      features.push("90% to vendor");
      features.push("$25/month minimum");
      features.push("Pay as you earn");
    }
    
    return features;
  };

  // Helper function to get plan color
  const getPlanColor = (planKey) => {
    const colors = {
      bronze: "from-orange-400 to-amber-600",
      silver: "from-gray-400 to-gray-600",
      gold: "from-yellow-400 to-yellow-600",
      'revenue-share': "from-purple-400 to-purple-600",
    };
    return colors[planKey] || "from-blue-400 to-blue-600";
  };

  const initializeAutocomplete = useCallback(() => {
    if (window.google && addressInputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: [] },
        }
      );
      autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
    }
  }, []);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      const location = place.geometry.location;
      const lat = location.lat();
      const lng = location.lng();

      setFormData((prev) => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString(),
        address: place.formatted_address || place.name,
      }));
      setMapCenter({ lat, lng });

      const addressComponents = place.address_components;
      const postalCode = addressComponents?.find((component) =>
        component.types.includes("postal_code")
      )?.long_name;

      if (postalCode) {
        setFormData((prev) => ({ ...prev, zipCode: postalCode }));
      }

      setShowMap(true);
      setTimeout(() => initializeMap(), 100);
    }
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setFormData((prev) => ({
            ...prev,
            latitude: lat.toString(),
            longitude: lng.toString(),
          }));
          setMapCenter({ lat, lng });

          if (window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK" && results[0]) {
                setFormData((prev) => ({
                  ...prev,
                  address: results[0].formatted_address,
                }));
                const addressComponents = results[0].address_components;
                const postalCode = addressComponents?.find((component) =>
                  component.types.includes("postal_code")
                )?.long_name;
                if (postalCode) {
                  setFormData((prev) => ({ ...prev, zipCode: postalCode }));
                }
              }
              setIsLoadingLocation(false);
            });
          } else {
            setIsLoadingLocation(false);
          }

          setShowMap(true);
          setTimeout(() => initializeMap(), 100);
        },
        (error) => {
          toast.error("Unable to get your location");
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
    }
  };

  const initializeMap = () => {
    if (window.google && mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 15,
      });

      if (formData.latitude && formData.longitude) {
        updateMarker(
          parseFloat(formData.latitude),
          parseFloat(formData.longitude)
        );
      }
    }
  };

  const updateMarker = (lat, lng) => {
    if (mapInstanceRef.current) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        draggable: true,
        title: "Shop Location",
      });
      markerRef.current.addListener("dragend", (event) => {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();
        setFormData((prev) => ({
          ...prev,
          latitude: newLat.toString(),
          longitude: newLng.toString(),
        }));
        reverseGeocode(newLat, newLng);
      });
    }
  };

  const reverseGeocode = (lat, lng) => {
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          setFormData((prev) => ({
            ...prev,
            address: results[0].formatted_address,
          }));
          const addressComponents = results[0].address_components;
          const postalCode = addressComponents?.find((component) =>
            component.types.includes("postal_code")
          )?.long_name;
          if (postalCode) {
            setFormData((prev) => ({ ...prev, zipCode: postalCode }));
          }
        }
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  };

  // Step validation
  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter shop name");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter email");
      return false;
    }
    if (!formData.password.trim()) {
      toast.error("Please enter password");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.phoneNumber) {
      toast.error("Please enter phone number");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Please enter address");
      return false;
    }
    if (!formData.zipCode) {
      toast.error("Please enter zip code");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!selectedPlan) {
      toast.error("Please select a subscription plan");
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!paymentChoice) {
      toast.error("Please choose a payment option");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep === 4 && !validateStep4()) return;
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      const newForm = new FormData();

      if (avatar) {
        newForm.append("file", avatar);
      }

      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
          newForm.append(key, formData[key]);
        }
      });

      // Add subscription preferences
      newForm.append("selectedPlan", selectedPlan);
      newForm.append("billingCycle", billingCycle);
      newForm.append("paymentChoice", paymentChoice);

      const response = await axios.post(
        `${server}/shop/create-shop`,
        newForm,
        config
      );

      toast.success(response.data.message);

      if (paymentChoice === "later") {
        setTimeout(() => {
          navigate("/shop-login");
        }, 2000);
      }
    } catch (error) {
      console.error("Shop registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handlePayPalApprove = async (data, actions) => {
    try {
      await actions.order.capture();
      toast.success("Payment successful! Completing registration...");
      await handleSubmit();
    } catch (error) {
      toast.error("Payment failed");
      setIsLoading(false);
    }
  };

  const getSelectedPlanPrice = () => {
    if (!selectedPlan) return 0;
    const plan = subscriptionPlans.find((p) => p.id === selectedPlan);
    return plan?.price[billingCycle] || 0;
  };

  // Render step content
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderAddressInfo();
      case 3:
        return renderSubscriptionSelection();
      case 4:
        return renderPaymentChoice();
      case 5:
        return paymentChoice === "now" ? renderPayment() : renderConfirmation();
      default:
        return null;
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Basic Information
      </h2>

      {/* Avatar Upload */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          {avatar ? (
            <img
              src={URL.createObjectURL(avatar)}
              alt="avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-blue-200">
              <span className="text-4xl text-gray-400">🏪</span>
            </div>
          )}
          <label
            htmlFor="file-input"
            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg"
          >
            <HiOutlineCamera className="w-5 h-5" />
          </label>
          <input
            type="file"
            id="file-input"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Shop Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Enter your shop name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="shop@example.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={visible ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {visible ? (
              <AiOutlineEye className="w-5 h-5" />
            ) : (
              <AiOutlineEyeInvisible className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Address & Location
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="+1 234 567 8900"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          GST Number (Optional)
        </label>
        <input
          type="text"
          name="gstNumber"
          value={formData.gstNumber}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Enter GST number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            ref={addressInputRef}
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            placeholder="Start typing your address..."
            required
          />
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={isLoadingLocation}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoadingLocation ? (
              <span className="animate-spin">⌛</span>
            ) : (
              <MdMyLocation className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Zip Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          placeholder="Enter zip code"
          required
        />
      </div>

      {showMap && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FiMapPin className="inline mr-2" />
            Shop Location on Map
          </label>
          <div
            ref={mapRef}
            className="w-full h-64 rounded-lg border border-gray-300"
          />
          <p className="text-xs text-gray-500 mt-2">
            Drag the marker to adjust your exact location
          </p>
        </div>
      )}
    </div>
  );

  const renderSubscriptionSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Choose Your Plan
      </h2>
      <p className="text-gray-600 mb-6">
        Select a subscription plan that suits your business needs
      </p>

      {/* Billing Cycle Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[
          { value: "monthly", label: "Monthly", discount: null },
          { value: "quarterly", label: "3 Months", discount: "10%" },
          { value: "semiannual", label: "6 Months", discount: "15%" },
          { value: "annual", label: "12 Months", discount: "20%" },
        ].map((cycle) => (
          <button
            key={cycle.value}
            type="button"
            onClick={() => setBillingCycle(cycle.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              billingCycle === cycle.value
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {cycle.label}
            {cycle.discount && (
              <span className="ml-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Save {cycle.discount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      {isLoadingPlans ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-gray-600">Loading subscription plans...</p>
        </div>
      ) : subscriptionPlans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No subscription plans available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
              selectedPlan === plan.id
                ? "border-blue-500 shadow-2xl bg-blue-50"
                : "border-gray-200 hover:border-blue-300 bg-white"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
            )}

            {selectedPlan === plan.id && (
              <div className="absolute top-4 right-4">
                <BsCheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            )}

            <div
              className={`w-12 h-12 rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}
            >
              <span className="text-2xl text-white">💎</span>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {plan.name}
            </h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-gray-900">
                ${plan.price[billingCycle]}
              </span>
              <span className="text-gray-500 text-sm">
                /
                {billingCycle === "quarterly"
                  ? "3 months"
                  : billingCycle === "semiannual"
                  ? "6 months"
                  : billingCycle === "annual"
                  ? "12 months"
                  : "month"}
              </span>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <FiCheck className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>
      )}
    </div>
  );

  const renderPaymentChoice = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Options</h2>
      <p className="text-gray-600 mb-6">
        Choose when you'd like to pay for your subscription
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pay Now Option */}
        <div
          onClick={() => setPaymentChoice("now")}
          className={`p-8 rounded-2xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
            paymentChoice === "now"
              ? "border-blue-500 shadow-2xl bg-blue-50"
              : "border-gray-200 hover:border-blue-300 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
              <BsCreditCard className="w-8 h-8 text-white" />
            </div>
            {paymentChoice === "now" && (
              <BsCheckCircle className="w-6 h-6 text-blue-600" />
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">Pay Now</h3>
          <p className="text-gray-600 mb-4">
            Complete payment now and get instant access after approval
          </p>

          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
            <ul className="space-y-2 text-sm text-green-800">
              <li>✅ Faster approval process</li>
              <li>✅ Immediate activation after admin approval</li>
              <li>✅ Start selling right away</li>
              <li>✅ 100% refund if not approved</li>
            </ul>
          </div>
        </div>

        {/* Pay Later Option */}
        <div
          onClick={() => setPaymentChoice("later")}
          className={`p-8 rounded-2xl border-2 cursor-pointer transition-all transform hover:scale-105 ${
            paymentChoice === "later"
              ? "border-blue-500 shadow-2xl bg-blue-50"
              : "border-gray-200 hover:border-blue-300 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
              <span className="text-3xl">⏰</span>
            </div>
            {paymentChoice === "later" && (
              <BsCheckCircle className="w-6 h-6 text-blue-600" />
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">Pay Later</h3>
          <p className="text-gray-600 mb-4">
            Complete registration now, pay after admin approval
          </p>

          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <ul className="space-y-2 text-sm text-purple-800">
              <li>✅ No payment required now</li>
              <li>✅ Wait for approval first</li>
              <li>✅ Pay only if approved</li>
              <li>✅ Flexible payment options</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Selected Plan Summary */}
      {selectedPlan && (
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-2">Selected Plan</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">
                {subscriptionPlans.find((p) => p.id === selectedPlan)?.name}{" "}
                Plan
              </p>
              <p className="text-sm text-gray-600">
                {billingCycle === "quarterly"
                  ? "3 Months"
                  : billingCycle === "semiannual"
                  ? "6 Months"
                  : billingCycle === "annual"
                  ? "12 Months"
                  : "Monthly"}{" "}
                billing
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                ${getSelectedPlanPrice()}
              </p>
              <p className="text-sm text-gray-600">
                /
                {billingCycle === "quarterly"
                  ? "3mo"
                  : billingCycle === "semiannual"
                  ? "6mo"
                  : billingCycle === "annual"
                  ? "12mo"
                  : "mo"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Complete Payment
      </h2>
      <p className="text-gray-600 mb-6">
        Your account will be created after successful payment
      </p>

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Order Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Plan</span>
            <span className="font-medium">
              {subscriptionPlans.find((p) => p.id === selectedPlan)?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Billing</span>
            <span className="font-medium">
              {billingCycle === "quarterly"
                ? "3 Months"
                : billingCycle === "semiannual"
                ? "6 Months"
                : billingCycle === "annual"
                ? "12 Months"
                : "Monthly"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shop Name</span>
            <span className="font-medium">{formData.name}</span>
          </div>
          <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
            <span className="font-semibold text-gray-800">Total</span>
            <span className="text-2xl font-bold text-gray-900">
              ${getSelectedPlanPrice()}
            </span>
          </div>
        </div>
      </div>

      {/* PayPal Payment */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <PayPalScriptProvider
          options={{
            "client-id":
              "AW3P72fNSIFlkCnT3gaKSxCKKaTL09YBLL3d45J5Uc7JaXCNrYJoUiza6OqL87Kj7Sg7UbufGwCrQ7yA",
            currency: "USD",
          }}
        >
          <PayPalButtons
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: getSelectedPlanPrice().toFixed(2), // Already in USD
                    },
                  },
                ],
              });
            }}
            onApprove={handlePayPalApprove}
            onError={(err) => {
              toast.error("Payment failed. Please try again.");
              setIsLoading(false);
            }}
          />
        </PayPalScriptProvider>
      </div>

      <div className="text-center text-sm text-gray-500 mt-4">
        <p>🔒 Your payment information is secure and encrypted</p>
        <p className="mt-2">
          💰 100% refund guaranteed if your shop is not approved by admin
        </p>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6 text-center py-8">
      <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
        <FiCheck className="w-10 h-10 text-white" />
      </div>

      <h2 className="text-3xl font-bold text-gray-800">Almost There!</h2>
      <p className="text-gray-600 max-w-md mx-auto">
        Review your information and click "Complete Registration" to finish
        setting up your shop
      </p>

      {/* Summary Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-md mx-auto text-left">
        <h3 className="font-semibold text-gray-800 mb-4">
          Registration Summary
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Shop Name:</span>
            <span className="font-medium">{formData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{formData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{formData.phoneNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Selected Plan:</span>
            <span className="font-medium">
              {subscriptionPlans.find((p) => p.id === selectedPlan)?.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment:</span>
            <span className="font-medium">Pay After Approval</span>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto text-left">
        <h4 className="font-semibold text-blue-900 mb-3">What happens next?</h4>
        <ol className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="font-bold mr-2">1.</span>
            <span>You'll receive an email verification link</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">2.</span>
            <span>Verify your email address</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">3.</span>
            <span>Admin will review your application (within 48 hours)</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">4.</span>
            <span>Once approved, complete your payment</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">5.</span>
            <span>Start selling on our platform!</span>
          </li>
        </ol>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Processing..." : "Complete Registration"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, paymentChoice === "now" ? 5 : 5].map(
              (step, index) => (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                        currentStep >= step
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {currentStep > step ? (
                        <FiCheck className="w-6 h-6" />
                      ) : (
                        step
                      )}
                    </div>
                    <span className="text-xs mt-2 text-gray-600 hidden md:block">
                      {step === 1 && "Basic Info"}
                      {step === 2 && "Address"}
                      {step === 3 && "Plan"}
                      {step === 4 && "Payment"}
                      {step === 5 &&
                        (paymentChoice === "now" ? "Pay" : "Confirm")}
                    </span>
                  </div>
                  {index < (paymentChoice === "now" ? 4 : 4) && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              )
            )}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Step Content */}
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FiArrowLeft />
                Previous
              </button>
            )}

            {currentStep <
              (paymentChoice === "later"
                ? 5
                : paymentChoice === "now"
                ? 5
                : 4) && (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto"
              >
                Next
                <FiArrowRight />
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link
              to="/shop-login"
              className="text-blue-600 hover:underline font-semibold"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShopCreateWithSubscription;
