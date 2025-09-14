const axios = require('axios');

class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    this.geocodingBaseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    this.placesBaseUrl = 'https://maps.googleapis.com/maps/api/place';
  }

  // Validate and get location details from pincode
  async validatePincode(pincode) {
    try {
      if (!pincode || pincode.length !== 6) {
        throw new Error('Invalid pincode format');
      }

      console.log(`Validating pincode: ${pincode}`);
      console.log(`API Key available: ${this.apiKey ? 'Yes' : 'No'}`);

      // Try both specific and generic queries, but validate results carefully
      const queries = [
        pincode, // First try just the pincode
        `${pincode} India` // Then try with India
      ];

      let bestResult = null;
      
      for (const query of queries) {
        try {
          const response = await axios.get(this.geocodingBaseUrl, {
            params: {
              address: query,
              key: this.apiKey,
              region: 'in',
            },
          });

          console.log(`Query: "${query}" - Status: ${response.data.status}, Results: ${response.data.results?.length || 0}`);
          
          // Log the full response for debugging
          if (response.data.results && response.data.results.length > 0) {
            console.log(`Full API Response for ${query}:`, JSON.stringify(response.data.results[0], null, 2));
          }
          
          // Log the full response for debugging
          if (response.data.results && response.data.results.length > 0) {
            console.log(`Full API Response for ${query}:`, JSON.stringify(response.data.results[0], null, 2));
          }

          if (response.data.status === 'OK' && response.data.results.length > 0) {
            const result = response.data.results[0];
            const addressComponents = result.address_components;
            const locationDetails = this.extractLocationDetails(addressComponents);

            console.log(`Address Components for "${query}":`, addressComponents.map(c => `${c.long_name} (${c.types.join(', ')})`));
            console.log(`Extracted Details:`, locationDetails);

            // More flexible validation that works with various Google Maps responses
            const hasStateInfo = locationDetails.state;
            const hasPostalCode = addressComponents.some(component => 
              component.types.includes('postal_code') && component.long_name === pincode
            );
            const addressContainsPincode = result.formatted_address.includes(pincode);
            const hasLocationInfo = locationDetails.area || locationDetails.district;
            
            // Check if this is a generic fallback response that should be rejected
            const isGenericKarnatakaResponse = result.formatted_address === 'Karnataka, India' && 
                                             !hasPostalCode &&
                                             !addressContainsPincode;

            console.log(`Validation - State: ${hasStateInfo}, Postal Code: ${hasPostalCode}, Address Contains Pincode: ${addressContainsPincode}, Has Location: ${hasLocationInfo}, Generic Karnataka: ${isGenericKarnatakaResponse}`);

            // Accept result if:
            // 1. Has state info AND
            // 2. Is not a generic Karnataka response AND
            // 3. Either has postal code OR address contains pincode OR has specific location info
            if (hasStateInfo && !isGenericKarnatakaResponse && (hasPostalCode || addressContainsPincode || hasLocationInfo)) {
              bestResult = {
                result,
                locationDetails
              };
              break; // Use the first good result
            }
          }
        } catch (apiError) {
          console.log(`API query failed for "${query}":`, apiError.message);
          continue;
        }
      }

      if (bestResult) {
        const { result, locationDetails } = bestResult;
        
        const finalData = {
          pincode: pincode,
          formattedAddress: result.formatted_address,
          area: locationDetails.area || 'Unknown Area',
          district: locationDetails.district || 'Unknown District',
          state: locationDetails.state,
          country: locationDetails.country || 'India',
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
          placeId: result.place_id,
        };

        return {
          isValid: true,
          data: finalData,
        };
      }

      // If no good API result, check if it's a valid Karnataka pincode pattern
      // This provides a fallback for valid Karnataka pincodes when API fails
      if (!bestResult && this.isKarnatakaPincode(pincode)) {
        console.log(`No API result but pincode matches Karnataka pattern: ${pincode}`);
        return {
          isValid: true,
          data: {
            pincode: pincode,
            formattedAddress: `${pincode}, Karnataka, India`,
            area: 'Karnataka Area',
            district: 'Karnataka District', 
            state: 'Karnataka',
            country: 'India',
            latitude: 15.3173,
            longitude: 75.7139,
            placeId: null,
          },
        };
      }

      return {
        isValid: false,
        message: 'Invalid pincode or location not found',
      };
    } catch (error) {
      console.error('Google Maps API Error:', error.message);
      
      return {
        isValid: false,
        message: 'Unable to validate pincode. Please try again.',
        error: error.message,
      };
    }
  }



  // Check if pincode follows Karnataka pattern
  isKarnatakaPincode(pincode) {
    // Karnataka pincodes generally start with 56-59
    const karnatakaPatterns = [
      /^56\d{4}$/, // Bangalore, Mysore area
      /^57\d{4}$/, // Mangalore, Davangere area  
      /^58\d{4}$/, // Hubli, Dharwad area
      /^59\d{4}$/, // Belgaum, Gulbarga area
    ];
    
    return karnatakaPatterns.some(pattern => pattern.test(pincode));
  }

  // Extract location details from address components
  extractLocationDetails(addressComponents) {
    const details = {
      area: '',
      district: '',
      state: '',
      country: '',
    };

    addressComponents.forEach((component) => {
      const types = component.types;
      const longName = component.long_name;
      const shortName = component.short_name;

      // Area/Locality extraction
      if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
        details.area = longName;
      } else if (types.includes('locality') && !details.area) {
        details.area = longName;
      } else if (types.includes('neighborhood') && !details.area) {
        details.area = longName;
      }

      // District extraction - check multiple administrative levels
      if (types.includes('administrative_area_level_2')) {
        details.district = longName;
      } else if (types.includes('administrative_area_level_3') && !details.district) {
        details.district = longName;
      } else if (types.includes('locality') && !details.district && details.area !== longName) {
        // If locality is different from area, it might be the district
        details.district = longName;
      }

      // State extraction
      if (types.includes('administrative_area_level_1')) {
        details.state = longName;
        // Also check short name for state codes
        if (shortName === 'KA' || shortName === 'Karnataka') {
          details.state = 'Karnataka';
        }
      }

      // Country extraction
      if (types.includes('country')) {
        details.country = longName;
      }
    });

    // Post-processing: If area and district are the same, prefer district
    if (details.area === details.district && details.area) {
      details.area = details.district + ' City';
    }

    // Handle common name variations
    if (details.area === 'Belagavi' || details.district === 'Belagavi') {
      details.area = details.area === 'Belagavi' ? 'Belgaum City' : details.area;
      details.district = details.district === 'Belagavi' ? 'Belgaum' : details.district;
    }

    // Additional state detection from formatted address or component names
    if (!details.state) {
      const stateIndicators = ['karnataka', 'ka', 'kt'];
      addressComponents.forEach((component) => {
        const name = component.long_name.toLowerCase();
        if (stateIndicators.some(indicator => name.includes(indicator))) {
          details.state = 'Karnataka';
        }
      });
    }

    return details;
  }

  // Search places by query (for autocomplete)
  async searchPlaces(query, location = null) {
    try {
      const params = {
        input: query,
        key: this.apiKey,
        components: 'country:in',
        types: 'geocode',
      };

      if (location) {
        params.location = `${location.lat},${location.lng}`;
        params.radius = 50000; // 50km radius
      }

      const response = await axios.get(`${this.placesBaseUrl}/autocomplete/json`, {
        params,
      });

      if (response.data.status !== 'OK') {
        return [];
      }

      return response.data.predictions.map((prediction) => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text,
      }));
    } catch (error) {
      console.error('Places API Error:', error.message);
      return [];
    }
  }

  // Get place details by place ID
  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(`${this.placesBaseUrl}/details/json`, {
        params: {
          place_id: placeId,
          key: this.apiKey,
          fields: 'address_component,formatted_address,geometry,name',
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error('Place not found');
      }

      const result = response.data.result;
      const locationDetails = this.extractLocationDetails(result.address_components);

      // Extract pincode
      const pincodeComponent = result.address_components.find((component) =>
        component.types.includes('postal_code')
      );

      return {
        placeId: placeId,
        name: result.name,
        formattedAddress: result.formatted_address,
        pincode: pincodeComponent ? pincodeComponent.long_name : null,
        area: locationDetails.area,
        district: locationDetails.district,
        state: locationDetails.state,
        country: locationDetails.country,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      };
    } catch (error) {
      console.error('Place Details API Error:', error.message);
      throw error;
    }
  }

  // Calculate distance between two coordinates
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Check if location is within Karnataka (or any specific state)
  isWithinState(state, targetState = 'Karnataka') {
    if (!state) return false;
    
    const normalizedState = state.toLowerCase().trim();
    const normalizedTarget = targetState.toLowerCase().trim();
    
    // Check for various forms of Karnataka
    const karnatakaVariants = ['karnataka', 'kt', 'ka'];
    
    if (normalizedTarget === 'karnataka') {
      return karnatakaVariants.some(variant => normalizedState.includes(variant));
    }
    
    return normalizedState.includes(normalizedTarget);
  }

  // Estimate delivery time based on distance and location
  estimateDeliveryTime(state, district, isMetro = false) {
    // Default delivery estimation logic
    if (this.isWithinState(state, 'Karnataka')) {
      if (isMetro || ['Bangalore', 'Bengaluru', 'Mysore', 'Hubli'].includes(district)) {
        return 2; // 2 days for metro cities
      }
      return 4; // 4 days for other Karnataka cities
    }
    return 7; // 7 days for other states
  }
}

module.exports = GoogleMapsService;