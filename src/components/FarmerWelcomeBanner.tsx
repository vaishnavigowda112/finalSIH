import React from 'react';
import {
  Sprout,
  MapPin,
  Scale,
  Settings,
  RefreshCw,
  Award,
  Sparkles,
  Volume2,
  CheckCircle2
} from 'lucide-react';
import { FarmerProfile, SupportedLanguage } from '../types';

interface FarmerWelcomeBannerProps {
  profile: FarmerProfile;
  onOpenSettings: () => void;
  onRefreshData: () => void;
  onSpeakWelcome: () => void;
  lang: SupportedLanguage;
  loading?: boolean;
}

export const FarmerWelcomeBanner: React.FC<FarmerWelcomeBannerProps> = ({
  profile,
  onOpenSettings,
  onRefreshData,
  onSpeakWelcome,
  lang,
  loading = false
}) => {
  const getCropEmoji = (crop: string) => {
    switch (crop.toLowerCase()) {
      case 'onion':
        return '🧅';
      case 'tomato':
        return '🍅';
      case 'pomegranate':
        return '🍎';
      case 'grapes':
        return '🍇';
      case 'soybean':
        return '🌱';
      case 'cotton':
        return '☁️';
      case 'orange (santra)':
        return '🍊';
      case 'potato':
        return '🥔';
      case 'green chilli':
        return '🌶️';
      default:
        return '🌾';
    }
  };

  return (
    <section
      id="farmer_welcoming_hub_banner"
      className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden border border-emerald-700/40"
    >
      {/* Background soft ambient pattern */}
      <div className="absolute right-0 top-0 -bottom-10 w-96 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.15),transparent_70%)] pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
        {/* Left Side: Welcoming Greeting & Identification */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {lang === 'mr'
                ? 'प्रमाणित शेतकरी डॅशबोर्ड'
                : lang === 'hi'
                ? 'प्रमाणित किसान डैशबोर्ड'
                : 'Verified Farmer Dashboard'}
            </span>
            <button
              type="button"
              onClick={onSpeakWelcome}
              title="Speak welcome summary"
              className="p-1 rounded-lg bg-emerald-700/60 hover:bg-emerald-600 text-emerald-200 transition"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>
              {lang === 'mr'
                ? `नमस्कार, ${profile.name}! 👋`
                : lang === 'hi'
                ? `स्वागत है, ${profile.name}! 👋`
                : `Welcome, ${profile.name}! 👋`}
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
            {lang === 'mr'
              ? `तुमच्या ${profile.address || profile.district} परिसरासाठी महाराष्ट्र APMC मंड्यांचे थेट भाव, इंधन व टोल खर्च वजा करून निव्वळ नफा खाली विश्लेषण केला आहे.`
              : `Real-time APMC Mandi prices, fuel, tolls and direct buyer realization analyzed for your produce.`}
          </p>
        </div>

        {/* Right Side: Registered Crop Badges & Settings CTA */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Active Produce Stat Card */}
          <div className="bg-stone-900/80 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-3 flex items-center gap-3 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-400/30 flex items-center justify-center text-xl shrink-0">
              {getCropEmoji(profile.primaryCrop)}
            </div>
            <div>
              <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                {lang === 'mr' ? 'नोंदणीकृत पीक' : 'Registered Crop'}
              </div>
              <div className="text-xs font-bold text-white">
                {profile?.primaryCrop || 'Onion'} • {((profile?.harvestQuantityKg ? profile.harvestQuantityKg : 1000) / 100).toFixed(1)} Qtl
              </div>
              <div className="text-[10px] text-stone-400">
                {profile.grade} • {profile.district}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              id="btn_welcome_open_settings"
              onClick={onOpenSettings}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <Settings className="w-4 h-4 text-amber-300" />
              <span>{lang === 'mr' ? 'सेटिंग्ज बदला' : 'Settings'}</span>
            </button>

            <button
              type="button"
              id="btn_welcome_refresh_rates"
              onClick={onRefreshData}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-stone-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{lang === 'mr' ? 'दर अपडेट करा' : 'Refresh Rates'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
