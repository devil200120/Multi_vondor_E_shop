import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiLocationMarker, HiMap, HiZoomIn, HiZoomOut } from "react-icons/hi";
import { FaStore, FaShoppingBag, FaMapMarkerAlt } from "react-icons/fa";

const MallMap = () => {
  const { categories } = useSelector((state) => state.categories);
  const { allProducts } = useSelector((state) => state.products);
  const { sellers } = useSelector((state) => state.seller);
  const categoriesData = categories || [];

  const [hoveredArea, setHoveredArea] = useState(null);

  // Cayman Islands regions/areas for the virtual mall
  const mallAreas = [
    {
      id: 1,
      name: "George Town",
      stores: 45,
      products: 320,
      x: 35,
      y: 55,
      color: "#012169",
    },
    {
      id: 2,
      name: "West Bay",
      stores: 28,
      products: 180,
      x: 25,
      y: 30,
      color: "#C8102E",
    },
    {
      id: 3,
      name: "Bodden Town",
      stores: 15,
      products: 95,
      x: 65,
      y: 60,
      color: "#012169",
    },
    {
      id: 4,
      name: "East End",
      stores: 8,
      products: 45,
      x: 85,
      y: 55,
      color: "#C8102E",
    },
    {
      id: 5,
      name: "North Side",
      stores: 12,
      products: 68,
      x: 70,
      y: 35,
      color: "#012169",
    },
  ];

  return (
    <section className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-blue-200 border-b-4 border-b-red-500 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HiMap className="w-7 h-7 text-white" />
            <div>
              <h2 className="text-lg font-bold text-white">Mall of Cayman</h2>
              <p className="text-primary-100 text-xs">
                Your Virtual Shopping Destination
              </p>
            </div>
          </div>
          <Link
            to="/products"
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm shadow-sm"
          >
            Browse All
          </Link>
        </div>
      </div>

      {/* Mall Map Content */}
      <div className="p-5">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-primary-600 mb-1">
            🏝️ Explore Our Virtual Mall
          </h3>
          <p className="text-gray-500 text-sm">
            Click on any region to discover stores and products from across the
            Cayman Islands
          </p>
        </div>

        {/* Interactive Map */}
        <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl overflow-hidden border-2 border-blue-200 shadow-inner">
          {/* Map Container with Embedded Map */}
          <div className="relative w-full h-[300px] md:h-[350px]">
            {/* Google Maps Embed of Cayman Islands */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241756.64477066882!2d-81.38744565!3d19.3133!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f2587c27e097265%3A0xa99ddab4cd90a7b5!2sCayman%20Islands!5e0!3m2!1sen!2sus!4v1703689200000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
              title="Cayman Islands Map"
            />

            {/* Interactive Overlay with Mall Markers */}
            <div className="absolute inset-0 pointer-events-none">
              {mallAreas.map((area) => (
                <Link
                  key={area.id}
                  to={`/products?location=${area.name
                    .toLowerCase()
                    .replace(" ", "-")}`}
                  className="pointer-events-auto absolute transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${area.x}%`, top: `${area.y}%` }}
                  onMouseEnter={() => setHoveredArea(area.id)}
                  onMouseLeave={() => setHoveredArea(null)}
                >
                  {/* Pulsing Marker */}
                  <div className="relative">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-transform duration-200 hover:scale-125"
                      style={{ backgroundColor: area.color }}
                    >
                      <FaStore className="text-white text-sm" />
                    </div>
                    {/* Pulse Animation */}
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-30"
                      style={{ backgroundColor: area.color }}
                    />
                  </div>

                  {/* Tooltip */}
                  {hoveredArea === area.id && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-xl p-3 min-w-[140px] z-10 border border-gray-200">
                      <div className="text-sm font-bold text-primary-600 mb-1">
                        {area.name}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <FaStore className="mr-1 text-primary-400" />{" "}
                        {area.stores} Stores
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <FaShoppingBag className="mr-1 text-red-400" />{" "}
                        {area.products} Products
                      </div>
                      <div className="text-xs text-primary-500 mt-2 font-medium">
                        Click to explore →
                      </div>
                      {/* Tooltip Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-white" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg p-2.5 shadow-md border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-1.5">
              Shopping Districts
            </div>
            <div className="flex flex-wrap gap-2">
              {mallAreas.slice(0, 3).map((area) => (
                <div key={area.id} className="flex items-center text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full mr-1"
                    style={{ backgroundColor: area.color }}
                  />
                  <span className="text-gray-600">{area.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Badge */}
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg p-2.5 shadow-md border border-gray-200">
            <div className="flex items-center gap-3 text-xs">
              <div className="text-center">
                <div className="font-bold text-primary-600">108+</div>
                <div className="text-gray-500">Stores</div>
              </div>
              <div className="w-px h-6 bg-gray-200" />
              <div className="text-center">
                <div className="font-bold text-red-500">708+</div>
                <div className="text-gray-500">Products</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <Link
            to="/products"
            className="px-5 py-2.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 transition-colors duration-200 text-sm flex items-center gap-2"
          >
            <FaShoppingBag /> Shop Now
          </Link>
          <Link
            to="/shop-create"
            className="px-5 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm flex items-center gap-2"
          >
            <FaStore /> Become a Seller
          </Link>
          <Link
            to="/shops"
            className="px-5 py-2.5 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm flex items-center gap-2 border border-primary-200"
          >
            <FaMapMarkerAlt /> View All Stores
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MallMap;
