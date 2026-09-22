import React, { useState } from 'react';
import {
  Sprout,
  LogIn,
  UserPlus,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Languages,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { SupportedLanguage, UserSession } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (session: UserSession) => void;
  onStartOnboarding: (phoneOrEmail: string) => void;
  lang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  onStartOnboarding,
  lang,
  onLanguageChange
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick Demo Profiles for instant 1-click evaluation
  const demoProfiles = [
    {
      id: 'farmer_demo_1',
      name: 'रमेश विष्णू पाटील',
      phone: '9822012345',
      district: 'Nashik',
      address: 'पिंपळगाव बसवंत, ता. निफाड, नाशिक',
      primaryCrop: 'Onion',
      harvestQuantityKg: 1000,
      grade: 'Grade A' as const,
      cropLabel: 'कांदा (10 क्विंटल)',
      cropEmoji: '🧅'
    },
    {
      id: 'farmer_demo_2',
      name: 'सचिन बाळू जाधव',
      phone: '9890123456',
      district: 'Narayangaon',
      address: 'वारुळवाडी, ता. जुन्नर, पुणे',
      primaryCrop: 'Tomato',
      harvestQuantityKg: 500,
      grade: 'Grade A' as const,
      cropLabel: 'टोमॅटो (5 क्विंटल)',
      cropEmoji: '🍅'
    },
    {
      id: 'farmer_demo_3',
      name: 'दत्तात्रय शिंदे',
      phone: '9423123456',
      district: 'Solapur',
      address: 'मोहोळ रोड, सोलापूर',
      primaryCrop: 'Pomegranate',
      harvestQuantityKg: 2000,
      grade: 'Grade A' as const,
      cropLabel: 'डाळिंब भगवा (20 क्विंटल)',
      cropEmoji: '🍎'
    }
  ];

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanId = identifier.trim();
    if (!cleanId) {
      setErrorMessage(
        lang === 'mr'
          ? 'कृपया मोबाईल नंबर किंवा ईमेल प्रविष्ट करा.'
          : lang === 'hi'
          ? 'कृपया मोबाइल नंबर या ईमेल दर्ज करें।'
          : 'Please enter a valid mobile number or email.'
      );
      return;
    }

    if (!password.trim()) {
      setErrorMessage(
        lang === 'mr'
          ? 'कृपया पासवर्ड किंवा पिन प्रविष्ट करा.'
          : lang === 'hi'
          ? 'कृपया पासवर्ड या पिन दर्ज करें।'
          : 'Please enter your password or PIN.'
      );
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (authMode === 'signup') {
        // Direct new user to the First-Time Onboarding Form
        onStartOnboarding(cleanId);
      } else {
        // Check if existing user in localStorage
        const stored = localStorage.getItem(`kisan_user_${cleanId}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            onLoginSuccess(parsed);
            return;
          } catch (err) {
            console.error('Failed to parse user session', err);
          }
        }

        // If no prior profile exists, create a default one and open onboarding
        onStartOnboarding(cleanId);
      }
    }, 400);
  };

  const handleQuickDemoLogin = (profile: (typeof demoProfiles)[0]) => {
    const session: UserSession = {
      userId: profile.id,
      phoneOrEmail: profile.phone,
      profile: {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        district: profile.district,
        primaryCrop: profile.primaryCrop,
        harvestQuantityKg: profile.harvestQuantityKg,
        grade: profile.grade,
        onboardingCompleted: true,
        preferredLanguage: lang,
        registeredAt: new Date().toISOString()
      }
    };
    onLoginSuccess(session);
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center items-center px-4 py-8 relative selection:bg-emerald-500 selection:text-white">
      {/* Background Decorative subtle pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Language Switcher Bar at Top Right */}
      <div className="w-full max-w-md flex justify-end mb-4 z-10">
        <div className="bg-stone-800/90 backdrop-blur-sm border border-stone-700/80 rounded-xl p-1 flex items-center gap-1 shadow-sm">
          <Languages className="w-3.5 h-3.5 text-stone-400 ml-2 mr-1" />
          {(['mr', 'hi', 'en'] as SupportedLanguage[]).map((l) => (
            <button
              key={l}
              id={`auth_lang_${l}`}
              type="button"
              onClick={() => onLanguageChange(l)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                lang === l
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिन्दी' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 mb-1">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {lang === 'mr'
              ? 'किसानमंडी महाराष्ट्र'
              : lang === 'hi'
              ? 'किसानमंडी महाराष्ट्र'
              : 'KisanMandi Maharashtra'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 max-w-xs mx-auto leading-relaxed">
            {lang === 'mr'
              ? 'थेट APMC भाव, वाहतूक खर्च गणक व ३-मार्ग चॅनेल नफा तुलना'
              : lang === 'hi'
              ? 'सटीक मंडी भाव, परिवहन लागत और अधिकतम मुनाफा विश्लेषक'
              : 'Direct APMC Mandi, Processor & Retailer Net Realization Engine'}
          </p>
        </div>

        {/* Tab Toggle: Login vs Signup */}
        <div className="grid grid-cols-2 bg-stone-900 p-1 rounded-2xl border border-stone-800">
          <button
            type="button"
            id="tab_auth_login"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              authMode === 'login'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'लॉगिन करा' : lang === 'hi' ? 'लॉगिन' : 'Log In'}</span>
          </button>
          <button
            type="button"
            id="tab_auth_signup"
            onClick={() => {
              setAuthMode('signup');
              setErrorMessage('');
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              authMode === 'signup'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{lang === 'mr' ? 'नवीन नोंदणी' : lang === 'hi' ? 'नया खाता' : 'Sign Up'}</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
            {errorMessage}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              {lang === 'mr'
                ? 'मोबाईल नंबर किंवा ईमेल'
                : lang === 'hi'
                ? 'मोबाइल नंबर या ईमेल'
                : 'Mobile Number or Email'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="input_auth_identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={lang === 'mr' ? 'उदा. 9822012345' : 'e.g. 9822012345'}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              {lang === 'mr'
                ? 'पासवर्ड किंवा ४-अंकी पिन'
                : lang === 'hi'
                ? 'पासवर्ड या ४-अंकीय पिन'
                : 'Password or 4-digit PIN'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="input_auth_password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            id="btn_submit_auth"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>
                  {authMode === 'signup'
                    ? lang === 'mr'
                      ? 'खाते तयार करा व पुढे चला'
                      : lang === 'hi'
                      ? 'खाता बनाएं और आगे बढ़ें'
                      : 'Create Account & Continue'
                    : lang === 'mr'
                    ? 'डॅशबोर्डमध्ये प्रवेश करा'
                    : lang === 'hi'
                    ? 'डैशबोर्ड में प्रवेश करें'
                    : 'Log In to Dashboard'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div className="pt-2 border-t border-stone-800/80 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {lang === 'mr'
                ? 'किंवा एका क्लिकवर डेमो शेतकरी लॉगिन:'
                : lang === 'hi'
                ? 'या एक क्लिक में डेमो किसान लॉगिन:'
                : 'Or 1-Click Demo Farmer Sign In:'}
            </span>
          </div>

          <div className="space-y-2">
            {demoProfiles.map((p) => (
              <button
                key={p.id}
                id={`btn_demo_login_${p.primaryCrop.toLowerCase()}`}
                type="button"
                onClick={() => handleQuickDemoLogin(p)}
                className="w-full bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-emerald-500/50 p-2.5 rounded-xl text-left transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{p.cropEmoji}</span>
                  <div>
                    <strong className="text-xs text-stone-200 block group-hover:text-emerald-400 transition">
                      {p.name}
                    </strong>
                    <span className="text-[10px] text-stone-400">
                      {p.district} • {p.cropLabel}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-md">
                  {lang === 'mr' ? 'प्रवेश' : 'Login'} →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Security & Data note */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            {lang === 'mr'
              ? 'महाराष्ट्र शासन AGMARKNET थेट दर सुसंगत'
              : 'Direct Agmarknet MSAMB Verified Pipeline'}
          </span>
        </div>
      </div>
    </div>
  );
};
