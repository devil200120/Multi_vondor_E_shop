const Order = require('../model/order');

// Utility script to add default coordinates to orders that don't have them
// This is for existing orders created before coordinate collection was implemented

const migrateOrderCoordinates = async () => {
  try {
    console.log('Starting order coordinates migration...');
    
    // Find orders without coordinates
    const ordersWithoutCoords = await Order.find({
      $or: [
        { 'shippingAddress.latitude': { $exists: false } },
        { 'shippingAddress.longitude': { $exists: false } },
        { 'shippingAddress.latitude': null },
        { 'shippingAddress.longitude': null },
        { 'shippingAddress.latitude': '' },
        { 'shippingAddress.longitude': '' }
      ]
    });

    console.log(`Found ${ordersWithoutCoords.length} orders without coordinates`);

    let updated = 0;
    
    for (const order of ordersWithoutCoords) {
      // Add default coordinates (you can modify this logic)
      // Option 1: Set to null to skip geocoding in frontend
      // Option 2: Try to geocode the address (requires Google Maps API)
      
      // For now, we'll set default coordinates to null
      // This will trigger the geocoding in the frontend
      order.shippingAddress.latitude = null;
      order.shippingAddress.longitude = null;
      
      await order.save();
      updated++;
      
      if (updated % 10 === 0) {
        console.log(`Updated ${updated}/${ordersWithoutCoords.length} orders...`);
      }
    }

    console.log(`Migration completed. Updated ${updated} orders.`);
    return { success: true, updated };
    
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error: error.message };
  }
};

// For geocoding existing addresses (optional)
const geocodeOrderAddresses = async (googleMapsApiKey) => {
  if (!googleMapsApiKey) {
    console.log('No Google Maps API key provided. Skipping geocoding.');
    return;
  }

  try {
    const { Client } = require('@googlemaps/google-maps-services-js');
    const client = new Client({});

    const ordersWithoutCoords = await Order.find({
      $or: [
        { 'shippingAddress.latitude': null },
        { 'shippingAddress.longitude': null }
      ]
    });

    console.log(`Geocoding ${ordersWithoutCoords.length} orders...`);

    let geocoded = 0;

    for (const order of ordersWithoutCoords) {
      try {
        const address = `${order.shippingAddress.address1}, ${order.shippingAddress.city}, ${order.shippingAddress.country}`;
        
        const response = await client.geocode({
          params: {
            address,
            key: googleMapsApiKey,
          },
        });

        if (response.data.results.length > 0) {
          const location = response.data.results[0].geometry.location;
          order.shippingAddress.latitude = location.lat;
          order.shippingAddress.longitude = location.lng;
          await order.save();
          geocoded++;
          
          console.log(`Geocoded order ${order._id}: ${location.lat}, ${location.lng}`);
        } else {
          console.log(`Could not geocode address for order ${order._id}: ${address}`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error geocoding order ${order._id}:`, error.message);
      }
    }

    console.log(`Geocoding completed. Successfully geocoded ${geocoded} orders.`);
    
  } catch (error) {
    console.error('Geocoding failed:', error);
  }
};

module.exports = {
  migrateOrderCoordinates,
  geocodeOrderAddresses
};

// Usage example:
// const { migrateOrderCoordinates, geocodeOrderAddresses } = require('./utils/migrateOrderCoordinates');
// 
// // Basic migration (adds null coordinates)
// migrateOrderCoordinates();
// 
// // With geocoding (requires Google Maps API key)
// geocodeOrderAddresses('YOUR_GOOGLE_MAPS_API_KEY');