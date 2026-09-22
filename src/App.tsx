import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  MapPin,
  Sparkles,
  Layers,
  Truck,
  ShieldCheck,
  Bot,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  ChevronRight,
  Store,
  Building2,
  Info,
  Award,
  Check,
  Send,
  User,
  Sliders,
  Fuel,
  Volume2,
  VolumeX,
  Languages,
  Factory,
  AlertTriangle,
  Flame,
  FileText,
  BarChart3,
  Scale,
  Zap,
  Sprout,
  Palette,
  Settings,
  Menu,
  LayoutDashboard,
  LocateFixed
} from 'lucide-react';
import {
  MandiRecord,
  MarketNetRealization,
  PriceForecast,
  QualityMatchResult,
  ChatMessage,
  SupportedLanguage,
  ChannelComparisonResponse,
  GranularLogisticsConfig,
  DesignTheme,
  FarmerProfile,
  UserSession
} from './types.js';
import { TRANSLATIONS } from './utils/translations.js';
import { AudioAssistant } from './utils/audioAssistant.js';
import { GpsLocationResult, requestBrowserGeolocation, watchLiveGpsTracking } from './utils/geolocation.js';
import { LiveGpsBar } from './components/LiveGpsBar.js';
import { ChannelComparisonView } from './components/ChannelComparisonView.js';
import { LogisticsCalculatorModal } from './components/LogisticsCalculatorModal.js';
import { MaharashtraMapComponent } from './components/MaharashtraMapComponent.js';
import { VoiceAssistantBar } from './components/VoiceAssistantBar.js';
import { UnifiedAnalysisDashboard } from './components/UnifiedAnalysisDashboard.js';
import { DesignOptionsModal } from './components/DesignOptionsModal.js';
import { DeepAnalyticsHub } from './components/DeepAnalyticsHub.js';
import { CollectorPipelineView } from './components/CollectorPipelineView.js';
import { AuthScreen } from './components/AuthScreen.js';
import { FarmerOnboardingModal } from './components/FarmerOnboardingModal.js';
import { FarmerSettingsModal } from './components/FarmerSettingsModal.js';
import { FarmerWelcomeBanner } from './components/FarmerWelcomeBanner.js';
import { LeftSidebarDashboard, SidebarTab } from './components/LeftSidebarDashboard.js';
import { ExecutiveMainDashboard } from './components/ExecutiveMainDashboard.js';
import { DataScienceAnalyticsHub } from './components/DataScienceAnalyticsHub.js';

export default function App() {
  const [lang, setLang] = useState<SupportedLanguage>('mr'); // Default to Marathi for Maharashtra specificity

  // User Authentication & Profile Session
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('kisan_mandi_user_session');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading saved user session', e);
    }
    return null;
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [onboardingIdentifier, setOnboardingIdentifier] = useState<string>('');
  const [isFarmerSettingsOpen, setIsFarmerSettingsOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isCollapsedDesktop, setIsCollapsedDesktop] = useState<boolean>(false);

  const [currentTheme, setCurrentTheme] = useState<DesignTheme>(() => {
    return (localStorage.getItem('kisanmandi_design_theme') as DesignTheme) || 'trader_terminal';
  });
  const [isDesignModalOpen, setIsDesignModalOpen] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [isOverviewExpanded, setIsOverviewExpanded] = useState<boolean>(true);
  const [activeFeatureTab, setActiveFeatureTab] = useState<
    'analysis' | 'ml_analytics' | 'deep_ai' | 'channels' | 'map' | 'calculator' | 'chatbot' | 'collector' | 'all'
  >('analysis');

  const handleFeatureTabSelect = (
    tabId: 'analysis' | 'ml_analytics' | 'deep_ai' | 'channels' | 'map' | 'calculator' | 'chatbot' | 'collector' | 'all'
  ) => {
    const target = tabId === 'channels' ? 'analysis' : tabId;
    setActiveFeatureTab(target);
    if (target === 'all') {
      setActiveTab('dashboard');
    } else {
      setActiveTab(target as SidebarTab);
    }
  };

  // Persist theme choice
  const handleSelectTheme = (theme: DesignTheme) => {
    setCurrentTheme(theme);
    localStorage.setItem('kisanmandi_design_theme', theme);
  };

  // Core Agricultural Parameters (Maharashtra centric)
  const [selectedCommodity, setSelectedCommodity] = useState<string>(() => userSession?.profile?.primaryCrop || 'Onion');
  const [selectedMarket, setSelectedMarket] = useState<string>('Lasalgaon');
  const [farmerLocation, setFarmerLocation] = useState<string>(() => userSession?.profile?.district || 'Nashik');
  const [quantityKg, setQuantityKg] = useState<number>(() => userSession?.profile?.harvestQuantityKg || 1000);
  const [produceGrade, setProduceGrade] = useState<'Grade A' | 'Grade B' | 'Grade C'>(() => userSession?.profile?.grade || 'Grade A');
  const [avgSizeMm, setAvgSizeMm] = useState<number>(65);

  // Granular Logistics & Fuel State
  const [logisticsConfig, setLogisticsConfig] = useState<GranularLogisticsConfig>({
    fuelType: 'diesel',
    fuelPricePerLitre: 92.80,
    mileageKmPerLitre: 11.5,
    roadQuality: 'state_highway',
    isRoundTrip: false,
    tollCharges: 185,
    unexpectedHeads: {
      hamaliPerQtl: 20,
      mandiCessPct: 1.5,
      parkingAndEntryFee: 80,
      transitDelayLossPct: 2.5
    }
  });

  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState<boolean>(false);

  // Data States
  const [mandiRecords, setMandiRecords] = useState<MandiRecord[]>([]);
  const [channelComparisonData, setChannelComparisonData] = useState<ChannelComparisonResponse | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [trendData, setTrendData] = useState<{ history: any[]; forecast: PriceForecast | null }>({
    history: [],
    forecast: null
  });
  const [mapData, setMapData] = useState<any>(null);
  const [buyerMatches, setBuyerMatches] = useState<QualityMatchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<any>(null);

  // HTML5 Browser Geolocation State - Strictly Real-Time Live GPS
  const [currentGps, setCurrentGps] = useState<GpsLocationResult | null>(null);
  const [isLocatingGlobal, setIsLocatingGlobal] = useState<boolean>(false);
  const [globalGpsError, setGlobalGpsError] = useState<string | null>(null);
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(false);

  const handleLocationDetected = (result: GpsLocationResult) => {
    setCurrentGps(result);
    // Explicitly update location string to reflect the live GPS position (village / taluka / district)
    setFarmerLocation(result.nearestDistrict);
  };

  const handleDetectGlobalGps = async () => {
    setIsLocatingGlobal(true);
    setGlobalGpsError(null);
    try {
      const result = await requestBrowserGeolocation();
      handleLocationDetected(result);
    } catch (err: any) {
      console.warn('Live GPS notice:', err);
      setGlobalGpsError(err.message || 'GPS location detection failed.');
    } finally {
      setIsLocatingGlobal(false);
    }
  };

  // 1. Immediately request live GPS satellite fix upon startup
  useEffect(() => {
    handleDetectGlobalGps();
  }, []);

  // 2. Real-time continuous live tracking when enabled (watchPosition stream)
  useEffect(() => {
    if (!isLiveTracking) return;
    const stopTracking = watchLiveGpsTracking(
      (newGps) => {
        setCurrentGps(newGps);
        setFarmerLocation(newGps.nearestDistrict);
      },
      (err) => {
        console.warn('Live GPS tracking notification:', err);
      }
    );
    return () => stopTracking();
  }, [isLiveTracking]);

  const handleToggleLiveTracking = () => {
    setIsLiveTracking((prev) => !prev);
  };

  // Route presets state
  const [routePresets, setRoutePresets] = useState<any[]>([]);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        'नमस्कार! मी किसानमंडी महाराष्ट्र एआय सहाय्यक आहे. मी तुम्हाला लासलगाव, वाशी, पुणे यांसारख्या बाजार समित्या, सह्याद्री फार्म्स/जैन इरिगेशनसारखे प्रक्रिया उद्योग आणि रिलायन्स/डीमार्टसारख्या रिटेलर्समधील थेट नफ्याची तुलना डिझेल, टोल व हमाली खर्चासह करून देईन. तुम्ही मराठी, हिंदी किंवा इंग्रजीत विचारू शकता!',
      timestamp: 'आत्ताच'
    }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  const t = TRANSLATIONS[lang];

  // Fetch Route Presets
  useEffect(() => {
    fetch('/api/mandi/routes/presets')
      .then((res) => res.json())
      .then((data) => {
        if (data.presets) setRoutePresets(data.presets);
      })
      .catch((err) => console.warn('Could not fetch route presets', err));
  }, []);

  // Fetch Channels and Mandi Data on Filter Change
  useEffect(() => {
    fetchData();
  }, [selectedCommodity, selectedMarket, farmerLocation, quantityKg, produceGrade, logisticsConfig, currentGps]);

  // Authentication & Profile Handlers
  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    localStorage.setItem('kisan_mandi_user_session', JSON.stringify(session));
    if (session.profile) {
      if (session.profile.primaryCrop) setSelectedCommodity(session.profile.primaryCrop);
      if (session.profile.district) setFarmerLocation(session.profile.district);
      if (session.profile.harvestQuantityKg) setQuantityKg(session.profile.harvestQuantityKg);
      if (session.profile.grade) setProduceGrade(session.profile.grade);
      if (session.profile.preferredLanguage) setLang(session.profile.preferredLanguage);
    }
    setIsOnboardingOpen(false);
  };

  const handleStartOnboarding = (phoneOrEmail: string) => {
    setOnboardingIdentifier(phoneOrEmail);
    setIsOnboardingOpen(true);
  };

  const handleOnboardingComplete = (profile: FarmerProfile) => {
    const session: UserSession = {
      userId: `farmer_${Date.now()}`,
      phoneOrEmail: profile.phone,
      profile
    };
    setUserSession(session);
    localStorage.setItem('kisan_mandi_user_session', JSON.stringify(session));
    setIsOnboardingOpen(false);

    // Sync to active dashboard
    setSelectedCommodity(profile.primaryCrop);
    setFarmerLocation(profile.district);
    setQuantityKg(profile.harvestQuantityKg);
    setProduceGrade(profile.grade);
    if (profile.preferredLanguage) setLang(profile.preferredLanguage);

    // Audio greeting
    const welcomeMsg =
      lang === 'mr'
        ? `नमस्कार ${profile.name}! तुमचे शेतकरी प्रोफाईल जतन झाले. तुमच्या ${profile.primaryCrop} पिकासाठी थेट बाजार भाव लोड होत आहेत.`
        : `Welcome ${profile.name}! Loading real-time mandi prices and buyer rates for your ${profile.primaryCrop}.`;
    AudioAssistant.speak(welcomeMsg, lang);
  };

  const handleSaveProfile = (updatedProfile: FarmerProfile) => {
    if (!userSession) return;
    const updatedSession: UserSession = {
      ...userSession,
      profile: updatedProfile
    };
    setUserSession(updatedSession);
    localStorage.setItem('kisan_mandi_user_session', JSON.stringify(updatedSession));

    setSelectedCommodity(updatedProfile.primaryCrop);
    setFarmerLocation(updatedProfile.district);
    setQuantityKg(updatedProfile.harvestQuantityKg);
    setProduceGrade(updatedProfile.grade);
    if (updatedProfile.preferredLanguage) setLang(updatedProfile.preferredLanguage);
  };

  const handleLogout = () => {
    localStorage.removeItem('kisan_mandi_user_session');
    setUserSession(null);
    setIsFarmerSettingsOpen(false);
    setIsOnboardingOpen(false);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.allSettled([
        // 1. Fetch 3-Way Channels Comparison
        fetch('/api/mandi/channels/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: farmerLocation,
            commodity: selectedCommodity,
            quantityKg,
            grade: produceGrade,
            coordinates: currentGps ? { lat: currentGps.latitude, lng: currentGps.longitude } : null,
            logisticsConfig
          })
        })
          .then(async (res) => {
            if (res.ok) {
              const channelData = await res.json();
              setChannelComparisonData(channelData);
            }
          })
          .catch((err) => console.warn('Channel comparison fetch notice:', err)),

        // 2. Fetch Traditional Mandi Net Realization
        fetch('/api/mandi/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: farmerLocation,
            commodity: selectedCommodity,
            quantityKg,
            coordinates: currentGps ? { lat: currentGps.latitude, lng: currentGps.longitude } : null
          })
        })
          .then(async (res) => {
            if (res.ok) {
              const recData = await res.json();
              setRecommendation(recData);
            }
          })
          .catch((err) => console.warn('Mandi recommend fetch notice:', err)),

        // 3. Fetch Trend & Forecast
        fetch(
          `/api/mandi/trend?commodity=${encodeURIComponent(selectedCommodity)}&market=${encodeURIComponent(
            selectedMarket
          )}`
        )
          .then(async (res) => {
            if (res.ok) {
              const trendJson = await res.json();
              setTrendData({
                history: trendJson.history || [],
                forecast: trendJson.forecast || null
              });
            }
          })
          .catch((err) => console.warn('Trend fetch notice:', err)),

        // 4. Fetch Map Mandis with Exact Lat/Lng
        fetch(
          currentGps
            ? `/api/mandi/map?commodity=${encodeURIComponent(selectedCommodity)}&location=${encodeURIComponent(
                farmerLocation
              )}&lat=${currentGps.latitude}&lng=${currentGps.longitude}`
            : `/api/mandi/map?commodity=${encodeURIComponent(selectedCommodity)}&location=${encodeURIComponent(
                farmerLocation
              )}`
        )
          .then(async (res) => {
            if (res.ok) {
              const mapJson = await res.json();
              setMapData(mapJson);
            }
          })
          .catch((err) => console.warn('Map fetch notice:', err)),

        // 5. Fetch Buyer Matches
        fetch('/api/buyers/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commodity: selectedCommodity,
            quantityKg,
            grade: produceGrade,
            avgSizeMm,
            location: farmerLocation
          })
        })
          .then(async (res) => {
            if (res.ok) {
              const buyerJson = await res.json();
              setBuyerMatches(buyerJson.matches || []);
            }
          })
          .catch((err) => console.warn('Buyer match fetch notice:', err))
      ]);
    } catch (err) {
      console.warn('Data fetch general warning:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim() || chatLoading) return;

    const newMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: chatMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          context: {
            farmerLocation,
            selectedCommodity,
            recentMandiData: recommendation?.bestOption || null,
            language: lang
          }
        })
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'माहिती उपलब्ध नाही, कृपया पुन्हा प्रयत्न करा.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, botMsg]);

      // Automatically speak out the answer
      AudioAssistant.speak(botMsg.content, lang);
    } catch (e: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          role: 'assistant',
          content: 'सर्व्हरशी संपर्क होऊ शकला नाही. कृपया थोड्या वेळाने प्रयत्न करा.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const triggerCollectorSync = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mandi/collector/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      setSyncStatus(data);
      fetchData();
    } catch (e: any) {
      console.error('Harvest sync failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoutePresetClick = (preset: any) => {
    setLogisticsConfig((prev) => ({
      ...prev,
      tollCharges: preset.tollCharges,
      roadQuality: preset.roadQuality
    }));
    setFarmerLocation(preset.from);
  };

  const applyQuickScenario = (commodity: string, location: string, qty: number, grade: 'Grade A' | 'Grade B' | 'Grade C') => {
    setSelectedCommodity(commodity);
    setFarmerLocation(location);
    setQuantityKg(qty);
    setProduceGrade(grade);
    setActiveTab('analysis');
  };

  // Theme Classes Map
  const themeContainerClasses = {
    fintech_emerald: 'bg-stone-50 text-stone-900',
    trader_terminal: 'bg-slate-950 text-slate-100 dark',
    krishi_earth: 'bg-[#FAF8F5] text-stone-900',
    bento_executive: 'bg-slate-50 text-slate-900'
  }[currentTheme];

  const themeHeaderClasses = {
    fintech_emerald: 'bg-white/95 border-stone-200/80',
    trader_terminal: 'bg-slate-900/95 border-slate-800 text-slate-100',
    krishi_earth: 'bg-[#FFFDF9]/95 border-[#E8E2D9]',
    bento_executive: 'bg-white/95 border-slate-200 shadow-xs'
  }[currentTheme];

  const themePrimaryButton = {
    fintech_emerald: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    trader_terminal: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-black',
    krishi_earth: 'bg-amber-800 hover:bg-amber-900 text-white',
    bento_executive: 'bg-indigo-700 hover:bg-indigo-800 text-white'
  }[currentTheme];

  // 1. If not logged in, render the Auth Screen (with first-time onboarding if requested)
  if (!userSession) {
    return (
      <div className="min-h-screen bg-stone-950 font-sans selection:bg-emerald-500 selection:text-white">
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          onStartOnboarding={handleStartOnboarding}
          lang={lang}
          onLanguageChange={setLang}
        />
        {isOnboardingOpen && (
          <FarmerOnboardingModal
            initialPhoneOrEmail={onboardingIdentifier}
            onComplete={handleOnboardingComplete}
            lang={lang}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeContainerClasses} font-sans antialiased selection:bg-emerald-600 selection:text-white transition-colors duration-200`}>
      {/* 1. LEFT SIDEBAR DASHBOARD NAVIGATION & CONTROL CENTER */}
      <LeftSidebarDashboard
        userProfile={userSession.profile}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'dashboard') {
            setActiveFeatureTab(tab as any);
          }
        }}
        selectedCommodity={selectedCommodity}
        onSelectCommodity={setSelectedCommodity}
        farmerLocation={farmerLocation}
        onSelectLocation={setFarmerLocation}
        quantityKg={quantityKg}
        onChangeQuantity={setQuantityKg}
        produceGrade={produceGrade}
        onChangeGrade={setProduceGrade}
        onOpenSettings={() => setIsFarmerSettingsOpen(true)}
        onOpenLogisticsModal={() => setIsLogisticsModalOpen(true)}
        onOpenDesignModal={() => setIsDesignModalOpen(true)}
        logisticsConfig={logisticsConfig}
        lang={lang}
        onLanguageChange={setLang}
        onLogout={handleLogout}
        onQuickPreset={applyQuickScenario}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isCollapsedDesktop={isCollapsedDesktop}
        onToggleCollapseDesktop={() => setIsCollapsedDesktop((prev) => !prev)}
        currentTheme={currentTheme}
        channelComparisonData={channelComparisonData}
        recommendations={recommendation?.rankedMarkets || recommendation?.allMarkets || []}
        currentGps={currentGps}
        onDetectGps={handleDetectGlobalGps}
        isLocatingGps={isLocatingGlobal}
      />

      {/* 2. MAIN CONTENT AREA (ON THE RIGHT OF THE DASHBOARD) */}
      <div className={`flex-1 min-w-0 transition-all duration-300 pb-20 ${
        isCollapsedDesktop ? 'lg:pl-20' : 'lg:pl-[320px] xl:pl-[340px]'
      }`}>
        {/* Sleek Top Bar with Mobile Menu & Active Tab Indicator */}
        <header className={`sticky top-0 z-30 ${themeHeaderClasses} backdrop-blur-md border-b px-4 lg:px-8 py-3 shadow-2xs transition-colors duration-200`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Toggle Button */}
              <button
                type="button"
                id="btn_open_mobile_sidebar"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-[#232646] bg-[#121426] text-slate-200 shadow-2xs hover:bg-[#1a1d36] transition"
                title="Open Left Dashboard"
              >
                <Menu className="w-5 h-5 text-emerald-400" />
              </button>

              {/* Active Tab & Crop Badge */}
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white font-mono">
                  {activeTab === 'dashboard' && (lang === 'mr' ? '⚡ एक्झिक्युटिव्ह डॅशबोर्ड' : '⚡ Executive Agro Trade Overview')}
                  {activeTab === 'analysis' && (lang === 'mr' ? '📊 थेट निर्णय व नफा विश्लेषण' : '📊 Complete Decision Analysis')}
                  {activeTab === 'deep_ai' && (lang === 'mr' ? '⚡ Gemini Flash सखोल AI विश्लेषण' : '⚡ Gemini Flash Deep Analytics')}
                  {activeTab === 'channels' && (lang === 'mr' ? '🛒 ३-मार्ग चॅनेल तुलना' : '🛒 3-Way Channel Matrix')}
                  {activeTab === 'map' && (lang === 'mr' ? '🗺️ महाराष्ट्र APMC नकाशा' : '🗺️ Regional APMC Mandi Map')}
                  {activeTab === 'calculator' && (lang === 'mr' ? '🚚 इंधन, टोल व वाहतूक खर्च' : '🚚 Route & Fuel Terrain')}
                  {activeTab === 'chatbot' && (lang === 'mr' ? '🤖 AI सल्लागार व व्हॉईस संवाद' : '🤖 AI Agricultural Voice Advisor')}
                  {activeTab === 'collector' && '🌾 AGMARKNET Harvesting Pipeline'}
                </span>

                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#181a30] text-emerald-400 border border-[#2b2f54]">
                  {selectedCommodity} • {farmerLocation} • {(quantityKg / 100).toFixed(1)} Qtl
                </span>
              </div>
            </div>

            {/* Quick Header Actions on Top Right */}
            <div className="flex items-center gap-2">
              <button
                id="btn_topbar_dashboard"
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition ${
                  activeTab === 'dashboard'
                    ? 'bg-[#271f4e] border border-[#523d8c] text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                    : 'bg-[#14162a] hover:bg-[#1a1d36] text-slate-300 border border-[#232646]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">{lang === 'mr' ? 'डॅशबोर्ड' : 'Dashboard'}</span>
              </button>

              <button
                id="btn_topbar_fuel_toll"
                type="button"
                onClick={() => setIsLogisticsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#14162a] hover:bg-[#1a1d36] text-slate-300 border border-[#232646] transition"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{lang === 'mr' ? 'इंधन/टोल' : 'Logistics'}</span>
              </button>

              <button
                id="btn_topbar_settings"
                type="button"
                onClick={() => setIsFarmerSettingsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#14162a] hover:bg-[#1a1d36] text-slate-300 border border-[#232646] transition"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden md:inline truncate max-w-[100px]">{userSession.profile.name}</span>
                <Settings className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 space-y-6">
        {/* REAL-TIME LIVE GPS SATELLITE BANNER */}
        <LiveGpsBar
          currentGps={currentGps}
          isLocating={isLocatingGlobal}
          isLiveTracking={isLiveTracking}
          onRefreshGps={handleDetectGlobalGps}
          onToggleLiveTracking={handleToggleLiveTracking}
          lang={lang}
          error={globalGpsError}
        />

        {/* 1. EXECUTIVE OVERVIEW DASHBOARD (FINTRACK STYLING) */}
        {isOverviewExpanded ? (
          <ExecutiveMainDashboard
            userProfile={userSession.profile}
            selectedCommodity={selectedCommodity}
            farmerLocation={farmerLocation}
            quantityKg={quantityKg}
            produceGrade={produceGrade}
            channelComparisonData={channelComparisonData}
            recommendations={recommendation?.rankedMarkets || recommendation?.allMarkets || []}
            lang={lang}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'dashboard') {
                setActiveFeatureTab(tab as any);
              }
            }}
            onOpenSettings={() => setIsFarmerSettingsOpen(true)}
            onOpenLogisticsModal={() => setIsLogisticsModalOpen(true)}
          />
        ) : (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#121426] border border-[#202340] text-xs font-mono text-slate-200">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">{lang === 'mr' ? 'शेतमाल:' : 'Produce:'}</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {selectedCommodity} ({farmerLocation}) • {(quantityKg / 100).toFixed(1)} Qtl
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">{lang === 'mr' ? 'सर्वोच्च खरेदीदार:' : 'Top Buyer Channel:'}</span>
                <span className="font-bold text-amber-400 font-mono">
                  {channelComparisonData?.bestOption?.channel.name || 'Reliance Modern Retail Hub'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">{lang === 'mr' ? 'निव्वळ परतावा:' : 'Net In Pocket:'}</span>
                <span className="font-bold text-white font-mono">
                  ₹{channelComparisonData?.bestOption?.netRealization ? (channelComparisonData.bestOption.netRealization).toLocaleString('en-IN') : `${(((quantityKg * 28.4))).toLocaleString('en-IN')}`}
                  <span className="text-emerald-400 ml-1">
                    (₹{channelComparisonData?.bestOption?.netRatePerKg || '28.4'}/kg)
                  </span>
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOverviewExpanded(true)}
              className="text-[11px] text-purple-400 hover:text-purple-300 font-bold hover:underline font-mono"
            >
              {lang === 'mr' ? '📈 ओव्हरव्ह्यू उघडा' : '📈 Expand Overview'}
            </button>
          </div>
        )}

        {/* 2. PRODUCE & LOGISTICS CONTROL BAR (ALWAYS ACCESSIBLE IN DASHBOARD) */}

        <section
          id="farmer_produce_control_bar"
          className="bg-[#121426] border border-[#202340] rounded-2xl p-4 sm:p-5 shadow-sm space-y-4"
        >
          {/* Quick Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
              <Zap className="w-3 h-3 text-amber-400" />
              {lang === 'mr' ? 'त्वरित उदाहरणे:' : 'Quick Presets:'}
            </span>
            <button
              onClick={() => applyQuickScenario('Onion', 'Nashik', 1000, 'Grade A')}
              className="px-3 py-1 rounded-lg bg-[#181a32] border border-[#282b4c] hover:border-purple-500 text-xs text-slate-200 font-mono transition"
            >
              🧅 10 Qtl Nashik Onion (Grade A)
            </button>
            <button
              onClick={() => applyQuickScenario('Tomato', 'Narayangaon', 500, 'Grade A')}
              className="px-3 py-1 rounded-lg bg-[#181a32] border border-[#282b4c] hover:border-purple-500 text-xs text-slate-200 font-mono transition"
            >
              🍅 5 Qtl Narayangaon Tomato (Grade A)
            </button>
            <button
              onClick={() => applyQuickScenario('Pomegranate', 'Solapur', 2000, 'Grade A')}
              className="px-3 py-1 rounded-lg bg-[#181a32] border border-[#282b4c] hover:border-purple-500 text-xs text-slate-200 font-mono transition"
            >
              🍎 20 Qtl Solapur Bhagwa Pomegranate
            </button>
            <button
              onClick={() => applyQuickScenario('Grapes', 'Sangli', 1500, 'Grade A')}
              className="px-3 py-1 rounded-lg bg-[#181a32] border border-[#282b4c] hover:border-purple-500 text-xs text-slate-200 font-mono transition"
            >
              🍇 15 Qtl Sangli Export Grapes
            </button>
            <button
              onClick={() => applyQuickScenario('Orange (Santra)', 'Nagpur', 2500, 'Grade A')}
              className="px-3 py-1 rounded-lg bg-[#181a32] border border-[#282b4c] hover:border-purple-500 text-xs text-slate-200 font-mono transition"
            >
              🍊 25 Qtl Nagpur Santra
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Commodity */}
            <div>
              <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">
                {t.filterLabels.commodity}
              </label>
              <select
                id="select_commodity"
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="w-full bg-[#181a32] border border-[#282b4c] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Onion">Onion (कांदा)</option>
                <option value="Tomato">Tomato (टोमॅटो)</option>
                <option value="Pomegranate">Pomegranate (डाळिंब - भगवा)</option>
                <option value="Grapes">Grapes (द्राक्षे)</option>
                <option value="Soybean">Soybean (सोयाबीन)</option>
                <option value="Cotton">Cotton (कापूस)</option>
                <option value="Orange (Santra)">Orange / Santra (संत्रा)</option>
                <option value="Potato">Potato (बटाटा)</option>
                <option value="Green Chilli">Green Chilli (हिरवी मिरची)</option>
              </select>
            </div>

            {/* Farmer Location */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono font-bold text-slate-300">
                  {t.filterLabels.location}
                </label>
                <button
                  type="button"
                  id="btn_detect_gps_header"
                  onClick={handleDetectGlobalGps}
                  disabled={isLocatingGlobal}
                  title="Detect exact coordinates with HTML5 navigator.geolocation"
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition flex items-center gap-1 ${
                    currentGps
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-cyan-950/60 border-cyan-700/70 text-cyan-300 hover:bg-cyan-900/70'
                  }`}
                >
                  {isLocatingGlobal ? (
                    <RefreshCw className="w-2.5 h-2.5 animate-spin text-cyan-300" />
                  ) : (
                    <LocateFixed className="w-2.5 h-2.5" />
                  )}
                  <span>{currentGps ? 'GPS Active' : '📍 Auto GPS'}</span>
                </button>
              </div>
              <select
                id="select_farmer_location"
                value={farmerLocation}
                onChange={(e) => setFarmerLocation(e.target.value)}
                className="w-full bg-[#181a32] border border-[#282b4c] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Nashik">Nashik (नाशिक)</option>
                <option value="Lasalgaon">Lasalgaon (लासलगाव)</option>
                <option value="Sangamner">Sangamner (संगमनेर)</option>
                <option value="Pune">Pune (पुणे)</option>
                <option value="Narayangaon">Narayangaon (नारायणगाव)</option>
                <option value="Ahmednagar">Ahmednagar (अहमदनगर)</option>
                <option value="Solapur">Solapur (सोलापूर)</option>
                <option value="Kolhapur">Kolhapur (कोल्हापूर)</option>
                <option value="Nagpur">Nagpur (नागपूर)</option>
                <option value="Jalgaon">Jalgaon (जळगाव)</option>
                <option value="Sangli">Sangli / Tasgaon (सांगली)</option>
                <option value="Latur">Latur (लातूर)</option>
                <option value="Satara">Satara / Panchgani (सातारा)</option>
              </select>
              {currentGps && (
                <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center justify-between">
                  <span>GPS: {currentGps.latitude.toFixed(2)}°N, {currentGps.longitude.toFixed(2)}°E</span>
                  <span>(±{currentGps.accuracy}m)</span>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">
                {t.filterLabels.quantityKg}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="input_quantity_kg"
                  type="number"
                  min="100"
                  step="100"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(Math.max(50, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#181a32] border border-[#282b4c] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
                <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap">
                  ({(quantityKg / 100).toFixed(1)} Qtl)
                </span>
              </div>
            </div>

            {/* Produce Grade */}
            <div>
              <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">
                {t.filterLabels.grade}
              </label>
              <select
                id="select_produce_grade"
                value={produceGrade}
                onChange={(e) => setProduceGrade(e.target.value as any)}
                className="w-full bg-[#181a32] border border-[#282b4c] rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white focus:outline-none focus:border-purple-500"
              >
                <option value="Grade A">Grade A (Super Quality / Export)</option>
                <option value="Grade B">Grade B (Regular Mandi Lot)</option>
                <option value="Grade C">Grade C (Processing / Small)</option>
              </select>
            </div>

            {/* Transport Summary */}
            <div>
              <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">
                Transport & Terrain Rate
              </label>
              <button
                type="button"
                id="btn_summary_fuel_toll"
                onClick={() => setIsLogisticsModalOpen(true)}
                className="w-full bg-[#181a32] hover:bg-[#1e213f] border border-[#282b4c] p-2 rounded-xl text-left transition flex items-center justify-between"
              >
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono font-bold">
                    {logisticsConfig.fuelType.toUpperCase()} @ ₹{logisticsConfig.fuelPricePerLitre}/L
                  </span>
                  <div className="text-xs font-bold text-emerald-400 font-mono truncate">
                    Toll: ₹{logisticsConfig.tollCharges} • {logisticsConfig.roadQuality.replace('_', ' ')}
                  </div>
                </div>
                <Sliders className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              </button>
            </div>
          </div>
        </section>

        {/* 3. THE 7 CORE AGRI-TRADE DASHBOARD MODULES HEADER & SEGMENTED CONTROLLER */}
        <div className="bg-[#101223] border border-[#202340] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1d2038] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-700/50 text-purple-400 flex items-center justify-center font-black shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold font-mono text-white tracking-wide flex items-center gap-2 flex-wrap">
                  <span>{lang === 'mr' ? 'मुख्य शेती व्यापार डॅशबोर्ड मॉड्यूल्स' : 'CORE AGRI-TRADE DASHBOARD MODULES'}</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#271f4e] text-purple-300 border border-[#523d8c]">
                    LIVE
                  </span>
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  {lang === 'mr'
                    ? 'निर्णय विश्लेषण (खरेदीदार तुलना व नफा पावती), Gemini AI, मंडी नकाशा, इंधन, व्हॉईस असिस्टंट व Agmarknet'
                    : 'Decision Analysis (with Verified Buyers & Net Matrix), Gemini Flash AI, Mandi GIS Map, Fuel & Route Terrain, AI Voice Advisor, & AGMARKNET Pipeline'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#181a32] hover:bg-[#202447] text-slate-300 border border-[#2b2f54] transition flex items-center gap-1.5"
              >
                <span>{isOverviewExpanded ? (lang === 'mr' ? '📉 ओव्हरव्ह्यू लहान करा' : '📉 Minimize Overview') : (lang === 'mr' ? '📈 ओव्हरव्ह्यू उघडा' : '📈 Expand Overview')}</span>
              </button>
              <button
                type="button"
                onClick={fetchData}
                className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-purple-950/70 hover:bg-purple-900 text-purple-200 border border-purple-800/60 transition flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{lang === 'mr' ? 'डेटा रिफ्रेश' : 'Refresh Data'}</span>
              </button>
            </div>
          </div>

          {/* Segmented Feature Navigation Tabs */}
          <nav
            id="dashboard_core_features_nav"
            className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin pt-1"
          >
            {[
              { id: 'analysis', label: lang === 'mr' ? '१. संपूर्ण निर्णय विश्लेषण' : '1. Decision Analysis', icon: <Scale className="w-4 h-4" />, badge: null, badgeColor: '' },
              { id: 'deep_ai', label: lang === 'mr' ? '२. Gemini Flash AI' : '2. Gemini Flash AI', icon: <Sparkles className="w-4 h-4 text-purple-400" />, badge: 'AI', badgeColor: 'bg-[#3b2b68] text-[#c4b5fd] border border-[#5b459d]' },
              { id: 'map', label: lang === 'mr' ? '३. मंडी मॅप व हीटमॅप' : '3. Mandi Map & Heatmap', icon: <MapPin className="w-4 h-4 text-cyan-400" />, badge: 'MAP', badgeColor: 'bg-[#083344] text-[#38bdf8] border border-[#0284c7]' },
              { id: 'calculator', label: lang === 'mr' ? '४. इंधन व घाट रस्ते' : '4. Fuel & Route Terrain', icon: <Fuel className="w-4 h-4 text-amber-400" />, badge: 'FUEL', badgeColor: 'bg-[#422006] text-[#fde047] border border-[#a16207]' },
              { id: 'chatbot', label: lang === 'mr' ? '५. AI व्हॉईस असिस्टंट' : '5. AI Voice Advisor', icon: <Bot className="w-4 h-4 text-purple-400" />, badge: 'VOICE', badgeColor: 'bg-[#3b2b68] text-[#c4b5fd] border border-[#5b459d]' },
              { id: 'collector', label: lang === 'mr' ? '६. AGMARKNET पाईप' : '6. AGMARKNET Pipeline', icon: <Layers className="w-4 h-4 text-emerald-400" />, badge: 'LIVE', badgeColor: 'bg-[#451a03] text-[#fbbf24] border border-[#b45309]' },
              { id: 'all', label: lang === 'mr' ? '📑 सर्व मॉड्यूल्स एकत्र' : '📑 All in Flow', icon: <LayoutDashboard className="w-4 h-4 text-purple-400" />, badge: 'ALL', badgeColor: 'bg-[#1e193d] text-purple-300 border border-[#44337a]' }
            ].map((tab) => {
              const isActive = activeFeatureTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`feature_tab_${tab.id}`}
                  onClick={() => handleFeatureTabSelect(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-[#271f4e] border border-[#523d8c] text-white shadow-[0_0_14px_rgba(99,102,241,0.35)]'
                      : 'bg-[#14162a] text-slate-400 hover:text-slate-200 border border-[#232646] hover:bg-[#1a1d36]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${tab.badgeColor}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ============================================================ */}
        {/* THE 7 CORE AGRI-TRADE DASHBOARD MODULES (RENDERED IN-PAGE) */}
        {/* ============================================================ */}

        {/* MODULE 1: COMPLETE UNIFIED DECISION ANALYSIS DASHBOARD */}
        {(activeFeatureTab === 'analysis' || activeFeatureTab === 'all' || activeTab === 'analysis') && channelComparisonData && (
          <section id="module_section_analysis" className="space-y-3">
            {activeFeatureTab === 'all' && (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 border-b border-[#232646] pb-2 pt-4">
                <span className="w-5 h-5 rounded-md bg-purple-900/50 border border-purple-600/60 text-purple-300 flex items-center justify-center text-[10px]">1</span>
                <span>{lang === 'mr' ? '१. संपूर्ण निर्णय विश्लेषण व नफा शिफारस' : '1. COMPLETE UNIFIED DECISION ANALYSIS'}</span>
              </div>
            )}
            <UnifiedAnalysisDashboard
              comparisonData={channelComparisonData}
              trendData={trendData}
              lang={lang}
              onOpenLogisticsModal={() => setIsLogisticsModalOpen(true)}
              routePresets={routePresets}
              onSelectRoutePreset={handleRoutePresetClick}
            />
          </section>
        )}

        {/* DATA SCIENCE & ML ANALYTICS HUB (Pandas, Scikit-learn, Seaborn, Matplotlib) */}
        {(activeFeatureTab === 'ml_analytics' || activeTab === 'ml_analytics') && (
          <section id="module_section_ml_analytics" className="space-y-3">
            <DataScienceAnalyticsHub
              lang={lang}
              currentCommodity={selectedCommodity}
              onSelectCommodity={setSelectedCommodity}
            />
          </section>
        )}

        {/* MODULE 2: GEMINI FLASH 3.5 DEEP AGRICULTURAL ANALYTICS */}
        {(activeFeatureTab === 'deep_ai' || activeFeatureTab === 'all' || activeTab === 'deep_ai') && (
          <section id="module_section_deep_ai" className="space-y-3">
            {activeFeatureTab === 'all' && (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 border-b border-[#232646] pb-2 pt-6">
                <span className="w-5 h-5 rounded-md bg-purple-900/50 border border-purple-600/60 text-purple-300 flex items-center justify-center text-[10px]">2</span>
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  {lang === 'mr' ? '२. GEMINI FLASH सखोल AI विश्लेषण' : '2. GEMINI FLASH DEEP ANALYTICS'}
                </span>
              </div>
            )}
            <DeepAnalyticsHub
              commodity={selectedCommodity}
              farmerLocation={farmerLocation}
              quantityKg={quantityKg}
              grade={produceGrade}
              logisticsConfig={logisticsConfig}
              lang={lang}
              onOpenLogisticsModal={() => setIsLogisticsModalOpen(true)}
              currentGps={currentGps}
            />
          </section>
        )}

        {/* MODULE 3: MAHARASHTRA MANDI MAP & HEATMAP */}
        {(activeFeatureTab === 'map' || activeFeatureTab === 'all' || activeTab === 'map') && mapData && (
          <section id="module_section_map" className="space-y-3">
            {activeFeatureTab === 'all' && (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 border-b border-[#232646] pb-2 pt-6">
                <span className="w-5 h-5 rounded-md bg-cyan-900/50 border border-cyan-600/60 text-cyan-300 flex items-center justify-center text-[10px]">3</span>
                <span>{lang === 'mr' ? '३. महाराष्ट्र मंडी नकाशा व प्रादेशिक हीटमॅप' : '3. MANDI GIS MAP & HEATMAP'}</span>
              </div>
            )}
            <MaharashtraMapComponent
              markets={mapData.markets || []}
              farmerLocation={farmerLocation}
              selectedCommodity={selectedCommodity}
              lang={lang}
              currentGps={currentGps}
              onLocationDetected={handleLocationDetected}
              onSelectMarket={(mkt) => {
                setSelectedMarket(mkt);
                handleFeatureTabSelect('analysis');
              }}
            />
          </section>
        )}

        {/* MODULE 4: FUEL, TOLL & ROUTE TERRAIN CALCULATOR */}
        {(activeFeatureTab === 'calculator' || activeFeatureTab === 'all' || activeTab === 'calculator') && (
          <section id="module_section_calculator" className="space-y-3">
            {activeFeatureTab === 'all' && (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 border-b border-[#232646] pb-2 pt-6">
                <span className="w-5 h-5 rounded-md bg-amber-900/50 border border-amber-600/60 text-amber-300 flex items-center justify-center text-[10px]">4</span>
                <span>{lang === 'mr' ? '४. इंधन, टोल व घाट रस्ते गणित' : '4. FUEL & ROUTE TERRAIN ESTIMATOR'}</span>
              </div>
            )}
            <div className="bg-[#121426] border border-[#202340] rounded-2xl p-6 space-y-6 shadow-sm">
              <div>
                <h3 className="text-base font-bold font-mono text-white flex items-center gap-2">
                  <Fuel className="w-5 h-5 text-amber-400" />
                  {lang === 'mr'
                    ? 'महाराष्ट्र महामार्ग इंधन, टोल व रस्ता दर्जा कॅल्क्युलेटर'
                    : 'Maharashtra Route Fuel, Toll & Road Terrain Estimator'}
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  {lang === 'mr'
                    ? 'कसारा घाट, समृद्धी महामार्ग व विविध मार्गांवरील प्रत्यक्ष डिझेल, टोल व फळे नुकसान गणित'
                    : 'Analyze fuel burn, tolls, Kasara Ghat descent delays, and produce bruising losses'}
                </p>
              </div>

              {/* Highway Route Presets */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-slate-300 block">
                  {lang === 'mr' ? 'महाराष्ट्रातील प्रमुख कृषी महामार्ग रूट्स:' : 'Popular Maharashtra Agro Highway Routes:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {routePresets.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleRoutePresetClick(p)}
                      className="p-3.5 bg-[#181a32] border border-[#282b4c] hover:border-purple-500 rounded-xl text-left transition space-y-1 group"
                    >
                      <div className="font-bold font-mono text-xs text-slate-200 group-hover:text-purple-300 flex items-center justify-between">
                        <span>{p.from} → {p.to}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400">
                        {p.distanceKm} km • Toll: ₹{p.tollCharges}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-2">
                        {typeof p.description === 'object' && p.description !== null
                          ? p.description[lang] || p.description.mr || p.description.en || ''
                          : String(p.description || '')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Settings Box */}
              <div className="p-5 bg-[#181a32] rounded-xl border border-[#282b4c] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-xs text-slate-200">
                    Active Transport Math Parameters
                  </span>
                  <button
                    onClick={() => setIsLogisticsModalOpen(true)}
                    className="text-xs font-mono text-purple-400 font-bold hover:underline"
                  >
                    Edit Rates & Road Condition
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono font-medium">Fuel Selected</span>
                    <strong className="text-slate-100 font-mono">
                      {logisticsConfig.fuelType.toUpperCase()} (₹{logisticsConfig.fuelPricePerLitre}/L)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono font-medium">Vehicle Mileage</span>
                    <strong className="text-slate-100 font-mono">{logisticsConfig.mileageKmPerLitre} km/L</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono font-medium">Road Condition</span>
                    <strong className="text-slate-100 font-mono">{logisticsConfig.roadQuality.replace('_', ' ')}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono font-medium">Fastag Toll Set</span>
                    <strong className="text-emerald-400 font-mono">₹{logisticsConfig.tollCharges}</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* MODULE 5: AI ADVISOR & VOICE ASSISTANT */}
        {(activeFeatureTab === 'chatbot' || activeFeatureTab === 'all' || activeTab === 'chatbot') && (
          <section id="module_section_chatbot" className="space-y-3">
            {activeFeatureTab === 'all' && (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 border-b border-[#232646] pb-2 pt-6">
                <span className="w-5 h-5 rounded-md bg-purple-900/50 border border-purple-600/60 text-purple-300 flex items-center justify-center text-[10px]">5</span>
                <span>{lang === 'mr' ? '५. AI सल्लागार व व्हॉईस असिस्टंट' : '5. AI ADVISOR & VOICE ASSISTANT'}</span>
              </div>
            )}
            <div className="bg-[#121426] border border-[#202340] rounded-2xl p-6 shadow-sm flex flex-col h-[650px]">
              <div className="flex items-center justify-between border-b border-[#202340] pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-700/50 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold font-mono text-base text-white">{t.chatbot.title}</h3>
                    <p className="text-xs font-mono text-slate-400">{t.chatbot.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-purple-950/70 border border-purple-700/50 flex items-center justify-center text-purple-400 shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed font-mono ${
                        msg.role === 'user'
                          ? 'bg-[#271f4e] border border-[#523d8c] text-white rounded-tr-none'
                          : 'bg-[#181a32] border border-[#282b4c] text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-700/40 text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => {
                              if (AudioAssistant.getIsSpeaking()) {
                                AudioAssistant.stopSpeaking();
                              } else {
                                AudioAssistant.speak(msg.content, lang);
                              }
                            }}
                            className="hover:text-purple-300 text-slate-300 flex items-center gap-1 font-semibold transition cursor-pointer"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{lang === 'mr' ? 'ऐका (Listen)' : lang === 'hi' ? 'सुनें (Listen)' : 'Listen'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-400 italic">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                    Analyzing market data in {lang === 'mr' ? 'मराठी' : lang === 'hi' ? 'हिन्दी' : 'English'}...
                  </div>
                )}
              </div>

              {/* Input Voice Bar */}
              <div className="pt-4 border-t border-[#202340]">
                <VoiceAssistantBar
                  lang={lang}
                  onSendMessage={handleSendMessage}
                  isLoading={chatLoading}
                  activeContext={`${farmerLocation} • ${selectedCommodity}`}
                  selectedCommodity={selectedCommodity}
                  farmerLocation={farmerLocation}
                />
              </div>
            </div>
          </section>
        )}

        {/* MODULE 6: AGMARKNET PIPELINE */}
        {(activeFeatureTab === 'collector' || activeFeatureTab === 'all' || activeTab === 'collector') && (
          <section id="module_section_collector" className="space-y-3">
            {activeFeatureTab === 'all' && (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 border-b border-[#232646] pb-2 pt-6">
                <span className="w-5 h-5 rounded-md bg-emerald-900/50 border border-emerald-600/60 text-emerald-300 flex items-center justify-center text-[10px]">6</span>
                <span>{lang === 'mr' ? '६. AGMARKNET थेट डेटा पाईपलाईन' : '6. AGMARKNET REAL-TIME INGESTION PIPELINE'}</span>
              </div>
            )}
            <CollectorPipelineView
              lang={lang}
              onHarvestSuccess={() => {
                fetchData();
              }}
              onSelectMarketForAnalysis={(comm, mkt) => {
                setSelectedCommodity(comm);
                setSelectedMarket(mkt);
                handleFeatureTabSelect('analysis');
                setTimeout(() => {
                  fetchData();
                }, 50);
              }}
            />
          </section>
        )}
      </main>

      {/* Logistics & Cost Configuration Modal */}
      <LogisticsCalculatorModal
        isOpen={isLogisticsModalOpen}
        onClose={() => setIsLogisticsModalOpen(false)}
        config={logisticsConfig}
        onChange={(newCfg) => setLogisticsConfig(newCfg)}
        lang={lang}
        onReset={() => {
          setLogisticsConfig({
            fuelType: 'diesel',
            fuelPricePerLitre: 92.80,
            mileageKmPerLitre: 11.5,
            roadQuality: 'state_highway',
            isRoundTrip: false,
            tollCharges: 185,
            unexpectedHeads: {
              hamaliPerQtl: 20,
              mandiCessPct: 1.5,
              parkingAndEntryFee: 80,
              transitDelayLossPct: 2.5
            }
          });
        }}
      />

      {/* Interactive Design Options & Layout Switcher Modal */}
      <DesignOptionsModal
        isOpen={isDesignModalOpen}
        onClose={() => setIsDesignModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
        lang={lang}
      />

      {/* Farmer Profile & Farm Settings Modal */}
      <FarmerSettingsModal
        isOpen={isFarmerSettingsOpen}
        onClose={() => setIsFarmerSettingsOpen(false)}
        currentProfile={userSession.profile}
        onSaveProfile={handleSaveProfile}
        onLogout={handleLogout}
        lang={lang}
        onLanguageChange={setLang}
      />

      {/* Conditional Onboarding Modal */}
      {isOnboardingOpen && (
        <FarmerOnboardingModal
          initialPhoneOrEmail={onboardingIdentifier}
          onComplete={handleOnboardingComplete}
          lang={lang}
        />
      )}
      </div>
    </div>
  );
}
