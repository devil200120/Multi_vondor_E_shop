import React, { useEffect } from "react";
import ShopCreateWithSubscription from "../components/Shop/ShopCreateWithSubscription";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ShopCreatePage = () => {
  const navigate = useNavigate();
  const { isSeller, seller } = useSelector((state) => state.seller);
  // if user is login then redirect to home page
  useEffect(() => {
    if (isSeller === true) {
      navigate(`/shop/${seller._id}`);
    }
  });
  return (
    <div>
      <ShopCreateWithSubscription />
    </div>
  );
};

export default ShopCreatePage;
