import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { Link } from "react-router-dom";
import { IoBagHandleOutline } from "react-icons/io5";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { backend_url } from "../../server";
import { addTocart, removeFromCart } from "../../redux/actions/cart";

const Cart = ({ setOpenCart }) => {
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  //remove from cart
  const removeFromCartHandler = (data) => {
    dispatch(removeFromCart(data));
  };

  // Total price
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  const quantityChangeHandler = (data) => {
    dispatch(addTocart(data));
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-black bg-opacity-75 h-screen z-[9999] animate-fadeIn">
      <div className="fixed top-0 right-0 h-full w-[80%] 800px:w-[25%] bg-white flex flex-col overflow-hidden shadow-unacademy-xl animate-slideInRight">
        {cart && cart.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 relative bg-white">
            <div className="absolute top-4 right-4 z-10">
              <RxCross1
                size={24}
                className="cursor-pointer text-text-secondary hover:text-red-500 transition-colors duration-200"
                onClick={() => setOpenCart(false)}
              />
            </div>
            <div className="text-center max-w-xs">
              <div className="w-16 h-16 mx-auto mb-6 bg-secondary-100 rounded-full flex items-center justify-center">
                <IoBagHandleOutline size={32} className="text-text-muted" />
              </div>
              <h5 className="text-xl font-semibold text-text-primary mb-2">
                Your cart is empty!
              </h5>
              <p className="text-sm text-text-muted leading-relaxed">
                Add some items to get started with your shopping
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto bg-white">
              {/* Cart Header */}
              <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-white sticky top-0 z-10">
                <div className="flex items-center">
                  <IoBagHandleOutline size={24} className="text-primary-500" />
                  <h5 className="ml-3 text-lg font-semibold text-text-primary">
                    Cart ({cart && cart.length}{" "}
                    {cart && cart.length === 1 ? "item" : "items"})
                  </h5>
                </div>
                <RxCross1
                  size={24}
                  className="cursor-pointer text-text-secondary hover:text-red-500 transition-colors duration-200"
                  onClick={() => setOpenCart(false)}
                />
              </div>

              {/* Cart Single item */}
              <div className="w-full">
                {cart &&
                  cart.map((i, index) => {
                    return (
                      <CartSingle
                        data={i}
                        key={index}
                        quantityChangeHandler={quantityChangeHandler}
                        removeFromCartHandler={removeFromCartHandler}
                      />
                    );
                  })}
              </div>
            </div>

            <div className="p-4 border-t border-secondary-200 bg-white">
              {/* Total Price Display */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-text-secondary">
                  Total:
                </span>
                <span className="text-lg font-bold text-text-primary">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="block"
                onClick={() => setOpenCart(false)}
              >
                <button className="w-full bg-primary-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors duration-200 flex items-center justify-center">
                  <span>Checkout Now</span>
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CartSingle = ({ data, quantityChangeHandler, removeFromCartHandler }) => {
  const [value, setValue] = useState(data.qty);
  const totalPrice = data.discountPrice * value;

  const increment = (data) => {
    if (data.stock < value) {
      toast.error("Product stock limited!");
    } else {
      setValue(value + 1);
      const updateCartData = { ...data, qty: value + 1 };
      quantityChangeHandler(updateCartData);
    }
  };

  const decrement = (data) => {
    setValue(value === 1 ? 1 : value - 1);
    const updateCartData = { ...data, qty: value === 1 ? 1 : value - 1 };
    quantityChangeHandler(updateCartData);
  };

  return (
    <div className="border-b border-secondary-100 p-4 hover:bg-secondary-50 transition-colors duration-200">
      <div className="flex items-start space-x-3">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={`${backend_url}${data?.images[0]}`}
            className="w-16 h-16 object-cover rounded-lg border border-secondary-200"
            alt={data.name}
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-text-primary truncate mb-1">
            {data.name}
          </h3>
          <p className="text-xs text-text-muted mb-2">
            ₹{data.discountPrice} each
          </p>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2 mb-2">
            <button
              className="w-6 h-6 rounded-full bg-secondary-200 hover:bg-secondary-300 flex items-center justify-center transition-colors duration-200"
              onClick={() => decrement(data)}
              disabled={value <= 1}
            >
              <HiOutlineMinus size={12} className="text-text-secondary" />
            </button>
            <span className="text-sm font-medium text-text-primary min-w-[1.5rem] text-center">
              {value}
            </span>
            <button
              className="w-6 h-6 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center transition-colors duration-200"
              onClick={() => increment(data)}
            >
              <HiPlus size={12} className="text-white" />
            </button>
          </div>

          {/* Total Price */}
          <p className="text-sm font-semibold text-primary-500">
            ₹{totalPrice.toFixed(2)}
          </p>
        </div>

        {/* Remove Button */}
        <button
          className="flex-shrink-0 p-1 hover:bg-red-50 rounded-full transition-colors duration-200"
          onClick={() => removeFromCartHandler(data)}
        >
          <RxCross1
            size={16}
            className="text-text-muted hover:text-red-500 transition-colors duration-200"
          />
        </button>
      </div>
    </div>
  );
};

export default Cart;
