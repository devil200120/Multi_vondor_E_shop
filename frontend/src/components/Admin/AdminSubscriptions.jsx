import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { HiCheck, HiClock, HiX, HiArrowUp, HiArrowDown, HiPlus } from "react-icons/hi";
import { RxCross1 } from "react-icons/rx";
import { FiEdit2, FiUserPlus } from "react-icons/fi";

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  
  // Modal states for changing subscription
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [newPlan, setNewPlan] = useState("");
  const [newBillingCycle, setNewBillingCycle] = useState("");
  const [changeReason, setChangeReason] = useState("");
  const [isChanging, setIsChanging] = useState(false);
  
  // Available plans
  const [availablePlans, setAvailablePlans] = useState({});
  
  // Shops without subscription
  const [shopsWithoutSub, setShopsWithoutSub] = useState([]);
  const [showUnsubscribed, setShowUnsubscribed] = useState(false);
  
  // Assign subscription modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [assignPlan, setAssignPlan] = useState("");
  const [assignBillingCycle, setAssignBillingCycle] = useState("monthly");
  const [assignDuration, setAssignDuration] = useState(1);
  const [assignIsFree, setAssignIsFree] = useState(false);
  const [assignReason, setAssignReason] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
    fetchPlans();
    fetchShopsWithoutSubscription();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await axios.get(
        `${server}/subscription/admin/all-subscriptions`,
        { withCredentials: true }
      );
      setSubscriptions(data.subscriptions);
    } catch (error) {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(
        `${server}/subscription/admin/subscription-stats`,
        { withCredentials: true }
      );
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to load stats");
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get(
        `${server}/subscription/admin/manage-plans`,
        { withCredentials: true }
      );
      setAvailablePlans(data.plans);
    } catch (error) {
      console.error("Failed to load plans");
    }
  };

  const fetchShopsWithoutSubscription = async () => {
    try {
      const { data } = await axios.get(
        `${server}/subscription/admin/shops-without-subscription`,
        { withCredentials: true }
      );
      console.log("Shops without subscription:", data.shops);
      setShopsWithoutSub(data.shops);
    } catch (error) {
      console.error("Failed to load shops without subscription:", error);
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    // Apply status filter
    const matchesFilter = filter === "all" || sub.status === filter;

    // Apply search filter
    const matchesSearch =
      !searchTerm ||
      sub.shop?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.shop?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleCancelSubscription = async (subscriptionId) => {
    if (!window.confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }

    setCancellingId(subscriptionId);
    try {
      await axios.put(
        `${server}/subscription/admin/cancel-subscription/${subscriptionId}`,
        {},
        { withCredentials: true }
      );
      toast.success("Subscription cancelled successfully");
      fetchSubscriptions();
      fetchStats();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to cancel subscription"
      );
    } finally {
      setCancellingId(null);
    }
  };

  const openChangeModal = (subscription) => {
    setSelectedSubscription(subscription);
    setNewPlan(subscription.plan);
    setNewBillingCycle(subscription.billingCycle);
    setChangeReason("");
    setChangeModalOpen(true);
  };

  const handleChangeSubscription = async () => {
    if (!newPlan) {
      toast.error("Please select a plan");
      return;
    }

    setIsChanging(true);
    try {
      const { data } = await axios.put(
        `${server}/subscription/admin/change-subscription/${selectedSubscription._id}`,
        {
          newPlan,
          billingCycle: newBillingCycle,
          reason: changeReason,
        },
        { withCredentials: true }
      );

      toast.success(data.message);
      setChangeModalOpen(false);
      setSelectedSubscription(null);
      fetchSubscriptions();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change subscription");
    } finally {
      setIsChanging(false);
    }
  };

  const getPlanOrder = (planName) => {
    const order = { free: 0, bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 };
    return order[planName?.toLowerCase()] || 0;
  };

  const getChangeType = (currentPlan, targetPlan) => {
    const currentOrder = getPlanOrder(currentPlan);
    const targetOrder = getPlanOrder(targetPlan);
    if (targetOrder > currentOrder) return "upgrade";
    if (targetOrder < currentOrder) return "downgrade";
    return "same";
  };

  // Open assign modal for a shop
  const openAssignModal = (shop) => {
    setSelectedShop(shop);
    setAssignPlan("");
    setAssignBillingCycle("monthly");
    setAssignDuration(1);
    setAssignIsFree(false);
    setAssignReason("");
    setAssignModalOpen(true);
  };

  // Handle assigning subscription to shop
  const handleAssignSubscription = async () => {
    if (!assignPlan) {
      toast.error("Please select a plan");
      return;
    }

    setIsAssigning(true);
    try {
      const { data } = await axios.post(
        `${server}/subscription/admin/create-subscription`,
        {
          shopId: selectedShop._id,
          plan: assignPlan,
          billingCycle: assignBillingCycle,
          durationMonths: assignDuration,
          isFree: assignIsFree,
          reason: assignReason,
        },
        { withCredentials: true }
      );

      toast.success(data.message);
      setAssignModalOpen(false);
      setSelectedShop(null);
      fetchSubscriptions();
      fetchStats();
      fetchShopsWithoutSubscription();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign subscription");
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-primary-600" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Subscription Management
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Shops"
          value={(stats?.total || 0) + shopsWithoutSub.length}
          color="blue"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats?.active || 0}
          color="green"
        />
        <StatCard
          title="Expiring Soon"
          value={stats?.expiringSoon || 0}
          color="yellow"
        />
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Without Subscription</p>
          <p className="text-3xl font-bold text-red-600">{shopsWithoutSub.length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by shop name, email, or plan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {["all", "active", "expired", "cancelled", "no-subscription"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              filter === status
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status === "no-subscription" ? "No Subscription" : status}
          </button>
        ))}
      </div>

      {/* Combined Subscriptions Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Shop
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Plan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Billing Cycle
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Start Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                End Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Shops without subscription */}
            {(filter === "all" || filter === "no-subscription") && shopsWithoutSub
              .filter(shop => 
                !searchTerm ||
                shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.email?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((shop) => (
              <tr key={`no-sub-${shop._id}`} className="hover:bg-red-50 bg-red-50/30">
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {shop.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {shop.email}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    No Subscription
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-400">-</td>
                <td className="px-4 py-3 text-sm text-gray-400">-</td>
                <td className="px-4 py-3 text-sm text-gray-400">-</td>
                <td className="px-4 py-3 text-sm text-gray-400">-</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <HiX className="w-3 h-3" />
                    None
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openAssignModal(shop)}
                    className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <HiPlus size={14} />
                    Assign
                  </button>
                </td>
              </tr>
            ))}
            {/* Shops with subscription */}
            {filter !== "no-subscription" && filteredSubscriptions.map((sub) => (
              <tr key={sub._id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {sub.shop?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {sub.shop?.email}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    sub.plan === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                    sub.plan === 'silver' ? 'bg-gray-200 text-gray-800' :
                    sub.plan === 'bronze' ? 'bg-orange-100 text-orange-800' :
                    sub.plan === 'free' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {sub.plan.replace("-", " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                  {sub.billingCycle.replace("-", " ")}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  ${sub.finalPrice}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(sub.startDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(sub.endDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    {sub.status === "active" && (
                      <>
                        <button
                          onClick={() => openChangeModal(sub)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-1"
                          title="Change Plan"
                        >
                          <FiEdit2 size={14} />
                          Change
                        </button>
                        <button
                          onClick={() => handleCancelSubscription(sub._id)}
                          disabled={cancellingId === sub._id}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingId === sub._id ? (
                            <span className="flex items-center gap-1">
                              <AiOutlineLoading3Quarters className="animate-spin w-3 h-3" />
                              ...
                            </span>
                          ) : (
                            "Cancel"
                          )}
                        </button>
                      </>
                    )}
                    {sub.status !== "active" && (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No subscriptions found
        </div>
      )}

      {/* Change Subscription Modal */}
      {changeModalOpen && selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Change Subscription Plan
              </h3>
              <button
                onClick={() => setChangeModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RxCross1 size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Current subscription info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Current Subscription</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{selectedSubscription.shop?.name}</p>
                  <p className="text-sm text-gray-500">{selectedSubscription.shop?.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  selectedSubscription.plan === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                  selectedSubscription.plan === 'silver' ? 'bg-gray-200 text-gray-800' :
                  selectedSubscription.plan === 'bronze' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {selectedSubscription.plan}
                </span>
              </div>
            </div>

            {/* New plan selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Plan
              </label>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(availablePlans).map(([planKey, planData]) => {
                  const changeType = getChangeType(selectedSubscription.plan, planKey);
                  const isCurrentPlan = planKey === selectedSubscription.plan;
                  
                  return (
                    <button
                      key={planKey}
                      onClick={() => setNewPlan(planKey)}
                      disabled={isCurrentPlan}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        newPlan === planKey
                          ? 'border-blue-500 bg-blue-50'
                          : isCurrentPlan
                          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 capitalize">{planData.name}</span>
                            {!isCurrentPlan && changeType === 'upgrade' && (
                              <span className="flex items-center text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                <HiArrowUp className="mr-1" /> Upgrade
                              </span>
                            )}
                            {!isCurrentPlan && changeType === 'downgrade' && (
                              <span className="flex items-center text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                                <HiArrowDown className="mr-1" /> Downgrade
                              </span>
                            )}
                            {isCurrentPlan && (
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            ${planData.monthlyPrice}/month • Up to {planData.maxProducts} products
                          </p>
                        </div>
                        {newPlan === planKey && (
                          <HiCheck className="w-6 h-6 text-blue-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Billing cycle selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Cycle (Optional)
              </label>
              <select
                value={newBillingCycle}
                onChange={(e) => setNewBillingCycle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Monthly</option>
                <option value="3-months">3 Months (10% off)</option>
                <option value="6-months">6 Months (15% off)</option>
                <option value="12-months">12 Months (20% off)</option>
              </select>
            </div>

            {/* Reason for change */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Change (Optional)
              </label>
              <textarea
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="e.g., Promotional upgrade, Customer request, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setChangeModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeSubscription}
                disabled={isChanging || newPlan === selectedSubscription.plan}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isChanging ? (
                  <>
                    <AiOutlineLoading3Quarters className="animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    {getChangeType(selectedSubscription.plan, newPlan) === 'upgrade' && <HiArrowUp />}
                    {getChangeType(selectedSubscription.plan, newPlan) === 'downgrade' && <HiArrowDown />}
                    Confirm Change
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Subscription Modal */}
      {assignModalOpen && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Assign Subscription Plan
              </h3>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RxCross1 size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Shop info */}
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Assigning to Shop</p>
              <div className="flex items-center gap-3">
                <img
                  src={selectedShop.avatar?.url || "/default-shop.png"}
                  alt={selectedShop.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                />
                <div>
                  <p className="font-semibold text-gray-900">{selectedShop.name}</p>
                  <p className="text-sm text-gray-500">{selectedShop.email}</p>
                </div>
              </div>
            </div>

            {/* Plan selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Plan <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(availablePlans).map(([planKey, planData]) => (
                  <button
                    key={planKey}
                    onClick={() => setAssignPlan(planKey)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      assignPlan === planKey
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`font-semibold capitalize ${
                          planKey === 'gold' ? 'text-yellow-600' :
                          planKey === 'silver' ? 'text-gray-600' :
                          planKey === 'bronze' ? 'text-orange-600' :
                          'text-gray-900'
                        }`}>
                          {planData.name}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          ${planData.monthlyPrice}/month • Up to {planData.maxProducts} products
                        </p>
                      </div>
                      {assignPlan === planKey && (
                        <HiCheck className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Billing cycle selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Cycle
              </label>
              <select
                value={assignBillingCycle}
                onChange={(e) => setAssignBillingCycle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="monthly">Monthly</option>
                <option value="3-months">3 Months (10% off)</option>
                <option value="6-months">6 Months (15% off)</option>
                <option value="12-months">12 Months (20% off)</option>
              </select>
            </div>

            {/* Duration in months */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Months)
              </label>
              <input
                type="number"
                min="1"
                max="36"
                value={assignDuration}
                onChange={(e) => setAssignDuration(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Free assignment toggle */}
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assignIsFree}
                  onChange={(e) => setAssignIsFree(e.target.checked)}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Assign as Free</span>
                  <p className="text-xs text-gray-500">No payment required from seller</p>
                </div>
              </label>
            </div>

            {/* Reason for assignment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={assignReason}
                onChange={(e) => setAssignReason(e.target.value)}
                placeholder="e.g., New seller promotion, Special partner deal, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                rows={3}
              />
            </div>

            {/* Price preview */}
            {assignPlan && availablePlans[assignPlan] && (
              <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  {assignIsFree ? (
                    <span className="text-green-600 font-semibold">Free Assignment</span>
                  ) : (
                    <>
                      Estimated Price: <span className="font-semibold text-gray-900">
                        ${(availablePlans[assignPlan].monthlyPrice * assignDuration).toFixed(2)}
                      </span>
                      <span className="text-gray-500"> for {assignDuration} month(s)</span>
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSubscription}
                disabled={isAssigning || !assignPlan}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAssigning ? (
                  <>
                    <AiOutlineLoading3Quarters className="animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <HiPlus />
                    Assign Subscription
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className={`text-3xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { icon: HiCheck, bg: "bg-green-100", text: "text-green-700" },
    expired: { icon: HiClock, bg: "bg-gray-100", text: "text-gray-700" },
    cancelled: { icon: HiX, bg: "bg-red-100", text: "text-red-700" },
    suspended: { icon: HiX, bg: "bg-yellow-100", text: "text-yellow-700" },
  };

  const config = statusConfig[status] || statusConfig.active;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} capitalize`}
    >
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

export default AdminSubscriptions;
