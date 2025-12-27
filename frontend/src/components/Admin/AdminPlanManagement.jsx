import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import {
  AiOutlineLoading3Quarters,
  AiOutlineEdit,
  AiOutlinePlus,
  AiOutlineSave,
  AiOutlineClose,
} from "react-icons/ai";
import { HiCheck, HiX } from "react-icons/hi";

const AdminPlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [formData, setFormData] = useState(getEmptyFormData());

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get(`${server}/subscription/admin/manage-plans`, {
        withCredentials: true,
      });
      setPlans(data.plans);
    } catch (error) {
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  function getEmptyFormData() {
    return {
      planKey: "",
      name: "",
      monthlyPrice: 0,
      maxProducts: 0,
      features: {
        businessProfile: false,
        logo: false,
        pdfUpload: false,
        imagesPerProduct: 0,
        videoOption: false,
        contactSeller: false,
        htmlCssEditor: false,
        adPreApproval: false,
      },
      isActive: true,
    };
  }

  const handleEdit = (planKey, planData) => {
    setEditingPlan(planKey);
    setFormData({
      planKey,
      name: planData.name,
      monthlyPrice: planData.monthlyPrice,
      maxProducts: planData.maxProducts,
      features: { ...planData.features },
      isActive: planData.isActive !== false,
    });
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setIsCreatingNew(false);
    setFormData(getEmptyFormData());
  };

  const handleSave = async () => {
    try {
      if (isCreatingNew) {
        await axios.post(
          `${server}/subscription/admin/create-plan`,
          formData,
          { withCredentials: true }
        );
        toast.success("Plan created successfully");
      } else {
        await axios.put(
          `${server}/subscription/admin/update-plan/${editingPlan}`,
          formData,
          { withCredentials: true }
        );
        toast.success("Plan updated successfully");
      }
      fetchPlans();
      handleCancel();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save plan");
    }
  };

  const handleToggleActive = async (planKey, currentStatus) => {
    try {
      await axios.put(
        `${server}/subscription/admin/toggle-plan/${planKey}`,
        { isActive: !currentStatus },
        { withCredentials: true }
      );
      toast.success(`Plan ${!currentStatus ? "activated" : "deactivated"}`);
      fetchPlans();
    } catch (error) {
      toast.error("Failed to update plan status");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (feature, value) => {
    setFormData((prev) => ({
      ...prev,
      features: { ...prev.features, [feature]: value },
    }));
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Subscription Plan Management
        </h2>
        <button
          onClick={() => {
            setIsCreatingNew(true);
            setFormData(getEmptyFormData());
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <AiOutlinePlus /> Create New Plan
        </button>
      </div>

      {/* Create New Plan Form */}
      {isCreatingNew && (
        <div className="mb-6 p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
          <h3 className="text-xl font-bold mb-4">Create New Plan</h3>
          <PlanForm
            formData={formData}
            onInputChange={handleInputChange}
            onFeatureChange={handleFeatureChange}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(plans).map(([planKey, planData]) => (
          <div
            key={planKey}
            className={`border rounded-lg p-6 ${
              planData.isActive === false
                ? "bg-gray-50 border-gray-300"
                : "border-gray-200"
            }`}
          >
            {editingPlan === planKey ? (
              <PlanForm
                formData={formData}
                onInputChange={handleInputChange}
                onFeatureChange={handleFeatureChange}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <PlanDisplay
                planKey={planKey}
                planData={planData}
                onEdit={() => handleEdit(planKey, planData)}
                onToggleActive={() =>
                  handleToggleActive(planKey, planData.isActive !== false)
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PlanForm = ({
  formData,
  onInputChange,
  onFeatureChange,
  onSave,
  onCancel,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plan Key (lowercase, no spaces)
        </label>
        <input
          type="text"
          value={formData.planKey}
          onChange={(e) => onInputChange("planKey", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="e.g., bronze, silver, gold"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Display Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onInputChange("name", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          placeholder="e.g., Bronze Plan"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Monthly Price ($)
        </label>
        <input
          type="number"
          value={formData.monthlyPrice}
          onChange={(e) =>
            onInputChange("monthlyPrice", parseFloat(e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Max Products
        </label>
        <input
          type="number"
          value={formData.maxProducts}
          onChange={(e) =>
            onInputChange("maxProducts", parseInt(e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Images Per Product
        </label>
        <input
          type="number"
          value={formData.features.imagesPerProduct}
          onChange={(e) =>
            onFeatureChange("imagesPerProduct", parseInt(e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          min="0"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Features
        </label>
        {Object.entries(formData.features).map(([feature, value]) => {
          if (feature === "imagesPerProduct") return null;
          return (
            <label key={feature} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => onFeatureChange(feature, e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 capitalize">
                {feature.replace(/([A-Z])/g, " $1").trim()}
              </span>
            </label>
          );
        })}
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={onSave}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <AiOutlineSave /> Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center justify-center gap-2"
        >
          <AiOutlineClose /> Cancel
        </button>
      </div>
    </div>
  );
};

const PlanDisplay = ({ planKey, planData, onEdit, onToggleActive }) => {
  const isActive = planData.isActive !== false;

  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 capitalize">
            {planData.name}
          </h3>
          <p className="text-sm text-gray-500">Key: {planKey}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            isActive
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-blue-600">
          ${planData.monthlyPrice}
          <span className="text-sm text-gray-500 font-normal">/month</span>
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Up to {planData.maxProducts === 999 ? "Unlimited" : planData.maxProducts}{" "}
          products
        </p>
      </div>

      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
        <div className="space-y-1">
          {Object.entries(planData.features).map(([feature, enabled]) => (
            <div key={feature} className="flex items-center gap-2 text-sm">
              {feature === "imagesPerProduct" ? (
                <span className="text-gray-700">
                  {enabled} images per product
                </span>
              ) : enabled ? (
                <>
                  <HiCheck className="text-green-600 w-4 h-4" />
                  <span className="text-gray-700 capitalize">
                    {feature.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </>
              ) : (
                <>
                  <HiX className="text-gray-400 w-4 h-4" />
                  <span className="text-gray-400 capitalize">
                    {feature.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <AiOutlineEdit /> Edit
        </button>
        <button
          onClick={onToggleActive}
          className={`flex-1 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
            isActive
              ? "bg-red-50 text-red-600 hover:bg-red-100"
              : "bg-green-50 text-green-600 hover:bg-green-100"
          }`}
        >
          {isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </>
  );
};

export default AdminPlanManagement;
