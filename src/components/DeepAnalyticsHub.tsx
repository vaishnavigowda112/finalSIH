import React, { useState, useEffect } from 'react';
import {
  DeepAgriculturalAnalytics,
  SupportedLanguage,
  GranularLogisticsConfig
} from '../types.js';
import { GpsLocationResult } from '../utils/geolocation.js';
import {
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Fuel,
  Volume2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Zap,
  ShieldCheck,
  Compass,
  DollarSign,
  Layers,
  ChevronRight
} from 'lucide-react';
import { AudioAssistant } from '../utils/audioAssistant.js';

interface DeepAnalyticsHubProps {
  commodity: string;
  farmerLocation: string;
  quantityKg: number;
  grade: string;
  logisticsConfig: GranularLogisticsConfig;
  lang: SupportedLanguage;
  onOpenLogisticsModal: () => void;
  currentGps?: GpsLocationResult | null;
}

export const DeepAnalyticsHub: React.FC<DeepAnalyticsHubProps> = ({
  commodity,
  farmerLocation,
  quantityKg,
  grade,
  logisticsConfig,
  lang,
  onOpenLogisticsModal,
  currentGps
}) => {
  const [analytics, setAnalytics] = useState<DeepAgriculturalAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  useEffect(() => {
    fetchDeepAnalytics();
  }, [commodity, farmerLocation, quantityKg, grade, logisticsConfig, currentGps]);

  const fetchDeepAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mandi/analytics/deep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity,
          farmerLocation,
          quantityKg,
          grade,
          logisticsConfig,
          coordinates: currentGps ? { lat: currentGps.latitude, lng: currentGps.longitude } : null
        })
      });
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch Gemini Flash deep analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayVoice = () => {
    if (!analytics) return;
    if (isPlayingAudio) {
      AudioAssistant.stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    let speech = '';
    if (lang === 'mr') {
      speech = `${analytics.marketOverview.summaryMr} ${analytics.optimalTiming.bestTimeToSellMr} ${analytics.strategicTakeaways.mr.join('. ')}`;
    } else if (lang === 'hi') {
      speech = `${analytics.marketOverview.summaryHi} ${analytics.strategicTakeaways.hi.join('. ')}`;
    } else {
      speech = `${analytics.marketOverview.summaryEn} ${analytics.optimalTiming.bestTimeToSell} ${analytics.strategicTakeaways.en.join('. ')}`;
    }

    AudioAssistant.speak(speech, lang);
    setIsPlayingAudio(true);
    setTimeout(() => setIsPlayingAudio(false), 8000);
  };

  if (loading && !analytics) {
    return (
      <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 mx-auto animate-spin">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-base text-stone-900">
          {lang === 'mr'
            ? 'Gemini Flash द्वारे सखोल कृषी डेटा विश्लेषण सुरू आहे...'
            : 'Gemini Flash is analyzing inter-district price spreads, fuel friction & harvest windows...'}
        </h3>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          {commodity} • {farmerLocation} • {quantityKg} kg ({quantityKg / 100} Qtl) • {grade}
        </p>
      </div>
    );
  }

  if (!analytics) return null;

  const overviewSummary =
    lang === 'mr'
      ? analytics.marketOverview.summaryMr
      : lang === 'hi'
      ? analytics.marketOverview.summaryHi
      : analytics.marketOverview.summaryEn;

  return (
    <div className="space-y-6">
      {/* Top Banner: Market State & Executive Intelligence */}
      <section className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5">
              <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                Gemini Flash 3.5 Intelligence Engine
              </span>
              <span className="bg-amber-400/20 text-amber-200 border border-amber-400/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                Market: {analytics.marketOverview.marketState} (Volatility: {analytics.marketOverview.volatilityIndex}%)
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              {lang === 'mr'
                ? `${commodity} सखोल बाजार बुद्धिमत्ता व लिलाव वेळ अंदाज`
                : `${commodity} Deep Market Analytics & Arbitrage Strategy`}
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {overviewSummary}
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handlePlayVoice}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs ${
                isPlayingAudio
                  ? 'bg-amber-400 text-stone-900 animate-pulse'
                  : 'bg-white text-emerald-950 hover:bg-emerald-50'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingAudio ? (lang === 'mr' ? 'थांबवा' : 'Stop') : (lang === 'mr' ? 'सल्ला ऐका' : 'Listen')}</span>
            </button>

            <button
              onClick={fetchDeepAnalytics}
              disabled={loading}
              className="p-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-xl border border-emerald-500/30 transition shadow-xs"
              title="Re-run Gemini Flash Deep Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      {/* 3 Core Analytical Tiles: Arbitrage, Optimal Timing, Sensitivity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Inter-District Arbitrage Radar */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold">
                  <Scale className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-xs text-stone-900">
                  {lang === 'mr' ? 'आंतर-जिल्हा आर्बिट्राज संधी' : 'Inter-District Price Spread Radar'}
                </h3>
              </div>
              <span className="text-[10px] text-stone-400 font-bold uppercase">Agmarknet + GPS</span>
            </div>

            <p className="text-[11px] text-stone-500">
              {lang === 'mr'
                ? 'बाजार दर फरक विरुद्ध डिझेल, टोल आणि कसारा घाट वाहतूक घर्षण'
                : 'Gross market rate gap minus calculated round-trip diesel, toll taxes & transit delays.'}
            </p>

            <div className="space-y-2.5 pt-1">
              {analytics.arbitrageMatrix.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5 hover:border-emerald-500 transition"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-stone-900">
                    <span>{item.route}</span>
                    <span className="text-emerald-700 font-mono">
                      +₹{item.netArbitrageProfitPerQtl}/Qtl
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                    <span>Spread: ₹{item.priceSpreadPerQtl}/Qtl</span>
                    <span>Transit: -₹{item.estimatedLogisticsCost}/Qtl</span>
                  </div>
                  <p className="text-[10px] text-stone-600 italic">
                    {lang === 'mr' ? item.recommendationMr : item.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[10px] text-stone-400">Deductions synchronized</span>
            <button
              onClick={onOpenLogisticsModal}
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>{lang === 'mr' ? 'खर्च बदला' : 'Edit Logistics'}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Optimal Timing & Auction Dispatch Window */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-xs text-stone-900">
                  {lang === 'mr' ? 'सर्वोत्तम लिलाव व डिस्पॅच वेळ' : 'Optimal Dispatch & Auction Window'}
                </h3>
              </div>
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {analytics.optimalTiming.recommendedAction}
              </span>
            </div>

            <p className="text-[11px] text-stone-500">
              {lang === 'mr'
                ? 'व्यापारी गर्दी, पहाटेचा लिलाव आणि वजन घट टाळण्यासाठी वेळेचा अंदाज'
                : 'Strategic timing to maximize buyer bidding competition and minimize transit weight loss.'}
            </p>

            <div className="space-y-3 pt-1">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  {lang === 'mr' ? 'शिफारस केलेली वेळ:' : 'Recommended Departure Window:'}
                </span>
                <p className="text-xs font-bold text-stone-900 leading-snug">
                  {lang === 'mr'
                    ? analytics.optimalTiming.bestTimeToSellMr
                    : analytics.optimalTiming.bestTimeToSell}
                </p>
              </div>

              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  {lang === 'mr' ? 'मुख्य लिलाव स्लॉट:' : 'Target APMC Auction Slot:'}
                </span>
                <p className="text-xs font-semibold text-stone-800">
                  {lang === 'mr'
                    ? analytics.optimalTiming.auctionWindowMr
                    : analytics.optimalTiming.auctionWindow}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Arrival queue: ~45 mins</span>
            <span className="font-bold text-emerald-700 font-mono">Early Slot Peak Rate</span>
          </div>
        </div>

        {/* Card 3: Logistics Sensitivity & Fuel Shock Test */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center font-bold">
                  <Fuel className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-xs text-stone-900">
                  {lang === 'mr' ? 'इंधन संवेदनशीलता व घाट जोखीम' : 'Fuel & Transit Sensitivity Shock'}
                </h3>
              </div>
              <span className="text-[10px] text-stone-400 font-mono">
                {logisticsConfig.fuelType.toUpperCase()} @ ₹{logisticsConfig.fuelPricePerLitre}/L
              </span>
            </div>

            <p className="text-[11px] text-stone-500">
              {lang === 'mr'
                ? 'डिझेल वाढ, टोल आकार आणि घाट रस्त्यावरील शेतमाल नुकसानीचा प्रभाव'
                : 'Quantified impact of diesel price spikes, toll expenses, and Kasara Ghat road shock.'}
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
                <span className="text-[10px] font-bold text-stone-500 block uppercase">Diesel Shock Test</span>
                <p className="text-[11px] text-stone-800 mt-0.5">
                  {analytics.logisticsSensitivity.dieselImpact}
                </p>
              </div>

              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
                <span className="text-[10px] font-bold text-stone-500 block uppercase">Fastag Toll Ratio</span>
                <p className="text-[11px] text-stone-800 mt-0.5">
                  {analytics.logisticsSensitivity.tollImpact}
                </p>
              </div>

              <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="text-[10px] font-bold text-amber-800 block uppercase">Transit Spoilage Factor</span>
                <p className="text-[11px] text-stone-800 mt-0.5">
                  {analytics.logisticsSensitivity.ghatDelayRisk}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[10px] text-stone-400">Road Quality: {logisticsConfig.roadQuality.replace('_', ' ')}</span>
            <span className="text-[11px] font-bold text-emerald-800">
              Toll: ₹{logisticsConfig.tollCharges}
            </span>
          </div>
        </div>
      </div>

      {/* Strategic Takeaways Box */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-2xs">
        <h3 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-700" />
          {lang === 'mr'
            ? 'Gemini Flash कृषी धोरणात्मक शिफारसी (Strategic Takeaways):'
            : 'Gemini Flash Strategic Trade Takeaways & Profit Safeguards:'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(lang === 'mr'
            ? analytics.strategicTakeaways.mr
            : lang === 'hi'
            ? analytics.strategicTakeaways.hi
            : analytics.strategicTakeaways.en
          ).map((tip, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl flex items-start gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs text-stone-800 font-medium leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
