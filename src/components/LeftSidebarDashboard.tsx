import React, { useState } from 'react';
import {
  Sprout,
  BarChart3,
  Sparkles,
  Scale,
  MapPin,
  Fuel,
  Bot,
  Layers,
  Settings,
  LogOut,
  Sliders,
  ChevronLeft,
  ChevronRight,
  X,
  Languages,
  User,
  Zap,
  Mic,
  LayoutDashboard,
  CheckCircle2,
  LocateFixed,
  Cpu
} from 'lucide-react';
import {
  FarmerProfile,
  SupportedLanguage,
  GranularLogisticsConfig,
  DesignTheme,
  ChannelComparisonResponse,
  MarketNetRealization
} from '../types.js';
import { AudioAssistant } from '../utils/audioAssistant.js';
import { GpsLocationResult } from '../utils/geolocation.js';

export type SidebarTab =
  | 'dashboard'
  | 'analysis'
  | 'ml_analytics'
  | 'deep_ai'
  | 'channels'
  | 'map'
  | 'calculator'
  | 'chatbot'
  | 'collector';

interface LeftSidebarDashboardProps {
  userProfile: FarmerProfile;
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  selectedCommodity: string;
  onSelectCommodity: (c: string) => void;
  farmerLocation: string;
  onSelectLocation: (l: string) => void;
  quantityKg: number;
  onChangeQuantity: (q: number) => void;
  produceGrade: 'Grade A' | 'Grade B' | 'Grade C';
  onChangeGrade: (g: 'Grade A' | 'Grade B' | 'Grade C') => void;
  onOpenSettings: () => void;
  onOpenLogisticsModal: () => void;
  onOpenDesignModal: () => void;
  logisticsConfig: GranularLogisticsConfig;
  lang: SupportedLanguage;
  onLanguageChange: (l: SupportedLanguage) => void;
  onLogout: () => void;
  onQuickPreset: (commodity: string, location: string, qty: number, grade: 'Grade A' | 'Grade B' | 'Grade C') => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsedDesktop: boolean;
  onToggleCollapseDesktop: () => void;
  currentTheme: DesignTheme;
  channelComparisonData?: ChannelComparisonResponse | null;
  recommendations?: MarketNetRealization[];
  currentGps?: GpsLocationResult | null;
  onDetectGps?: () => void;
  isLocatingGps?: boolean;
}

export const LeftSidebarDashboard: React.FC<LeftSidebarDashboardProps> = ({
  userProfile,
  activeTab,
  onSelectTab,
  selectedCommodity,
  onSelectCommodity,
  farmerLocation,
  onSelectLocation,
  quantityKg,
  onChangeQuantity,
  produceGrade,
  onChangeGrade,
  onOpenSettings,
  onOpenLogisticsModal,
  onOpenDesignModal,
  logisticsConfig,
  lang,
  onLanguageChange,
  onLogout,
  onQuickPreset,
  isOpenMobile,
  onCloseMobile,
  isCollapsedDesktop,
  onToggleCollapseDesktop,
  currentTheme,
  channelComparisonData,
  recommendations,
  currentGps,
  onDetectGps,
  isLocatingGps
}) => {
  const [isListening, setIsListening] = useState(false);
  const [showParameters, setShowParameters] = useState(true);

  const maharashtraDistricts = [
    { value: 'Nashik', label: 'Nashik (नाशिक)' },
    { value: 'Lasalgaon', label: 'Lasalgaon (लासलगाव)' },
    { value: 'Sangamner', label: 'Sangamner (संगमनेर)' },
    { value: 'Pune', label: 'Pune (पुणे / जुन्नर)' },
    { value: 'Narayangaon', label: 'Narayangaon (नारायणगाव)' },
    { value: 'Ahmednagar', label: 'Ahmednagar (अहमदनगर)' },
    { value: 'Solapur', label: 'Solapur (सोलापूर)' },
    { value: 'Kolhapur', label: 'Kolhapur (कोल्हापूर)' },
    { value: 'Nagpur', label: 'Nagpur (नागपूर)' },
    { value: 'Jalgaon', label: 'Jalgaon (जळगाव)' },
    { value: 'Sangli', label: 'Sangli (सांगली)' },
    { value: 'Latur', label: 'Latur (लातूर)' },
    { value: 'Satara', label: 'Satara (सातारा)' }
  ];

  const commodities = [
    { value: 'Onion', label: 'Onion (कांदा)', emoji: '🧅' },
    { value: 'Tomato', label: 'Tomato (टोमॅटो)', emoji: '🍅' },
    { value: 'Pomegranate', label: 'Pomegranate (डाळिंब)', emoji: '🍎' },
    { value: 'Grapes', label: 'Grapes (द्राक्षे)', emoji: '🍇' },
    { value: 'Soybean', label: 'Soybean (सोयाबीन)', emoji: '🌱' },
    { value: 'Cotton', label: 'Cotton (कापूस)', emoji: '☁️' },
    { value: 'Orange (Santra)', label: 'Orange (संत्रा)', emoji: '🍊' },
    { value: 'Potato', label: 'Potato (बटाटा)', emoji: '🥔' },
    { value: 'Green Chilli', label: 'Green Chilli (मिरची)', emoji: '🌶️' }
  ];

  const handleVoiceAssistantTrigger = () => {
    if (isListening) {
      AudioAssistant.stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    AudioAssistant.startListening(
      lang,
      (transcript) => {
        setIsListening(false);
        onSelectTab('chatbot');
        if (isOpenMobile) onCloseMobile();
      },
      () => {
        setIsListening(false);
      },
      (err) => {
        setIsListening(false);
      }
    );
  };

  // Best channel computation
  const bestOption = channelComparisonData?.bestOption;
  const apmcOption = channelComparisonData?.comparisonList?.find((c) => c.channel.channelType === 'APMC_MANDI');
  const processorOption = channelComparisonData?.comparisonList?.find((c) => c.channel.channelType === 'FOOD_PROCESSOR');
  const retailOption = channelComparisonData?.comparisonList?.find((c) => c.channel.channelType === 'MODERN_RETAIL');

  // Navigation Items matching FinTrack Reference Image
  const navItems = [
    {
      id: 'dashboard' as SidebarTab,
      label: lang === 'mr' ? 'डॅशबोर्ड' : 'DASHBOARD',
      icon: LayoutDashboard,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'analysis' as SidebarTab,
      label: lang === 'mr' ? 'थेट निर्णय विश्लेषण' : 'DECISION ANALYSIS',
      icon: BarChart3,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'ml_analytics' as SidebarTab,
      label: lang === 'mr' ? 'डेटा सायन्स & ML (Pandas/Seaborn)' : 'DATA SCIENCE & ML (PANDAS/SEABORN)',
      icon: Cpu,
      badge: 'ML/API',
      badgeColor: 'bg-[#064e3b] text-[#34d399] border border-[#047857]'
    },
    {
      id: 'deep_ai' as SidebarTab,
      label: lang === 'mr' ? 'सखोल AI विश्लेषण' : 'AI DEEP ANALYTICS',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-[#3b2b68] text-[#c4b5fd] border border-[#5b459d]'
    },
    {
      id: 'map' as SidebarTab,
      label: lang === 'mr' ? 'बाजार नकाशा व हिटमॅप' : 'MANDI MAP & HEATMAP',
      icon: MapPin,
      badge: 'MAP',
      badgeColor: 'bg-[#083344] text-[#38bdf8] border border-[#0284c7]'
    },
    {
      id: 'calculator' as SidebarTab,
      label: lang === 'mr' ? 'इंधन, टोल व घाट खर्च' : 'FUEL & TERRAIN CALC',
      icon: Fuel,
      badge: null,
      badgeColor: ''
    },
    {
      id: 'chatbot' as SidebarTab,
      label: lang === 'mr' ? 'AI व्हॉईस सल्लागार' : 'AI VOICE ADVISOR',
      icon: Bot,
      badge: 'AI',
      badgeColor: 'bg-[#3b2b68] text-[#c4b5fd] border border-[#5b459d]'
    },
    {
      id: 'collector' as SidebarTab,
      label: lang === 'mr' ? 'AGMARKNET डेटा पाईप' : 'AGMARKNET PIPELINE',
      icon: Layers,
      badge: 'LIVE',
      badgeColor: 'bg-[#451a03] text-[#fbbf24] border border-[#b45309]'
    }
  ];

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Left Dashboard Sidebar (FinTrack Styled Dark Panel) */}
      <aside
        id="app_left_dashboard_sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r shadow-2xl transition-all duration-300 ease-in-out bg-[#0c0d19] border-[#1d2038] text-slate-100 ${
          isCollapsedDesktop ? 'lg:w-20' : 'lg:w-[320px] xl:w-[340px]'
        } ${
          isOpenMobile ? 'translate-x-0 w-[320px] max-w-[90vw]' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* BRAND HEADER: FinTrack Style (KisanMandi / AGRI TRADE OS 2.0) */}
        <div className="p-5 border-b border-[#1d2038] flex items-center justify-between bg-[#0e1022]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center font-black shadow-[0_0_15px_rgba(99,102,241,0.5)] shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            {(!isCollapsedDesktop || isOpenMobile) && (
              <div className="leading-tight truncate">
                <div className="text-lg font-black tracking-tight text-white font-mono flex items-center gap-1.5">
                  <span>KisanMandi</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase block font-semibold">
                  AGRI TRADE OS 2.0
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1d36]"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onToggleCollapseDesktop}
              title={isCollapsedDesktop ? 'Expand Left Dashboard' : 'Collapse Left Dashboard'}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1d36] transition"
            >
              {isCollapsedDesktop ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* SCROLLABLE NAVIGATION LIST */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 scrollbar-thin">
          {/* NAVIGATE HEADER LABEL (Matches reference image) */}
          {(!isCollapsedDesktop || isOpenMobile) && (
            <div className="px-2 pt-1">
              <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase block">
                NAVIGATE
              </span>
            </div>
          )}

          {/* MAIN MENU ITEMS (FinTrack list with dots, glow pills and badges) */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`nav_btn_${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (isOpenMobile) onCloseMobile();
                  }}
                  title={item.label}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 group font-mono text-xs ${
                    isActive
                      ? 'bg-[#271f4e] border border-[#523d8c] text-white font-bold shadow-[0_0_14px_rgba(99,102,241,0.25)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#15172e] border border-transparent font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Bullet dot from reference screenshot */}
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 transition ${
                        isActive
                          ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.9)]'
                          : 'bg-slate-600 group-hover:bg-slate-400'
                      }`}
                    />
                    <span className="truncate tracking-wide">{item.label}</span>
                  </div>

                  {item.badge && (!isCollapsedDesktop || isOpenMobile) && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* SETTINGS MENU ITEM */}
            <button
              type="button"
              id="nav_btn_settings"
              onClick={() => {
                onOpenSettings();
                if (isOpenMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 group font-mono text-xs text-slate-400 hover:text-slate-200 hover:bg-[#15172e] border border-transparent font-medium"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-slate-600 group-hover:bg-slate-400" />
                <span className="truncate tracking-wide">
                  {lang === 'mr' ? 'सेटिंग्ज व प्रोफाइल' : 'SETTINGS'}
                </span>
              </div>
              <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
            </button>
          </nav>

          {/* QUICK PRODUCE PARAMETERS (Compact collapsible bar on the left) */}
          {(!isCollapsedDesktop || isOpenMobile) && (
            <div className="mt-4 pt-3 border-t border-[#1d2038] space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {lang === 'mr' ? 'शेतमाल पॅरामीटर्स' : 'FARM PARAMETERS'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowParameters((prev) => !prev)}
                  className="text-[10px] font-mono text-slate-400 hover:text-emerald-400 underline"
                >
                  {showParameters ? 'Hide' : 'Edit'}
                </button>
              </div>

              {showParameters && (
                <div className="p-3 bg-[#121426] border border-[#202340] rounded-xl space-y-2.5 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        {lang === 'mr' ? 'पीक' : 'Crop'}
                      </label>
                      <select
                        id="sidebar_select_crop"
                        value={selectedCommodity}
                        onChange={(e) => onSelectCommodity(e.target.value)}
                        className="w-full bg-[#181a32] border border-[#2c3054] rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      >
                        {commodities.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.emoji} {c.value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-slate-400 block">
                          {lang === 'mr' ? 'जिल्हा' : 'District'}
                        </label>
                        {onDetectGps && (
                          <button
                            type="button"
                            onClick={onDetectGps}
                            disabled={isLocatingGps}
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded transition flex items-center gap-1 ${
                              currentGps
                                ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-600/60'
                                : 'text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 border border-cyan-800/60'
                            }`}
                            title="Detect HTML5 GPS coordinates"
                          >
                            <LocateFixed className="w-2.5 h-2.5" />
                            <span>{currentGps ? 'GPS On' : 'GPS'}</span>
                          </button>
                        )}
                      </div>
                      <select
                        id="sidebar_select_location"
                        value={farmerLocation}
                        onChange={(e) => onSelectLocation(e.target.value)}
                        className="w-full bg-[#181a32] border border-[#2c3054] rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      >
                        {maharashtraDistricts.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.value}
                          </option>
                        ))}
                      </select>
                      {currentGps && (
                        <div className="text-[9px] text-emerald-400 font-mono mt-1 flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 font-bold text-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                            🛰️ {currentGps.latitude.toFixed(4)}°N, {currentGps.longitude.toFixed(4)}°E
                          </span>
                          <span className="text-slate-400 text-[8px] truncate">
                            📍 {currentGps.village || currentGps.nearestDistrict} (±{currentGps.accuracy}m)
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        {lang === 'mr' ? 'प्रमाण (Kg)' : 'Qty (Kg)'}
                      </label>
                      <input
                        id="sidebar_input_qty"
                        type="number"
                        min="50"
                        step="50"
                        value={quantityKg}
                        onChange={(e) => onChangeQuantity(Math.max(50, parseInt(e.target.value) || 0))}
                        className="w-full bg-[#181a32] border border-[#2c3054] rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">
                        {lang === 'mr' ? 'प्रत' : 'Grade'}
                      </label>
                      <select
                        id="sidebar_select_grade"
                        value={produceGrade}
                        onChange={(e) => onChangeGrade(e.target.value as any)}
                        className="w-full bg-[#181a32] border border-[#2c3054] rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      >
                        <option value="Grade A">Grade A</option>
                        <option value="Grade B">Grade B</option>
                        <option value="Grade C">Grade C</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between border-t border-[#1d2038]">
                    <span className="text-[10px] text-slate-400">
                      {(quantityKg / 100).toFixed(1)} Qtl • Diesel ₹92.8/L
                    </span>
                    <button
                      type="button"
                      onClick={onOpenLogisticsModal}
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Tolls/Fuel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VOICE ASSISTANT MINI TRIGGER BUTTON */}
          {(!isCollapsedDesktop || isOpenMobile) && (
            <div className="pt-2">
              <button
                type="button"
                id="btn_sidebar_mic_talk"
                onClick={handleVoiceAssistantTrigger}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-center gap-2 font-mono text-xs font-bold transition shadow-sm ${
                  isListening
                    ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
                    : 'bg-[#15172e] hover:bg-[#1e213f] border-[#292c4f] text-slate-300'
                }`}
              >
                <Mic className={`w-4 h-4 ${isListening ? 'text-rose-400' : 'text-purple-400'}`} />
                <span>
                  {isListening
                    ? (lang === 'mr' ? 'ऐकत आहे... बोला' : 'Listening...')
                    : (lang === 'mr' ? 'AI व्हॉईस बोला' : 'Voice Assistant (Mic)')}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM USER PROFILE & LANGUAGE (Matches clean footer) */}
        {(!isCollapsedDesktop || isOpenMobile) && (
          <div className="p-3.5 border-t border-[#1d2038] bg-[#0e1022] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800 text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="overflow-hidden font-mono">
                  <div className="text-xs font-bold text-slate-200 truncate">
                    {userProfile.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {userProfile?.district || 'Nashik'} • {userProfile?.primaryCrop || 'Onion'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  id="btn_sidebar_footer_settings"
                  onClick={onOpenSettings}
                  title="Farmer Settings"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a1d36] transition"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  id="btn_sidebar_footer_logout"
                  onClick={onLogout}
                  title="Log Out"
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/60 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Language Toggle Bar */}
            <div className="flex items-center justify-between text-[10px] font-mono font-bold bg-[#14162a] p-1 rounded-lg border border-[#232646]">
              <span className="text-slate-400 px-1.5 flex items-center gap-1">
                <Languages className="w-3 h-3 text-purple-400" />
                Lang:
              </span>
              <div className="flex items-center gap-1">
                {(['mr', 'hi', 'en'] as SupportedLanguage[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onLanguageChange(l)}
                    className={`px-2 py-0.5 rounded transition ${
                      lang === l
                        ? 'bg-purple-700 text-white font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिंदी' : 'EN'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
