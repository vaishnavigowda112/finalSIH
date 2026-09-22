import React from 'react';
import { DesignTheme, SupportedLanguage } from '../types.js';
import {
  Palette,
  Check,
  Sparkles,
  Layout,
  Terminal,
  Leaf,
  Layers,
  X,
  Eye,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface DesignOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: DesignTheme;
  onSelectTheme: (theme: DesignTheme) => void;
  lang: SupportedLanguage;
}

interface DesignOptionMeta {
  id: DesignTheme;
  title: { en: string; mr: string; hi: string };
  tagline: { en: string; mr: string; hi: string };
  badge: string;
  colors: {
    bg: string;
    card: string;
    primary: string;
    accent: string;
    text: string;
  };
  paletteSwatches: string[];
  features: { en: string[]; mr: string[]; hi: string[] };
  visualMockup: {
    headerBg: string;
    cardBg: string;
    accentBg: string;
    fontFamily: string;
  };
}

const DESIGN_OPTIONS: DesignOptionMeta[] = [
  {
    id: 'fintech_emerald',
    title: {
      en: 'Option 1: Sahyadri Agro-Fintech (Default)',
      mr: 'पर्याय १: सह्याद्री ॲग्रो-फिनटेक (मानक)',
      hi: 'विकल्प 1: सह्याद्री एग्रो-फिनटेक (डिफ़ॉल्ट)'
    },
    tagline: {
      en: 'Crisp agricultural fintech palette with deep forest pine (#065F46) & warm stone canvas.',
      mr: 'स्वच्छ कृषी फिनटेक रंगसंगती, वन हिरवा रंग व दगडी ऑफ-व्हाइट पार्श्वभूमी.',
      hi: 'कृषि फिनटेक रंग, गहरा हरा और स्वच्छ पृष्ठभूमि।'
    },
    badge: 'Recommended for Farmers & FPOs',
    colors: {
      bg: 'bg-stone-50',
      card: 'bg-white border-stone-200',
      primary: 'bg-emerald-700 text-white',
      accent: 'text-emerald-800',
      text: 'text-stone-900'
    },
    paletteSwatches: ['#047857', '#065F46', '#D1FAE5', '#F5F5F4', '#1C1917'],
    features: {
      en: [
        'High-contrast outdoor daylight legibility',
        'Executive decision banner with direct profit delta',
        'Balanced card padding & crisp tabular waterfall deductions'
      ],
      mr: [
        'उन्हातही सहज वाचता येणारा उच्च कॉन्ट्रास्ट',
        'थेट नफा फरकाचा ठळक हिरवा बॅनर',
        'तपशीलवार खर्च वजावट तक्ता'
      ],
      hi: [
        'धूप में भी आसानी से पढ़ा जा सकने वाला हाई-कंट्रास्ट',
        'स्पष्ट शुद्ध लाभ निर्णय बैनर',
        'विस्तृत ईंधन व टोल खर्च विवरण'
      ]
    },
    visualMockup: {
      headerBg: 'bg-white border-b border-stone-200',
      cardBg: 'bg-white border border-stone-200',
      accentBg: 'bg-emerald-700',
      fontFamily: 'font-sans'
    }
  },
  {
    id: 'trader_terminal',
    title: {
      en: 'Option 2: Mandi Trader Terminal (Pro Dark)',
      mr: 'पर्याय २: मंडी ट्रेडर टर्मिनल (डार्क प्रो)',
      hi: 'विकल्प 2: मंडी ट्रेडर टर्मिनल (डार्क प्रो)'
    },
    tagline: {
      en: 'High-density financial terminal with charcoal slate canvas (#0F172A), neon green tickers & amber signals.',
      mr: 'उच्च-घनता व्यापारी स्क्रीन, गडद कोळसा रंग, चमकणारे हिरवे व पिवळे बाजारभाव.',
      hi: 'ट्रेडर टर्मिनल थीम, गहरा स्लेट रंग और जीवंत मार्केट टिकर।'
    },
    badge: 'Best for APMC Traders & Commission Agents',
    colors: {
      bg: 'bg-slate-950',
      card: 'bg-slate-900 border-slate-800',
      primary: 'bg-emerald-500 text-slate-950',
      accent: 'text-emerald-400',
      text: 'text-slate-100'
    },
    paletteSwatches: ['#10B981', '#F59E0B', '#0F172A', '#1E293B', '#F8FAFC'],
    features: {
      en: [
        'Ultra high-contrast dark theme for long trading sessions',
        'Order-book style compact data density and monospace numbers',
        'Glowing status beacons & live market ticker styling'
      ],
      mr: [
        'रात्रीच्या व पहाटेच्या कामासाठी डोळ्यांना आरामदायी डार्क मोड',
        'कमी जागेत अधिक संख्यात्मक डेटा व मॉनोस्पेस फॉन्ट',
        'थेट चमकणारे मार्केट सिग्नल्स'
      ],
      hi: [
        'लंबे ट्रेडिंग सत्र के लिए आरामदायक डार्क थीम',
        'सटीक ऑर्डर-बुक स्टाइल सघन डेटा लेआउट',
        'चमकदार रेट संकेतक'
      ]
    },
    visualMockup: {
      headerBg: 'bg-slate-900 border-b border-slate-800',
      cardBg: 'bg-slate-900 border border-slate-800',
      accentBg: 'bg-emerald-500',
      fontFamily: 'font-mono'
    }
  },
  {
    id: 'krishi_earth',
    title: {
      en: 'Option 3: Krishi Minimalist Earth (Warm Clay)',
      mr: 'पर्याय ३: कृषी मिनिमलिस्ट अर्थ (माती व नैसर्गिक)',
      hi: 'विकल्प 3: कृषि मिनिमलिस्ट अर्थ (प्राकृतिक)'
    },
    tagline: {
      en: 'Natural organic warmth with textured terracotta (#C2410C), sand parchment, and generous whitespace.',
      mr: 'नैसर्गिक मातीचा रंग, उबदार वाळू रंग आणि मोकळी सोपी मांडणी.',
      hi: 'प्राकृतिक मिट्टी और टेराकोटा रंग, सरल और सुंदर लेआउट।'
    },
    badge: 'Organic & Clean Tactile Layout',
    colors: {
      bg: 'bg-[#FAF8F5]',
      card: 'bg-[#FFFDF9] border-[#E8E2D9]',
      primary: 'bg-amber-800 text-white',
      accent: 'text-amber-900',
      text: 'text-stone-900'
    },
    paletteSwatches: ['#9A3412', '#D97706', '#FAF8F5', '#E8E2D9', '#292524'],
    features: {
      en: [
        'Soft organic warm-paper canvas reducing digital fatigue',
        'Subtle earth-tone borders and rounded tactile touch surfaces',
        'Spacious typographic rhythm with clear step indicators'
      ],
      mr: [
        'डोळ्यांना शांत वाटणारा नैसर्गिक कागदी रंग',
        'मोठे सोपे बटणे व स्पष्ट पायऱ्या',
        'अतिशय स्वच्छ व साधी मांडणी'
      ],
      hi: [
        'डिजिटल थकान कम करने वाला हल्का गर्म रंग',
        'बड़े आसान बटन और स्पष्ट चरण',
        'सुव्यवस्थित और शांत बनावट'
      ]
    },
    visualMockup: {
      headerBg: 'bg-[#FFFDF9] border-b border-[#E8E2D9]',
      cardBg: 'bg-[#FFFDF9] border border-[#E8E2D9]',
      accentBg: 'bg-amber-800',
      fontFamily: 'font-sans'
    }
  },
  {
    id: 'bento_executive',
    title: {
      en: 'Option 4: Executive Bento Grid (Indigo Agro-Tech)',
      mr: 'पर्याय ४: एक्झिक्युटिव्ह बेंटो ग्रिड (इंडिगो टेक)',
      hi: 'विकल्प 4: एग्जीक्यूटिव बेंटो ग्रिड (इंडिगो एग्रो-टेक)'
    },
    tagline: {
      en: 'Modern bento-box modular layout with deep indigo (#4338CA), cyan accents, and graphical KPI tiles.',
      mr: 'आधुनिक बेंटो-बॉक्स मांडणी, इंडिगो व निळा रंग आणि ग्राफिकल विश्लेषण कार्ड्स.',
      hi: 'मॉडर्न बेंटो-ग्रिड लेआउट, इंडिगो रंग और ग्राफ़िकल कार्ड्स।'
    },
    badge: 'Modern SaaS & Analytics Heavy',
    colors: {
      bg: 'bg-slate-50',
      card: 'bg-white border-slate-200',
      primary: 'bg-indigo-700 text-white',
      accent: 'text-indigo-800',
      text: 'text-slate-900'
    },
    paletteSwatches: ['#4338CA', '#06B6D4', '#6366F1', '#F1F5F9', '#0F172A'],
    features: {
      en: [
        'Sleek modular bento-grid cards with subtle drop shadows',
        'Visual graphical KPI micro-charts inside each decision card',
        'Modern tech-forward indigo and cyan status badges'
      ],
      mr: [
        'आधुनिक बेंटो-ग्रिड बॉक्सेस आणि सूक्ष्म सावल्या',
        'प्रत्येक कार्डात छोटे व्हिज्युअल आलेख',
        'हाय-टेक इंडिगो आणि आकाशी रंगसंगती'
      ],
      hi: [
        'मॉडर्न बेंटो कार्ड्स और साफ़ विजुअल ग्राफिक्स',
        'प्रत्येक कार्ड में स्पष्ट चार्ट टाइल्स',
        'इंडिगो व स्यान मॉडर्न टेक स्टाइल'
      ]
    },
    visualMockup: {
      headerBg: 'bg-white border-b border-indigo-100',
      cardBg: 'bg-white border border-slate-200 shadow-sm',
      accentBg: 'bg-indigo-700',
      fontFamily: 'font-sans'
    }
  }
];

export const DesignOptionsModal: React.FC<DesignOptionsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  lang
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                {lang === 'mr' ? 'डिझाईन पर्याय निवडा' : lang === 'hi' ? 'डिजाइन विकल्प चुनें' : 'Choose Your Design Theme'}
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  4 Options Available
                </span>
              </h2>
              <p className="text-xs text-stone-500">
                {lang === 'mr'
                  ? 'तुमच्या आवडीनुसार ॲपची रंगसंगती आणि मांडणी एका क्लिकवर बदला'
                  : 'Select your preferred visual aesthetic and layout density with 1-click live preview.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Design Options Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DESIGN_OPTIONS.map((opt) => {
              const isSelected = currentTheme === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => onSelectTheme(opt.id)}
                  className={`rounded-2xl p-5 border-2 transition cursor-pointer relative flex flex-col justify-between group ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50/50'
                  }`}
                >
                  {/* Selection Badge */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3" />
                      <span>{lang === 'mr' ? 'सध्या निवडलेले' : 'Active Theme'}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Top Type Indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                        {opt.badge}
                      </span>
                    </div>

                    {/* Title & Tagline */}
                    <div>
                      <h3 className="font-bold text-sm text-stone-900 group-hover:text-emerald-800 transition">
                        {opt.title[lang] || opt.title.en}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                        {opt.tagline[lang] || opt.tagline.en}
                      </p>
                    </div>

                    {/* Mini Visual Mockup Preview */}
                    <div className={`p-3 rounded-xl border border-stone-300/80 ${opt.id === 'trader_terminal' ? 'bg-slate-950 text-slate-100' : opt.id === 'krishi_earth' ? 'bg-[#FAF8F5] text-stone-900' : opt.id === 'bento_executive' ? 'bg-slate-50 text-slate-900' : 'bg-stone-50 text-stone-900'}`}>
                      <div className="flex items-center justify-between pb-2 border-b border-stone-200/40 text-[10px]">
                        <span className="font-bold">KisanMandi</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${opt.id === 'trader_terminal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800'}`}>
                          ₹2,840/Qtl
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 mt-2 text-[9px]">
                        <div className={`p-1.5 rounded ${opt.id === 'trader_terminal' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-stone-200'}`}>
                          <span className="text-[8px] opacity-70 block">Net In-Pocket</span>
                          <strong className="font-bold">₹26,840</strong>
                        </div>
                        <div className={`p-1.5 rounded ${opt.id === 'trader_terminal' ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-stone-200'}`}>
                          <span className="text-[8px] opacity-70 block">Fuel & Toll</span>
                          <strong className="font-bold">₹1,180</strong>
                        </div>
                      </div>
                    </div>

                    {/* Color Swatch Bar */}
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mr-1">
                        Palette:
                      </span>
                      {opt.paletteSwatches.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-4 h-4 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Key Highlights */}
                    <ul className="space-y-1 pt-1 text-[11px] text-stone-600">
                      {(opt.features[lang] || opt.features.en).map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Apply Button */}
                  <div className="mt-4 pt-3 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTheme(opt.id);
                        onClose();
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{lang === 'mr' ? 'लागू केले आहे' : 'Applied'}</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>{lang === 'mr' ? 'हे डिझाईन निवडा' : 'Select This Design'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            {lang === 'mr'
              ? 'टीप: निवडलेले डिझाईन तुमच्या ब्राऊझरमध्ये आपोआप सेव्ह केले जाईल.'
              : 'Tip: Your chosen design is saved to your browser preferences.'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition shadow-xs"
          >
            {lang === 'mr' ? 'पूर्ण झाले' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
