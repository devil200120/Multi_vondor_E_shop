import React, { useEffect, useRef, useState } from "react";
import {
  FiMapPin,
  FiNavigation,
  FiClock,
  FiTruck,
  FiRefreshCw,
  FiAlertCircle,
  FiRadio,
  FiPlay,
  FiPause,
} from "react-icons/fi";
import socketIO from "socket.io-client";
const SOCKET_ENDPOINT = "https://multi-vondor-e-shop-2.onrender.com";

const OrderLocationMap = ({ order, shopLocation }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const deliveryMarkerRef = useRef(null);
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const routePolylineRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [traffic, setTraffic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [deliveryPosition, setDeliveryPosition] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [trackingPath, setTrackingPath] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationInterval, setSimulationInterval] = useState(null);

  // Google Maps API Key - You need to set this in your environment
  const GOOGLE_MAPS_API_KEY =
    process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";

  // Initialize Google Maps
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => setError("Failed to load Google Maps");
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, [GOOGLE_MAPS_API_KEY]);

  // Initialize map and calculate route
  useEffect(() => {
    const initMap = async () => {
      if (
        mapLoaded &&
        mapRef.current &&
        order?.shippingAddress &&
        shopLocation
      ) {
        await initializeMap();
      }
    };
    initMap();
  }, [mapLoaded, order, shopLocation]);

  // Initialize socket connection for live tracking
  useEffect(() => {
    if (order?._id) {
      socketRef.current = socketIO(SOCKET_ENDPOINT);

      // Join delivery tracking room
      socketRef.current.emit("joinDeliveryTracking", {
        orderId: order._id,
        userType: "supplier",
      });

      // Listen for delivery location updates
      socketRef.current.on("deliveryLocationUpdate", (data) => {
        if (data.orderId === order._id) {
          // Update delivery position with smooth animation
          if (deliveryMarkerRef.current && mapInstanceRef.current) {
            const newPos = new window.google.maps.LatLng(
              data.location.lat,
              data.location.lng
            );

            // Smooth marker movement
            const currentPos = deliveryMarkerRef.current.getPosition();
            if (currentPos) {
              // Simple animation function
              const animate = (marker, from, to) => {
                const start = Date.now();
                const deltaLat = to.lat() - from.lat();
                const deltaLng = to.lng() - from.lng();
                const duration = 1000;

                const animateStep = () => {
                  const elapsed = Date.now() - start;
                  const progress = Math.min(elapsed / duration, 1);

                  const currentLat = from.lat() + deltaLat * progress;
                  const currentLng = from.lng() + deltaLng * progress;

                  marker.setPosition(
                    new window.google.maps.LatLng(currentLat, currentLng)
                  );

                  if (progress < 1) {
                    requestAnimationFrame(animateStep);
                  }
                };
                animateStep();
              };

              animate(deliveryMarkerRef.current, currentPos, newPos);
            } else {
              deliveryMarkerRef.current.setPosition(newPos);
            }

            deliveryMarkerRef.current.setVisible(true);
            setDeliveryPosition(data.location);
          }

          setEstimatedArrival(data.estimatedArrival);
          setCurrentSpeed(data.speed || 0);
        }
      });

      // Listen for delivery path updates
      socketRef.current.on("deliveryPathUpdate", (data) => {
        if (data.orderId === order._id) {
          setTrackingPath((prev) => [...prev, data.location]);
        }
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.emit("leaveDeliveryTracking", {
            orderId: order._id,
          });
          socketRef.current.disconnect();
        }
      };
    }
  }, [order?._id]);

  const initializeMap = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Order shipping address:", order.shippingAddress);
      console.log("Shop location:", shopLocation);

      // Get customer coordinates
      let customerLat, customerLng;

      if (order.shippingAddress.latitude && order.shippingAddress.longitude) {
        customerLat = parseFloat(order.shippingAddress.latitude);
        customerLng = parseFloat(order.shippingAddress.longitude);
        console.log(
          "Using stored customer coordinates:",
          customerLat,
          customerLng
        );
      } else {
        // Geocode the address
        const geocoder = new window.google.maps.Geocoder();
        const address = `${order.shippingAddress.address1}, ${order.shippingAddress.city}, ${order.shippingAddress.country}`;

        console.log("Attempting to geocode customer address:", address);

        const geocodeResult = await new Promise((resolve, reject) => {
          geocoder.geocode({ address }, (results, status) => {
            console.log(
              "Customer geocoding status:",
              status,
              "Results:",
              results
            );
            if (status === "OK" && results[0]) {
              resolve(results[0].geometry.location);
            } else {
              reject(
                new Error(
                  `Could not geocode customer address: ${address}. Status: ${status}`
                )
              );
            }
          });
        });

        customerLat = geocodeResult.lat();
        customerLng = geocodeResult.lng();
      }

      // Get shop coordinates
      let shopLat, shopLng;
      if (shopLocation.latitude && shopLocation.longitude) {
        shopLat = parseFloat(shopLocation.latitude);
        shopLng = parseFloat(shopLocation.longitude);
      } else {
        // Geocode shop address
        const geocoder = new window.google.maps.Geocoder();
        const shopAddress = shopLocation.address || "Shop Address";

        console.log("Attempting to geocode shop address:", shopAddress);

        const shopGeocodeResult = await new Promise((resolve, reject) => {
          geocoder.geocode({ address: shopAddress }, (results, status) => {
            console.log("Shop geocoding status:", status, "Results:", results);
            if (status === "OK" && results[0]) {
              resolve(results[0].geometry.location);
            } else {
              reject(
                new Error(
                  `Could not geocode shop address: ${shopAddress}. Status: ${status}`
                )
              );
            }
          });
        });

        shopLat = shopGeocodeResult.lat();
        shopLng = shopGeocodeResult.lng();
      }

      // Create map
      const bounds = new window.google.maps.LatLngBounds();
      const shopPos = new window.google.maps.LatLng(shopLat, shopLng);
      const customerPos = new window.google.maps.LatLng(
        customerLat,
        customerLng
      );

      bounds.extend(shopPos);
      bounds.extend(customerPos);

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 10,
        center: bounds.getCenter(),
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Add shop marker
      const shopMarker = new window.google.maps.Marker({
        position: shopPos,
        map: map,
        title: "Shop Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#3B82F6",
          fillOpacity: 0.8,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      // Add customer marker
      const customerMarker = new window.google.maps.Marker({
        position: customerPos,
        map: map,
        title: "Customer Location",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#EF4444",
          fillOpacity: 0.8,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      // Add delivery person marker (initially hidden)
      const deliveryMarker = new window.google.maps.Marker({
        position: shopPos, // Start at shop location
        map: map,
        title: "Delivery Person",
        visible: false,
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#10B981",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
          rotation: 0,
        },
      });
      deliveryMarkerRef.current = deliveryMarker;

      // Add info windows
      const shopInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">Shop Location</h3>
            <p style="margin: 0; font-size: 14px;">${
              shopLocation.address || "Shop Address"
            }</p>
          </div>
        `,
      });

      const customerInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">Delivery Address</h3>
            <p style="margin: 0; font-size: 14px;">
              ${order.shippingAddress.address1}<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.country}
            </p>
          </div>
        `,
      });

      shopMarker.addListener("click", () => {
        customerInfoWindow.close();
        shopInfoWindow.open(map, shopMarker);
      });

      customerMarker.addListener("click", () => {
        shopInfoWindow.close();
        customerInfoWindow.open(map, customerMarker);
      });

      // Calculate and display route
      await calculateRoute(shopPos, customerPos, map);

      // Fit map to show both markers
      map.fitBounds(bounds);

      setLoading(false);
    } catch (err) {
      console.error("Error initializing map:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const calculateRoute = async (origin, destination, map) => {
    try {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true, // We use custom markers
        polylineOptions: {
          strokeColor: "#3B82F6",
          strokeWeight: 4,
          strokeOpacity: 0.8,
        },
      });

      directionsServiceRef.current = directionsService;
      directionsRendererRef.current = directionsRenderer;

      directionsRenderer.setMap(map);

      // Calculate route
      const result = await new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: origin,
            destination: destination,
            travelMode: window.google.maps.TravelMode.DRIVING,
            drivingOptions: {
              departureTime: new Date(),
              trafficModel: window.google.maps.TrafficModel.BEST_GUESS,
            },
            unitSystem: window.google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false,
          },
          (result, status) => {
            if (status === "OK") {
              resolve(result);
            } else {
              reject(new Error("Could not calculate route: " + status));
            }
          }
        );
      });

      directionsRenderer.setDirections(result);

      // Extract route information
      const route = result.routes[0];
      const leg = route.legs[0];

      setDistance(leg.distance.text);
      setDuration(leg.duration.text);

      // Get traffic information if available
      if (leg.duration_in_traffic) {
        setTraffic(leg.duration_in_traffic.text);
      }
    } catch (err) {
      console.error("Error calculating route:", err);
      setError("Could not calculate route");
    }
  };

  // Animate marker movement
  const animateMarker = (marker, from, to, duration = 1000) => {
    const start = Date.now();
    const deltaLat = to.lat() - from.lat();
    const deltaLng = to.lng() - from.lng();

    // Calculate bearing for arrow rotation
    const bearing = calculateBearing(from, to);

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);

      const currentLat = from.lat() + deltaLat * progress;
      const currentLng = from.lng() + deltaLng * progress;

      marker.setPosition(new window.google.maps.LatLng(currentLat, currentLng));

      // Update arrow rotation
      const icon = marker.getIcon();
      icon.rotation = bearing;
      marker.setIcon(icon);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // Calculate bearing between two points
  const calculateBearing = (from, to) => {
    const dLng = ((to.lng() - from.lng()) * Math.PI) / 180;
    const lat1 = (from.lat() * Math.PI) / 180;
    const lat2 = (to.lat() * Math.PI) / 180;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

    const bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  };

  // Update remaining route
  const updateRemainingRoute = async (currentPosition) => {
    if (!order?.shippingAddress || !directionsServiceRef.current) return;

    try {
      const customerLat = parseFloat(order.shippingAddress.latitude);
      const customerLng = parseFloat(order.shippingAddress.longitude);

      const result = await new Promise((resolve, reject) => {
        directionsServiceRef.current.route(
          {
            origin: new window.google.maps.LatLng(
              currentPosition.lat,
              currentPosition.lng
            ),
            destination: new window.google.maps.LatLng(
              customerLat,
              customerLng
            ),
            travelMode: window.google.maps.TravelMode.DRIVING,
            drivingOptions: {
              departureTime: new Date(),
              trafficModel: window.google.maps.TrafficModel.BEST_GUESS,
            },
          },
          (result, status) => {
            if (status === "OK") {
              resolve(result);
            } else {
              reject(new Error("Could not calculate remaining route"));
            }
          }
        );
      });

      // Update the directions renderer with remaining route
      directionsRendererRef.current.setDirections(result);

      // Update distance and duration
      const leg = result.routes[0].legs[0];
      setDistance(leg.distance.text);
      setDuration(leg.duration.text);
      if (leg.duration_in_traffic) {
        setTraffic(leg.duration_in_traffic.text);
      }
    } catch (error) {
      console.error("Error updating remaining route:", error);
    }
  };

  // Update live path (breadcrumb trail)
  const updateLivePath = (position) => {
    if (mapInstanceRef.current && trackingPath.length > 0) {
      // Create or update polyline for tracking path
      if (routePolylineRef.current) {
        routePolylineRef.current.setMap(null);
      }

      const pathCoordinates = trackingPath.map(
        (point) => new window.google.maps.LatLng(point.lat, point.lng)
      );

      routePolylineRef.current = new window.google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: "#10B981",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map: mapInstanceRef.current,
      });
    }
  };

  // Start live tracking simulation (for demo purposes)
  const startSimulation = () => {
    if (!shopLocation || !order?.shippingAddress || isSimulating) return;

    setIsSimulating(true);
    const shopLat = parseFloat(shopLocation.latitude);
    const shopLng = parseFloat(shopLocation.longitude);
    const customerLat = parseFloat(order.shippingAddress.latitude);
    const customerLng = parseFloat(order.shippingAddress.longitude);

    let progress = 0;
    const totalSteps = 50;
    const stepDuration = 2000; // 2 seconds per step

    const interval = setInterval(() => {
      progress += 1;
      const ratio = progress / totalSteps;

      // Interpolate position
      const currentLat = shopLat + (customerLat - shopLat) * ratio;
      const currentLng = shopLng + (customerLng - shopLng) * ratio;

      const position = { lat: currentLat, lng: currentLng };

      // Simulate speed (km/h)
      const speed = 30 + Math.random() * 20;

      // Update local position
      if (deliveryMarkerRef.current && mapInstanceRef.current) {
        const newPos = new window.google.maps.LatLng(
          position.lat,
          position.lng
        );

        // Smooth marker movement
        const currentPos = deliveryMarkerRef.current.getPosition();
        if (currentPos) {
          // Simple animation
          const animate = (marker, from, to) => {
            const start = Date.now();
            const deltaLat = to.lat() - from.lat();
            const deltaLng = to.lng() - from.lng();
            const duration = 1000;

            const animateStep = () => {
              const elapsed = Date.now() - start;
              const progress = Math.min(elapsed / duration, 1);

              const currentLat = from.lat() + deltaLat * progress;
              const currentLng = from.lng() + deltaLng * progress;

              marker.setPosition(
                new window.google.maps.LatLng(currentLat, currentLng)
              );

              if (progress < 1) {
                requestAnimationFrame(animateStep);
              }
            };
            animateStep();
          };

          animate(deliveryMarkerRef.current, currentPos, newPos);
        } else {
          deliveryMarkerRef.current.setPosition(newPos);
        }

        deliveryMarkerRef.current.setVisible(true);
        setDeliveryPosition(position);
      }
      setCurrentSpeed(speed);

      // Broadcast to socket
      if (socketRef.current) {
        socketRef.current.emit("deliveryLocationBroadcast", {
          orderId: order._id,
          location: position,
          speed: speed,
          estimatedArrival: new Date(
            Date.now() + (totalSteps - progress) * stepDuration
          ),
        });
      }

      if (progress >= totalSteps) {
        clearInterval(interval);
        setIsSimulating(false);
        setSimulationInterval(null);
      }
    }, stepDuration);

    setSimulationInterval(interval);
  };

  // Stop simulation
  const stopSimulation = () => {
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
      setIsSimulating(false);
    }
  };

  // Toggle live tracking
  const toggleLiveTracking = () => {
    setIsLiveTracking(!isLiveTracking);
    if (!isLiveTracking) {
      // Start GPS tracking
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            // Broadcast real location
            if (socketRef.current) {
              socketRef.current.emit("deliveryLocationBroadcast", {
                orderId: order._id,
                location: location,
                speed: position.coords.speed || 0,
                estimatedArrival: null,
              });
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
      }
    } else {
      // Stop GPS tracking
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }
  };

  const refreshRoute = () => {
    if (
      mapInstanceRef.current &&
      mapLoaded &&
      order?.shippingAddress &&
      shopLocation
    ) {
      initializeMap();
    }
  };

  if (!order?.shippingAddress || !shopLocation) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <FiAlertCircle className="mx-auto text-4xl text-gray-400 mb-2" />
          <p className="text-gray-600">Location information not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiMapPin className="text-xl text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Order Location & Route
            </h3>
            <p className="text-sm text-gray-600">
              Track delivery route and distance
            </p>
          </div>
        </div>
        <button
          onClick={refreshRoute}
          disabled={loading}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh route"
        >
          <FiRefreshCw
            className={`text-gray-600 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Route Information */}
      {(distance || duration || traffic) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {distance && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <FiNavigation className="text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Distance
                </span>
              </div>
              <p className="text-lg font-semibold text-blue-900">{distance}</p>
            </div>
          )}

          {duration && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <FiClock className="text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Duration
                </span>
              </div>
              <p className="text-lg font-semibold text-green-900">{duration}</p>
            </div>
          )}

          {traffic && (
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-1">
                <FiTruck className="text-orange-600" />
                <span className="text-sm font-medium text-orange-900">
                  With Traffic
                </span>
              </div>
              <p className="text-lg font-semibold text-orange-900">{traffic}</p>
            </div>
          )}
        </div>
      )}

      {/* Live Tracking Controls */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                isLiveTracking ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              <FiRadio
                className={`text-lg ${
                  isLiveTracking ? "text-green-600" : "text-gray-600"
                }`}
              />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                Live Delivery Tracking
              </h4>
              <p className="text-sm text-gray-600">
                {isLiveTracking
                  ? "Real-time GPS tracking active"
                  : "Click to enable live tracking"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isLiveTracking && (
              <div className="flex items-center space-x-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">LIVE</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Live Tracking Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              GPS Tracking
            </span>
            <button
              onClick={toggleLiveTracking}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isLiveTracking ? "bg-green-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isLiveTracking ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Simulation Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={startSimulation}
              disabled={isSimulating}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 text-sm"
            >
              <FiPlay className="w-3 h-3" />
              <span>Demo</span>
            </button>
            <button
              onClick={stopSimulation}
              disabled={!isSimulating}
              className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 text-sm"
            >
              <FiPause className="w-3 h-3" />
              <span>Stop</span>
            </button>
          </div>

          {/* Current Speed */}
          {currentSpeed > 0 && (
            <div className="text-center">
              <span className="text-sm text-gray-600">Speed</span>
              <p className="text-lg font-semibold text-green-600">
                {Math.round(currentSpeed)} km/h
              </p>
            </div>
          )}
        </div>

        {/* Delivery Position Info */}
        {deliveryPosition && (
          <div className="mt-4 p-3 bg-white rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  Delivery Person Location
                </span>
                <p className="text-xs text-gray-500">
                  Lat: {deliveryPosition.lat.toFixed(6)}, Lng:{" "}
                  {deliveryPosition.lng.toFixed(6)}
                </p>
              </div>
              {estimatedArrival && (
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-700">ETA</span>
                  <p className="text-xs text-green-600">
                    {new Date(estimatedArrival).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center">
              <FiRefreshCw className="mx-auto text-2xl text-blue-600 animate-spin mb-2" />
              <p className="text-sm text-gray-600">Loading map and route...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="text-center">
              <FiAlertCircle className="mx-auto text-2xl text-red-500 mb-2" />
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={refreshRoute}
                className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-96 rounded-lg border border-gray-200"
          style={{ minHeight: "400px" }}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>Shop Location</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span>Customer Location</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-green-500"></div>
          <span>Delivery Person</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-blue-500 rounded"></div>
          <span>Delivery Route</span>
        </div>
        {trackingPath.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-1 bg-green-500 rounded"></div>
            <span>Live Path</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderLocationMap;
