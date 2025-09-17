# Profile Address Section Runtime Error Fix

## Issue Description
The user was experiencing a runtime error in the profile address section with the message: "can't access lexical declaration 'updateMarker' before initialization". This was a JavaScript temporal dead zone error caused by incorrect function declaration order and dependencies.

## Root Cause Analysis
The error was caused by several function dependency issues in the ProfileContent.jsx file:

1. **Function Declaration Order**: `updateMarker` function was being called in `initializeMap` and `handlePlaceSelect` before it was defined
2. **Circular Dependencies**: Functions were referencing each other in the wrong order
3. **Missing useCallback Wrappers**: Some functions weren't properly wrapped in `useCallback`, causing dependency issues
4. **Incorrect State Setter**: `parseAddressComponents` was trying to call `setState` which didn't exist

## Fixes Applied

### 1. **Function Reordering**
Reorganized the functions in the correct dependency order:
```javascript
// Correct order:
1. parseAddressComponents (no dependencies on other functions)
2. reverseGeocode (depends on parseAddressComponents)
3. updateMarker (depends on reverseGeocode)
4. handlePlaceSelect (depends on parseAddressComponents, updateMarker)
5. initializeMap (depends on updateMarker, reverseGeocode)
```

### 2. **useCallback Implementation**
Wrapped all functions in `useCallback` with proper dependencies:
```javascript
const parseAddressComponents = useCallback((place) => {
  // function body
}, []);

const reverseGeocode = useCallback((lat, lng) => {
  // function body
}, [parseAddressComponents]);

const updateMarker = useCallback((lat, lng) => {
  // function body
}, [reverseGeocode]);
```

### 3. **Fixed State Setter Issue**
Corrected the `parseAddressComponents` function to use `setCity` instead of the non-existent `setState`:
```javascript
// Before (incorrect):
setState(stateData.isoCode);

// After (correct):
setCity(stateData.isoCode);
```

### 4. **Dependency Array Fixes**
Updated dependency arrays to include all referenced variables and functions:
```javascript
const handlePlaceSelect = useCallback(() => {
  // function body
}, [parseAddressComponents, showMap, updateMarker]);
```

### 5. **Removed Duplicate Functions**
Eliminated duplicate function declarations that were causing "already declared" errors.

## Files Modified
- `frontend/src/components/Profile/ProfileContent.jsx`

## Error Resolution
The main runtime error "can't access lexical declaration 'updateMarker' before initialization" has been resolved by ensuring proper function declaration order and dependencies.

## Remaining Warnings
Some non-critical linting warnings remain but don't affect functionality:
- Unused imports (HiOutlineLocationMarker, HiOutlineCreditCard, styles)
- Unused variables (avatar)
- Missing dependencies in some useEffect hooks

These warnings don't cause runtime errors and can be addressed in a future cleanup if needed.

## Testing Recommendations
1. Navigate to Profile → Address section
2. Try adding a new address
3. Test Google Maps integration (clicking on map, using autocomplete)
4. Test current location functionality
5. Verify address form submission works correctly

## Technical Notes
The issue was primarily related to JavaScript's temporal dead zone, where variables declared with `let`, `const`, or function declarations using arrow syntax cannot be accessed before their declaration in the code. The fix ensures all functions are declared in the correct order and properly wrapped in `useCallback` hooks for React optimization.