import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineEdit, AiOutlineSave, AiOutlineClose } from "react-icons/ai";
import { MdDiscount, MdOutlineAdsClick, MdFreeBreakfast } from "react-icons/md";
import { BiDollar } from "react-icons/bi";
import { BsGift } from "react-icons/bs";

const AdminAdPlanManagement = () => {
  const [adPlans, setAdPlans] = useState([]);
  const [durationDiscounts, setDurationDiscounts] = useState([
    { months: 1, discount: 0, label: "1 Month" },
    { months: 3, discount: 10, label: "3 Months" },
    { months: 6, discount: 15, label: "6 Months" },
    { months: 12, discount: 20, label: "12 Months" },
  ]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [saving, setSaving] = useState(false);

  // Default ad plans configuration
  const defaultAdPlans = [
    {
      adType: "leaderboard",
      name: "Leaderboard",
      size: "728x120",
      slots: 6,
      basePrice: 600,
      position: "Top of homepage",
      visibility: "Very High",
      isActive: true,
      isFree: false,
    },
    {
      adType: "top_sidebar",
      name: "Top Sidebar",
      size: "200x120",
      slots: 6,
      basePrice: 200,
      position: "Top sidebar",
      visibility: "High",
      isActive: true,
      isFree: false,
    },
    {
      adType: "right_sidebar_top",
      name: "Right Sidebar Top",
      size: "300x200",
      slots: 6,
      basePrice: 300,
      position: "Right sidebar top",
      visibility: "High",
      isActive: true,
      isFree: false,
    },
    {
      adType: "right_sidebar_middle",
      name: "Right Sidebar Middle",
      size: "300x200",
      slots: 6,
      basePrice: 250,
      position: "Right sidebar middle",
      visibility: "Medium",
      isActive: true,
      isFree: false,
    },
    {
      adType: "right_sidebar_bottom",
      name: "Right Sidebar Bottom",
      size: "300x200",
      slots: 6,
      basePrice: 200,
      position: "Right sidebar bottom",
      visibility: "Medium",
      isActive: true,
      isFree: false,
    },
    {
      adType: "featured_store",
      name: "Featured Store",
      size: "Store Card",
      slots: null,
      basePrice: 100,
      position: "Featured stores section",
      visibility: "Very High",
      isActive: true,
      isFree: false,
    },
    {
      adType: "featured_product",
      name: "Featured Product",
      size: "Product Card",
      slots: null,
      basePrice: 50,
      position: "Featured products section",
      visibility: "Very High",
      isActive: true,
      isFree: false,
    },
    {
      adType: "newsletter_inclusion",
      name: "Newsletter Inclusion",
      size: "Email Banner",
      slots: null,
      basePrice: 100,
      position: "Newsletter emails",
      visibility: "High",
      isActive: true,
      isFree: false,
    },
    {
      adType: "editorial_writeup",
      name: "Editorial Write-up",
      size: "Article",
      slots: null,
      basePrice: 300,
      position: "Blog/Editorial section",
      visibility: "Very High",
      isActive: true,
      isFree: false,
    },
  ];

  useEffect(() => {
    fetchAdPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdPlans = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${server}/advertisement/admin/plans`, {
        withCredentials: true,
      });

      if (data.success && data.plans?.length > 0) {
        setAdPlans(data.plans);
        if (data.durationDiscounts) {
          setDurationDiscounts(data.durationDiscounts);
        }
      } else {
        // Use default plans if none exist
        setAdPlans(defaultAdPlans);
      }
    } catch (error) {
      console.error("Error fetching ad plans:", error);
      // Use default plans on error
      setAdPlans(defaultAdPlans);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan({ ...plan });
  };

  const handleSavePlan = async () => {
    try {
      setSaving(true);
      const { data } = await axios.put(
        `${server}/advertisement/admin/update-plan`,
        editingPlan,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Ad plan updated successfully");
        setAdPlans(
          adPlans.map((p) =>
            p.adType === editingPlan.adType ? editingPlan : p
          )
        );
        setEditingPlan(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update plan");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePlan = async (adType) => {
    try {
      const plan = adPlans.find((p) => p.adType === adType);
      const { data } = await axios.put(
        `${server}/advertisement/admin/toggle-plan/${adType}`,
        { isActive: !plan.isActive },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(
          `${plan.name} ${plan.isActive ? "disabled" : "enabled"} successfully`
        );
        setAdPlans(
          adPlans.map((p) =>
            p.adType === adType ? { ...p, isActive: !p.isActive } : p
          )
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to toggle plan");
    }
  };

  const handleToggleFree = async (adType) => {
    try {
      const plan = adPlans.find((p) => p.adType === adType);
      const { data } = await axios.put(
        `${server}/advertisement/admin/toggle-free/${adType}`,
        { isFree: !plan.isFree },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success(
          `${plan.name} is now ${plan.isFree ? "PAID" : "FREE"} for testing`
        );
        setAdPlans(
          adPlans.map((p) =>
            p.adType === adType ? { ...p, isFree: !p.isFree } : p
          )
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to toggle free mode"
      );
    }
  };

  const handleSaveDiscounts = async () => {
    try {
      setSaving(true);
      const { data } = await axios.put(
        `${server}/advertisement/admin/update-discounts`,
        { durationDiscounts },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Duration discounts updated successfully");
        setEditingDiscount(null);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update discounts"
      );
    } finally {
      setSaving(false);
    }
  };

  const getVisibilityColor = (visibility) => {
    switch (visibility) {
      case "Very High":
        return "bg-green-100 text-green-800";
      case "High":
        return "bg-blue-100 text-blue-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full mx-8 pt-1 mt-10 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="flex items-center space-x-3">
          <MdOutlineAdsClick className="w-8 h-8 text-white" />
          <div>
            <h2 className="text-2xl font-bold text-white">
              Advertisement Plan Management
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              Configure ad types, pricing, slots, and discounts
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Duration Discounts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <MdDiscount className="w-5 h-5 mr-2 text-green-600" />
              Duration Discounts
            </h3>
            {editingDiscount ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDiscounts}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                >
                  <AiOutlineSave /> Save
                </button>
                <button
                  onClick={() => setEditingDiscount(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center gap-1"
                >
                  <AiOutlineClose /> Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingDiscount(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <AiOutlineEdit /> Edit Discounts
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {durationDiscounts.map((discount, index) => (
              <div
                key={discount.months}
                className={`p-4 rounded-lg border-2 ${
                  discount.discount > 0
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">
                    {discount.label}
                  </div>
                  {editingDiscount ? (
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={discount.discount}
                      onChange={(e) => {
                        const newDiscounts = [...durationDiscounts];
                        newDiscounts[index].discount = parseInt(e.target.value);
                        setDurationDiscounts(newDiscounts);
                      }}
                      className="w-20 text-center text-2xl font-bold mt-2 border border-gray-300 rounded-lg"
                    />
                  ) : (
                    <div
                      className={`text-3xl font-bold mt-2 ${
                        discount.discount > 0
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {discount.discount}%
                    </div>
                  )}
                  <div className="text-sm text-gray-600 mt-1">
                    {discount.discount > 0 ? "Discount" : "No Discount"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ad Plans Table */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <BiDollar className="w-5 h-5 mr-2 text-blue-600" />
            Advertisement Types & Pricing
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Ad Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Slots
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Base Price/Month
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">
                    <div className="flex items-center justify-center gap-1">
                      <BsGift className="text-green-600" />
                      Free Mode
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Visibility
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border-b">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {adPlans.map((plan) => (
                  <tr
                    key={plan.adType}
                    className={`border-b hover:bg-gray-50 ${
                      !plan.isActive ? "opacity-50 bg-gray-100" : ""
                    } ${plan.isFree ? "bg-green-50" : ""}`}
                  >
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleTogglePlan(plan.adType)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          plan.isActive ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            plan.isActive ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-800">
                        {plan.name}
                      </div>
                      <div className="text-xs text-gray-500">{plan.adType}</div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{plan.size}</td>
                    <td className="px-4 py-4">
                      {editingPlan?.adType === plan.adType ? (
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={editingPlan.slots || ""}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              slots: parseInt(e.target.value) || null,
                            })
                          }
                          className="w-16 px-2 py-1 border rounded"
                          disabled={!plan.slots}
                        />
                      ) : (
                        <span className="text-gray-600">
                          {plan.slots || "—"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {editingPlan?.adType === plan.adType ? (
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-1">$</span>
                          <input
                            type="number"
                            min="1"
                            value={editingPlan.basePrice}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                basePrice: parseInt(e.target.value),
                              })
                            }
                            className="w-20 px-2 py-1 border rounded"
                          />
                        </div>
                      ) : (
                        <span
                          className={`font-semibold ${
                            plan.isFree
                              ? "text-gray-400 line-through"
                              : "text-green-600"
                          }`}
                        >
                          ${plan.basePrice}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleFree(plan.adType)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          plan.isFree ? "bg-purple-500" : "bg-gray-300"
                        }`}
                        title={
                          plan.isFree
                            ? "Click to make PAID"
                            : "Click to make FREE for testing"
                        }
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            plan.isFree ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      {plan.isFree && (
                        <div className="text-[10px] text-purple-600 font-bold mt-1">
                          FREE
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-sm">
                      {plan.position}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getVisibilityColor(
                          plan.visibility
                        )}`}
                      >
                        {plan.visibility}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {editingPlan?.adType === plan.adType ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={handleSavePlan}
                            disabled={saving}
                            className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            <AiOutlineSave />
                          </button>
                          <button
                            onClick={() => setEditingPlan(null)}
                            className="p-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          >
                            <AiOutlineClose />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          <AiOutlineEdit />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-bold text-blue-800 mb-3">
            📋 Ad System Configuration Rules
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <ul className="space-y-2 list-disc list-inside">
              <li>Vendors only - customers cannot create ads</li>
              <li>Image & Video ads supported</li>
              <li>10-second rotation for banner placements</li>
              <li>Auto-renew enabled by default (one-off available)</li>
            </ul>
            <ul className="space-y-2 list-disc list-inside">
              <li>1-week expiration warning email sent automatically</li>
              <li>Ads link only to vendor store (validated)</li>
              <li>Payment required before admin approval</li>
              <li>Refund processed if ad is rejected</li>
            </ul>
          </div>
        </div>

        {/* Free Mode Warning */}
        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
            <BsGift className="w-5 h-5" />
            🧪 Free Mode (Testing Only)
          </h4>
          <div className="text-sm text-purple-700">
            <p className="mb-2">
              <strong>Free Mode</strong> allows sellers to create ads without
              payment for testing purposes.
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                Toggle <strong>Free Mode ON</strong> to allow free ad creation
                for that ad type
              </li>
              <li>Sellers will skip the payment step entirely</li>
              <li>Ads still require admin approval</li>
              <li>
                <strong className="text-red-600">
                  ⚠️ Remember to disable Free Mode after testing!
                </strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdPlanManagement;
