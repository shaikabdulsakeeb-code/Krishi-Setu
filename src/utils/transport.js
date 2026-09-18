// Constants
export const TRANSPORT_RATE_ROAD_PER_KM = 18; // ₹18/km
export const TRANSPORT_RATE_RAIL_PER_TONNE_KM = 1.5; // ₹1.5/tonne-km

export const TRANSPORT_CONFIG = {
  USE_LIVE_ORS: false, // Set to true to use Cloud Function ORS API, false for Haversine
};

// Haversine formula for straight-line distance
export function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export async function calculateTransportCost(farmerLocation, buyerLocation, quantityKg) {
  let distanceKm;
  
  if (TRANSPORT_CONFIG.USE_LIVE_ORS) {
    // Call Cloud Function (Not implemented in this hackathon scope yet)
    throw new Error("Live ORS not implemented yet. Set USE_LIVE_ORS to false.");
  } else {
    // Fallback: Haversine distance
    distanceKm = getHaversineDistance(
      farmerLocation.lat, 
      farmerLocation.lng, 
      buyerLocation.lat, 
      buyerLocation.lng
    );
  }

  // Determine mode
  let mode = 'road';
  if (distanceKm > 300 && quantityKg > 500) {
    mode = 'rail';
  }

  // Calculate cost
  let charge = 0;
  if (mode === 'road') {
    charge = distanceKm * TRANSPORT_RATE_ROAD_PER_KM;
  } else {
    const quantityTonnes = quantityKg / 1000;
    charge = distanceKm * quantityTonnes * TRANSPORT_RATE_RAIL_PER_TONNE_KM;
  }

  return {
    distanceKm: Math.round(distanceKm),
    mode,
    transportCharge: Math.round(charge)
  };
}
