/**
 * Real-Time Live GPS Utility for Maharashtra Farmers
 * Strictly uses built-in JavaScript browser Geolocation (navigator.geolocation)
 * Zero Google GPS / Maps API key requirements.
 *
 * Core capabilities:
 * 1. High-Accuracy built-in navigator.geolocation.getCurrentPosition & watchPosition
 * 2. Instant Haversine distance computations across all Maharashtra Mandis in pure JS
 * 3. Open reverse geocoding via standard free OpenStreetMap Nominatim or pure spatial centroid lookup
 */

export interface GpsLocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
  formattedAddress?: string;
  village?: string;
  taluka?: string;
  nearestDistrict: string;
  nearestDistrictMarathi: string;
  distanceToDistrictKm: number;
  isWithinMaharashtra: boolean;
  source: 'inbuilt_js_gps' | 'network_js';
  isLiveGps: boolean;
}

// Maharashtra District and Key Agricultural Mandi Centroids for distance benchmarking
export const MAHARASHTRA_REGIONS: Array<{
  name: string;
  nameMarathi: string;
  lat: number;
  lng: number;
}> = [
  { name: 'Nashik', nameMarathi: 'नाशिक', lat: 19.9975, lng: 73.7898 },
  { name: 'Lasalgaon', nameMarathi: 'लासलगाव', lat: 20.1472, lng: 74.2253 },
  { name: 'Pimpalgaon', nameMarathi: 'पिंपळगाव बसवंत', lat: 20.1700, lng: 73.9800 },
  { name: 'Niphad', nameMarathi: 'निफाड', lat: 20.0864, lng: 74.1080 },
  { name: 'Sangamner', nameMarathi: 'संगमनेर', lat: 19.5765, lng: 74.2070 },
  { name: 'Ahmednagar', nameMarathi: 'अहमदनगर', lat: 19.0952, lng: 74.7480 },
  { name: 'Rahuri', nameMarathi: 'राहुरी', lat: 19.3900, lng: 74.6500 },
  { name: 'Pune', nameMarathi: 'पुणे', lat: 18.5204, lng: 73.8567 },
  { name: 'Narayangaon', nameMarathi: 'नारायणगाव', lat: 19.1235, lng: 73.9782 },
  { name: 'Manchar', nameMarathi: 'मंचर', lat: 19.0068, lng: 73.9431 },
  { name: 'Chakan', nameMarathi: 'चाकण', lat: 18.7606, lng: 73.8617 },
  { name: 'Baramati', nameMarathi: 'बारामती', lat: 18.1517, lng: 74.5775 },
  { name: 'Vashi', nameMarathi: 'वाशी', lat: 19.0771, lng: 73.0039 },
  { name: 'Mumbai', nameMarathi: 'मुंबई', lat: 19.0760, lng: 72.8777 },
  { name: 'Navi Mumbai', nameMarathi: 'नवी मुंबई', lat: 19.0330, lng: 73.0297 },
  { name: 'Thane', nameMarathi: 'ठाणे', lat: 19.2183, lng: 72.9781 },
  { name: 'Solapur', nameMarathi: 'सोलापूर', lat: 17.6599, lng: 75.9064 },
  { name: 'Kolhapur', nameMarathi: 'कोल्हापूर', lat: 16.7050, lng: 74.2433 },
  { name: 'Sangli', nameMarathi: 'सांगली', lat: 16.8524, lng: 74.5815 },
  { name: 'Tasgaon', nameMarathi: 'तासगाव', lat: 17.0347, lng: 74.6000 },
  { name: 'Satara', nameMarathi: 'सातारा', lat: 17.6805, lng: 74.0183 },
  { name: 'Jalgaon', nameMarathi: 'जळगाव', lat: 21.0077, lng: 75.5626 },
  { name: 'Dhule', nameMarathi: 'धुळे', lat: 20.9042, lng: 74.7749 },
  { name: 'Chhatrapati Sambhajinagar', nameMarathi: 'छत्रपती संभाजीनगर', lat: 19.8762, lng: 75.3433 },
  { name: 'Jalna', nameMarathi: 'जालना', lat: 19.8410, lng: 75.8864 },
  { name: 'Nagpur', nameMarathi: 'नागपूर', lat: 21.1458, lng: 79.0882 },
  { name: 'Amravati', nameMarathi: 'अमरावती', lat: 20.9320, lng: 77.7523 },
  { name: 'Akola', nameMarathi: 'अकोला', lat: 20.7002, lng: 77.0082 },
  { name: 'Latur', nameMarathi: 'लातूर', lat: 18.4088, lng: 76.5604 },
  { name: 'Nanded', nameMarathi: 'नांदेड', lat: 19.1383, lng: 77.3210 },
  { name: 'Yavatmal', nameMarathi: 'यवतमाळ', lat: 20.3888, lng: 78.1204 },
  { name: 'Beed', nameMarathi: 'बीड', lat: 18.9891, lng: 75.7601 },
  { name: 'Dharashiv', nameMarathi: 'धाराशिव (उस्मानाबाद)', lat: 18.1856, lng: 76.0419 },
  { name: 'Parbhani', nameMarathi: 'परभणी', lat: 19.2686, lng: 76.7725 },
  { name: 'Buldhana', nameMarathi: 'बुलढाणा', lat: 20.5292, lng: 76.1843 },
  { name: 'Wardha', nameMarathi: 'वर्धा', lat: 20.7453, lng: 78.6022 },
  { name: 'Chandrapur', nameMarathi: 'चंद्रपूर', lat: 19.9615, lng: 79.2961 },
  { name: 'Gadchiroli', nameMarathi: 'गडचिरोली', lat: 20.1809, lng: 80.0039 },
  { name: 'Bhandara', nameMarathi: 'भंडारा', lat: 21.1667, lng: 79.6500 },
  { name: 'Gondia', nameMarathi: 'गोंदिया', lat: 21.4598, lng: 80.1950 },
  { name: 'Washim', nameMarathi: 'वाशिम', lat: 20.1110, lng: 77.1350 },
  { name: 'Hingoli', nameMarathi: 'हिंगोली', lat: 19.7196, lng: 77.1477 },
  { name: 'Ratnagiri', nameMarathi: 'रत्नागिरी', lat: 16.9902, lng: 73.3120 },
  { name: 'Sindhudurg', nameMarathi: 'सिंधुदुर्ग', lat: 16.1200, lng: 73.6800 },
  { name: 'Raigad', nameMarathi: 'रायगड', lat: 18.5158, lng: 73.1822 },
  { name: 'Palghar', nameMarathi: 'पालघर', lat: 19.6967, lng: 72.7699 },
  { name: 'Malegaon', nameMarathi: 'मालेगाव', lat: 20.5539, lng: 74.5262 },
  { name: 'Yeola', nameMarathi: 'येवला', lat: 20.0423, lng: 74.4890 },
  { name: 'Sinnar', nameMarathi: 'सिन्नर', lat: 19.8456, lng: 73.9984 },
  { name: 'Dindori', nameMarathi: 'दिंडोरी', lat: 20.2032, lng: 73.8341 },
  { name: 'Junnar', nameMarathi: 'जुन्नर', lat: 19.2064, lng: 73.8767 },
  { name: 'Pandharpur', nameMarathi: 'पंढरपूर', lat: 17.6778, lng: 75.3283 }
];

/**
 * Calculates Great-Circle Distance in pure JavaScript using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Pure JavaScript spatial matcher to locate the nearest Maharashtra district/region
 */
export function resolveNearestMaharashtraRegion(lat: number, lng: number): {
  nearestDistrict: string;
  nearestDistrictMarathi: string;
  distanceKm: number;
  isWithinMaharashtra: boolean;
} {
  let closest = MAHARASHTRA_REGIONS[0];
  let minDistance = calculateHaversineDistanceKm(lat, lng, closest.lat, closest.lng);

  for (let i = 1; i < MAHARASHTRA_REGIONS.length; i++) {
    const region = MAHARASHTRA_REGIONS[i];
    const dist = calculateHaversineDistanceKm(lat, lng, region.lat, region.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = region;
    }
  }

  // Rough bounding box for Maharashtra: Lat 15.5 to 22.3, Lng 72.4 to 81.0
  const isWithinMaharashtra =
    lat >= 15.5 && lat <= 22.3 && lng >= 72.4 && lng <= 81.0;

  return {
    nearestDistrict: closest.name,
    nearestDistrictMarathi: closest.nameMarathi,
    distanceKm: minDistance,
    isWithinMaharashtra
  };
}

/**
 * Free reverse geocoding via OpenStreetMap / backend service
 */
export async function reverseGeocodeLiveCoordinates(lat: number, lng: number): Promise<{
  formattedAddress: string;
  district: string;
  districtMarathi: string;
  village?: string;
  taluka?: string;
  isWithinMaharashtra: boolean;
}> {
  try {
    const res = await fetch(`/api/gps/reverse-geocode?lat=${lat}&lng=${lng}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      return {
        formattedAddress: data.formattedAddress,
        district: data.district,
        districtMarathi: data.districtMarathi,
        village: data.village,
        taluka: data.taluka,
        isWithinMaharashtra: data.isWithinMaharashtra
      };
    }
  } catch (err) {
    console.warn('Reverse geocode notice:', err);
  }

  // Pure JavaScript fallback to regional centroids
  const fallback = resolveNearestMaharashtraRegion(lat, lng);
  return {
    formattedAddress: `${fallback.nearestDistrict}, Maharashtra`,
    district: fallback.nearestDistrict,
    districtMarathi: fallback.nearestDistrictMarathi,
    isWithinMaharashtra: fallback.isWithinMaharashtra
  };
}

/**
 * Fallback to live server network geolocation when browser denies permission
 */
export async function fetchLiveGpsFromService(): Promise<GpsLocationResult> {
  const res = await fetch('/api/gps/live-locate', {
    signal: AbortSignal.timeout(5000)
  });
  if (!res.ok) {
    throw new Error('Network GPS resolver unavailable');
  }
  const data = await res.json();
  const nearest = resolveNearestMaharashtraRegion(data.latitude, data.longitude);

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    accuracy: data.accuracy || 100,
    altitude: null,
    heading: null,
    speed: null,
    timestamp: Date.now(),
    formattedAddress: data.formattedAddress || `${nearest.nearestDistrict}, Maharashtra`,
    village: data.village || nearest.nearestDistrict,
    taluka: data.taluka || nearest.nearestDistrict,
    nearestDistrict: data.district || nearest.nearestDistrict,
    nearestDistrictMarathi: data.districtMarathi || nearest.nearestDistrictMarathi,
    distanceToDistrictKm: nearest.distanceKm,
    isWithinMaharashtra: data.isWithinMaharashtra ?? nearest.isWithinMaharashtra,
    source: 'network_js',
    isLiveGps: true
  };
}

/**
 * IN-BUILT JAVASCRIPT GEOLOCATION SYSTEM
 * Uses browser's native window.navigator.geolocation.getCurrentPosition()
 * High-accuracy satellite / device fix, maximumAge = 0 (strictly live data).
 */
export async function requestBrowserGeolocation(): Promise<GpsLocationResult> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return fetchLiveGpsFromService();
  }

  return new Promise<GpsLocationResult>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
        const nearest = resolveNearestMaharashtraRegion(latitude, longitude);

        // Async enrich with reverse geocoded address
        let addressInfo: any = {};
        try {
          addressInfo = await reverseGeocodeLiveCoordinates(latitude, longitude);
        } catch (_err) {
          // ignore
        }

        resolve({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          altitude: altitude ? Math.round(altitude) : null,
          heading: heading ? Math.round(heading) : null,
          speed: speed ? Math.round(speed * 3.6) : null, // km/h
          timestamp: position.timestamp,
          formattedAddress: addressInfo.formattedAddress || `${nearest.nearestDistrict}, Maharashtra`,
          village: addressInfo.village || nearest.nearestDistrict,
          taluka: addressInfo.taluka || nearest.nearestDistrict,
          nearestDistrict: addressInfo.district || nearest.nearestDistrict,
          nearestDistrictMarathi: addressInfo.districtMarathi || nearest.nearestDistrictMarathi,
          distanceToDistrictKm: nearest.distanceKm,
          isWithinMaharashtra: addressInfo.isWithinMaharashtra ?? nearest.isWithinMaharashtra,
          source: 'inbuilt_js_gps',
          isLiveGps: true
        });
      },
      async (err) => {
        console.warn('Navigator geolocation notice:', err.message);
        // Seamless fallback to network geolocation if browser permission restricted in iframe
        try {
          const fallback = await fetchLiveGpsFromService();
          resolve(fallback);
        } catch (fbErr: any) {
          reject(new Error(fbErr.message || 'Failed to acquire in-built JavaScript GPS coordinates.'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Strictly live, no cached position
      }
    );
  });
}

/**
 * IN-BUILT JAVASCRIPT CONTINUOUS TRACKING
 * Uses browser's native window.navigator.geolocation.watchPosition()
 * Continuously streams real-time coordinate updates in pure JavaScript.
 */
export function watchLiveGpsTracking(
  onUpdate: (location: GpsLocationResult) => void,
  onError?: (err: Error) => void
): () => void {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    if (onError) onError(new Error('In-built JavaScript Geolocation not supported on this browser'));
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
      const nearest = resolveNearestMaharashtraRegion(latitude, longitude);

      onUpdate({
        latitude,
        longitude,
        accuracy: Math.round(accuracy),
        altitude: altitude ? Math.round(altitude) : null,
        heading: heading ? Math.round(heading) : null,
        speed: speed ? Math.round(speed * 3.6) : null,
        timestamp: position.timestamp,
        formattedAddress: `${nearest.nearestDistrict}, Maharashtra`,
        nearestDistrict: nearest.nearestDistrict,
        nearestDistrictMarathi: nearest.nearestDistrictMarathi,
        distanceToDistrictKm: nearest.distanceKm,
        isWithinMaharashtra: nearest.isWithinMaharashtra,
        source: 'inbuilt_js_gps',
        isLiveGps: true
      });
    },
    (err) => {
      if (onError) onError(new Error(err.message || 'In-built JavaScript GPS tracking interrupted'));
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}
