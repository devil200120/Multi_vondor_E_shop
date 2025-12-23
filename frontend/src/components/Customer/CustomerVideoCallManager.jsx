import React, { useState } from "react";
import CustomerVideoCall from "./CustomerVideoCall";
import CustomerCallHistory from "./CustomerCallHistory";

const CustomerVideoCallManager = () => {
  const [activeTab, setActiveTab] = useState("call");

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("call")}
            className={`${
              activeTab === "call"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            <i className="fas fa-video mr-2"></i>
            Video Call
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`${
              activeTab === "history"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            <i className="fas fa-history mr-2"></i>
            Call History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === "call" && (
          <div className="p-6">
            <CustomerVideoCall />
          </div>
        )}
        {activeTab === "history" && (
          <div className="p-6">
            <CustomerCallHistory />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerVideoCallManager;
