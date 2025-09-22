import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { backend_url, server } from "../../server";
import { getAvatarUrl } from "../../utils/mediaUtils";
import Loader from "../Layout/Loader";
import { toast } from "react-toastify";
import { logoutSeller } from "../../redux/actions/user";
import {
  MdLocationOn,
  MdPhone,
  MdStore,
  MdStar,
  MdCalendarToday,
  MdEdit,
  MdLogout,
} from "react-icons/md";
import { IoShieldCheckmark } from "react-icons/io5";
import { FiTrendingUp } from "react-icons/fi";
import { HiOutlineBadgeCheck } from "react-icons/hi";

const ShopInfo = ({ isOwner }) => {
  const [data, setData] = useState({});
  const { products } = useSelector((state) => state.products);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllProductsShop(id));
    setIsLoading(true);
    axios
      .get(`${server}/shop/get-shop-info/${id}`)
      .then((res) => {
        setData(res.data.shop);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }, [dispatch, id]);

  const logoutHandler = async () => {
    try {
      await dispatch(logoutSeller());
      toast.success("Logout successful!");
      navigate("/shop-login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Calculate total reviews and ratings more safely
  const totalReviewsLength =
    products?.reduce((acc, product) => {
      return acc + (product?.reviews?.length || 0);
    }, 0) || 0;

  const totalRatings =
    products?.reduce((acc, product) => {
      const productRatingSum =
        product?.reviews?.reduce((sum, review) => {
          return sum + (review?.rating || 0);
        }, 0) || 0;
      return acc + productRatingSum;
    }, 0) || 0;

  // Fix: Properly handle case when there are no reviews and round to 1 decimal
  const averageRating =
    totalReviewsLength > 0
      ? Math.round((totalRatings / totalReviewsLength) * 10) / 10
      : 0;

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section with Gradient */}
          <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              {/* Avatar and Badge */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={getAvatarUrl(data.avatar, backend_url)}
                    alt={data.name}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-3 border-white">
                    <IoShieldCheckmark className="text-white text-lg" />
                  </div>
                </div>

                {/* Shop Name and Badge */}
                <div className="text-center mt-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="text-white text-xl md:text-2xl font-bold">
                      {data.name}
                    </h3>
                    <HiOutlineBadgeCheck className="text-blue-200 text-xl" />
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-medium">
                      Verified Supplier
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {data.description && (
            <div className="p-4 border-b border-gray-100">
              <p className="text-gray-600 text-center leading-relaxed">
                {data.description}
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Total Products */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <MdStore className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      Products
                    </p>
                    <p className="text-xl font-bold text-gray-800">
                      {products?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shop Rating */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500 p-2 rounded-lg">
                    <MdStar className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Rating</p>
                    <div className="flex items-center gap-1">
                      {totalReviewsLength > 0 ? (
                        <>
                          <p className="text-xl font-bold text-gray-800">
                            {averageRating.toFixed(1)}
                          </p>
                          <span className="text-amber-500 text-sm">★</span>
                          <span className="text-gray-400 text-xs ml-1">
                            ({totalReviewsLength} reviews)
                          </span>
                        </>
                      ) : (
                        <div className="flex flex-col">
                          <p className="text-lg font-bold text-gray-500">
                            No Reviews
                          </p>
                          <span className="text-gray-400 text-xs">
                            Be the first to review!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 mb-6">
              {/* Address */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MdLocationOn className="text-gray-400 text-xl mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Address
                  </p>
                  <p className="text-gray-800 leading-relaxed">
                    {data.address}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MdPhone className="text-gray-400 text-xl mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Phone
                  </p>
                  <p className="text-gray-800 font-medium">
                    {data.phoneNumber}
                  </p>
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MdCalendarToday className="text-gray-400 text-xl mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Member Since
                  </p>
                  <p className="text-gray-800 font-medium">
                    {new Date(data?.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons for Owner */}
            {isOwner && (
              <div className="space-y-3">
                <Link to="/settings" className="block">
                  <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg">
                    <MdEdit className="text-lg" />
                    <span>Edit Shop</span>
                  </button>
                </Link>

                <button
                  onClick={logoutHandler}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg"
                >
                  <MdLogout className="text-lg" />
                  <span>Log Out</span>
                </button>
              </div>
            )}

            {/* Performance Badge */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <div className="flex items-center gap-3">
                <div className="bg-green-500 p-2 rounded-lg">
                  <FiTrendingUp className="text-white text-lg" />
                </div>
                <div>
                  <p className="text-green-700 font-semibold text-sm">
                    Trusted Supplier
                  </p>
                  <p className="text-green-600 text-xs">
                    Verified business with quality products
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShopInfo;
