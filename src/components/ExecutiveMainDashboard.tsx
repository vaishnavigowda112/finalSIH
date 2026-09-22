import React from 'react';
import {
  Building2,
  Zap,
  Scale,
  Sliders,
  TrendingUp,
  MapPin,
  Truck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  FarmerProfile,
  SupportedLanguage,
  ChannelComparisonResponse,
  MarketNetRealization
} from '../types.js';

interface ExecutiveMainDashboardProps {
  userProfile: FarmerProfile;
  selectedCommodity: string;
  farmerLocation: string;
  quantityKg: number;
  produceGrade: string;
  channelComparisonData: ChannelComparisonResponse | null;
  recommendations?: MarketNetRealization[];
  lang: SupportedLanguage;
  onSelectTab: (tab: 'dashboard' | 'analysis' | 'ml_analytics' | 'deep_ai' | 'map' | 'calculator' | 'chatbot' | 'collector') => void;
  onOpenSettings: () => void;
  onOpenLogisticsModal: () => void;
}

export const ExecutiveMainDashboard: React.FC<ExecutiveMainDashboardProps> = ({
  userProfile,
  selectedCommodity,
  farmerLocation,
  quantityKg,
  produceGrade,
  channelComparisonData,
  recommendations = [],
  lang,
  onSelectTab,
  onOpenSettings,
  onOpenLogisticsModal
}) => {
  // Time-of-day greeting calculation
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (lang === 'mr') {
      if (hour < 12) return `शुभ सकाळ, ${userProfile.name}`;
      if (hour < 17) return `शुभ दुपार, ${userProfile.name}`;
      if (hour < 17) return `शुभ दुपार, ${userProfile.name}`;
      return `शुभ संध्याकाळ, ${userProfile.name}`;
    }
    if (hour < 12) return `Good Morning, ${userProfile.name}`;
    if (hour < 17) return `Good Afternoon, ${userProfile.name}`;
    return `Good Evening, ${userProfile.name}`;
  };

  // Precise Bill Patching / Net in Pocket calculation
  const bestOption = channelComparisonData?.bestOption;
  const grossRev = bestOption?.grossRevenue || Math.round(quantityKg * 32.5);
  // Total expenses exactly equals gross revenue minus net in-pocket realization
  const netInPocket = bestOption ? bestOption.netRealization : Math.round(grossRev * 0.84);
  const totalExpenses = grossRev - netInPocket;
  const realizationPct = Math.round((netInPocket / Math.max(1, grossRev)) * 100);

  // Formatted string values
  const formattedGross = `₹${(grossRev / 1000).toFixed(1)}K`;
  const formattedExpenses = `-₹${(totalExpenses / 1000).toFixed(1)}K`;
  const formattedNet = `₹${(netInPocket / 1000).toFixed(1)}K`;

  // Top benchmark APMC mandi
  const topMandi = recommendations[0];

  return (
    <div className="space-y-6 text-slate-100 pb-8">
      {/* 1. EXECUTIVE GREETING & MANDI HIGHLIGHT HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-mono flex items-center gap-3">
            <span>{getGreeting()}</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            {lang === 'mr'
              ? `थेट Agmarknet बाजारभाव व वाहतूक नफा विश्लेषण डॅशबोर्ड`
              : `Live Agmarknet mandi benchmarks and real-time net realization dashboard`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#17192f] border border-[#2b2e54] text-slate-300 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {selectedCommodity} • {farmerLocation} • {(quantityKg / 100).toFixed(1)} Qtl ({produceGrade})
          </span>
          <button
            type="button"
            onClick={onOpenLogisticsModal}
            className="p-2 rounded-xl bg-[#17192f] hover:bg-[#202342] border border-[#2b2e54] text-slate-300 transition"
            title="Logistics Math"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* 2. EXECUTIVE FINANCIAL OVERVIEW CARDS (Mathematical Consistency: Gross - Total Deductions = Net) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gross Produce Value */}
        <div className="bg-[#121324] border border-[#202340] rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span>{lang === 'mr' ? 'एकूण उत्पन्न' : 'GROSS PRODUCE VALUE'}</span>
            <span className="text-slate-500 font-normal">{quantityKg} kg</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {formattedGross}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            ₹{bestOption ? bestOption.channel.offeredPricePerQtl : 3250}/qtl baseline
          </div>
        </div>

        {/* Total Logistics & Deductions */}
        <div className="bg-[#121324] border border-[#202340] rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span>{lang === 'mr' ? 'एकूण खर्च व कपाती' : 'TOTAL DEDUCTIONS'}</span>
            <Truck className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {formattedExpenses}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {lang === 'mr' ? 'इंधन, टोल, हमाली व सेस' : 'Fuel, Fastag, Hamali & Cess'}
          </div>
        </div>

        {/* Final Net In-Pocket Cash */}
        <div className="bg-[#121324] border border-[#064e3b] rounded-2xl p-5 shadow-lg space-y-2 bg-gradient-to-br from-[#121324] to-[#0a2318]">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span>{lang === 'mr' ? 'हातात निव्वळ नफा' : 'NET IN-POCKET CASH'}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-700/50">
              {realizationPct}% Realized
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {formattedNet}
          </div>
          <div className="text-[11px] text-emerald-300 font-mono">
            ₹{bestOption ? bestOption.netRatePerKg : (netInPocket / quantityKg).toFixed(2)}/kg net in pocket
          </div>
        </div>
      </div>

      {/* 3. APMC MARKET HIGHLIGHT & DECISION LINK */}
      <div className="bg-[#121324] border border-[#202340] rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202340] pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
              {lang === 'mr' ? 'प्रमुख एपीएमसी बाजार समिती तुलना' : 'PRIMARY APMC MANDI BENCHMARK'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('analysis')}
            className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
          >
            <span>{lang === 'mr' ? 'संपूर्ण निर्णय विश्लेषण उघडा' : 'Open Complete Decision Analysis'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {recommendations.slice(0, 3).map((mandi, idx) => (
            <div
              key={mandi.marketId || idx}
              className={`p-4 rounded-xl border transition ${
                idx === 0
                  ? 'bg-[#151d28] border-emerald-700/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : 'bg-[#181a32] border-[#272b4c]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#202447] flex items-center justify-center text-xs font-bold font-mono text-emerald-400">
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">
                      {lang === 'mr' && mandi.marketNameMarathi ? mandi.marketNameMarathi : mandi.marketName}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">{mandi.district}</span>
                  </div>
                </div>
                {idx === 0 && (
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                    {lang === 'mr' ? 'सर्वोत्तम' : 'Top Choice'}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-[#272b4c]">
                <div className="flex justify-between text-slate-400">
                  <span>Modal Price:</span>
                  <span className="text-slate-200 font-bold">₹{mandi.modalPricePerQtl}/qtl</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Distance:</span>
                  <span className="text-slate-300">{mandi.distanceKm} km</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Logistics Cost:</span>
                  <span className="text-rose-400 font-medium">-₹{mandi.transportCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#272b4c] text-slate-100 font-bold">
                  <span className="text-emerald-400">Net Realization:</span>
                  <span className="text-emerald-300 text-sm font-bold">₹{mandi.netRealization.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
