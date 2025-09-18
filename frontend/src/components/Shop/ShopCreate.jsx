import React, { useState, useRef, useCallback } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { RxAvatar } from "react-icons/rx";
import { HiOutlineCamera, HiOutlineLocationMarker } from "react-icons/hi";
import { MdMyLocation, MdLocationOn } from "react-icons/md";
import { FiMapPin, FiGlobe, FiArrowLeft } from "react-icons/fi";

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

const ShopCreate = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Google Maps states
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default to India
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Refs
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Initialize Google Maps when component mounts
  React.useEffect(() => {
    loadGoogleMapsScript(() => {
      initializeAutocomplete();
    });
  }, []);

  const initializeAutocomplete = useCallback(() => {
    if (window.google && addressInputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: [] }, // Allow all countries
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

      setLatitude(lat.toString());
      setLongitude(lng.toString());
      setMapCenter({ lat, lng });
      setAddress(place.formatted_address || place.name);

      // Extract zip code if available
      const addressComponents = place.address_components;
      const postalCode = addressComponents?.find((component) =>
        component.types.includes("postal_code")
      )?.long_name;

      if (postalCode) {
        setZipCode(postalCode);
      }

      setShowMap(true);

      setTimeout(() => {
        initializeMap();
      }, 100);
    }
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setLatitude(lat.toString());
          setLongitude(lng.toString());
          setMapCenter({ lat, lng });

          // Reverse geocode to get address
          if (window.google) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === "OK" && results[0]) {
                setAddress(results[0].formatted_address);

                // Extract zip code
                const addressComponents = results[0].address_components;
                const postalCode = addressComponents?.find((component) =>
                  component.types.includes("postal_code")
                )?.long_name;

                if (postalCode) {
                  setZipCode(postalCode);
                }
              }
              setIsLoadingLocation(false);
            });
          } else {
            setIsLoadingLocation(false);
          }

          setShowMap(true);
          setTimeout(() => {
            initializeMap();
          }, 100);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error(
            "Unable to get your location. Please enter address manually."
          );
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
    }
  };

  const initializeMap = () => {
    if (mapRef.current && window.google) {
      const mapOptions = {
        center: mapCenter,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      };

      mapInstanceRef.current = new window.google.maps.Map(
        mapRef.current,
        mapOptions
      );

      // Add click listener to map
      mapInstanceRef.current.addListener("click", (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        setLatitude(lat.toString());
        setLongitude(lng.toString());
        updateMarker(lat, lng);
        reverseGeocode(lat, lng);
      });

      // If coordinates exist, add marker
      if (latitude && longitude) {
        updateMarker(parseFloat(latitude), parseFloat(longitude));
      }
    }
  };

  const updateMarker = (lat, lng) => {
    if (mapInstanceRef.current) {
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // Add new marker
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        draggable: true,
        title: "Shop Location",
      });

      // Add drag listener to marker
      markerRef.current.addListener("dragend", (event) => {
        const newLat = event.latLng.lat();
        const newLng = event.latLng.lng();

        setLatitude(newLat.toString());
        setLongitude(newLng.toString());
        reverseGeocode(newLat, newLng);
      });
    }
  };

  const reverseGeocode = (lat, lng) => {
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          setAddress(results[0].formatted_address);

          // Extract zip code
          const addressComponents = results[0].address_components;
          const postalCode = addressComponents?.find((component) =>
            component.types.includes("postal_code")
          )?.long_name;

          if (postalCode) {
            setZipCode(postalCode);
          }
        }
      });
    }
  };

  React.useEffect(() => {
    if (showMap && window.google) {
      setTimeout(() => {
        initializeMap();
      }, 100);
    }
  }, [showMap, mapCenter]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!avatar) {
      toast.error("Please select a shop avatar/logo");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter shop name");
      return;
    }

    if (!email.trim()) {
      toast.error("Please enter email");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter password");
      return;
    }

    if (!phoneNumber) {
      toast.error("Please enter phone number");
      return;
    }

    if (!address.trim()) {
      toast.error("Please enter address");
      return;
    }

    if (!zipCode) {
      toast.error("Please enter zip code");
      return;
    }

    setIsLoading(true);

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };

      const newForm = new FormData();
      newForm.append("file", avatar);
      newForm.append("name", name);
      newForm.append("email", email);
      newForm.append("password", password);
      newForm.append("zipCode", zipCode);
      newForm.append("address", address);
      newForm.append("phoneNumber", phoneNumber);

      // Include coordinates if available
      if (latitude && longitude) {
        newForm.append("latitude", latitude);
        newForm.append("longitude", longitude);
      }

      const response = await axios.post(
        `${server}/shop/create-shop`,
        newForm,
        config
      );

      // If successful, show success message and clear form
      toast.success(response.data.message);
      setName("");
      setEmail("");
      setPassword("");
      setAvatar(null);
      setZipCode("");
      setAddress("");
      setPhoneNumber("");
      setLatitude("");
      setLongitude("");
      setShowMap(false);

      // Navigate to login page after successful registration
      setTimeout(() => {
        navigate("/shop-login");
      }, 2000);
    } catch (error) {
      console.error("Shop registration error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Back Button - Fixed Position */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-all duration-200 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl border border-white/50 hover:border-blue-200 group"
        >
          <FiArrowLeft
            className="mr-2 group-hover:-translate-x-0.5 transition-transform duration-200"
            size={18}
          />
          Back to Home
        </Link>
      </div>

      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto pt-16">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl mb-4">
              <FiGlobe className="text-white text-lg" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Start Your Journey as a
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                {" "}
                Seller
              </span>
            </h1>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              Join thousands of successful sellers. Create your shop and start
              reaching customers worldwide.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
              <h2 className="text-lg font-semibold text-white">
                Shop Registration
              </h2>
              <p className="text-purple-100 text-sm mt-1">
                Fill in your details to create your shop
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Shop Avatar */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Shop Logo/Avatar
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                          {avatar ? (
                            <img
                              src={URL.createObjectURL(avatar)}
                              alt="avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <RxAvatar className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="file-input"
                          className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all cursor-pointer"
                        >
                          <HiOutlineCamera className="mr-1 text-sm" />
                          Choose Image
                        </label>
                        <input
                          type="file"
                          id="file-input"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG up to 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Shop Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Shop Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Enter your shop name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={visible ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all pr-10"
                        placeholder="Create a strong password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setVisible(!visible)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {visible ? (
                          <AiOutlineEye size={16} />
                        ) : (
                          <AiOutlineEyeInvisible size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column - Address & Location */}
                <div className="space-y-4">
                  {/* Location Tools */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <MdLocationOn className="mr-1 text-blue-600 text-lg" />
                      Shop Location
                    </h3>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isLoadingLocation}
                        className="w-full flex items-center justify-center px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                      >
                        <MdMyLocation className="mr-1 text-sm" />
                        {isLoadingLocation
                          ? "Getting Location..."
                          : "Use Current Location"}
                      </button>
                      <p className="text-xs text-gray-600 text-center">
                        or enter address manually below
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Shop Address *
                    </label>
                    <input
                      ref={addressInputRef}
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Start typing your address..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Address autocomplete powered by Google Maps
                    </p>
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="Enter zip code"
                      required
                    />
                  </div>

                  {/* Coordinates Display */}
                  {latitude && longitude && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h4 className="text-xs font-semibold text-green-800 mb-2 flex items-center">
                        <FiMapPin className="mr-1 text-sm" />
                        Location Coordinates
                      </h4>
                      <div className="text-xs text-green-700 space-y-1">
                        <p>Lat: {parseFloat(latitude).toFixed(6)}</p>
                        <p>Lng: {parseFloat(longitude).toFixed(6)}</p>
                      </div>
                    </div>
                  )}

                  {/* Map */}
                  {showMap && (
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="h-48 w-full" ref={mapRef}></div>
                      <div className="bg-gray-50 px-3 py-2 border-t">
                        <p className="text-xs text-gray-600">
                          Click on the map to adjust your shop location
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Your Shop...
                    </div>
                  ) : (
                    "Create My Shop"
                  )}
                </button>
              </div>

              {/* Login Link */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have a shop?{" "}
                  <Link
                    to="/shop-login"
                    className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCreate;
