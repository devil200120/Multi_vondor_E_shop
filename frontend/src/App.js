import React, { useState, useEffect } from "react";
import "./App.css";
import Store from "./redux/store";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useGoogleTranslate } from "./hooks/useGoogleTranslate";
import axios from "axios";
import { CurrencyProvider } from "./context/CurrencyContext";
import BanModal from "./components/BanDetection/BanModal";
import BanProtection from "./components/BanDetection/BanProtection";
import SellerBanProtection from "./components/BanDetection/SellerBanProtection";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import BuyerTermsOfServicePage from "./pages/BuyerTermsOfServicePage";
import SellerTermsOfServicePage from "./pages/SellerTermsOfServicePage";
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
  ProductShippingPage,
  SellerGSTSettingsPage,
  ShopVideoCallsPage,
  DashboardVideoBannersPage,
  DashboardCreateVideoBannerPage,
  DashboardEditVideoBannerPage,
  ShopAllAdvertisements,
  ShopCreateAdvertisement,
  ShopAdvertisementPricing,
  ShopAdvertisementPayment,
  ShopEditAdvertisement,
  ShopRenewAdvertisement,
  HtmlCssEditorPage,
} from "./routes/ShopRoutes";

import {
  AdminDashboardPage,
  AdminDashboardUsers,
  AdminDashboardSellers,
  AdminDashboardPendingSellers,
  AdminDashboardOrders,
  AdminDashboardProducts,
  AdminDashboardEvents,
  AdminDashboardWithdraw,
  AdminDashboardBanner,
  AdminDashboardCategories,
} from "./routes/AdminRoutes";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminOrderDetailsPage from "./pages/AdminOrderDetailsPage";
import AdminDashboardLegalPages from "./pages/AdminDashboardLegalPages";
import AdminReviewsPage from "./pages/AdminReviewsPage";
import AdminSiteSettingsPage from "./pages/AdminSiteSettingsPage";
import AdminCurrencySettingsPage from "./pages/AdminCurrencySettingsPage";
import AdminFAQPage from "./pages/AdminFAQPage";
import AdminVideoBannersPage from "./pages/AdminVideoBannersPage";
import CreateVideoBannerPage from "./pages/CreateVideoBannerPage";
import PhonePeSuccessPage from "./pages/PhonePeSuccessPage";
import PhonePeFailedPage from "./pages/PhonePeFailedPage";
import PhonePeTestPayment from "./pages/PhonePeTestPayment";
import SubscriptionPlansPage from "./pages/SubscriptionPlansPage";
import CommissionDashboardPage from "./pages/CommissionDashboardPage";
import InventoryAlertsPage from "./pages/InventoryAlertsPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import AdminSubscriptionsPage from "./pages/AdminSubscriptionsPage";
import AdminPlanManagementPage from "./pages/AdminPlanManagementPage";
import AdminReviewManagementPage from "./pages/AdminReviewManagementPage";
import AdminAdvertisementsPage from "./pages/AdminAdvertisementsPage";
import AdminAdPlanManagementPage from "./pages/AdminAdPlanManagementPage";
import ReviewManagementPage from "./pages/ReviewManagementPage";
import AdminDashboardStaff from "./pages/AdminDashboardStaff";
import AdminDashboardPendingProducts from "./pages/AdminDashboardPendingProducts";

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
import CustomerVideoCall from "./components/Customer/CustomerVideoCall";
import SellerVideoCall from "./components/Shop/SellerVideoCall";
import { SocketProvider } from "./contexts/SocketContext";

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
    <CurrencyProvider>
    <SocketProvider>
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
        <Route path="/buyer-terms" element={<BuyerTermsOfServicePage />} />
        <Route path="/seller-terms" element={<SellerTermsOfServicePage />} />
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
        <Route path="/phonepe/success" element={<PhonePeSuccessPage />} />
        <Route path="/phonepe/failed" element={<PhonePeFailedPage />} />
        <Route path="/phonepe/test-payment" element={<PhonePeTestPayment />} />
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
        {/* Public subscription plans page - anyone can view */}
        <Route path="/shop/subscriptions" element={<SubscriptionPlansPage />} />
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
          path="/dashboard-html-css-editor"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <HtmlCssEditorPage />
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
          path="/dashboard-product-shipping"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ProductShippingPage />
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
          path="/dashboard-video-calls"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopVideoCallsPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-video-banners"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <DashboardVideoBannersPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-create-video-banner"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <DashboardCreateVideoBannerPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-edit-video-banner/:id"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <DashboardEditVideoBannerPage />
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

        <Route
          path="/dashboard-advertisements"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopAllAdvertisements />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-create-advertisement"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopCreateAdvertisement />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-advertisement-pricing"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopAdvertisementPricing />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-advertisement-payment/:advertisementId"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopAdvertisementPayment />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-edit-advertisement/:id"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopEditAdvertisement />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-renew-advertisement/:id"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ShopRenewAdvertisement />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-gst-settings"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <SellerGSTSettingsPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-subscription"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <SubscriptionPlansPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-commissions"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <CommissionDashboardPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-inventory-alerts"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <InventoryAlertsPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/dashboard-reviews"
          element={
            <SellerProtectedRoute>
              <SellerBanProtection>
                <ReviewManagementPage />
              </SellerBanProtection>
            </SellerProtectedRoute>
          }
        />

        <Route
          path="/subscription-success"
          element={
            <SellerProtectedRoute>
              <SubscriptionSuccessPage />
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
          path="/admin-staff"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardStaff />
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
          path="/admin-pending-sellers"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPendingSellers />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-pending-products"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardPendingProducts />
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
          path="/admin-video-banners"
          element={
            <ProtectedAdminRoute>
              <AdminVideoBannersPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-create-video-banner"
          element={
            <ProtectedAdminRoute>
              <CreateVideoBannerPage />
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
          path="/admin-legal-pages"
          element={
            <ProtectedAdminRoute>
              <AdminDashboardLegalPages />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-reviews"
          element={
            <ProtectedAdminRoute>
              <AdminReviewsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-site-settings"
          element={
            <ProtectedAdminRoute>
              <AdminSiteSettingsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-currency-settings"
          element={
            <ProtectedAdminRoute>
              <AdminCurrencySettingsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-subscriptions"
          element={
            <ProtectedAdminRoute>
              <AdminSubscriptionsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-plan-management"
          element={
            <ProtectedAdminRoute>
              <AdminPlanManagementPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-advertisements"
          element={
            <ProtectedAdminRoute>
              <AdminAdvertisementsPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-ad-plans"
          element={
            <ProtectedAdminRoute>
              <AdminAdPlanManagementPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-review-management"
          element={
            <ProtectedAdminRoute>
              <AdminReviewManagementPage />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin-faq"
          element={
            <ProtectedAdminRoute>
              <AdminFAQPage />
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
      
      {/* Customer Video Call Component - Global */}
      <CustomerVideoCall />
      
      {/* Seller Video Call Component - Global */}
      <SellerVideoCall />
      
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
    </SocketProvider>
    </CurrencyProvider>
  );
};
export default App;
