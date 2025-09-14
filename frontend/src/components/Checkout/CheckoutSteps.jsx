import React from "react";
import { FiTruck, FiCreditCard, FiCheck } from "react-icons/fi";

const CheckoutSteps = ({ active }) => {
  const steps = [
    { id: 1, title: "Shipping", icon: FiTruck },
    { id: 2, title: "Payment", icon: FiCreditCard },
    { id: 3, title: "Success", icon: FiCheck },
  ];

  return (
    <div className="w-full flex justify-center py-8 bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="w-full max-w-2xl px-4">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full transform -translate-y-1/2 z-0">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((active - 1) / 2) * 100}%` }}
            />
          </div>

          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = active >= step.id;
            const isCurrent = active === step.id;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center relative z-10"
              >
                {/* Step Circle */}
                <div
                  className={`
                                        w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 transform
                                        ${
                                          isActive
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-500 border-white shadow-lg scale-110"
                                            : "bg-white border-gray-300"
                                        }
                                        ${
                                          isCurrent
                                            ? "ring-4 ring-indigo-200 ring-opacity-50"
                                            : ""
                                        }
                                    `}
                >
                  <StepIcon
                    className={`
                                            w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300
                                            ${
                                              isActive
                                                ? "text-white"
                                                : "text-gray-400"
                                            }
                                        `}
                  />
                </div>

                {/* Step Label */}
                <div className="mt-3 text-center">
                  <div
                    className={`
                                            text-sm sm:text-base font-medium transition-colors duration-300
                                            ${
                                              isActive
                                                ? "text-indigo-600"
                                                : "text-gray-500"
                                            }
                                        `}
                  >
                    {step.title}
                  </div>

                  {/* Step Number */}
                  <div
                    className={`
                                            text-xs mt-1 transition-colors duration-300
                                            ${
                                              isActive
                                                ? "text-indigo-500"
                                                : "text-gray-400"
                                            }
                                        `}
                  >
                    Step {step.id}
                  </div>
                </div>

                {/* Active Indicator */}
                {isCurrent && (
                  <div className="absolute -bottom-2 w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Step Description */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-xl px-6 py-4 shadow-sm border border-gray-100">
            <p className="text-gray-600 text-sm sm:text-base">
              {active === 1 &&
                "Enter your delivery address and contact information"}
              {active === 2 &&
                "Choose your payment method and complete the purchase"}
              {active === 3 &&
                "Order confirmed! You'll receive a confirmation email shortly"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSteps;
