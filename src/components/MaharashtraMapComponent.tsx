import React, { useState, useMemo } from 'react';
import { SupportedLanguage } from '../types.js';
import {
  MapPin,
  Navigation,
  TrendingUp,
  DollarSign,
  Compass,
  LocateFixed,
  Radio,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Layers,
  ArrowUpRight,
  Info,
  Car
} from 'lucide-react';
import {
  GpsLocationResult,
  requestBrowserGeolocation,
  calculateHaversineDistanceKm,
  MAHARASHTRA_REGIONS
} from '../utils/geolocation.js';

export interface MarketMapItem {
  id: string;
  market: string;
  marketMarathi?: string;
  district: string;
  districtMarathi?: string;
  state: string;
  commodity: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  arrivals_tonnes: number;
  latitude: number;
  longitude: number;
  distanceKm: number;
  roadQuality?: string;
  terrainName?: string | { en?: string; mr?: string; hi?: string };
  tollCharges?: number;
  estimatedTransportCost?: number;
}

interface MaharashtraMapProps {
  markets: MarketMapItem[];
  farmerLocation: string;
  selectedCommodity: string;
  lang: SupportedLanguage;
  onSelectMarket: (marketName: string) => void;
  currentGps?: GpsLocationResult | null;
  onLocationDetected?: (result: GpsLocationResult) => void;
}

export const MaharashtraMapComponent: React.FC<MaharashtraMapProps> = ({
  markets,
  farmerLocation,
  selectedCommodity,
  lang,
  onSelectMarket,
  currentGps,
  onLocationDetected
}) => {
  // Local geolocation tracking states
  const [internalGps, setInternalGps] = useState<GpsLocationResult | null>(currentGps || null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showHaulageVectors, setShowHaulageVectors] = useState<boolean>(true);
  const [showDistanceRings, setShowDistanceRings] = useState<boolean>(true);
  const [activeMandiDetail, setActiveMandiDetail] = useState<MarketMapItem | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'price' | 'arrivals'>('distance');

  // Active GPS source: prop currentGps or local internalGps
  const activeGps = currentGps || internalGps;

  // Resolve default fallback coordinates for farmer location
  const farmerFallbackCoord = useMemo(() => {
    const locKey = (farmerLocation || 'nashik').toLowerCase().trim();
    const match = MAHARASHTRA_REGIONS.find((r) => r.name.toLowerCase() === locKey);
    return match ? { lat: match.lat, lng: match.lng } : { lat: 19.9975, lng: 73.7898 };
  }, [farmerLocation]);

  // Farmer's active coordinates: exact live GPS if available, else district centroid
  const farmerCoord = useMemo(() => {
    if (activeGps) {
      return {
        lat: activeGps.latitude,
        lng: activeGps.longitude,
        isLiveGps: true,
        accuracy: activeGps.accuracy
      };
    }
    return {
      lat: farmerFallbackCoord.lat,
      lng: farmerFallbackCoord.lng,
      isLiveGps: false,
      accuracy: undefined
    };
  }, [activeGps, farmerFallbackCoord]);

  // Handle HTML5 Geolocation using navigator.geolocation.getCurrentPosition()
  const handleTriggerGeolocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    try {
      const result = await requestBrowserGeolocation();
      setInternalGps(result);
      if (onLocationDetected) {
        onLocationDetected(result);
      }
    } catch (err: any) {
      setLocationError(err.message || 'Failed to retrieve browser GPS coordinates.');
    } finally {
      setIsLocating(false);
    }
  };

  // Geographic Bounding box for Maharashtra: Lat ~ 15.6 to 22.1, Lng ~ 72.4 to 81.0
  const minLat = 15.6;
  const maxLat = 22.1;
  const minLng = 72.4;
  const maxLng = 81.0;

  // Convert GPS lat/lng into SVG coordinates (percentages: 0 to 100)
  const getCoordinates = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return {
      x: Math.max(5, Math.min(95, x)),
      y: Math.max(8, Math.min(92, y))
    };
  };

  const farmerSvgPos = getCoordinates(farmerCoord.lat, farmerCoord.lng);

  // Compute live Haversine distances to each mandi from the active coordinates
  const calculatedMarkets = useMemo(() => {
    return markets.map((m) => {
      const exactDistance = calculateHaversineDistanceKm(
        farmerCoord.lat,
        farmerCoord.lng,
        m.latitude,
        m.longitude
      );
      return {
        ...m,
        liveDistanceKm: exactDistance
      };
    });
  }, [markets, farmerCoord]);

  // Sorted markets based on user preference
  const sortedMarkets = useMemo(() => {
    const list = [...calculatedMarkets];
    if (sortBy === 'distance') {
      list.sort((a, b) => a.liveDistanceKm - b.liveDistanceKm);
    } else if (sortBy === 'price') {
      list.sort((a, b) => b.modal_price - a.modal_price);
    } else if (sortBy === 'arrivals') {
      list.sort((a, b) => (b.arrivals_tonnes || 0) - (a.arrivals_tonnes || 0));
    }
    return list;
  }, [calculatedMarkets, sortBy]);

  // Scale 50km and 100km to SVG radius percentages
  // Approx: 1 deg lat = 111 km, height of 6.5 deg lat ~ 720 km
  const kmToSvgRadius = (km: number) => (km / 720) * 100;

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER & GEOLOCATION CONTROLLER */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Compass className="w-3 h-3 text-emerald-700" />
                {lang === 'mr'
                  ? 'महाराष्ट्र एपीएमसी थेट नकाशा व जीआयएस'
                  : 'Maharashtra APMC Live Mandi GIS'}
              </span>
              <span className="bg-sky-50 text-sky-800 border border-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-sky-700" />
                HTML5 Geolocation
              </span>
            </div>
            <h3 className="font-bold text-base text-stone-900 mt-1 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-700" />
              {lang === 'mr'
                ? 'कृषी उत्पन्न बाजार समिती नकाशा व अंतर मोजणी'
                : 'Mandi Network & True GPS Haulage Map'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {lang === 'mr'
                ? `निवडक पीक: ${selectedCommodity} • शेतकऱ्याचे केंद्र: ${
                    activeGps ? `${activeGps.nearestDistrict} (थेट GPS)` : farmerLocation
                  }`
                : `Active Commodity: ${selectedCommodity} • Farmer Center: ${
                    activeGps ? `${activeGps.nearestDistrict} (Live GPS)` : farmerLocation
                  }`}
            </p>
          </div>

          {/* HTML5 Geolocation Trigger Button */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              id="btn_trigger_html5_geolocation"
              onClick={handleTriggerGeolocation}
              disabled={isLocating}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border ${
                activeGps
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
            >
              {isLocating ? (
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-700" />
              ) : (
                <LocateFixed className="w-4 h-4" />
              )}
              <span>
                {isLocating
                  ? lang === 'mr'
                    ? 'स्थान शोधत आहे (GPS)...'
                    : 'Acquiring GPS...'
                  : activeGps
                  ? lang === 'mr'
                    ? 'थेट GPS अपडेट करा'
                    : 'Refresh Live GPS'
                  : lang === 'mr'
                  ? 'माझे अचूक शेत स्थान शोधा (GPS)'
                  : 'Detect My Farm (HTML5 GPS)'}
              </span>
            </button>

            {/* Map Layers Toggles */}
            <div className="inline-flex rounded-xl p-1 bg-stone-100 border border-stone-200 text-xs">
              <button
                type="button"
                onClick={() => setShowHaulageVectors(!showHaulageVectors)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  showHaulageVectors ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                }`}
                title="Toggle straight-line haulage vectors to mandis"
              >
                <Car className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {lang === 'mr' ? 'मार्ग रेषा' : 'Haulage Lines'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setShowDistanceRings(!showDistanceRings)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                  showDistanceRings ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                }`}
                title="Toggle 50km and 100km distance radar rings"
              >
                <Radio className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {lang === 'mr' ? 'अंतर वलय' : 'Radar Rings'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Live GPS Telemetry Status Banner */}
        {activeGps ? (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
              </span>
              <span className="font-bold">
                {lang === 'mr'
                  ? 'थेट HTML5 GPS सक्रिय आहे:'
                  : 'Live HTML5 Geolocation Active:'}
              </span>
              <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">
                {activeGps.latitude.toFixed(4)}°N, {activeGps.longitude.toFixed(4)}°E
              </span>
              <span className="text-emerald-800 text-[11px]">
                (±{activeGps.accuracy}m accuracy)
              </span>
            </div>
            <div className="text-emerald-900 font-semibold text-[11px]">
              {lang === 'mr'
                ? `जवळचा जिल्हा/तालुका: ${activeGps.nearestDistrictMarathi} (~${activeGps.distanceToDistrictKm} km)`
                : `Nearest District Hub: ${activeGps.nearestDistrict} (~${activeGps.distanceToDistrictKm} km)`}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-stone-400 shrink-0" />
              <span>
                {lang === 'mr'
                  ? `सध्याचा बेस: ${farmerLocation} (जिल्हा केंद्र). अचूक अंतर मोजण्यासाठी वरील "माझे अचूक शेत स्थान शोधा" वर क्लिक करा.`
                  : `Currently using district centroid (${farmerLocation}). Click "Detect My Farm (HTML5 GPS)" to calibrate distances to your exact field.`}
              </span>
            </div>
            <span className="text-[10px] font-semibold text-stone-500 bg-stone-200/60 px-2 py-0.5 rounded">
              Built-in navigator.geolocation
            </span>
          </div>
        )}

        {/* Location Error Notification (if permission denied or timed out) */}
        {locationError && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">
                {lang === 'mr' ? 'स्थान परवानगी सूचना:' : 'Geolocation Notice:'}
              </span>
              <p>{locationError}</p>
              <p className="text-[11px] text-amber-800">
                {lang === 'mr'
                  ? 'टीप: ब्राउझर सेटिंग्जमध्ये जाऊन Location परवानगी सक्षम करा किंवा खालील यादीतून तुमचा जिल्हा निवडा.'
                  : 'Tip: Enable Location Permissions in your browser bar, or continue using your selected Maharashtra district.'}
              </p>
            </div>
          </div>
        )}

        {/* 2. THE INTERACTIVE MAHARASHTRA SVG MAP CANVAS */}
        <div className="relative w-full h-[480px] bg-gradient-to-b from-stone-50 to-stone-100/90 rounded-2xl border border-stone-200 overflow-hidden select-none">
          {/* Subtle Cartographic Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#E2E8F0_1px,transparent_1px),linear-gradient(to_bottom,#E2E8F0_1px,transparent_1px)] bg-[size:36px_36px] opacity-45 pointer-events-none" />

          {/* Regional Geographic Watermark Labels */}
          <span className="absolute top-5 left-8 text-[10px] font-black text-stone-400 uppercase tracking-widest pointer-events-none">
            Khandesh / North MH
          </span>
          <span className="absolute top-5 right-12 text-[10px] font-black text-stone-400 uppercase tracking-widest pointer-events-none">
            Vidarbha (Nagpur / Amravati)
          </span>
          <span className="absolute bottom-6 left-10 text-[10px] font-black text-stone-400 uppercase tracking-widest pointer-events-none">
            Western MH (Pune / Kolhapur / Sangli)
          </span>
          <span className="absolute bottom-6 right-20 text-[10px] font-black text-stone-400 uppercase tracking-widest pointer-events-none">
            Marathwada (Latur / Nanded / Beed)
          </span>
          <span className="absolute top-36 left-4 text-[9px] font-bold text-sky-400/80 uppercase tracking-wider pointer-events-none">
            Arabian Sea / Konkan Coast
          </span>

          {/* SVG Vector Overlays: Radar Distance Rings & Haulage Connectors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <radialGradient id="farmerRadarGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                <stop offset="60%" stopColor="#0284c7" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Concentric Distance Rings around Farmer */}
            {showDistanceRings && (
              <>
                <circle
                  cx={`${farmerSvgPos.x}%`}
                  cy={`${farmerSvgPos.y}%`}
                  r={`${kmToSvgRadius(50)}%`}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.3"
                />
                <circle
                  cx={`${farmerSvgPos.x}%`}
                  cy={`${farmerSvgPos.y}%`}
                  r={`${kmToSvgRadius(100)}%`}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.2"
                />
                <circle
                  cx={`${farmerSvgPos.x}%`}
                  cy={`${farmerSvgPos.y}%`}
                  r={`${kmToSvgRadius(180)}%`}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="1"
                  strokeDasharray="5 5"
                  opacity="0.15"
                />
              </>
            )}

            {/* Straight-line Haulage Vectors from Farmer to Mandis */}
            {showHaulageVectors &&
              calculatedMarkets.map((m) => {
                const pos = getCoordinates(m.latitude, m.longitude);
                const isSelected = activeMandiDetail?.id === m.id;
                return (
                  <g key={`vector_${m.id}`}>
                    <line
                      x1={`${farmerSvgPos.x}%`}
                      y1={`${farmerSvgPos.y}%`}
                      x2={`${pos.x}%`}
                      y2={`${pos.y}%`}
                      stroke={isSelected ? '#047857' : '#94a3b8'}
                      strokeWidth={isSelected ? 2.5 : 1}
                      strokeDasharray={isSelected ? 'none' : '3 3'}
                      opacity={isSelected ? 0.9 : 0.4}
                    />
                  </g>
                );
              })}
          </svg>

          {/* 1. PLOTTED FARMER'S PIN (Pulsing Radar Beacon) */}
          <div
            id="map_pin_farmer_base"
            style={{ left: `${farmerSvgPos.x}%`, top: `${farmerSvgPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
          >
            <div className="relative group cursor-pointer flex flex-col items-center">
              {/* Radar Ping Animation */}
              <div className="absolute -inset-3 rounded-full bg-sky-500 opacity-30 animate-ping pointer-events-none" />

              {/* Marker Core */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-sky-400">
                <Navigation className="w-4 h-4 transform -rotate-45 fill-white" />
              </div>

              {/* Label Pill */}
              <div className="mt-1 bg-stone-900/90 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight shadow-md whitespace-nowrap flex items-center gap-1 border border-stone-700">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block animate-pulse" />
                <span>
                  {activeGps
                    ? lang === 'mr'
                      ? 'तुमचे शेत (थेट GPS)'
                      : 'Your Farm (Live GPS)'
                    : lang === 'mr'
                    ? `तुमचे केंद्र (${farmerLocation})`
                    : `Your Base (${farmerLocation})`}
                </span>
              </div>

              {/* Hover Tooltip for Farmer Coordinates */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-stone-900 text-stone-100 p-2.5 rounded-xl shadow-xl text-[11px] space-y-1 z-30 pointer-events-none">
                <div className="font-bold text-white border-b border-stone-700 pb-1">
                  {activeGps ? 'HTML5 Geolocation Fix' : 'District Centroid'}
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Latitude:</span>
                  <span className="font-mono text-cyan-300">{farmerCoord.lat.toFixed(4)}°N</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Longitude:</span>
                  <span className="font-mono text-cyan-300">{farmerCoord.lng.toFixed(4)}°E</span>
                </div>
                {farmerCoord.accuracy && (
                  <div className="flex justify-between">
                    <span className="text-stone-400">Accuracy:</span>
                    <span className="text-emerald-400">±{farmerCoord.accuracy} meters</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. PLOTTED APMC MANDI PINS */}
          {calculatedMarkets.map((m) => {
            const { x, y } = getCoordinates(m.latitude, m.longitude);
            const isHigh = m.modal_price >= 2500;
            const isSelected = activeMandiDetail?.id === m.id;

            return (
              <div
                key={m.id}
                id={`map_pin_${m.id}`}
                onClick={() => {
                  setActiveMandiDetail(m);
                  onSelectMarket(m.market);
                }}
                style={{ left: `${x}%`, top: `${y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
              >
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold shadow-md transition-transform transform group-hover:scale-110 border ${
                    isSelected
                      ? 'bg-emerald-800 text-white ring-2 ring-emerald-400 border-emerald-950 scale-105'
                      : isHigh
                      ? 'bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-800'
                      : 'bg-white text-stone-900 border-stone-300 hover:border-amber-500'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap font-sans">
                    {lang === 'mr' && m.marketMarathi ? m.marketMarathi : m.market}
                  </span>
                  <span className="font-mono text-[11px] bg-black/15 px-1.5 py-0.5 rounded">
                    ₹{m.modal_price}
                  </span>
                </div>

                {/* Hover Tooltip with Live Haversine Distance */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 bg-white text-stone-800 border border-stone-300 p-3 rounded-xl shadow-xl text-[11px] space-y-1.5 z-30 pointer-events-none">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-1">
                    <span className="font-bold text-stone-900">{m.market}</span>
                    <span className="text-[10px] text-stone-500">{m.district}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Modal Price:</span>
                    <strong className="text-emerald-700 font-mono">₹{m.modal_price}/qtl</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">
                      {activeGps ? 'True GPS Distance:' : 'Road Distance:'}
                    </span>
                    <strong className="text-sky-800 font-mono">{m.liveDistanceKm} km</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Mandi Arrivals:</span>
                    <span className="text-stone-700">{m.arrivals_tonnes} tonnes</span>
                  </div>
                  {m.terrainName && (
                    <div className="flex justify-between text-[10px] text-stone-500 border-t border-stone-100 pt-1">
                      <span>Terrain:</span>
                      <span className="font-medium text-stone-700">
                        {typeof m.terrainName === 'object' && m.terrainName !== null
                          ? (m.terrainName as any)[lang] || (m.terrainName as any).mr || (m.terrainName as any).en || ''
                          : String(m.terrainName)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. ACTIVE SELECTED MANDI HAULAGE CARD (IF CLICKED) */}
        {activeMandiDetail && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Selected Mandi
                </span>
                <h4 className="font-bold text-stone-900 text-sm">
                  {lang === 'mr' && activeMandiDetail.marketMarathi
                    ? activeMandiDetail.marketMarathi
                    : activeMandiDetail.market}{' '}
                  APMC ({activeMandiDetail.district})
                </h4>
              </div>
              <p className="text-xs text-stone-600 mt-1">
                {lang === 'mr'
                  ? `थेट शेतापासून अंतर: ${activeMandiDetail.liveDistanceKm} किमी • भाव: ₹${activeMandiDetail.modal_price}/क्विं • आवक: ${activeMandiDetail.arrivals_tonnes} टन`
                  : `Distance from your field: ${activeMandiDetail.liveDistanceKm} km • Modal Price: ₹${activeMandiDetail.modal_price}/qtl • Arrivals: ${activeMandiDetail.arrivals_tonnes} Tonnes`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectMarket(activeMandiDetail.market)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <span>{lang === 'mr' ? 'तपशीलवार नफा विश्लेषण पहा' : 'View Net Realization'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 4. MANDI DIRECTORY TABLE SORTED BY DISTANCE / PRICE */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>
                {lang === 'mr'
                  ? `बाजार समित्या यादी (${sortedMarkets.length} मंड्या)`
                  : `APMC Mandi Haulage Directory (${sortedMarkets.length} Markets)`}
              </span>
            </h4>

            {/* Sort Controls */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 text-[11px]">
                {lang === 'mr' ? 'क्रमवारी:' : 'Sort by:'}
              </span>
              <div className="inline-flex rounded-lg p-0.5 bg-stone-100 border border-stone-200">
                <button
                  type="button"
                  onClick={() => setSortBy('distance')}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors ${
                    sortBy === 'distance' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  {lang === 'mr' ? 'अंतर (जवळून)' : 'Distance'}
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('price')}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors ${
                    sortBy === 'price' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  {lang === 'mr' ? 'बाजारभाव (जास्त)' : 'Price'}
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('arrivals')}
                  className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-colors ${
                    sortBy === 'arrivals' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  {lang === 'mr' ? 'आवक' : 'Arrivals'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sortedMarkets.map((m) => {
              const isSelected = activeMandiDetail?.id === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => {
                    setActiveMandiDetail(m);
                    onSelectMarket(m.market);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 text-xs ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-400/30'
                      : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-stone-900">
                        {lang === 'mr' && m.marketMarathi ? m.marketMarathi : m.market}
                      </div>
                      <div className="text-[11px] text-stone-500">{m.district}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-800 font-mono text-sm">
                        ₹{m.modal_price}
                      </div>
                      <div className="text-[10px] text-stone-400">per qtl</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-600 border-t border-stone-200/60 pt-1.5">
                    <span className="font-mono font-semibold text-sky-800 flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-sky-600" />
                      {m.liveDistanceKm} km
                    </span>
                    <span className="text-stone-500">{m.arrivals_tonnes || 120} T</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
