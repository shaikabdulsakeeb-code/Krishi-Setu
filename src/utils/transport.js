// Constants
export const TRANSPORT_RATE_ROAD_PER_KM = 18; // ₹18/km
export const TRANSPORT_RATE_RAIL_PER_TONNE_KM = 1.5; // ₹1.5/tonne-km
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY;

export const TRANSPORT_CONFIG = {
  USE_LIVE_ORS: Boolean(ORS_API_KEY),
};

export async function geocodeAddress(address) {
  if (!ORS_API_KEY) {
    throw new Error('OpenRouteService API key is required to convert an address into latitude and longitude.');
  }

  const params = new URLSearchParams({
    api_key: ORS_API_KEY,
    text: address,
    'boundary.country': 'IN',
    size: '1',
  });

  const response = await fetch(`https://api.openrouteservice.org/geocode/search?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Could not find latitude and longitude for this address.');
  }

  const data = await response.json();
  const coordinates = data?.features?.[0]?.geometry?.coordinates;
  const label = data?.features?.[0]?.properties?.label;

  if (!coordinates) {
    throw new Error('No matching location found. Please enter a more specific address.');
  }

  return {
    lng: coordinates[0],
    lat: coordinates[1],
    address: label || address,
  };
}

async function getOpenRouteServiceDistance(farmerLocation, buyerLocation) {
  const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/json', {
    method: 'POST',
    headers: {
      Authorization: ORS_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      coordinates: [
        [farmerLocation.lng, farmerLocation.lat],
        [buyerLocation.lng, buyerLocation.lat],
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('OpenRouteService could not calculate the route.');
  }

  const data = await response.json();
  const distanceMeters = data?.routes?.[0]?.summary?.distance;
  if (!distanceMeters) {
    throw new Error('OpenRouteService returned no route distance.');
  }

  return distanceMeters / 1000;
}

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
  let source = 'straight-line estimate';
  
  if (TRANSPORT_CONFIG.USE_LIVE_ORS) {
    try {
      distanceKm = await getOpenRouteServiceDistance(farmerLocation, buyerLocation);
      source = 'OpenRouteService road route';
    } catch (error) {
      console.warn(error.message);
    }
  }

  if (!distanceKm) {
    distanceKm = getHaversineDistance(
      farmerLocation.lat,
      farmerLocation.lng,
      buyerLocation.lat,
      buyerLocation.lng
    );
  } else {
    distanceKm = Math.max(distanceKm, 1);
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
    transportCharge: Math.round(charge),
    source,
  };
}
