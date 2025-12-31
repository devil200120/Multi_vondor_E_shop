import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { HiChevronRight, HiChevronDown } from "react-icons/hi";
import {
  FaStore,
  FaTshirt,
  FaHome,
  FaSprayCan,
  FaTv,
  FaChild,
  FaUtensils,
  FaStar,
  FaTree,
  FaCogs,
  FaBriefcase,
  FaGem,
} from "react-icons/fa";

const MallMap = () => {
  const { categories } = useSelector((state) => state.categories);
  const { allProducts } = useSelector((state) => state.products);
  const { sellers } = useSelector((state) => state.seller);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [hoveredStore, setHoveredStore] = useState(null);

  // Mall categories with icons and store counts
  const mallCategories = [
    {
      id: 1,
      name: "Fashion & Jewellery",
      icon: FaTshirt,
      color: "#E91E63",
      count: 12,
    },
    { id: 2, name: "Home & Living", icon: FaHome, color: "#2196F3", count: 8 },
    { id: 3, name: "Electronics", icon: FaTv, color: "#00BCD4", count: 10 },
    {
      id: 4,
      name: "Food & Dining",
      icon: FaUtensils,
      color: "#FF9800",
      count: 15,
    },
    { id: 5, name: "Kids & Toys", icon: FaChild, color: "#4CAF50", count: 3 },
    { id: 6, name: "Services", icon: FaCogs, color: "#607D8B", count: 10 },
  ];

  // Mall store locations for the floor plan
  const mallStores = [
    // Anchor stores (large, yellow)
    {
      id: "jcpenney",
      name: "JCPenney",
      x: 5,
      y: 45,
      width: 8,
      height: 35,
      color: "#FFD700",
      type: "anchor",
      zone: "A",
    },
    {
      id: "dillards",
      name: "Dillard's",
      x: 60,
      y: 30,
      width: 15,
      height: 55,
      color: "#FFD700",
      type: "anchor",
      zone: "D",
    },
    {
      id: "athome",
      name: "At Home",
      x: 85,
      y: 5,
      width: 12,
      height: 25,
      color: "#FFD700",
      type: "anchor",
      zone: "N",
    },
    {
      id: "burlington",
      name: "Burlington",
      x: 25,
      y: 5,
      width: 15,
      height: 20,
      color: "#C71585",
      type: "anchor",
      zone: "J",
    },

    // Entertainment (blue)
    {
      id: "regal",
      name: "Regal Theaters",
      x: 75,
      y: 15,
      width: 10,
      height: 18,
      color: "#1E90FF",
      type: "entertainment",
      zone: "N",
    },
    {
      id: "rink",
      name: "MCM Rink N Roll",
      x: 25,
      y: 40,
      width: 12,
      height: 12,
      color: "#C71585",
      type: "entertainment",
      zone: "L",
    },

    // Regular stores (magenta/pink corridor)
    {
      id: "store1",
      name: "Fashion Store",
      x: 15,
      y: 30,
      width: 6,
      height: 8,
      color: "#C71585",
      type: "retail",
      zone: "B",
    },
    {
      id: "store2",
      name: "Electronics",
      x: 22,
      y: 30,
      width: 6,
      height: 8,
      color: "#C71585",
      type: "retail",
      zone: "B",
    },
    {
      id: "store3",
      name: "Home Decor",
      x: 30,
      y: 55,
      width: 8,
      height: 10,
      color: "#C71585",
      type: "retail",
      zone: "C",
    },
    {
      id: "store4",
      name: "Sports Zone",
      x: 40,
      y: 55,
      width: 8,
      height: 10,
      color: "#C71585",
      type: "retail",
      zone: "C",
    },
    {
      id: "store5",
      name: "Beauty Plus",
      x: 50,
      y: 55,
      width: 6,
      height: 10,
      color: "#1E90FF",
      type: "retail",
      zone: "E",
    },

    // Food court area
    {
      id: "foodcourt",
      name: "Food Court",
      x: 15,
      y: 55,
      width: 12,
      height: 15,
      color: "#FFD700",
      type: "food",
      zone: "B",
    },

    // More inline stores
    {
      id: "store6",
      name: "Kids Zone",
      x: 35,
      y: 25,
      width: 5,
      height: 6,
      color: "#C71585",
      type: "retail",
      zone: "H",
    },
    {
      id: "store7",
      name: "Jewelry",
      x: 42,
      y: 25,
      width: 5,
      height: 6,
      color: "#C71585",
      type: "retail",
      zone: "H",
    },
    {
      id: "store8",
      name: "Shoes",
      x: 49,
      y: 25,
      width: 5,
      height: 6,
      color: "#C71585",
      type: "retail",
      zone: "H",
    },
    {
      id: "store9",
      name: "Accessories",
      x: 35,
      y: 35,
      width: 5,
      height: 6,
      color: "#1E90FF",
      type: "retail",
      zone: "I",
    },
    {
      id: "store10",
      name: "Mobile",
      x: 42,
      y: 35,
      width: 5,
      height: 6,
      color: "#1E90FF",
      type: "retail",
      zone: "I",
    },
  ];

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <section className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        {/* Left Sidebar - Categories */}
        <div className="lg:w-72 bg-gray-50 border-r border-gray-200 p-4 flex-shrink-0">
          {/* Mall Logo/Branding */}
          <div className="mb-6 text-center">
            <div className="relative inline-block">
              <div className="w-28 h-28 mx-auto bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className="text-white font-black text-lg leading-tight">
                    CAYMAN
                  </div>
                  <div className="text-white font-black text-lg leading-tight">
                    CITY
                  </div>
                  <div className="text-yellow-300 font-black text-lg leading-tight">
                    MALL
                  </div>
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-2 bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 rounded-full"></div>
            </div>
          </div>

          {/* Category Filter List */}
          <div className="space-y-1">
            {mallCategories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategories.includes(category.id);

              return (
                <div key={category.id}>
                  <div
                    className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-sm ${
                      isSelected ? "bg-white shadow-sm" : ""
                    }`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    {/* Icon */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <IconComponent
                        size={14}
                        style={{ color: category.color }}
                      />
                    </div>

                    {/* Category Name */}
                    <span className="flex-1 text-sm font-medium text-gray-700">
                      {category.name}
                    </span>

                    {/* Count */}
                    <span className="text-xs text-gray-400 font-medium">
                      {category.count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Links */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Link
              to="/products"
              className="block w-full py-2.5 px-4 bg-blue-600 text-white text-center font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Browse All Stores
            </Link>
            <Link
              to="/shop-create"
              className="block w-full mt-2 py-2.5 px-4 bg-pink-600 text-white text-center font-semibold rounded-lg hover:bg-pink-700 transition-colors text-sm"
            >
              Become a Seller
            </Link>
          </div>
        </div>

        {/* Right Side - Mall Floor Plan */}
        <div className="flex-1 p-3 bg-gray-100 flex flex-col">
          {/* Map Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button className="p-1.5 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
                <HiChevronRight
                  size={16}
                  className="text-gray-600 rotate-180"
                />
              </button>
              <span className="text-xs text-gray-500">MCM Promenade</span>
            </div>
            {/* Stats - Moved to header for mobile */}
            <div className="flex lg:hidden items-center gap-3 bg-white rounded-lg px-3 py-1.5 shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="font-bold text-blue-600 text-sm">
                  {sellers?.length || 50}+
                </div>
                <div className="text-gray-500 text-[10px]">Stores</div>
              </div>
              <div className="w-px h-5 bg-gray-200" />
              <div className="text-center">
                <div className="font-bold text-pink-600 text-sm">
                  {allProducts?.length || 500}+
                </div>
                <div className="text-gray-500 text-[10px]">Products</div>
              </div>
            </div>
          </div>

          {/* Interactive Floor Plan */}
          <div
            className="relative bg-white rounded-lg shadow-inner overflow-hidden flex-1"
            style={{ minHeight: "280px" }}
          >
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%">
                <defs>
                  <pattern
                    id="grid"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 20 0 L 0 0 0 20"
                      fill="none"
                      stroke="#ccc"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Parking lot lines (top) */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gray-200 flex">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-gray-300"
                  style={{ transform: "skewX(-15deg)" }}
                />
              ))}
            </div>

            {/* Mall Stores */}
            <svg
              viewBox="0 0 100 80"
              className="w-full h-full absolute inset-0"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Main corridor/walkway */}
              <rect
                x="12"
                y="25"
                width="55"
                height="45"
                fill="#F5F5F5"
                stroke="#ddd"
                strokeWidth="0.3"
              />

              {/* Render all stores */}
              {mallStores.map((store) => (
                <g key={store.id}>
                  <rect
                    x={store.x}
                    y={store.y}
                    width={store.width}
                    height={store.height}
                    fill={store.color}
                    stroke="#333"
                    strokeWidth="0.3"
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onMouseEnter={() => setHoveredStore(store.id)}
                    onMouseLeave={() => setHoveredStore(null)}
                    onClick={() =>
                      (window.location.href = `/products?store=${store.id}`)
                    }
                  />
                  {/* Store label for anchor stores */}
                  {store.type === "anchor" && (
                    <text
                      x={store.x + store.width / 2}
                      y={store.y + store.height / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[3px] font-bold fill-gray-800 pointer-events-none"
                      style={{
                        writingMode:
                          store.height > store.width * 1.5
                            ? "vertical-rl"
                            : "horizontal-tb",
                        textOrientation: "mixed",
                      }}
                    >
                      {store.name}
                    </text>
                  )}
                  {/* Zone markers */}
                  <text
                    x={store.x + store.width / 2}
                    y={
                      store.y +
                      store.height / 2 +
                      (store.type === "anchor" ? 4 : 0)
                    }
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[2.5px] font-semibold fill-gray-700 pointer-events-none"
                  >
                    {store.zone}
                  </text>
                  {/* Small store indicators */}
                  {store.type === "retail" && (
                    <circle
                      cx={store.x + store.width / 2}
                      cy={store.y + store.height / 2 - 1}
                      r="0.8"
                      fill="white"
                      className="pointer-events-none"
                    />
                  )}
                </g>
              ))}

              {/* Entry points */}
              <circle cx="37" cy="70" r="1.5" fill="#4CAF50" />
              <text
                x="37"
                y="74"
                textAnchor="middle"
                className="text-[2px] fill-gray-600"
              >
                Main Entry
              </text>
            </svg>

            {/* Tooltip for hovered store */}
            {hoveredStore && (
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-3 z-10 border border-gray-200">
                <div className="text-sm font-bold text-gray-800">
                  {mallStores.find((s) => s.id === hoveredStore)?.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Zone {mallStores.find((s) => s.id === hoveredStore)?.zone}
                </div>
                <div className="text-xs text-blue-600 mt-1 font-medium">
                  Click to view products →
                </div>
              </div>
            )}

            {/* Stats - Desktop only (positioned absolute) */}
            <div className="hidden lg:block absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg p-2.5 shadow-md border border-gray-200">
              <div className="flex items-center gap-4 text-xs">
                <div className="text-center">
                  <div className="font-bold text-blue-600">
                    {sellers?.length || 50}+
                  </div>
                  <div className="text-gray-500">Stores</div>
                </div>
                <div className="w-px h-6 bg-gray-200" />
                <div className="text-center">
                  <div className="font-bold text-pink-600">
                    {allProducts?.length || 500}+
                  </div>
                  <div className="text-gray-500">Products</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend - Below map on mobile, inside map on desktop */}
          <div className="lg:hidden mt-3 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-2">
              Store Types
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs">
                <div
                  className="w-4 h-3 rounded"
                  style={{ backgroundColor: "#FFD700" }}
                ></div>
                <span className="text-gray-600">Anchor Stores</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div
                  className="w-4 h-3 rounded"
                  style={{ backgroundColor: "#C71585" }}
                ></div>
                <span className="text-gray-600">Retail Stores</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div
                  className="w-4 h-3 rounded"
                  style={{ backgroundColor: "#1E90FF" }}
                ></div>
                <span className="text-gray-600">Entertainment</span>
              </div>
            </div>
          </div>

          {/* Bottom Quick Actions */}
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <Link
              to="/shops"
              className="px-4 py-2 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2 border border-gray-300 shadow-sm"
            >
              <FaStore /> View All Stores
            </Link>
            <Link
              to="/products"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 shadow-sm"
            >
              <FaGem /> Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MallMap;
