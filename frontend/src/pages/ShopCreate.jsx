import React, { useEffect } from "react";
import ShopCreate from "../components/Shop/ShopCreate";
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <ShopCreate />
    </div>
  );
};

export default ShopCreatePage;
