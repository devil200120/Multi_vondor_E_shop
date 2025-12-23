import React, { useState } from "react";
import { AiOutlinePlus, AiOutlineDelete, AiOutlineClose } from "react-icons/ai";

const ProductAttributesForm = ({ attributes = [], onChange }) => {
  const [localAttributes, setLocalAttributes] = useState(
    attributes.length > 0
      ? attributes
      : [
          {
            name: "",
            values: [{ value: "", price: "" }],
            type: "text",
            hasPriceVariation: false,
          },
        ]
  );

  const attributeTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "color", label: "Color" },
    { value: "size", label: "Size" },
    { value: "boolean", label: "Yes/No" },
    { value: "other", label: "Other" },
  ];

  const addAttribute = () => {
    const newAttributes = [
      ...localAttributes,
      {
        name: "",
        values: [{ value: "", price: "" }],
        type: "text",
        hasPriceVariation: false,
      },
    ];
    setLocalAttributes(newAttributes);
    onChange(newAttributes);
  };

  const removeAttribute = (index) => {
    const newAttributes = localAttributes.filter((_, i) => i !== index);
    setLocalAttributes(newAttributes);
    onChange(newAttributes);
  };

  const updateAttribute = (index, field, value) => {
    const newAttributes = localAttributes.map((attr, i) => {
      if (i === index) {
        return {
          ...attr,
          [field]: value
        };
      }
      return attr;
    });
    setLocalAttributes(newAttributes);
    onChange(newAttributes);
  };

  const addValue = (attributeIndex) => {
    const newAttributes = localAttributes.map((attr, index) => {
      if (index === attributeIndex) {
        return {
          ...attr,
          values: [...attr.values, { value: "", price: "" }]
        };
      }
      return attr;
    });
    setLocalAttributes(newAttributes);
    onChange(newAttributes);
  };

  const removeValue = (attributeIndex, valueIndex) => {
    const newAttributes = localAttributes.map((attr, index) => {
      if (index === attributeIndex && attr.values.length > 1) {
        return {
          ...attr,
          values: attr.values.filter((_, i) => i !== valueIndex)
        };
      }
      return attr;
    });
    setLocalAttributes(newAttributes);
    onChange(newAttributes);
  };

  const updateValue = (attributeIndex, valueIndex, field, value) => {
    const newAttributes = localAttributes.map((attr, index) => {
      if (index === attributeIndex) {
        return {
          ...attr,
          values: attr.values.map((val, vIndex) => {
            if (vIndex === valueIndex) {
              return {
                ...val,
                [field]: value
              };
            }
            return val;
          })
        };
      }
      return attr;
    });
    setLocalAttributes(newAttributes);
    onChange(newAttributes);
  };

  const togglePriceVariation = (attributeIndex) => {
    const newAttributes = localAttributes.map((attr, index) => {
      if (index === attributeIndex) {
        const newHasPriceVariation = !attr.hasPriceVariation;
        return {
          ...attr,
          hasPriceVariation: newHasPriceVariation,
          values: newHasPriceVariation 
            ? attr.values
            : attr.values.map(val => ({ ...val, price: "" }))
        };
      }
      return attr;
    });
    setLocalAttributes(newAttributes);
    onChange(newAttributes);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Product Attributes
        </h3>
        <button
          type="button"
          onClick={addAttribute}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <AiOutlinePlus size={16} />
          Add Attribute
        </button>
      </div>

      <div className="space-y-4">
        {localAttributes.map((attribute, index) => (
          <div
            key={index}
            className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            {/* Attribute Name */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attribute Name
              </label>
              <input
                type="text"
                value={attribute.name}
                onChange={(e) => updateAttribute(index, "name", e.target.value)}
                placeholder="e.g., Color, Size, RAM, Storage"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Attribute Type */}
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={attribute.type}
                onChange={(e) => updateAttribute(index, "type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {attributeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Variation Toggle */}
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Variation
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`priceVariation-${index}`}
                  checked={attribute.hasPriceVariation || false}
                  onChange={() => togglePriceVariation(index)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={`priceVariation-${index}`}
                  className="text-sm text-gray-600"
                >
                  Different prices
                </label>
              </div>
            </div>

            {/* Attribute Values */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Values{" "}
                  {attribute.hasPriceVariation && (
                    <span className="text-blue-600">(with prices)</span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => addValue(index)}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                >
                  <AiOutlinePlus size={12} />
                  Add Value
                </button>
              </div>
              <div className="space-y-2">
                {attribute.values?.map((valueObj, valueIndex) => {
                  const value =
                    typeof valueObj === "string" ? valueObj : valueObj.value;
                  const price =
                    typeof valueObj === "object" ? valueObj.price : "";

                  return (
                    <div key={valueIndex} className="flex gap-2">
                      {attribute.type === "color" ? (
                        <>
                          <input
                            type="color"
                            value={value || "#000000"}
                            onChange={(e) =>
                              updateValue(
                                index,
                                valueIndex,
                                "value",
                                e.target.value
                              )
                            }
                            className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) =>
                              updateValue(
                                index,
                                valueIndex,
                                "value",
                                e.target.value
                              )
                            }
                            placeholder="Color name or hex"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </>
                      ) : attribute.type === "boolean" ? (
                        <select
                          value={value}
                          onChange={(e) =>
                            updateValue(
                              index,
                              valueIndex,
                              "value",
                              e.target.value
                            )
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select...</option>
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      ) : attribute.type === "number" ? (
                        <input
                          type="number"
                          value={value}
                          onChange={(e) =>
                            updateValue(
                              index,
                              valueIndex,
                              "value",
                              e.target.value
                            )
                          }
                          placeholder="Enter number"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            updateValue(
                              index,
                              valueIndex,
                              "value",
                              e.target.value
                            )
                          }
                          placeholder={
                            attribute.type === "size"
                              ? "e.g., Small, Medium, Large"
                              : "Enter value"
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}

                      {/* Price Input (only if price variation is enabled) */}
                      {attribute.hasPriceVariation && (
                        <input
                          type="number"
                          value={price}
                          onChange={(e) =>
                            updateValue(
                              index,
                              valueIndex,
                              "price",
                              e.target.value
                            )
                          }
                          placeholder="Price ₹"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}

                      {attribute.values.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeValue(index, valueIndex)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-md transition-colors"
                          title="Remove value"
                        >
                          <AiOutlineClose size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Remove Button */}
            <div className="pt-7">
              <button
                type="button"
                onClick={() => removeAttribute(index)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-md transition-colors"
                title="Remove attribute"
              >
                <AiOutlineDelete size={18} />
              </button>
            </div>
          </div>
        ))}

        {localAttributes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No attributes added yet.</p>
            <p className="text-sm">
              Click "Add Attribute" to start adding product specifications.
            </p>
          </div>
        )}
      </div>

      {/* Examples */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Examples of attributes you can add:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
          <div>
            <div className="font-medium">Without price variation:</div>
            <div className="ml-2">• Color: Red, Blue, Green</div>
            <div className="ml-2">• Material: Cotton, Polyester</div>
          </div>
          <div>
            <div className="font-medium">With price variation:</div>
            <div className="ml-2">• RAM: 4GB (₹15,000), 8GB (₹18,000)</div>
            <div className="ml-2">
              • Storage: 128GB (₹20,000), 256GB (₹25,000)
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-blue-600">
          💡 Enable "Different prices" to set custom prices for each attribute
          value
        </div>
      </div>
    </div>
  );
};

export default ProductAttributesForm;
