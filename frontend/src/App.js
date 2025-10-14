import React, { useState, useEffect } from "react";
import "./App.css";
import Store from "./redux/store";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useGoogleTranslate } from "./hooks/useGoogleTranslate";
import axios from "axios";
import BanModal from "./components/BanDetection/BanModal";
import BanProtection from "./components/BanDetection/BanProtection";
import SellerBanProtection from "./components/BanDetection/SellerBanProtection";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import ShippingPolicyPage from "./pages/ShippingPolicyPage";
import AboutUsPage from "./pages/AboutUsPage";
import ReviewsPage from "./pages/ReviewsPage";
import {
  LoginPage,
  SignupPage,
  ActivationPage,
  HomePage,
  ProductsPage,
  BestSellingPage,
  EventsPage,
  FAQPage,
  CheckoutPage,
  PaymentPage,
  OrderSuccessPage,
  ProductDetailsPage,
  ProfilePage,
  ShopCreatePage,
  SellerActivationPage,
  ShopLoginPage,
  OrderDetailsPage,
  TrackOrderPage,
  UserInbox,
  UserForgotPasswordPage,
  UserResetPasswordPage,
} from "./routes/Routes";
import {
  ShopDashboardPage,
  ShopCreateProduct,
  ShopAllProducts,
  ShopCreateEvents,
  ShopAllEvents,
  ShopAllCoupouns,
  ShopPreviewPage,
  ShopAllOrders,
  ShopOrderDetails,
  ShopAllRefunds,
  ShopSettingsPage,
  ShopWithDrawMoneyPage,
  ShopInboxPage,
  ShopEditProductPage,
  ShopForgotPasswordPage,
  ShopResetPasswordPage,
  ShippingManagementPage,
} from "./routes/ShopRoutes";

import {
  AdminDashboardPage,
  AdminDashboardUsers,
  AdminDashboardSellers,
  AdminDashboardOrders,
  AdminDashboardProducts,
  AdminDashboardEvents,
  AdminDashboardWithdraw,
  AdminDashboardBanner,
  AdminDashboardCategories,
} from "./routes/AdminRoutes";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminOrderDetailsPage from "./pages/AdminOrderDetailsPage";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loadSeller, loadUser } from "./redux/actions/user";
import ProtectedRoute from "./routes/ProtectedRoute";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";
import SellerProtectedRoute from "./routes/SellerProtectedRoute";
import { ShopHomePage } from "./ShopRoutes";
import { getAllProducts } from "./redux/actions/product";
import { getAllEvents } from "./redux/actions/event";
import { server } from "./server";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const App = () => {
  const [stripeApikey, setStripeApiKey] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize Google Translate
  useGoogleTranslate();

  async function getStripeApikey() {
    try {
      const { data } = await axios.get(`${server}/payment/stripeapikey`);
      setStripeApiKey(data.stripeApikey);
    } catch (error) {
      console.log("Error loading stripe key:", error);
    }
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load user and seller data first (these actions handle their own errors)
        await Promise.all([
          Store.dispatch(loadUser()),
          Store.dispatch(loadSeller()),
        ]);
        
        // Load other data
        Store.dispatch(getAllProducts());
        Store.dispatch(getAllEvents());
        getStripeApikey();
        
        setIsInitialized(true);
      } catch (error) {
        console.log("Error initializing app:", error);
        setIsInitialized(true); // Set to true even on error to prevent infinite loading
      }
    };

    initializeApp();
  }, []);

  // Show loading screen while app is initializing
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
          <p className="text-gray-500">Initializing your shopping experience</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <BanModal />
      {stripeApikey && (
        <Elements stripe={loadStripe(stripeApikey)}>
          <Routes>
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <BanProtection>
                    <PaymentPage />
                  </BanProtection>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Elements>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignupPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/refund" element={<RefundPolicyPage />} />
        <Route path="/shipping" element={<ShippingPolicyPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/forgot-password" element={<UserForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<UserResetPasswordPage />} />
        <Route
          path="/activation/:activation_token"
          element={<ActivationPage />}
        />
        <Route
          path="/seller/activation/:activation_token"
          element={<SellerActivationPage />}
        />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/best-selling" element={<BestSellingPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <BanProtection>
                <CheckoutPage />
              </BanProtection>
            </ProtectedRoute>
          }
        />

        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <BanProtection>
                <ProfilePage />
              </BanProtection>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <BanProtection>
                <UserInbox />
              </BanProtection>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/order/:id"
          element={
            <ProtectedRoute>
              <BanProtection>
                <OrderDetailsPage />
              </BanProtection>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/track/order/:id"
          element={
            <ProtectedRoute>
              <BanProtection>
                <TrackOrderPage />
              </BanProtection>
            </ProtectedRoute>
          }
        />

        <Route path="/shop/preview/:id" element={<ShopPreviewPage />} />
        {/* shop Routes */}
        <Route path="/shop-create" element={<ShopCreatePage />} />
        <Route path="/shop-login" element={<ShopLoginPage />} />
        <Route path="/shop-forgot-password" element={<ShopForgotPasswordPage />} />
        <Route path="/shop-reset-password/:token" element={<ShopResetPasswordPage />} />
        <Route
          path="/shop/:id"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopHomePage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopSettingsPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-shipping"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShippingManagementPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopDashboardPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-create-product"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopCreateProduct />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-edit-product/:id"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopEditProductPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-orders"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopAllOrders />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-refunds"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopAllRefunds />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/order/:id"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopOrderDetails />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-products"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopAllProducts />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-withdraw-money"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopWithDrawMoneyPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-messages"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopInboxPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-create-event"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopCreateEvents />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-events"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopAllEvents />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />
        <Route
          path="/dashboard-coupouns"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopAllCoupouns />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedAdminRoute>
              <AdminAnalyticsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-users"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardUsers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-sellers"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardSellers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-orders"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardOrders />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/order/:id"
          element={
            <ProtectedAdminRoute>
              <AdminOrderDetailsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-products"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardProducts />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-events"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardEvents />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-banner"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardBanner />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-categories"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardCategories />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-withdraw-request"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardWithdraw />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </BrowserRouter>
  );
};
export default App;
