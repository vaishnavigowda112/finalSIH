import React from 'react';
import {
  GranularLogisticsConfig,
  FuelType,
  RoadQualityType,
  SupportedLanguage
} from '../types.js';
import { TRANSLATIONS } from '../utils/translations.js';
import {
  Fuel,
  Navigation,
  ShieldAlert,
  Sliders,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';

interface LogisticsCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GranularLogisticsConfig;
  onChange: (newConfig: GranularLogisticsConfig) => void;
  lang: SupportedLanguage;
  onReset: () => void;
}

export const LogisticsCalculatorModal: React.FC<LogisticsCalculatorModalProps> = ({
  isOpen,
  onClose,
  config,
  onChange,
  lang,
  onReset
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang].logisticsConfig;

  const updateField = <K extends keyof GranularLogisticsConfig>(key: K, val: GranularLogisticsConfig[K]) => {
    onChange({ ...config, [key]: val });
  };

  const updateUnexpected = <K extends keyof GranularLogisticsConfig['unexpectedHeads']>(
    key: K,
    val: number
  ) => {
    onChange({
      ...config,
      unexpectedHeads: {
        ...config.unexpectedHeads,
        [key]: val
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        id="logistics_config_modal"
        className="bg-white border border-stone-300 rounded-2xl max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-2xl my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">{t.title}</h3>
              <p className="text-xs text-stone-500">
                {lang === 'mr'
                  ? 'डिझेल, टोल, घाट रस्ता व हमालीचा निव्वळ नफ्यावरील थेट परिणाम'
                  : (lang === 'hi'
                    ? 'डीजल, टोल, घाट मार्ग व हम्माली का शुद्ध मुनाफे पर असर'
                    : 'Fine-tune fuel, tolls, ghat transit, and hidden deductions')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-xs bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* 1. Fuel Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-emerald-700" />
              {t.fuelType} & Rate
            </label>
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200">
              <button
                type="button"
                id="btn_fuel_diesel"
                onClick={() => {
                  onChange({ ...config, fuelType: 'diesel', fuelPricePerLitre: 92.80 });
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  config.fuelType === 'diesel'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t.diesel}
              </button>
              <button
                type="button"
                id="btn_fuel_petrol"
                onClick={() => {
                  onChange({ ...config, fuelType: 'petrol', fuelPricePerLitre: 104.20 });
                }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  config.fuelType === 'petrol'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {t.petrol}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-stone-600 block mb-1">
                {lang === 'mr' ? 'इंधन दर (₹ प्रति लिटर)' : (lang === 'hi' ? 'ईंधन दर (₹ प्रति लीटर)' : 'Fuel Price (₹/Litre)')}
              </span>
              <input
                type="number"
                value={config.fuelPricePerLitre}
                onChange={(e) => updateField('fuelPricePerLitre', parseFloat(e.target.value) || 0)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.mileage}</span>
              <input
                type="number"
                step="0.5"
                value={config.mileageKmPerLitre}
                onChange={(e) => updateField('mileageKmPerLitre', parseFloat(e.target.value) || 1)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Road Quality & Terrain */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-sky-700" />
            {t.roadQuality}
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'expressway', label: t.expressway, desc: '<1% damage, 65 km/h' },
              { id: 'state_highway', label: t.stateHighway, desc: '+12% fuel, 2.5% bruising' },
              { id: 'ghat_rough', label: t.ghatRough, desc: '+28% fuel, +45m delay, 5.5% bruising' }
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => updateField('roadQuality', r.id as RoadQualityType)}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-xs transition ${
                  config.roadQuality === r.id
                    ? 'bg-emerald-50 border-emerald-600 text-stone-900 font-semibold'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="font-bold text-stone-900">{r.label}</div>
                  <div className="text-[11px] text-stone-500 font-normal">{r.desc}</div>
                </div>
                {config.roadQuality === r.id && (
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Highway Tolls & Unexpected Heads */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            {lang === 'mr' ? 'टोल व इतर अप्रत्यक्ष कपात' : (lang === 'hi' ? 'टोल व अन्य अप्रत्यक्ष कटौतियां' : 'Tolls & Indirect Deductions')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.tollPreset}</span>
              <input
                type="number"
                value={config.tollCharges}
                onChange={(e) => updateField('tollCharges', parseInt(e.target.value) || 0)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.hamali}</span>
              <input
                type="number"
                value={config.unexpectedHeads.hamaliPerQtl}
                onChange={(e) => updateUnexpected('hamaliPerQtl', parseInt(e.target.value) || 0)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.mandiCess}</span>
              <input
                type="number"
                step="0.5"
                value={config.unexpectedHeads.mandiCessPct}
                onChange={(e) => updateUnexpected('mandiCessPct', parseFloat(e.target.value) || 0)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-stone-600 block mb-1">{t.parkingFee}</span>
              <input
                type="number"
                value={config.unexpectedHeads.parkingAndEntryFee}
                onChange={(e) => updateUnexpected('parkingAndEntryFee', parseInt(e.target.value) || 0)}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Round trip checkbox & Actions */}
        <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 font-medium">
            <input
              type="checkbox"
              checked={config.isRoundTrip}
              onChange={(e) => updateField('isRoundTrip', e.target.checked)}
              className="rounded bg-stone-50 border-stone-300 text-emerald-700 focus:ring-emerald-600"
            />
            <span>{t.roundTrip}</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 px-4 py-2 rounded-xl transition shadow-sm"
            >
              Apply & Recalculate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
