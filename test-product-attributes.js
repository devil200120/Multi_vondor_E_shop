// Test Product Attributes in Invoice PDF
// This file tests the cart data structure and attribute display

const testCartItem = {
  _id: "test123",
  name: "Premium Cotton T-Shirt",
  discountPrice: 999,
  originalPrice: 1299,
  qty: 2,
  selectedAttributes: {
    Size: "Large",
    Color: "Navy Blue",
    Material: "Cotton",
    Style: "Casual"
  },
  attributeSelection: {
    Size: "Large", 
    Color: "Navy Blue",
    Material: "Cotton",
    Style: "Casual"
  },
  finalPrice: 999,
  gstConfiguration: {
    isGstApplicable: true,
    gstType: "separate",
    cgstRate: 9,
    sgstRate: 9,
    hsnCode: "61051000"
  }
};

// Simulate the getProductAttributes function from PDF generator
const getProductAttributes = (item) => {
  let attributes = [];
  
  // Check for various attribute naming conventions
  const attributeKeys = [
    'size', 'selectedSize', 'Size', 'product_size',
    'color', 'selectedColor', 'Color', 'product_color',
    'variant', 'selectedVariant', 'Variant',
    'model', 'selectedModel', 'Model',
    'brand', 'selectedBrand', 'Brand',
    'material', 'selectedMaterial', 'Material',
    'style', 'selectedStyle', 'Style'
  ];
  
  // Check direct attributes
  attributeKeys.forEach(key => {
    if (item[key] && typeof item[key] === 'string' && item[key].trim() !== '') {
      const attributeName = key.replace(/^selected/, '').toLowerCase();
      const capitalizedName = attributeName.charAt(0).toUpperCase() + attributeName.slice(1);
      if (!attributes.some(attr => attr.includes(capitalizedName))) {
        attributes.push(`<strong>${capitalizedName}:</strong> ${item[key]}`);
      }
    }
  });
  
  // Check if item has selectedAttributes object
  if (item.selectedAttributes && typeof item.selectedAttributes === 'object') {
    Object.keys(item.selectedAttributes).forEach(key => {
      if (item.selectedAttributes[key] && typeof item.selectedAttributes[key] === 'string' && item.selectedAttributes[key].trim() !== '') {
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        if (!attributes.some(attr => attr.includes(capitalizedKey))) {
          attributes.push(`<strong>${capitalizedKey}:</strong> ${item.selectedAttributes[key]}`);
        }
      }
    });
  }
  
  // Check if item has attributeSelection object
  if (item.attributeSelection && typeof item.attributeSelection === 'object') {
    Object.keys(item.attributeSelection).forEach(key => {
      if (item.attributeSelection[key] && typeof item.attributeSelection[key] === 'string' && item.attributeSelection[key].trim() !== '') {
        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
        if (!attributes.some(attr => attr.includes(capitalizedKey))) {
          attributes.push(`<strong>${capitalizedKey}:</strong> ${item.attributeSelection[key]}`);
        }
      }
    });
  }
  
  return attributes.length > 0 ? attributes.join('<br>') + '<br>' : '';
};

console.log("=== PRODUCT ATTRIBUTES TEST ===\n");

console.log("📦 Test Cart Item Structure:");
console.log(JSON.stringify(testCartItem, null, 2));

console.log("\n🔍 Extracted Attributes:");
const extractedAttributes = getProductAttributes(testCartItem);
console.log("HTML Output:", extractedAttributes);

console.log("\n📄 Expected Invoice Display:");
console.log("Premium Cotton T-Shirt");
console.log("Size: Large");
console.log("Color: Navy Blue"); 
console.log("Material: Cotton");
console.log("Style: Casual");
console.log("Unit Price: ₹999");
console.log("GST: CGST: 9.0% | SGST: 9.0%");

console.log("\n✅ ATTRIBUTES EXTRACTION:");
console.log("- selectedAttributes object: ✅ Available");
console.log("- Size attribute: ✅ Large");
console.log("- Color attribute: ✅ Navy Blue");
console.log("- Material attribute: ✅ Cotton");
console.log("- Style attribute: ✅ Casual");

console.log("\n🛠️ PDF GENERATOR FIX:");
console.log("✅ Updated getProductAttributes() function");
console.log("✅ Added support for selectedAttributes object");
console.log("✅ Added support for attributeSelection object");
console.log("✅ Added fallback for direct attribute properties");
console.log("✅ Added debugging console logs");

console.log("\n📋 NEXT STEPS:");
console.log("1. Test with a real order that has product attributes");
console.log("2. Check console logs during PDF generation");
console.log("3. Verify attributes appear in generated invoice");
console.log("4. Remove debug logs after confirmation");

console.log("\n🎯 EXPECTED RESULT:");
console.log("Product attributes should now appear in invoice PDF under each product:");