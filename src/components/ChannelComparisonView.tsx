import React, { useState } from 'react';
import {
  ChannelComparisonResponse,
  ChannelComparisonItem,
  SupportedLanguage
} from '../types.js';
import { TRANSLATIONS } from '../utils/translations.js';
import { AudioAssistant } from '../utils/audioAssistant.js';
import {
  Building2,
  Factory,
  Store,
  CheckCircle2,
  AlertTriangle,
  Fuel,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  ShieldCheck,
  Percent,
  Truck,
  Sparkles,
  Sliders
} from 'lucide-react';

interface ChannelComparisonViewProps {
  data: ChannelComparisonResponse;
  lang: SupportedLanguage;
  onOpenLogisticsModal: () => void;
}

export const ChannelComparisonView: React.FC<ChannelComparisonViewProps> = ({
  data,
  lang,
  onOpenLogisticsModal
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const t = TRANSLATIONS[lang].channelHeaders;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const playAudioAdvice = (item: ChannelComparisonItem) => {
    if (playingId === item.channel.id) {
      AudioAssistant.stopSpeaking();
      setPlayingId(null);
      return;
    }

    let speechText = '';
    if (lang === 'mr') {
      speechText = `${item.channel.nameMarathi || item.channel.name} येथे शेतमाल विकल्यास ${item.distanceKm} किलोमीटर अंतरासाठी डिझेल खर्च ₹${item.logisticsBreakdown.fuelCost} व टोल ₹${item.logisticsBreakdown.tollCharges} वजा जाता तुम्हाला ₹${item.netRealization} इतका निव्वळ नफा मिळेल. दर प्रति किलो ₹${item.netRatePerKg} पडेल.`;
    } else if (lang === 'hi') {
      speechText = `${item.channel.nameHindi || item.channel.name} में बिक्री करने पर ${item.distanceKm} किमी के लिए ईंधन खर्च ₹${item.logisticsBreakdown.fuelCost} और टोल ₹${item.logisticsBreakdown.tollCharges} घटाने के बाद ₹${item.netRealization} शुद्ध लाभ मिलेगा।`;
    } else {
      speechText = `Selling to ${item.channel.name} located ${item.distanceKm} km away yields a net in-pocket payout of ₹${item.netRealization} (₹${item.netRatePerKg} per kg) after ₹${item.logisticsBreakdown.totalLogisticsAndDeductions} in freight, fuel, and toll deductions.`;
    }

    setPlayingId(item.channel.id);
    AudioAssistant.speak(
      speechText,
      lang,
      () => setPlayingId(item.channel.id),
      () => setPlayingId(null)
    );
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'FOOD_PROCESSOR':
        return <Factory className="w-5 h-5 text-indigo-700" />;
      case 'MODERN_RETAILER':
        return <Store className="w-5 h-5 text-purple-700" />;
      case 'APMC_MANDI':
      default:
        return <Building2 className="w-5 h-5 text-amber-700" />;
    }
  };

  const getChannelBadge = (type: string) => {
    switch (type) {
      case 'FOOD_PROCESSOR':
        return {
          label: lang === 'mr' ? 'अन्न प्रक्रिया उद्योग' : (lang === 'hi' ? 'खाद्य प्रसंस्करण' : 'Food Processor'),
          classes: 'bg-indigo-50 text-indigo-800 border-indigo-200'
        };
      case 'MODERN_RETAILER':
        return {
          label: lang === 'mr' ? 'किरकोळ साखळी / हब' : (lang === 'hi' ? 'आधुनिक रिटेलर' : 'Modern Retailer Hub'),
          classes: 'bg-purple-50 text-purple-800 border-purple-200'
        };
      case 'APMC_MANDI':
      default:
        return {
          label: lang === 'mr' ? 'कृषी उत्पन्न बाजार समिती' : (lang === 'hi' ? 'एपीएमसी मंडी' : 'APMC Mandi'),
          classes: 'bg-amber-50 text-amber-800 border-amber-200'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Trilingual Strategic Banner */}
      {data.aiTradeAdvisory && (
        <div
          id="ai_channel_advisory_card"
          className="bg-white border border-stone-200 p-5 sm:p-6 rounded-2xl relative overflow-hidden shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  AI Channel Strategy Advisor
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {data.farmerProduce.location} • {data.farmerProduce.quantityKg} kg {data.farmerProduce.commodity}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-normal pt-1">
                {lang === 'mr'
                  ? data.aiTradeAdvisory.marathi
                  : (lang === 'hi' ? data.aiTradeAdvisory.hindi : data.aiTradeAdvisory.english)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                id="btn_play_main_advisory_audio"
                onClick={() => {
                  const speech = lang === 'mr'
                    ? data.aiTradeAdvisory?.marathi
                    : (lang === 'hi' ? data.aiTradeAdvisory?.hindi : data.aiTradeAdvisory?.english);
                  if (speech) {
                    AudioAssistant.speak(speech, lang);
                  }
                }}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition shadow-sm"
              >
                <Volume2 className="w-4 h-4" />
                <span>{t.audioAdvice}</span>
              </button>
            </div>
          </div>

          {data.aiTradeAdvisory.keyPoints && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-4 pt-3 border-t border-stone-100 text-xs text-stone-700">
              {data.aiTradeAdvisory.keyPoints.map((kp, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{kp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comparison Grid */}
      <div className="space-y-4">
        {data.comparisonList.map((item) => {
          const badge = getChannelBadge(item.channel.channelType);
          const isExpanded = expandedId === item.channel.id;
          const isWinner = item.isBestOption;

          return (
            <div
              key={item.channel.id}
              id={`channel_card_${item.channel.id}`}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white ${
                isWinner
                  ? 'border-emerald-600 shadow-md ring-2 ring-emerald-600/20'
                  : 'border-stone-200 hover:border-stone-300 hover:shadow-sm'
              }`}
            >
              {/* Winner Ribbon */}
              {isWinner && (
                <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {lang === 'mr' ? 'सर्वोत्तम निव्वळ नफा देणारा पर्याय' : (lang === 'hi' ? 'सर्वोत्तम शुद्ध आय विकल्प' : 'Optimal Net Payout Choice')}
                  </span>
                  <span className="font-mono">
                    +₹{(item.netRealization - (data.comparisonList[1]?.netRealization || 0)).toLocaleString('en-IN')} {lang === 'mr' ? 'जास्त नफा' : 'Higher Profit'}
                  </span>
                </div>
              )}

              <div className="p-5 sm:p-6 space-y-4">
                {/* Header Row */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center">
                        {getChannelIcon(item.channel.channelType)}
                      </div>
                      <span className="font-bold text-base text-stone-900">
                        {lang === 'mr' && item.channel.nameMarathi ? item.channel.nameMarathi : item.channel.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.classes}`}>
                        {badge.label}
                      </span>
                      <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-stone-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        {item.channel.reliabilityScore}/100 Trust
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {item.channel.location} ({item.distanceKm} km)
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        ~{item.travelTimeHours} hrs transit
                      </span>
                      <span className="flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5 text-stone-400" />
                        {item.channel.paymentDays === 1 ? 'T+1 Same/Next Day' : `${item.channel.paymentDays} Days DBT`}
                      </span>
                    </div>
                  </div>

                  {/* Price & Realization Block */}
                  <div className="flex items-center gap-3 sm:gap-6 self-stretch sm:self-auto justify-between bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-stone-500 font-bold uppercase block tracking-wider">
                        {t.grossRevenue}
                      </span>
                      <div className="text-sm font-bold text-stone-800 font-mono">
                        ₹{item.grossRevenue.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-stone-500">
                        ₹{item.channel.offeredPricePerQtl}/qtl
                      </span>
                    </div>

                    <div className="h-8 w-px bg-stone-200" />

                    <div className="text-right">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase block tracking-wider">
                        {t.netRealization}
                      </span>
                      <div className="text-lg sm:text-xl font-bold text-emerald-800 font-mono">
                        ₹{item.netRealization.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">
                        (₹{item.netRatePerKg}/kg net)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pros & Cons Mini Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Pros */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-1.5">
                    <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      {t.pros}
                    </div>
                    <ul className="space-y-1 text-xs text-stone-700">
                      {item.channel.prosCons.pros.map((p: any, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-emerald-700 text-xs font-bold">•</span>
                          <span>
                            {typeof p === 'object' && p !== null
                              ? p[lang] || p.mr || p.hi || p.en || ''
                              : String(p || '')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 space-y-1.5">
                    <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      {t.cons}
                    </div>
                    <ul className="space-y-1 text-xs text-stone-700">
                      {item.channel.prosCons.cons.map((c: any, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-rose-600 text-xs font-bold">•</span>
                          <span>
                            {typeof c === 'object' && c !== null
                              ? c[lang] || c.mr || c.hi || c.en || ''
                              : String(c || '')}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Detailed Breakdown Accordion Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-3">
                    <button
                      id={`btn_toggle_breakdown_${item.channel.id}`}
                      type="button"
                      onClick={() => toggleExpand(item.channel.id)}
                      className="text-xs font-bold text-stone-700 hover:text-stone-900 flex items-center gap-1.5 transition"
                    >
                      <span>{t.viewBreakdown}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-stone-500" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-400" />}
                    </button>
                    <span className="text-xs text-stone-500 font-mono">
                      Logistics & Deductions: -₹{item.logisticsBreakdown.totalLogisticsAndDeductions.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id={`btn_audio_channel_${item.channel.id}`}
                      onClick={() => playAudioAdvice(item)}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                        playingId === item.channel.id
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-stone-100 text-stone-700 hover:text-stone-900 hover:bg-stone-200 border-stone-200'
                      }`}
                    >
                      {playingId === item.channel.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-700" />}
                      <span>{playingId === item.channel.id ? 'Stop' : (lang === 'mr' ? 'ऑडिओ' : 'Listen')}</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Breakdown Drawer */}
                {isExpanded && (
                  <div
                    id={`breakdown_details_${item.channel.id}`}
                    className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4 text-xs"
                  >
                    <div className="font-bold text-stone-800 flex items-center justify-between border-b border-stone-200 pb-2">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-emerald-700" />
                        {lang === 'mr' ? 'तपशीलवार खर्च व कपात गणित' : 'Granular Expense & Deduction Math'}
                      </span>
                      <button
                        onClick={onOpenLogisticsModal}
                        className="text-[11px] text-emerald-700 font-semibold hover:underline"
                      >
                        {lang === 'mr' ? 'दर बदला' : 'Edit Rates'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-500 block uppercase font-medium">
                          {lang === 'mr' ? 'गाडी भाडे व अंतर शुल्क' : 'Vehicle Hire & Driver Fee'}
                        </span>
                        <strong className="text-stone-900 font-mono text-sm">₹{item.logisticsBreakdown.vehicleHireBaseFare + item.logisticsBreakdown.driverAndDistanceCost}</strong>
                        <span className="text-[10px] text-stone-400 block">Base ₹{item.logisticsBreakdown.vehicleHireBaseFare} + Driver Km</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-500 block uppercase font-medium">
                          {lang === 'mr' ? 'इंधन खर्च' : 'Fuel Cost'} ({item.logisticsBreakdown.fuelType.toUpperCase()})
                        </span>
                        <strong className="text-stone-900 font-mono text-sm">₹{item.logisticsBreakdown.fuelCost}</strong>
                        <span className="text-[10px] text-stone-400 block">({item.logisticsBreakdown.litresConsumed} L consumed)</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-500 block uppercase font-medium">
                          {lang === 'mr' ? 'टोल खर्च (फास्टॅग)' : 'Highway Tolls'}
                        </span>
                        <strong className="text-stone-900 font-mono text-sm">₹{item.logisticsBreakdown.tollCharges}</strong>
                        <span className="text-[10px] text-stone-400 block">MH Highway Plaza</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-500 block uppercase font-medium">
                          {lang === 'mr' ? 'हमाली व उतराई' : 'Hamali & Labor'}
                        </span>
                        <strong className="text-stone-900 font-mono text-sm">₹{item.logisticsBreakdown.hamaliCharges}</strong>
                        <span className="text-[10px] text-stone-400 block">Loading/Unloading</span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-500 block uppercase font-medium">
                          {lang === 'mr' ? 'मंडी सेस व वजन पावती' : 'APMC Cess & Gate Fee'}
                        </span>
                        <strong className="text-stone-900 font-mono text-sm">₹{item.logisticsBreakdown.mandiCessAmount + item.logisticsBreakdown.parkingAndEntryFee}</strong>
                        <span className="text-[10px] text-stone-400 block">
                          {item.channel.channelType === 'APMC_MANDI' ? 'Cess + Weighbridge' : '0% for Direct Sale'}
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-500 block uppercase font-medium">
                          {lang === 'mr' ? 'एकूण कपाती' : 'Total Deductions'}
                        </span>
                        <strong className="text-rose-700 font-mono text-sm">-₹{item.logisticsBreakdown.totalLogisticsAndDeductions + item.rejectionLossAmount}</strong>
                        <span className="text-[10px] text-stone-400 block">All Heads Included</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="bg-white p-3 rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-600 font-bold block mb-1">
                          {lang === 'mr' ? 'रस्त्याची स्थिती व फळे नुकसान बफर' : 'Road Transit Spoilage / Bruising'}
                        </span>
                        <div className="text-stone-800 font-mono">
                          -₹{item.logisticsBreakdown.roadQualityEffect.spoilageLossAmount} <span className="text-stone-500 text-xs font-sans">({item.logisticsBreakdown.roadQualityEffect.spoilageDamagePct}% buffer on {item.logisticsBreakdown.roadQualityEffect.roadType.replace('_', ' ')})</span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-stone-200">
                        <span className="text-[10px] text-stone-600 font-bold block mb-1">
                          {lang === 'mr' ? 'गुणवत्ता रिजेक्शन अंदाज' : 'Quality Rejection Risk Loss'}
                        </span>
                        <div className="text-stone-800 font-mono">
                          -₹{item.rejectionLossAmount} <span className="text-stone-500 text-xs font-sans">({item.channel.qualityTolerance})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
