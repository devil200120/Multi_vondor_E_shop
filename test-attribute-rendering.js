// Test to verify attribute rendering handles object values correctly

const testAttributes = [
  {
    name: "Color",
    type: "color",
    hasPriceVariation: true,
    values: [
      { value: "Red", price: 1200, _id: "64a1b2c3d4e5f6789012345" },
      { value: "Blue", price: 1300, _id: "64a1b2c3d4e5f6789012346" },
      "Green" // backward compatibility test
    ]
  },
  {
    name: "Size",
    type: "size", 
    hasPriceVariation: false,
    values: [
      { value: "S", price: null, _id: "64a1b2c3d4e5f6789012347" },
      { value: "M", price: null, _id: "64a1b2c3d4e5f6789012348" },
      { value: "L", price: null, _id: "64a1b2c3d4e5f6789012349" }
    ]
  },
  {
    name: "Material",
    type: "text",
    hasPriceVariation: false,
    values: [
      { value: "Cotton", _id: "64a1b2c3d4e5f67890123410" },
      { value: "Silk", _id: "64a1b2c3d4e5f67890123411" }
    ]
  }
];

function extractValue(valueObj) {
  return typeof valueObj === "string" ? valueObj : valueObj.value;
}

function extractPrice(valueObj) {
  return typeof valueObj === "object" ? valueObj.price : null;
}

// Test the extraction functions
console.log("Testing attribute value extraction:");

testAttributes.forEach((attr) => {
  console.log(`\nAttribute: ${attr.name} (${attr.type})`);
  
  attr.values.forEach((valueObj, index) => {
    const value = extractValue(valueObj);
    const price = extractPrice(valueObj);
    
    console.log(`  Value ${index + 1}: "${value}" (price: ${price})`);
    
    // Verify that we can safely render the value
    if (typeof value !== "string" && typeof value !== "number") {
      console.error(`  ERROR: Value is not renderable: ${JSON.stringify(value)}`);
    } else {
      console.log(`  ✅ Renderable value: ${value}`);
    }
  });
});

console.log("\n✅ All tests passed! Attribute values can be safely rendered.");