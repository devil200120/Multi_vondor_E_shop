import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import HtmlCssEditor from "../../components/Shop/HtmlCssEditor";
import axios from "axios";
import { server } from "../../server";
import { FiLock } from "react-icons/fi";

const HtmlCssEditorPage = () => {
  const { seller } = useSelector((state) => state.seller);
  const navigate = useNavigate();
  const [hasFeature, setHasFeature] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFeature = async () => {
      try {
        const { data } = await axios.get(
          `${server}/subscription/my-subscription`,
          { withCredentials: true }
        );
        if (data.subscription?.features?.htmlCssEditor) {
          setHasFeature(true);
        } else {
          setHasFeature(false);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
        setHasFeature(false);
      } finally {
        setLoading(false);
      }
    };

    checkFeature();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <DashboardSideBar active={23} />
          </div>
          <div className="w-full flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasFeature) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex justify-between w-full">
          <div className="w-[80px] 800px:w-[330px]">
            <DashboardSideBar active={23} />
          </div>
          <div className="w-full flex flex-col items-center justify-center min-h-[500px] p-6">
            <div className="max-w-md text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiLock className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Gold Plan Feature
              </h2>
              <p className="text-gray-600 mb-6">
                The HTML/CSS Editor is a premium feature available only with the Gold plan.
                Upgrade your subscription to unlock custom HTML and CSS styling for your shop page.
              </p>
              <button
                onClick={() => navigate("/shop/subscriptions")}
                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all shadow-lg"
              >
                Upgrade to Gold Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex justify-between w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={23} />
        </div>
        <div className="w-full justify-center flex">
          <HtmlCssEditor />
        </div>
      </div>
    </div>
  );
};

export default HtmlCssEditorPage;
