import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { RxCross1 } from "react-icons/rx";
import Lottie from "react-lottie";
import * as loadingAnimationData from "../../Assests/animations/loading.json";
import { getProductImageUrl } from "../../utils/mediaUtils";
import { useCurrency } from "../../context/CurrencyContext";

const Payment = () => {
  const [orderData, setOrderData] = useState([]);
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCodProcessing, setIsCodProcessing] = useState(false);
  const [isPhonePeProcessing, setIsPhonePeProcessing] = useState(false);
  const [sellerPayPalEmail, setSellerPayPalEmail] = useState(null);
  const [sellerShopName, setSellerShopName] = useState("Shop");
  const { user } = useSelector((state) => state.user);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  // Loading animation configuration
  const loadingOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimationData.default || loadingAnimationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  // Enhanced loading spinner component
  const LoadingSpinner = ({ text = "Processing..." }) => (
    <div className="flex items-center justify-center space-x-3">
      {/* Animated dots */}
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-2 h-2 bg-white rounded-full animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>

      {/* Spinner */}
      <div className="relative">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
        <div className="absolute inset-0 animate-ping rounded-full h-6 w-6 border border-white opacity-25"></div>
      </div>

      {/* Text with pulse effect */}
      <span className="text-[16px] font-[600] animate-pulse">{text}</span>
    </div>
  );

  useEffect(() => {
    const orderData = JSON.parse(localStorage.getItem("latestOrder"));
    setOrderData(orderData);

    // Fetch seller's PayPal email if shopId exists
    if (orderData?.shopId) {
      fetchSellerPayPalEmail(orderData.shopId);
    }
  }, []);

  const fetchSellerPayPalEmail = async (shopId) => {
    try {
      const response = await axios.get(
        `${server}/shop/get-shop-info/${shopId}`
      );
      if (response.data.success && response.data.shop) {
        const shop = response.data.shop;
        setSellerPayPalEmail(shop.paypalEmail);
        setSellerShopName(shop.name);

        if (!shop.paypalEmail) {
          console.warn(
            "⚠️ Seller has not configured PayPal email. Payment will go to platform."
          );
          toast.warning(
            "Seller hasn't set up PayPal. Payment will be processed manually."
          );
        } else {
          console.log(`✅ Seller PayPal email found: ${shop.paypalEmail}`);
        }
      }
    } catch (error) {
      console.error("Error fetching seller PayPal email:", error);
      toast.warning(
        "Could not fetch seller payment info. Using default payment method."
      );
    }
  };

  // PayPal - Direct payment to seller
  const createOrder = (data, actions) => {
    const purchaseUnit = {
      description: `Order from ${sellerShopName}`,
      amount: {
        currency_code: "USD",
        value: orderData?.totalPrice,
      },
    };

    // If seller has PayPal email, send money DIRECTLY to seller
    if (sellerPayPalEmail) {
      purchaseUnit.payee = {
        email_address: sellerPayPalEmail,
      };
      console.log(
        `💰 Payment will go DIRECTLY to seller: ${sellerPayPalEmail}`
      );
    } else {
      console.log(`⚠️ No seller PayPal email - payment will go to platform`);
    }

    return actions.order
      .create({
        purchase_units: [purchaseUnit],
        // not needed if a shipping address is actually needed
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
      })
      .then((orderID) => {
        return orderID;
      });
  };

  const order = {
    cart: orderData?.cart,
    shippingAddress: orderData?.shippingAddress,
    user: user && user,
    totalPrice: orderData?.totalPrice,
    subTotalPrice: orderData?.subTotalPrice,
    shippingPrice: orderData?.shipping,
    discountPrice: orderData?.discountPrice,
    tax: orderData?.tax || 0,
  };

  const onApprove = async (data, actions) => {
    return actions.order.capture().then(function (details) {
      const { payer } = details;

      let paymentInfo = payer;

      if (paymentInfo !== undefined) {
        paypalPaymentHandler(paymentInfo);
      }
    });
  };

  const paypalPaymentHandler = async (paymentInfo) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    order.paymentInfo = {
      id: paymentInfo.payer_id,
      status: "succeeded",
      type: "Paypal",
    };

    await axios
      .post(`${server}/order/create-order`, order, config)
      .then((res) => {
        setOpen(false);
        // Store order data for success page
        localStorage.setItem(
          "latestOrderData",
          JSON.stringify({
            orders: res.data.orders,
            paymentMethod: res.data.paymentMethod,
            totalAmount: orderData?.totalPrice,
            user: user,
            timestamp: new Date().toISOString(),
          })
        );
        navigate("/order/success");
        toast.success("Order successful!");
        localStorage.setItem("cartItems", JSON.stringify([]));
        localStorage.setItem("latestOrder", JSON.stringify([]));
      });
  };

  const paymentData = {
    amount: Math.round(orderData?.totalPrice * 100),
  };

  const paymentHandler = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        `${server}/payment/process`,
        paymentData,
        config
      );

      const client_secret = data.client_secret;

      if (!stripe || !elements) return;
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else {
        if (result.paymentIntent.status === "succeeded") {
          order.paymentInfo = {
            id: result.paymentIntent.id,
            status: result.paymentIntent.status,
            type: "Credit Card",
          };

          await axios
            .post(`${server}/order/create-order`, order, config)
            .then((res) => {
              setOpen(false);
              // Store order data for success page
              localStorage.setItem(
                "latestOrderData",
                JSON.stringify({
                  orders: res.data.orders,
                  paymentMethod: res.data.paymentMethod,
                  totalAmount: orderData?.totalPrice,
                  user: user,
                  timestamp: new Date().toISOString(),
                })
              );
              navigate("/order/success");
              toast.success("Order successful!");
              localStorage.setItem("cartItems", JSON.stringify([]));
              localStorage.setItem("latestOrder", JSON.stringify([]));
            });
        }
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  //  Cash on Delevery Handler (COD)
  const cashOnDeliveryHandler = async (e) => {
    e.preventDefault();
    setIsCodProcessing(true);

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    order.paymentInfo = {
      type: "Cash On Delivery",
    };

    await axios
      .post(`${server}/order/create-order`, order, config)
      .then((res) => {
        setOpen(false);
        // Store order data for success page
        localStorage.setItem(
          "latestOrderData",
          JSON.stringify({
            orders: res.data.orders,
            paymentMethod: res.data.paymentMethod,
            totalAmount: orderData?.totalPrice,
            user: user,
            timestamp: new Date().toISOString(),
          })
        );
        navigate("/order/success");
        toast.success("Order successful!");
        localStorage.setItem("cartItems", JSON.stringify([]));
        localStorage.setItem("latestOrder", JSON.stringify([]));
      });
  };

  // PhonePe Payment Handler
  const phonePePaymentHandler = async (e) => {
    e.preventDefault();
    setIsPhonePeProcessing(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      // Prepare PhonePe payment data
      const phonePeData = {
        amount: orderData?.totalPrice,
        orderId: `ORDER_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        userId: user?._id,
        userPhone: user?.phoneNumber || "9999999999", // Default phone if not available
        userName: user?.name,
        userEmail: user?.email,
      };

      // Initiate PhonePe payment
      const { data } = await axios.post(
        `${server}/payment/phonepe/initiate`,
        phonePeData,
        {
          ...config,
          withCredentials: true, // Include authentication cookies
        }
      );

      if (data.success) {
        // Store order data temporarily
        localStorage.setItem("tempOrderData", JSON.stringify(order));
        localStorage.setItem("tempPhonePeTransaction", data.transactionId);

        // Show test mode notification if applicable
        if (data.isTestMode) {
          toast.info("🧪 Redirecting to PhonePe Test Mode", {
            position: "top-center",
            autoClose: 2000,
          });
        }

        // Redirect to PhonePe payment page (real or test)
        window.location.href = data.paymentUrl;
      } else {
        toast.error("Failed to initiate PhonePe payment");
        setIsPhonePeProcessing(false);
      }
    } catch (error) {
      toast.error(
        "PhonePe payment failed: " +
          (error.response?.data?.message || error.message)
      );
      setIsPhonePeProcessing(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="w-[90%] 1000px:w-[70%] block 800px:flex">
        <div className="w-full 800px:w-[65%]">
          <PaymentInfo
            user={user}
            open={open}
            setOpen={setOpen}
            onApprove={onApprove}
            createOrder={createOrder}
            paymentHandler={paymentHandler}
            cashOnDeliveryHandler={cashOnDeliveryHandler}
            phonePePaymentHandler={phonePePaymentHandler}
            isProcessing={isProcessing}
            isCodProcessing={isCodProcessing}
            isPhonePeProcessing={isPhonePeProcessing}
            loadingOptions={loadingOptions}
            LoadingSpinner={LoadingSpinner}
          />
        </div>
        <div className="w-full 800px:w-[35%] 800px:mt-0 mt-8">
          <CartData orderData={orderData} />
        </div>
      </div>
    </div>
  );
};

const PaymentInfo = ({
  user,
  open,
  setOpen,
  onApprove,
  createOrder,
  paymentHandler,
  cashOnDeliveryHandler,
  phonePePaymentHandler,
  isProcessing,
  isCodProcessing,
  isPhonePeProcessing,
  loadingOptions,
  LoadingSpinner,
}) => {
  const [select, setSelect] = useState(1);

  return (
    <div className="w-full 800px:w-[95%] bg-[#fff] rounded-md p-5 pb-8">
      {/* select buttons */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
            onClick={() => setSelect(1)}
          >
            {select === 1 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
            Pay with Debit/credit card
          </h4>
        </div>

        {/* pay with card */}
        {select === 1 ? (
          <div className="w-full flex border-b">
            <form className="w-full" onSubmit={paymentHandler}>
              <div className="w-full flex pb-3">
                <div className="w-[50%]">
                  <label className="block pb-2">Name on Card</label>
                  <input
                    required
                    value={user && user.name}
                    className={`${styles.input} !w-[95%]`}
                  />
                </div>
                <div className="w-[50%]">
                  <label className="block pb-2">Exp Date</label>
                  <CardExpiryElement
                    className={`${styles.input}`}
                    options={{
                      style: {
                        base: {
                          fontSize: "19px",
                          lineHeight: 1.5,
                          color: "#444",
                        },
                        empty: {
                          color: "#3a120a",
                          backgroundColor: "transparent",
                          "::placeholder": {
                            color: "#444",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="w-full flex pb-3">
                <div className="w-[50%]">
                  <label className="block pb-2">Name On Card</label>
                  <CardNumberElement
                    className={`${styles.input} !h-[35px] !w-[95%]`}
                    options={{
                      style: {
                        base: {
                          fontSize: "19px",
                          lineHeight: 1.5,
                          color: "#444",
                        },
                        empty: {
                          color: "#3a120a",
                          backgroundColor: "transparent",
                          "::placeholder": {
                            color: "#444",
                          },
                        },
                      },
                    }}
                  />
                </div>
                <div className="w-[50%]">
                  <label className="block pb-2">CVV</label>
                  <CardCvcElement
                    className={`${styles.input} !h-[35px]`}
                    options={{
                      style: {
                        base: {
                          fontSize: "19px",
                          lineHeight: 1.5,
                          color: "#444",
                        },
                        empty: {
                          color: "#3a120a",
                          backgroundColor: "transparent",
                          "::placeholder": {
                            color: "#444",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
              {isProcessing ? (
                <div
                  className={`${styles.button} !bg-gradient-to-r !from-[#f63b60] !to-[#ff4757] text-[#fff] h-[45px] rounded-[5px] flex items-center justify-center shadow-lg transform transition-all duration-200`}
                >
                  {loadingAnimationData ? (
                    <div className="flex items-center justify-center space-x-3">
                      <Lottie options={loadingOptions} width={30} height={30} />
                      <span className="text-[16px] font-[600] animate-pulse">
                        Processing Payment...
                      </span>
                      <div className="flex space-x-1 ml-2">
                        <div
                          className="w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <LoadingSpinner text="Processing Payment..." />
                  )}
                </div>
              ) : (
                <input
                  type="submit"
                  value="Submit"
                  disabled={isProcessing}
                  className={`${styles.button} !bg-[#f63b60] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600] disabled:opacity-50 disabled:cursor-not-allowed hover:!bg-[#e53e3e] transition-all duration-200 transform hover:scale-105`}
                />
              )}
            </form>
          </div>
        ) : null}
      </div>

      <br />
      {/* paypal payment */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
            onClick={() => setSelect(2)}
          >
            {select === 2 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
            Pay with Paypal
          </h4>
        </div>

        {/* pay with payment  */}
        {select === 2 ? (
          <div className="w-full flex border-b">
            <div
              className={`${styles.button} !bg-[#f63b60] text-white h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600]`}
              onClick={() => setOpen(true)}
            >
              pay Now
            </div>
            {open && (
              <div className="w-full fixed top-0 left-0 bg-[#00000039] h-screen flex items-center justify-center z-[99999]">
                <div className="w-full 800px:w-[40%] h-screen 800px:h-[80vh] bg-white rounded-[5px] shadow flex flex-col justify-center p-8 relative overflow-y-scroll">
                  <div className="w-full flex justify-end p-3">
                    <RxCross1
                      size={30}
                      className="cursor-pointer absolute top-5 right-3"
                      onClick={() => setOpen(false)}
                    />
                  </div>
                  <PayPalScriptProvider
                    options={{
                      "client-id":
                        "AW3P72fNSIFlkCnT3gaKSxCKKaTL09YBLL3d45J5Uc7JaXCNrYJoUiza6OqL87Kj7Sg7UbufGwCrQ7yA",
                      currency: "USD",
                    }}
                  >
                    <PayPalButtons
                      style={{ layout: "vertical" }}
                      onApprove={onApprove}
                      createOrder={createOrder}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <br />
      {/* cash on delivery */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
            onClick={() => setSelect(3)}
          >
            {select === 3 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1]">
            Cash on Delivery
          </h4>
        </div>

        {/* cash on delivery */}
        {select === 3 ? (
          <div className="w-full flex">
            <form className="w-full" onSubmit={cashOnDeliveryHandler}>
              {isCodProcessing ? (
                <div
                  className={`${styles.button} !bg-gradient-to-r !from-[#f63b60] !to-[#ff4757] text-[#fff] h-[45px] rounded-[5px] flex items-center justify-center w-full shadow-lg transform transition-all duration-200`}
                >
                  {loadingAnimationData ? (
                    <div className="flex items-center justify-center space-x-3">
                      <Lottie options={loadingOptions} width={30} height={30} />
                      <span className="text-[16px] font-[600] animate-pulse">
                        Confirming Order...
                      </span>
                      <div className="flex space-x-1 ml-2">
                        <div
                          className="w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <LoadingSpinner text="Confirming Order..." />
                  )}
                </div>
              ) : (
                <input
                  type="submit"
                  value="Confirm"
                  disabled={isCodProcessing}
                  className={`${styles.button} !bg-[#f63b60] text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600] disabled:opacity-50 disabled:cursor-not-allowed hover:!bg-[#e53e3e] transition-all duration-200 transform hover:scale-105`}
                />
              )}
            </form>
          </div>
        ) : null}
      </div>

      <br />
      {/* PhonePe payment */}
      <div>
        <div className="flex w-full pb-5 border-b mb-2">
          <div
            className="w-[25px] h-[25px] rounded-full bg-transparent border-[3px] border-[#1d1a1ab4] relative flex items-center justify-center"
            onClick={() => setSelect(4)}
          >
            {select === 4 ? (
              <div className="w-[13px] h-[13px] bg-[#1d1a1acb] rounded-full" />
            ) : null}
          </div>
          <h4 className="text-[18px] pl-2 font-[600] text-[#000000b1] flex items-center">
            Pay with PhonePe
            <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              UPI
            </span>
          </h4>
        </div>

        {/* PhonePe payment */}
        {select === 4 ? (
          <div className="w-full flex">
            <form className="w-full" onSubmit={phonePePaymentHandler}>
              <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h5 className="text-[14px] font-[500] text-purple-800 mb-2">
                  🚀 Quick & Secure UPI Payment
                </h5>
                <p className="text-[12px] text-purple-600">
                  Pay instantly using PhonePe, Google Pay, Paytm, or any UPI app
                </p>
              </div>

              {isPhonePeProcessing ? (
                <div
                  className={`${styles.button} !bg-gradient-to-r !from-purple-600 !to-purple-700 text-[#fff] h-[45px] rounded-[5px] flex items-center justify-center w-full shadow-lg transform transition-all duration-200`}
                >
                  {loadingAnimationData ? (
                    <div className="flex items-center justify-center space-x-3">
                      <Lottie options={loadingOptions} width={30} height={30} />
                      <span className="text-[16px] font-[600] animate-pulse">
                        Redirecting to PhonePe...
                      </span>
                      <div className="flex space-x-1 ml-2">
                        <div
                          className="w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-1 h-1 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <LoadingSpinner text="Redirecting to PhonePe..." />
                  )}
                </div>
              ) : (
                <input
                  type="submit"
                  value="Pay with PhonePe"
                  disabled={isPhonePeProcessing}
                  className={`${styles.button} !bg-gradient-to-r !from-purple-600 !to-purple-700 text-[#fff] h-[45px] rounded-[5px] cursor-pointer text-[18px] font-[600] disabled:opacity-50 disabled:cursor-not-allowed hover:!from-purple-700 hover:!to-purple-800 transition-all duration-200 transform hover:scale-105 shadow-lg`}
                />
              )}
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const CartData = ({ orderData }) => {
  const shipping =
    orderData?.shipping && !isNaN(orderData.shipping)
      ? Number(orderData.shipping).toFixed(2)
      : "0.00";

  return (
    <div className="w-full bg-[#fff] rounded-md p-5 pb-8">
      {/* Order Items Section */}
      {orderData?.cart && orderData.cart.length > 0 && (
        <div className="mb-6">
          <h3 className="text-[18px] font-[600] text-[#000000] mb-4">
            Order Items
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {orderData.cart.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 border border-[#00000010] rounded-lg"
              >
                {/* Product Image */}
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={getProductImageUrl(
                      item.images,
                      0,
                      process.env.REACT_APP_BACKEND_URL
                    )}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-md border border-[#00000010]"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/64x64/f0f0f0/999999?text=No+Image";
                    }}
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-[500] text-[#000] truncate">
                    {item.name}
                  </h4>

                  {/* Selected Attributes */}
                  {item.selectedAttributes &&
                    Object.keys(item.selectedAttributes).length > 0 && (
                      <div className="mt-1">
                        {Object.entries(item.selectedAttributes).map(
                          ([key, value]) => (
                            <span
                              key={key}
                              className="inline-block bg-[#f5f5f5] text-[#333] text-[12px] px-2 py-1 rounded-md mr-2 mb-1"
                            >
                              {key}: {value}
                            </span>
                          )
                        )}
                      </div>
                    )}

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[12px] text-[#666]">
                      Qty: {item.qty}
                    </span>
                    <div className="flex flex-col items-end">
                      {/* Show final price if available (when attributes have price variations) */}
                      {item.finalPrice ? (
                        <>
                          <span className="text-[14px] font-[600] text-[#f63b60]">
                            {formatPrice(item.finalPrice * item.qty)}
                          </span>
                          {item.finalPrice !== item.discountPrice && (
                            <span className="text-[12px] text-[#999] line-through">
                              {formatPrice(item.discountPrice * item.qty)}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[14px] font-[600] text-[#f63b60]">
                          {formatPrice(item.discountPrice * item.qty)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <hr className="my-4 border-[#00000010]" />
        </div>
      )}

      {/* Price Summary */}
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">subtotal:</h3>
        <h5 className="text-[18px] font-[600]">
          {formatPrice(
            orderData?.subTotalPrice && !isNaN(orderData.subTotalPrice)
              ? Number(orderData.subTotalPrice)
              : 0
          )}
        </h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">shipping:</h3>
        <h5 className="text-[18px] font-[600]">{formatPrice(shipping)}</h5>
      </div>
      <br />
      <div className="flex justify-between">
        <h3 className="text-[16px] font-[400] text-[#000000a4]">Discount:</h3>
        <h5 className="text-[18px] font-[600]">
          {orderData?.discountPrice
            ? formatPrice(orderData.discountPrice)
            : "-"}
        </h5>
      </div>

      <div className="flex justify-between border-t pt-3 mt-3">
        <h3 className="text-[18px] font-[600] text-[#000000]">Total:</h3>
        <h5 className="text-[18px] font-[600]">
          {formatPrice(
            orderData?.totalPrice && !isNaN(orderData.totalPrice)
              ? Number(orderData.totalPrice)
              : 0
          )}
        </h5>
      </div>
      <br />
    </div>
  );
};

export default Payment;
