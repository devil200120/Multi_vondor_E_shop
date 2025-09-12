import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../Route/ProductCard/ProductCard";
import { backend_url } from "../../server";
import Ratings from "../Products/Ratings";
import { getAllEventsShop } from "../../redux/actions/event";
import {
  MdStore,
  MdEvent,
  MdStar,
  MdDashboard,
  MdTrendingUp,
} from "react-icons/md";
import { HiOutlineChartBar } from "react-icons/hi";
import { IoSparkles } from "react-icons/io5";

const ShopProfileData = ({ isOwner }) => {
  const { products } = useSelector((state) => state.products);
  const { events } = useSelector((state) => state.events);
  const { seller } = useSelector((state) => state.seller);
  const { id } = useParams();

  const dispatch = useDispatch();
  useEffect(() => {
    if (seller?._id) {
      dispatch(getAllEventsShop(seller._id));
    }
  }, [dispatch, seller?._id]);

  const [active, setActive] = useState(1);

  const allReviews =
    products && products.map((product) => product.reviews).flat();

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with Navigation Tabs */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActive(1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                active === 1
                  ? "bg-indigo-500 text-white shadow-lg transform scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <MdStore className="text-lg" />
              <span>Products ({products?.length || 0})</span>
            </button>

            <button
              onClick={() => setActive(2)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                active === 2
                  ? "bg-purple-500 text-white shadow-lg transform scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <MdEvent className="text-lg" />
              <span>Events ({events?.length || 0})</span>
            </button>

            <button
              onClick={() => setActive(3)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                active === 3
                  ? "bg-amber-500 text-white shadow-lg transform scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <MdStar className="text-lg" />
              <span>Reviews ({allReviews?.length || 0})</span>
            </button>
          </div>

          {/* Dashboard Button for Owner */}
          {isOwner && (
            <Link to="/dashboard" className="block">
              <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg">
                <MdDashboard className="text-lg" />
                <span>Go Dashboard</span>
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        {/* Products Tab */}
        {active === 1 && (
          <div>
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <MdStore className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Total Products
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {products?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <MdTrendingUp className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Total Sales
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {products?.reduce(
                        (acc, product) => acc + (product.sold_out || 0),
                        0
                      ) || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <HiOutlineChartBar className="text-white text-xl" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Categories
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {new Set(products?.map((p) => p.category)).size || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products &&
                products.map((i, index) => (
                  <ProductCard data={i} key={index} isShop={true} />
                ))}
            </div>

            {(!products || products.length === 0) && (
              <div className="text-center py-12">
                <MdStore className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Products Yet
                </h3>
                <p className="text-gray-500">
                  This shop hasn't added any products yet.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {active === 2 && (
          <div>
            {/* Events Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-500 p-3 rounded-xl">
                <IoSparkles className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Running Events
                </h2>
                <p className="text-gray-600">
                  Special offers and promotional events
                </p>
              </div>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {events &&
                events.map((i, index) => (
                  <ProductCard
                    data={i}
                    key={index}
                    isShop={true}
                    isEvent={true}
                  />
                ))}
            </div>

            {(!events || events.length === 0) && (
              <div className="text-center py-12">
                <MdEvent className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Events Running
                </h3>
                <p className="text-gray-500">
                  This shop doesn't have any active events at the moment.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {active === 3 && (
          <div>
            {/* Reviews Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-500 p-3 rounded-xl">
                <MdStar className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Customer Reviews
                </h2>
                <p className="text-gray-600">
                  What customers are saying about this shop
                </p>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {allReviews &&
                allReviews.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex gap-4">
                      <img
                        src={`${backend_url}/${item.user.avatar}`}
                        className="w-12 h-12 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                        alt={item.user.name}
                      />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h4 className="font-semibold text-gray-800">
                            {item.user.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Ratings rating={item.rating} />
                            <span className="text-sm text-gray-500">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {item?.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {(!allReviews || allReviews.length === 0) && (
              <div className="text-center py-12">
                <MdStar className="mx-auto text-6xl text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Reviews Yet
                </h3>
                <p className="text-gray-500">
                  This shop hasn't received any reviews yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProfileData;
