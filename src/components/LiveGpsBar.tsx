import React from 'react';
import {
  Navigation2,
  RefreshCw,
  Radio,
  Gauge,
  Compass,
  AlertCircle,
  MapPin,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { GpsLocationResult } from '../utils/geolocation.js';
import { SupportedLanguage } from '../types.js';

interface LiveGpsBarProps {
  currentGps: GpsLocationResult | null;
  isLocating: boolean;
  isLiveTracking: boolean;
  onRefreshGps: () => void;
  onToggleLiveTracking: () => void;
  lang: SupportedLanguage;
  error?: string | null;
}

export const LiveGpsBar: React.FC<LiveGpsBarProps> = ({
  currentGps,
  isLocating,
  isLiveTracking,
  onRefreshGps,
  onToggleLiveTracking,
  lang,
  error
}) => {
  return (
    <div
      id="live_gps_system_banner"
      className="bg-[#0e1022] border border-emerald-500/30 rounded-xl p-3 text-xs font-mono shadow-lg relative overflow-hidden"
    >
      {/* Background soft glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        {/* Left: Status & Real-Time Coordinates */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
                currentGps
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-400'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
            >
              <Navigation2
                className={`w-4 h-4 ${
                  currentGps?.heading ? '' : isLocating ? 'animate-spin' : ''
                }`}
                style={{
                  transform: currentGps?.heading ? `rotate(${currentGps.heading}deg)` : undefined
                }}
              />
            </div>
            {currentGps && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide uppercase flex items-center gap-1.5 text-[11px]">
                {currentGps ? (
                  <>
                    <span className="text-emerald-400">●</span>
                    {lang === 'mr'
                      ? 'थेट GPS सक्रिय (Live Satellite)'
                      : lang === 'hi'
                      ? 'लाइव GPS सक्रिय (Live Satellite)'
                      : 'Live Real-Time GPS Active'}
                  </>
                ) : isLocating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                    {lang === 'mr' ? 'थेट GPS शोधत आहे...' : 'Acquiring Live GPS Satellite Fix...'}
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    {lang === 'mr' ? 'GPS तयार करा' : 'Live GPS Standby'}
                  </>
                )}
              </span>

              {currentGps && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-600/50 text-emerald-300 font-semibold">
                  ±{currentGps.accuracy}m {lang === 'mr' ? 'अचूकता' : 'accuracy'}
                </span>
              )}

              {currentGps && (
                <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[9px] bg-slate-800/80 border border-slate-700 text-slate-300">
                  {currentGps.source === 'inbuilt_js_gps'
                    ? '🛰️ In-built JS GPS (Device)'
                    : '📶 Built-in Network JS'}
                </span>
              )}
            </div>

            {/* Coordinates & Location string */}
            <div className="text-slate-300 text-[11px] flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
              {currentGps ? (
                <>
                  <span className="text-emerald-300 font-bold">
                    {currentGps.latitude.toFixed(5)}°N, {currentGps.longitude.toFixed(5)}°E
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-white font-medium truncate max-w-[280px]">
                    📍 {currentGps.village || currentGps.taluka || currentGps.nearestDistrict},{' '}
                    {lang === 'mr'
                      ? currentGps.nearestDistrictMarathi
                      : currentGps.nearestDistrict}
                  </span>
                  <span className="hidden md:inline text-slate-500">•</span>
                  <span className="hidden md:inline text-[10px] text-emerald-400/90 italic">
                    {lang === 'mr'
                      ? 'थेट स्थान लागू (प्रोफाइल स्थानाचा वापर बंद)'
                      : 'Live coordinates used — profile bypassed'}
                  </span>
                </>
              ) : (
                <span className="text-slate-400">
                  {lang === 'mr'
                    ? 'अचूक अंतर व डिझेल खर्चासाठी थेट उपग्रह GPS वापरा'
                    : 'Acquire real-time satellite coordinates to calculate true road freight & tolls'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Metrics & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live Speed & Motion Metrics if available */}
          {currentGps && currentGps.speed !== null && currentGps.speed !== undefined && (
            <div className="hidden lg:flex items-center gap-3 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-700/60 text-[10px]">
              <div className="flex items-center gap-1 text-slate-300">
                <Gauge className="w-3 h-3 text-cyan-400" />
                <span>{currentGps.speed} km/h</span>
              </div>
              {currentGps.heading !== null && currentGps.heading !== undefined && (
                <div className="flex items-center gap-1 text-slate-300">
                  <Compass className="w-3 h-3 text-purple-400" />
                  <span>{currentGps.heading}°</span>
                </div>
              )}
            </div>
          )}

          {/* Continuous Tracking Toggle */}
          <button
            id="btn_toggle_live_tracking"
            onClick={onToggleLiveTracking}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              isLiveTracking
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 hover:bg-emerald-600/40'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
            }`}
            title="Stream live position continuously as you travel"
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveTracking ? 'animate-pulse text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">
              {isLiveTracking
                ? lang === 'mr'
                  ? 'थेट ट्रॅकिंग चालू'
                  : 'Tracking ON'
                : lang === 'mr'
                ? 'थेट ट्रॅकिंग'
                : 'Live Tracking'}
            </span>
          </button>

          {/* Re-acquire / Refresh Live GPS button */}
          <button
            id="btn_refresh_live_gps"
            onClick={onRefreshGps}
            disabled={isLocating}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>
              {isLocating
                ? lang === 'mr'
                  ? 'शोधत आहे...'
                  : 'Acquiring...'
                : lang === 'mr'
                ? 'थेट GPS रीफ्रेश करा'
                : 'Refresh Live GPS'}
            </span>
          </button>
        </div>
      </div>

      {/* Error alert banner if any */}
      {error && (
        <div className="mt-2 pt-2 border-t border-red-500/30 flex items-center gap-2 text-red-300 text-[11px]">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
