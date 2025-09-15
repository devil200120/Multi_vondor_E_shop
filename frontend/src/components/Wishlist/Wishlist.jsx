import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import { BsCartPlus } from "react-icons/bs";
import { AiOutlineHeart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { removeFromWishlist } from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import { backend_url } from "../../server";

const Wishlist = ({ setOpenWishlist }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const removeFromWishlistHandler = (data) => {
    dispatch(removeFromWishlist(data));
  };

  const addToCartHandler = (data) => {
    const newData = { ...data, qty: 1 };
    dispatch(addTocart(newData));
    setOpenWishlist(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-black bg-opacity-75 h-screen z-[9999] animate-fadeIn">
      <div className="fixed top-0 right-0 h-full w-[80%] 800px:w-[25%] bg-white flex flex-col overflow-hidden shadow-unacademy-xl animate-slideInRight">
        {wishlist && wishlist.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 relative bg-white">
            <div className="absolute top-4 right-4 z-10">
              <RxCross1
                size={24}
                className="cursor-pointer text-text-secondary hover:text-red-500 transition-colors duration-200"
                onClick={() => setOpenWishlist(false)}
              />
            </div>
            <div className="text-center max-w-xs">
              <div className="w-16 h-16 mx-auto mb-6 bg-red-50 rounded-full flex items-center justify-center">
                <AiOutlineHeart size={32} className="text-red-400" />
              </div>
              <h5 className="text-xl font-semibold text-text-primary mb-2">
                Your wishlist is empty!
              </h5>
              <p className="text-sm text-text-muted leading-relaxed">
                Save items you like to your wishlist and shop them later
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto bg-white">
              {/* Wishlist Header */}
              <div className="flex items-center justify-between p-4 border-b border-secondary-200 bg-white sticky top-0 z-10">
                <div className="flex items-center">
                  <AiOutlineHeart size={24} className="text-red-500" />
                  <h5 className="ml-3 text-lg font-semibold text-text-primary">
                    Wishlist ({wishlist && wishlist.length}{" "}
                    {wishlist && wishlist.length === 1 ? "item" : "items"})
                  </h5>
                </div>
                <RxCross1
                  size={24}
                  className="cursor-pointer text-text-secondary hover:text-red-500 transition-colors duration-200"
                  onClick={() => setOpenWishlist(false)}
                />
              </div>

              {/* Wishlist Items */}
              <div className="w-full">
                {wishlist &&
                  wishlist.map((i, index) => {
                    return (
                      <CartSingle
                        data={i}
                        key={index}
                        removeFromWishlistHandler={removeFromWishlistHandler}
                        addToCartHandler={addToCartHandler}
                      />
                    );
                  })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CartSingle = ({ data, removeFromWishlistHandler, addToCartHandler }) => {
  const [value] = useState(1);
  const totalPrice = data.discountPrice * value;

  return (
    <div className="border-b border-secondary-100 p-4 hover:bg-secondary-50 transition-colors duration-200">
      <div className="flex items-start space-x-3">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <img
            src={`${backend_url}${data?.images[0]}`}
            alt={data.name}
            className="w-16 h-16 object-cover rounded-lg border border-secondary-200"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-text-primary truncate mb-1">
            {data.name}
          </h3>
          <p className="text-lg font-semibold text-primary-500 mb-3">
            ₹{totalPrice.toFixed(2)}
          </p>

          {/* Action Button */}
          <button
            className="inline-flex items-center px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-md hover:bg-primary-600 transition-colors duration-200"
            onClick={() => addToCartHandler(data)}
          >
            <BsCartPlus size={14} className="mr-1.5" />
            Add to Cart
          </button>
        </div>

        {/* Remove Button */}
        <button
          className="flex-shrink-0 p-1 hover:bg-red-50 rounded-full transition-colors duration-200"
          onClick={() => removeFromWishlistHandler(data)}
          title="Remove from wishlist"
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

export default Wishlist;
