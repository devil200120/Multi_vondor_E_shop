import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/styles";
import {
  AiOutlineHeart,
  AiOutlineSearch,
  AiOutlineShoppingCart,
  AiOutlineUser,
} from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { BiMenuAltLeft } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { HiOutlineUserCircle } from "react-icons/hi";
import DropDown from "./DropDown";
import Navbar from "./Navbar";
import { useSelector, useDispatch } from "react-redux";
import { backend_url } from "../../server";
import { getAvatarUrl, getProductImageUrl } from "../../utils/mediaUtils";
import Cart from "../cart/Cart";
import Wishlist from "../Wishlist/Wishlist";
import GoogleTranslate from "./GoogleTranslate";
import { RxCross1 } from "react-icons/rx";
import { getRootCategoriesPublic } from "../../redux/actions/category";

const Header = ({ activeHeading }) => {
  const dispatch = useDispatch();
  const { isSeller, seller } = useSelector((state) => state.seller);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { allProducts } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState(null);
  const [active, setActive] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [openWishlist, setOpenWishlist] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu

  const dropdownRef = useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(getRootCategoriesPublic());
  }, [dispatch]);

  // Use API categories directly - already filtered to root categories
  const rootCategories = categories || [];

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
      {/* Thin Blue Top Bar */}
      <div className="bg-primary-500 h-2"></div>

      {/* Main Header with Logo and Navigation */}
      <div className="bg-white border-b-4 border-accent-500">
        <div className={`${styles.section}`}>
          <div className="hidden 800px:flex items-center justify-between py-3 gap-4">
            {/* Logo - Fixed width */}
            <div
              className="flex-shrink-0"
              style={{ minWidth: "140px", maxWidth: "140px" }}
            >
              <Link to="/">
                <img
                  src="/branding-logo-cayman.jpeg"
                  alt="Mall of Cayman"
                  className="h-14 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Navigation Links - Centered with even spacing */}
            <nav className="flex-1 flex items-center justify-center">
              <Navbar active={activeHeading} />
            </nav>

            {/* Right Side - Icons and Auth */}
            <div className="flex-shrink-0 flex items-center gap-4">
              {/* Search Icon */}
              <button className="text-primary-500 hover:text-primary-600 transition-colors">
                <AiOutlineSearch size={22} />
              </button>

              {/* Wishlist */}
              <button
                className="relative text-primary-500 hover:text-accent-500 transition-colors"
                onClick={() => setOpenWishlist(true)}
              >
                <AiOutlineHeart size={22} />
                {wishlist && wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                className="relative text-primary-500 hover:text-primary-600 transition-colors"
                onClick={() => setOpenCart(true)}
              >
                <AiOutlineShoppingCart size={22} />
                {cart && cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* Sign In / Register or Profile */}
              {isAuthenticated || isSeller ? (
                <Link
                  to={isSeller ? "/dashboard" : "/profile"}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                >
                  <img
                    src={getAvatarUrl(
                      isSeller ? seller?.avatar : user?.avatar,
                      backend_url
                    )}
                    className="w-7 h-7 rounded-full object-cover border border-white"
                    alt="Profile"
                  />
                  <span className="text-sm font-medium">
                    {isSeller ? "Dashboard" : "Profile"}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="text-primary-500 text-sm font-medium hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    className="px-5 py-2 bg-accent-500 text-white text-sm font-medium rounded-md hover:bg-accent-600 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Section */}
      <div
        className={`${
          active
            ? "shadow-md fixed top-0 left-0 z-50 bg-white"
            : "bg-gray-50 border-b border-gray-200"
        } transition-all duration-300 hidden 800px:block w-full`}
      >
        <div className={`${styles.section}`}>
          <div className="flex items-center justify-center py-3">
            {/* Search Box - Centered */}
            <div className="w-full max-w-2xl relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, stores..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-4 pr-12 py-2.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600 transition-colors">
                  <AiOutlineSearch size={18} />
                </button>
              </div>

              {searchData && searchData.length !== 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {searchData.map((product, index) => (
                    <Link
                      key={index}
                      to={`/product/${product._id}`}
                      className="block"
                      onClick={() => setSearchData(null)}
                    >
                      <div className="flex items-center p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
                        <img
                          src={getProductImageUrl(
                            product.images,
                            0,
                            backend_url
                          )}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded mr-3"
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-800 truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-primary-500 font-semibold">
                            ${product.discountPrice}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div
        className={`${
          active ? "shadow-moc fixed top-0 left-0 z-50" : ""
        } w-full h-16 bg-white border-b border-primary-100 800px:hidden`}
      >
        <div className="w-full flex items-center justify-between px-4 h-full">
          {/* Menu Button */}
          <div>
            <BiMenuAltLeft
              size={28}
              className="text-primary-500 cursor-pointer hover:text-primary-600 transition-all duration-200 hover:scale-110"
              onClick={() => setOpen(true)}
            />
          </div>

          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="group hover:scale-105 transition-all duration-300 ease-in-out"
            >
              <img
                src="/branding-logo-cayman.jpeg"
                alt="Mall of Cayman"
                className="h-24 w-auto object-contain transition-all duration-300"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,61,165,0.1))",
                  maxWidth: "280px",
                }}
              />
            </Link>
          </div>

          {/* Right Side Icons - Cart and Profile */}
          <div className="flex items-center space-x-3">
            {/* Profile/Login */}
            <div className="cursor-pointer">
              {isAuthenticated || isSeller ? (
                <Link to={isSeller ? "/dashboard" : "/profile"}>
                  <img
                    src={getAvatarUrl(
                      isSeller ? seller?.avatar : user?.avatar,
                      backend_url
                    )}
                    className="w-8 h-8 rounded-full object-cover border-2 border-primary-500"
                    alt="Profile"
                  />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="p-2 hover:bg-primary-50 rounded-lg transition-colors duration-200 block"
                >
                  <CgProfile
                    size={24}
                    className="text-primary-500 hover:text-primary-600 transition-colors duration-200"
                  />
                </Link>
              )}
            </div>

            {/* Cart Icon */}
            <div
              className="relative cursor-pointer p-2"
              onClick={() => setOpenCart(true)}
            >
              <AiOutlineShoppingCart size={24} className="text-primary-500" />
              {cart && cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
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
            className="fixed w-4/5 max-w-sm bg-white h-screen top-0 left-0 z-50 overflow-y-auto animate-slideInLeft shadow-moc-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Header - Mall of Cayman Branding */}
            <div className="flex items-center justify-between p-4 border-b border-primary-100 bg-primary-500 animate-slideIn">
              <div className="text-white font-bold text-lg">Mall of Cayman</div>
              <RxCross1
                size={24}
                className="text-white cursor-pointer hover:text-accent-300 hover:scale-110 transition-all duration-200"
                onClick={() => setOpen(false)}
              />
            </div>

            {/* Wishlist Quick Access */}
            <div className="p-4 border-b border-secondary-100 bg-primary-50">
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-white p-3 rounded-lg transition-all duration-200"
                onClick={() => {
                  setOpenWishlist(true);
                  setOpen(false);
                }}
              >
                <div className="flex items-center space-x-3">
                  <AiOutlineHeart size={24} className="text-accent-500" />
                  <span className="font-medium text-text-primary">
                    My Wishlist
                  </span>
                </div>
                {wishlist && wishlist.length > 0 && (
                  <span className="bg-accent-500 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div
              className="p-4 animate-slideIn"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="relative">
                <AiOutlineSearch
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-400"
                />
                <input
                  type="search"
                  placeholder="Search products, stores..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              {searchData && searchData.length > 0 && (
                <div className="absolute bg-white border border-secondary-200 rounded-lg shadow-moc-lg z-10 w-full left-0 mt-2 max-h-64 overflow-y-auto animate-slideInDown">
                  {searchData.map((product, index) => (
                    <Link
                      key={index}
                      to={`/product/${product._id}`}
                      onClick={() => {
                        setSearchData(null);
                        setOpen(false);
                      }}
                    >
                      <div className="flex items-center p-3 hover:bg-primary-50 border-b border-secondary-100 last:border-b-0">
                        <img
                          src={getProductImageUrl(
                            product.images,
                            0,
                            backend_url
                          )}
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
                <button className="w-full bg-accent-500 text-white font-medium py-3 rounded-lg hover:bg-accent-600 transition-colors duration-200 flex items-center justify-center hover:scale-105 transform">
                  {isSeller ? "Seller Dashboard" : "Become a Seller"}
                  <IoIosArrowForward className="ml-1" size={16} />
                </button>
              </Link>
            </div>

            {/* Profile Section */}
            <div
              className="p-4 border-t border-secondary-200 mt-4 animate-slideIn"
              style={{ animationDelay: "0.4s" }}
            >
              {isAuthenticated || isSeller ? (
                <div className="flex flex-col items-center space-y-3">
                  <Link
                    to={isSeller ? "/dashboard" : "/profile"}
                    onClick={() => setOpen(false)}
                  >
                    <img
                      src={getAvatarUrl(
                        isSeller ? seller?.avatar : user?.avatar,
                        backend_url
                      )}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-4 border-primary-500"
                    />
                  </Link>
                  <div className="text-center">
                    <p className="text-text-primary font-medium">
                      {isSeller ? seller?.name : user?.name}
                    </p>
                    <p className="text-text-muted text-sm">
                      {isSeller ? seller?.email : user?.email}
                    </p>
                  </div>
                  <Link
                    to={isSeller ? "/dashboard" : "/profile"}
                    onClick={() => setOpen(false)}
                    className="w-full bg-primary-500 text-white font-medium py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200 text-center"
                  >
                    {isSeller ? "Dashboard" : "View Profile"}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <HiOutlineUserCircle
                      size={48}
                      className="text-primary-300 mx-auto mb-2"
                    />
                    <p className="text-text-muted text-sm">
                      Welcome to Mall of Cayman!
                    </p>
                  </div>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="w-full bg-primary-500 text-white font-medium py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200 text-center block"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    onClick={() => setOpen(false)}
                    className="w-full border-2 border-accent-500 text-accent-500 font-medium py-3 rounded-lg hover:bg-accent-50 transition-colors duration-200 text-center block"
                  >
                    Register
                  </Link>
                </div>
              )}
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
