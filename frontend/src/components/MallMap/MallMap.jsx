import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { HiChevronRight } from "react-icons/hi";
import { FaStore, FaGem, FaCrown } from "react-icons/fa";
import { getRootCategoriesPublic } from "../../redux/actions/category";
import { backend_url, server } from "../../server";
import { getCategoryImageUrl } from "../../utils/mediaUtils";

const MallMap = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allProducts } = useSelector((state) => state.products);
  const { sellers } = useSelector((state) => state.seller);
  const { categories, isLoading } = useSelector((state) => state.categories);

  const [hoveredStore, setHoveredStore] = useState(null);
  const [goldSellers, setGoldSellers] = useState([]);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(getRootCategoriesPublic());
  }, [dispatch]);

  // Fetch Gold subscription sellers
  useEffect(() => {
    const fetchGoldSellers = async () => {
      try {
        const response = await axios.get(`${server}/shop/gold-sellers`);
        if (response.data.success) {
          setGoldSellers(response.data.sellers);
        }
      } catch (error) {
        console.error("Error fetching gold sellers:", error);
      }
    };
    fetchGoldSellers();
  }, []);

  // Use actual categories from database
  const categoriesData = categories || [];

  // Store positions for gold sellers - predefined layout positions
  const storePositions = [
    // Anchor stores (large, yellow) - for first 4 gold sellers
    {
      x: 5,
      y: 45,
      width: 8,
      height: 35,
      color: "#FFD700",
      type: "anchor",
      zone: "A",
    },
    {
      x: 60,
      y: 30,
      width: 15,
      height: 55,
      color: "#FFD700",
      type: "anchor",
      zone: "D",
    },
    {
      x: 85,
      y: 5,
      width: 12,
      height: 25,
      color: "#FFD700",
      type: "anchor",
      zone: "N",
    },
    {
      x: 25,
      y: 5,
      width: 15,
      height: 20,
      color: "#FFD700",
      type: "anchor",
      zone: "J",
    },
    // Regular stores (magenta/pink) - for remaining gold sellers
    {
      x: 15,
      y: 30,
      width: 6,
      height: 8,
      color: "#C71585",
      type: "retail",
      zone: "B",
    },
    {
      x: 22,
      y: 30,
      width: 6,
      height: 8,
      color: "#C71585",
      type: "retail",
      zone: "B",
    },
    {
      x: 30,
      y: 55,
      width: 8,
      height: 10,
      color: "#C71585",
      type: "retail",
      zone: "C",
    },
    {
      x: 40,
      y: 55,
      width: 8,
      height: 10,
      color: "#C71585",
      type: "retail",
      zone: "C",
    },
    {
      x: 50,
      y: 55,
      width: 6,
      height: 10,
      color: "#1E90FF",
      type: "retail",
      zone: "E",
    },
    {
      x: 35,
      y: 25,
      width: 5,
      height: 6,
      color: "#C71585",
      type: "retail",
      zone: "H",
    },
    {
      x: 42,
      y: 25,
      width: 5,
      height: 6,
      color: "#C71585",
      type: "retail",
      zone: "H",
    },
    {
      x: 49,
      y: 25,
      width: 5,
      height: 6,
      color: "#C71585",
      type: "retail",
      zone: "H",
    },
    {
      x: 35,
      y: 35,
      width: 5,
      height: 6,
      color: "#1E90FF",
      type: "retail",
      zone: "I",
    },
    {
      x: 42,
      y: 35,
      width: 5,
      height: 6,
      color: "#1E90FF",
      type: "retail",
      zone: "I",
    },
    {
      x: 75,
      y: 15,
      width: 10,
      height: 18,
      color: "#1E90FF",
      type: "retail",
      zone: "N",
    },
    {
      x: 25,
      y: 40,
      width: 12,
      height: 12,
      color: "#C71585",
      type: "retail",
      zone: "L",
    },
  ];

  // Map gold sellers to store positions
  const mallStores =
    goldSellers.length > 0
      ? goldSellers.map((seller, index) => ({
          id: seller._id,
          name: seller.name,
          sellerId: seller._id,
          avatar: seller.avatar?.url,
          isGoldSeller: true,
          ...storePositions[index % storePositions.length],
        }))
      : [
          // Default placeholder stores when no gold sellers
          {
            id: "store1",
            name: "Premium Store 1",
            x: 5,
            y: 45,
            width: 8,
            height: 35,
            color: "#FFD700",
            type: "anchor",
            zone: "A",
          },
          {
            id: "store2",
            name: "Premium Store 2",
            x: 60,
            y: 30,
            width: 15,
            height: 55,
            color: "#FFD700",
            type: "anchor",
            zone: "D",
          },
          {
            id: "store3",
            name: "Premium Store 3",
            x: 85,
            y: 5,
            width: 12,
            height: 25,
            color: "#FFD700",
            type: "anchor",
            zone: "N",
          },
          {
            id: "store4",
            name: "Premium Store 4",
            x: 25,
            y: 5,
            width: 15,
            height: 20,
            color: "#C71585",
            type: "anchor",
            zone: "J",
          },
          {
            id: "store5",
            name: "Store 5",
            x: 15,
            y: 30,
            width: 6,
            height: 8,
            color: "#C71585",
            type: "retail",
            zone: "B",
          },
          {
            id: "store6",
            name: "Store 6",
            x: 22,
            y: 30,
            width: 6,
            height: 8,
            color: "#C71585",
            type: "retail",
            zone: "B",
          },
          {
            id: "store7",
            name: "Store 7",
            x: 30,
            y: 55,
            width: 8,
            height: 10,
            color: "#C71585",
            type: "retail",
            zone: "C",
          },
          {
            id: "store8",
            name: "Store 8",
            x: 40,
            y: 55,
            width: 8,
            height: 10,
            color: "#C71585",
            type: "retail",
            zone: "C",
          },
          {
            id: "store9",
            name: "Store 9",
            x: 50,
            y: 55,
            width: 6,
            height: 10,
            color: "#1E90FF",
            type: "retail",
            zone: "E",
          },
          {
            id: "store10",
            name: "Store 10",
            x: 35,
            y: 25,
            width: 5,
            height: 6,
            color: "#C71585",
            type: "retail",
            zone: "H",
          },
        ];

  const toggleCategory = (category) => {
    // Navigate to products page filtered by this category
    const categoryName = category.name || category.title;
    navigate(`/products?category=${encodeURIComponent(categoryName)}`);
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
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 animate-pulse"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                  <div className="w-6 h-4 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : categoriesData.length > 0 ? (
              categoriesData.map((category, index) => (
                <div key={category._id || category.id || index}>
                  <div
                    className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-sm group"
                    onClick={() => toggleCategory(category)}
                  >
                    {/* Category Image */}
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={getCategoryImageUrl(
                          category.image || category.image_Url,
                          backend_url
                        )}
                        alt={category.name || category.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            (category.name || category.title || "C")[0]
                          )}&background=003DA5&color=fff&size=32`;
                        }}
                      />
                    </div>

                    {/* Category Name */}
                    <span className="flex-1 text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
                      {category.name || category.title}
                    </span>

                    {/* Arrow */}
                    <HiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No categories available
              </div>
            )}
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
                    fill={store.isGoldSeller ? "#FFD700" : store.color}
                    stroke={store.isGoldSeller ? "#DAA520" : "#333"}
                    strokeWidth={store.isGoldSeller ? "0.5" : "0.3"}
                    className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    onMouseEnter={() => setHoveredStore(store.id)}
                    onMouseLeave={() => setHoveredStore(null)}
                    onClick={() => {
                      if (store.isGoldSeller && store.sellerId) {
                        navigate(`/shop/preview/${store.sellerId}`);
                      } else {
                        navigate(`/products`);
                      }
                    }}
                  />
                  {/* Store label for anchor stores or gold sellers */}
                  {(store.type === "anchor" || store.isGoldSeller) && (
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
                      {store.name.length > 12
                        ? store.name.substring(0, 12) + "..."
                        : store.name}
                    </text>
                  )}
                  {/* Gold crown indicator for gold sellers */}
                  {store.isGoldSeller && (
                    <text
                      x={store.x + store.width / 2}
                      y={store.y + 2}
                      textAnchor="middle"
                      className="text-[3px] pointer-events-none"
                    >
                      👑
                    </text>
                  )}
                  {/* Zone markers - only for non-gold sellers */}
                  {!store.isGoldSeller && (
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
                  )}
                  {/* Small store indicators */}
                  {store.type === "retail" && !store.isGoldSeller && (
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
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-xl p-3 z-10 border border-gray-200 max-w-[200px]">
                {(() => {
                  const store = mallStores.find((s) => s.id === hoveredStore);
                  return store ? (
                    <>
                      <div className="flex items-center gap-2">
                        {store.isGoldSeller && store.avatar && (
                          <img
                            src={store.avatar}
                            alt={store.name}
                            className="w-8 h-8 rounded-full object-cover border-2 border-yellow-400"
                          />
                        )}
                        <div>
                          <div className="text-sm font-bold text-gray-800 flex items-center gap-1">
                            {store.name}
                            {store.isGoldSeller && (
                              <FaCrown className="w-3 h-3 text-yellow-500" />
                            )}
                          </div>
                          {store.isGoldSeller ? (
                            <div className="text-xs text-yellow-600 font-medium">
                              Gold Member
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">
                              Zone {store.zone}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 mt-2 font-medium">
                        {store.isGoldSeller
                          ? "Click to visit shop →"
                          : "Click to view products →"}
                      </div>
                    </>
                  ) : null;
                })()}
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
                  className="w-4 h-3 rounded border border-yellow-500"
                  style={{ backgroundColor: "#FFD700" }}
                ></div>
                <span className="text-gray-600 flex items-center gap-1">
                  <FaCrown className="w-3 h-3 text-yellow-500" /> Gold Members
                </span>
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
            {goldSellers.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-yellow-600 font-medium">
                👑 {goldSellers.length} Premium Gold Seller
                {goldSellers.length !== 1 ? "s" : ""} on map
              </div>
            )}
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
