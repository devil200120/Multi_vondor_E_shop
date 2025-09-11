import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/styles";
import { categoriesData } from "../../static/data";
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { BiMenuAltLeft } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import DropDown from "./DropDown";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import { backend_url } from "../../server";
import Cart from "../cart/Cart";
import Wishlist from "../Wishlist/Wishlist";
import { RxCross1 } from "react-icons/rx";

const Header = ({ activeHeading }) => {
  const { isSeller } = useSelector((state) => state.seller);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { allProducts } = useSelector((state) => state.products);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState(null);
  const [active, setActive] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu

  const dropdownRef = useRef(null);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropDown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    // Filter products
    const filteredProducts =
      allProducts &&
      allProducts.filter((product) =>
        product.name.toLowerCase().includes(term.toLowerCase())
      );
    setSearchData(filteredProducts);
  };

  window.addEventListener("scroll", () => {
    if (window.scrollY > 70) {
      setActive(true);
    } else {
      setActive(false);
    }
  });

  return (
    <>
      {/* Top Header - Desktop */}
      <div className={`${styles.section} border-b border-secondary-200`}>
        <div className="hidden 800px:h-16 800px:my-4 800px:flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="hover:opacity-80 transition-opacity duration-200"
            >
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <span className="text-2xl font-bold text-text-primary">
                  EShop
                </span>
              </div>
            </Link>
          </div>

          {/* Search Box */}
          <div className={`${styles.search_container} mx-8`}>
            <div className="relative">
              <AiOutlineSearch size={20} className={`${styles.search_icon}`} />
              <input
                type="text"
                placeholder="Search for products, courses..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={`${styles.search_input}`}
              />
            </div>

            {searchData && searchData.length !== 0 && (
              <div className={`${styles.search_results} animate-slideInDown`}>
                {searchData.map((product, index) => (
                  <Link
                    key={index}
                    to={`/product/${product._id}`}
                    className="block"
                    onClick={() => setSearchData(null)}
                  >
                    <div className="flex items-center p-4 hover:bg-secondary-50 transition-colors duration-200 border-b border-secondary-100 last:border-b-0">
                      <img
                        src={`${backend_url}${product.images[0]}`}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-md mr-4"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-text-primary truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-text-muted mt-1">
                          ₹{product.discountPrice}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Become Seller Button */}
          <div>
            <Link to={`${isSeller ? "/dashboard" : "/shop-create"}`}>
              <button className={`${styles.button_secondary} text-sm`}>
                {isSeller ? "Dashboard" : "Become Seller"}
                <IoIosArrowForward className="ml-1" size={16} />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div
        className={`${
          active
            ? "shadow-unacademy-lg fixed top-0 left-0 z-50 bg-white"
            : "bg-white border-b border-secondary-200"
        } transition-all duration-300 hidden 800px:flex items-center justify-between w-full h-16`}
      >
        <div className={`${styles.section} ${styles.spaceBetween}`}>
          {/* Categories Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setDropDown(!dropDown)}
              className="relative h-12 w-64 hidden 1000px:block cursor-pointer"
            >
              <button className="h-full w-full flex items-center justify-between pl-4 pr-3 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 shadow-unacademy hover:shadow-unacademy-md">
                <div className="flex items-center">
                  <BiMenuAltLeft size={20} className="mr-2" />
                  <span className="text-sm">All Categories</span>
                </div>
                <IoIosArrowDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    dropDown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropDown && (
                <DropDown
                  categoriesData={categoriesData}
                  setDropDown={setDropDown}
                />
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center">
            <Navbar active={activeHeading} />
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <div
              className="relative cursor-pointer p-2 hover:bg-secondary-50 rounded-lg transition-colors duration-200"
              onClick={() => setOpenWishlist(true)}
            >
              <AiOutlineHeart
                size={24}
                className="text-text-secondary hover:text-primary-500 transition-colors duration-200"
              />
              {wishlist && wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </div>

            {/* Cart */}
            <div
              className="relative cursor-pointer p-2 hover:bg-secondary-50 rounded-lg transition-colors duration-200"
              onClick={() => setOpenCart(true)}
            >
              <AiOutlineShoppingCart
                size={24}
                className="text-text-secondary hover:text-primary-500 transition-colors duration-200"
              />
              {cart && cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>

            {/* Profile */}
            <div className="cursor-pointer">
              {isAuthenticated ? (
                <Link to="/profile" className="block">
                  <img
                    src={`${backend_url}${user.avatar}`}
                    className="w-8 h-8 rounded-full object-cover border-2 border-secondary-200 hover:border-primary-500 transition-colors duration-200"
                    alt="Profile"
                  />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="p-2 hover:bg-secondary-50 rounded-lg transition-colors duration-200 block"
                >
                  <CgProfile
                    size={24}
                    className="text-text-secondary hover:text-primary-500 transition-colors duration-200"
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div
        className={`${
          active ? "shadow-unacademy fixed top-0 left-0 z-50" : ""
        } w-full h-16 bg-white border-b border-secondary-200 800px:hidden`}
      >
        <div className="w-full flex items-center justify-between px-4 h-full">
          {/* Menu Button */}
          <div>
            <BiMenuAltLeft
              size={28}
              className="text-text-secondary cursor-pointer hover:text-primary-500 transition-all duration-200 hover:scale-110"
              onClick={() => setOpen(true)}
            />
          </div>

          {/* Logo */}
          <div>
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-lg font-bold text-text-primary">EShop</span>
            </Link>
          </div>

          {/* Cart Icon */}
          <div
            className="relative cursor-pointer p-2"
            onClick={() => setOpenCart(true)}
          >
            <AiOutlineShoppingCart size={24} className="text-text-secondary" />
            {cart && cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {open && (
        <div
          className="fixed w-full bg-black bg-opacity-50 z-40 h-full top-0 left-0 animate-fadeIn"
          onClick={() => setOpen(false)}
        >
          <div
            className="fixed w-4/5 max-w-sm bg-white h-screen top-0 left-0 z-50 overflow-y-auto animate-slideInLeft shadow-unacademy-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-200 animate-slideIn">
              <div
                className="relative cursor-pointer hover:scale-110 transition-transform duration-200"
                onClick={() => {
                  setOpenWishlist(true);
                  setOpen(false);
                }}
              >
                <AiOutlineHeart
                  size={24}
                  className="text-text-secondary hover:text-primary-500 transition-colors duration-200"
                />
                {wishlist && wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center animate-scaleIn">
                    {wishlist.length}
                  </span>
                )}
              </div>

              <RxCross1
                size={24}
                className="text-text-secondary cursor-pointer hover:text-red-500 hover:scale-110 transition-all duration-200"
                onClick={() => setOpen(false)}
              />
            </div>

            {/* Search Bar */}
            <div
              className="p-4 animate-slideIn"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="relative">
                <AiOutlineSearch
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"
                />
                <input
                  type="search"
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              {searchData && searchData.length > 0 && (
                <div className="absolute bg-white border border-secondary-200 rounded-lg shadow-unacademy-lg z-10 w-full left-0 mt-2 max-h-64 overflow-y-auto animate-slideInDown">
                  {searchData.map((product, index) => (
                    <Link
                      key={index}
                      to={`/product/${product._id}`}
                      onClick={() => {
                        setSearchData(null);
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center p-3 hover:bg-secondary-50 border-b border-secondary-100 last:border-b-0">
                        <img
                          src={`${backend_url}${product.images[0]}`}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded mr-3"
                        />
                        <h5 className="text-sm font-medium text-text-primary truncate">
                          {product.name}
                        </h5>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div
              className="px-4 animate-slideIn"
              style={{ animationDelay: "0.2s" }}
            >
              <Navbar active={activeHeading} />
            </div>

            {/* Become Seller Button */}
            <div
              className="p-4 animate-slideIn"
              style={{ animationDelay: "0.3s" }}
            >
              <Link to={`${isSeller ? "/dashboard" : "/shop-create"}`}>
                <button className="w-full bg-primary-500 text-white font-medium py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center hover:scale-105 transform">
                  {isSeller ? "Dashboard" : "Become Seller"}
                  <IoIosArrowForward className="ml-1" size={16} />
                </button>
              </Link>
            </div>

            {/* Profile Section */}
            <div
              className="p-4 border-t border-secondary-200 mt-4 animate-slideIn"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex justify-center">
                {isAuthenticated ? (
                  <Link to="/profile" onClick={() => setOpen(false)}>
                    <img
                      src={`${backend_url}${user.avatar}`}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-4 border-primary-500"
                    />
                  </Link>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      to="/login"
                      className="text-text-primary font-medium hover:text-primary-500 transition-colors duration-200"
                      onClick={() => setOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/sign-up"
                      className="text-text-primary font-medium hover:text-primary-500 transition-colors duration-200"
                      onClick={() => setOpen(false)}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popups */}
      {openCart && <Cart setOpenCart={setOpenCart} />}
      {openWishlist && <Wishlist setOpenWishlist={setOpenWishlist} />}
    </>
  );
};

export default Header;
