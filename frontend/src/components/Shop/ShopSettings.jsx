import React, { useState, useRef, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { backend_url, server } from "../../server";
import { AiOutlineCamera } from "react-icons/ai";
import { FiMapPin, FiSave } from "react-icons/fi";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdMyLocation } from "react-icons/md";
import styles from "../../styles/styles";
import axios from "axios";
import { loadSeller } from "../../redux/actions/user";
import { toast } from "react-toastify";

const ShopSettings = () => {
  const { seller } = useSelector((state) => state.seller);
  const [avatar, setAvatar] = useState();
  const [name, setName] = useState(seller && seller.name);
  const [description, setDescription] = useState(
    seller && seller.description ? seller.description : ""
  );
  const [address, setAddress] = useState(seller && seller.address);
  const [phoneNumber, setPhoneNumber] = useState(seller && seller.phoneNumber);
  const [zipCode, setZipcode] = useState(seller && seller.zipCode);

  // Google Maps states
  const [latitude, setLatitude] = useState(seller?.latitude || "");
  const [longitude, setLongitude] = useState(seller?.longitude || "");
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({
    lat: seller?.latitude ? parseFloat(seller.latitude) : 20.5937,
    lng: seller?.longitude ? parseFloat(seller.longitude) : 78.9629,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Refs for Google Maps
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const dispatch = useDispatch();

  // Google Maps API Key
  const GOOGLE_MAPS_API_KEY =
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
    "AIzaSyBVeker3NKNQyfAy-XkVDrqodDoU7GYQyk";

  // Initialize Google Maps
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
        initializeAutocomplete();
      };
      script.onerror = () => toast.error("Failed to load Google Maps");
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
      initializeAutocomplete();
    }
  }, []);

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
        setZipcode(postalCode);
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
                  setZipcode(postalCode);
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
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      title: "Shop Location",
      draggable: true,
    });

    markerRef.current.addListener("dragend", (event) => {
      const newLat = event.latLng.lat();
      const newLng = event.latLng.lng();
      setLatitude(newLat.toString());
      setLongitude(newLng.toString());
      reverseGeocode(newLat, newLng);
    });
  };

  const reverseGeocode = (lat, lng) => {
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results[0]) {
          setAddress(results[0].formatted_address);
        }
      });
    }
  };

  // Image updated
  const handleImage = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    setAvatar(file);

    const formData = new FormData();

    formData.append("image", e.target.files[0]);

    await axios
      .put(`${server}/shop/update-shop-avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      })
      .then((res) => {
        dispatch(loadSeller());
        toast.success("Avatar updated successfully!");
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const updateHandler = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `${server}/shop/update-seller-info`,
        {
          name,
          address,
          zipCode,
          phoneNumber,
          description,
          latitude,
          longitude,
        },
        { withCredentials: true }
      );

      toast.success("Shop info updated successfully!");
      dispatch(loadSeller());
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update shop info"
      );
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center">
      <div className="flex w-full 800px:w-[80%] flex-col justify-center my-5">
        <div className="w-full flex items-center justify-center">
          <div className="relative">
            <img
              src={
                avatar
                  ? URL.createObjectURL(avatar)
                  : `${backend_url}/${seller.avatar}`
              }
              alt=""
              className="w-[200px] h-[200px] rounded-full cursor-pointer"
            />
            <div className="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[10px] right-[15px]">
              <input
                type="file"
                id="image"
                className="hidden"
                onChange={handleImage}
              />
              <label htmlFor="image">
                <AiOutlineCamera />
              </label>
            </div>
          </div>
        </div>

        {/* shop info */}
        <form className="flex flex-col items-center" onSubmit={updateHandler}>
          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop Name</label>
            </div>
            <input
              type="name"
              placeholder={`${seller.name}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>
          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop description</label>
            </div>
            <input
              type="name"
              placeholder={`${
                seller?.description
                  ? seller.description
                  : "Enter your shop description"
              }`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
            />
          </div>

          {/* Enhanced Address Section with Google Maps */}
          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2 font-semibold text-gray-700 flex items-center">
                <HiOutlineLocationMarker className="mr-2 text-blue-600" />
                Shop Address
              </label>
            </div>

            {/* Address Input with Autocomplete */}
            <div className="relative w-[95%] mb-4">
              <input
                ref={addressInputRef}
                type="text"
                placeholder="Enter shop address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`${styles.input} !w-full pr-12`}
                required
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                title="Use current location"
              >
                <MdMyLocation
                  className={isLoadingLocation ? "animate-spin" : ""}
                />
              </button>
            </div>

            {/* Location Actions */}
            <div className="w-[95%] flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <FiMapPin className="mr-2" />
                {showMap ? "Hide Map" : "Show Map"}
              </button>

              {latitude && longitude && (
                <div className="text-sm text-green-600 flex items-center">
                  <FiMapPin className="mr-1" />
                  Location Set
                </div>
              )}
            </div>

            {/* Google Map */}
            {showMap && mapLoaded && (
              <div className="w-[95%] mb-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    ref={mapRef}
                    className="w-full h-64"
                    style={{ minHeight: "250px" }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Click on the map or drag the marker to set your shop location
                </p>
              </div>
            )}

            {/* Coordinates Display */}
            {latitude && longitude && (
              <div className="w-[95%] bg-blue-50 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Location Coordinates
                </h4>
                <div className="text-sm text-blue-800 grid grid-cols-2 gap-2">
                  <div>
                    <strong>Latitude:</strong> {parseFloat(latitude).toFixed(6)}
                  </div>
                  <div>
                    <strong>Longitude:</strong>{" "}
                    {parseFloat(longitude).toFixed(6)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop Phone Number</label>
            </div>
            <input
              type="number"
              placeholder={seller?.phoneNumber}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
            <div className="w-full pl-[3%]">
              <label className="block pb-2">Shop Zip Code</label>
            </div>
            <input
              type="number"
              placeholder={seller?.zipCode}
              value={zipCode}
              onChange={(e) => setZipcode(e.target.value)}
              className={`${styles.input} !w-[95%] mb-4 800px:mb-0`}
              required
            />
          </div>

          <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-8">
            <button
              type="submit"
              className="w-[95%] bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <FiSave className="text-lg" />
              <span>Update Shop Information</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShopSettings;
