import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Sprout,
  Scale,
  Award,
  Save,
  LogOut,
  Settings,
  Languages,
  RotateCcw,
  Check,
  Shield,
  HelpCircle
} from 'lucide-react';
import { FarmerProfile, SupportedLanguage } from '../types';

interface FarmerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: FarmerProfile;
  onSaveProfile: (updatedProfile: FarmerProfile) => void;
  onLogout: () => void;
  lang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const FarmerSettingsModal: React.FC<FarmerSettingsModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  onLogout,
  lang,
  onLanguageChange
}) => {
  const [name, setName] = useState(currentProfile.name);
  const [phone, setPhone] = useState(currentProfile.phone);
  const [address, setAddress] = useState(currentProfile.address);
  const [district, setDistrict] = useState(currentProfile.district);
  const [primaryCrop, setPrimaryCrop] = useState(currentProfile.primaryCrop);
  const [quantityKg, setQuantityKg] = useState<number>(currentProfile.harvestQuantityKg);
  const [grade, setGrade] = useState<'Grade A' | 'Grade B' | 'Grade C'>(currentProfile.grade);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if currentProfile changes
  useEffect(() => {
    setName(currentProfile.name);
    setPhone(currentProfile.phone);
    setAddress(currentProfile.address);
    setDistrict(currentProfile.district);
    setPrimaryCrop(currentProfile.primaryCrop);
    setQuantityKg(currentProfile.harvestQuantityKg);
    setGrade(currentProfile.grade);
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

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

  const cropOptions = [
    { value: 'Onion', label: 'कांदा (Onion)', emoji: '🧅' },
    { value: 'Tomato', label: 'टोमॅटो (Tomato)', emoji: '🍅' },
    { value: 'Pomegranate', label: 'डाळिंब (Pomegranate)', emoji: '🍎' },
    { value: 'Grapes', label: 'द्राक्षे (Grapes)', emoji: '🍇' },
    { value: 'Soybean', label: 'सोयाबीन (Soybean)', emoji: '🌱' },
    { value: 'Cotton', label: 'कापूस (Cotton)', emoji: '☁️' },
    { value: 'Orange (Santra)', label: 'संत्रा (Orange / Santra)', emoji: '🍊' },
    { value: 'Potato', label: 'बटाटा (Potato)', emoji: '🥔' },
    { value: 'Green Chilli', label: 'हिरवी मिरची (Green Chilli)', emoji: '🌶️' }
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: FarmerProfile = {
      ...currentProfile,
      name: name.trim() || currentProfile.name,
      phone: phone.trim() || currentProfile.phone,
      address: address.trim() || currentProfile.address,
      district,
      primaryCrop,
      harvestQuantityKg: Number(quantityKg) || 1000,
      grade,
      preferredLanguage: lang,
      onboardingCompleted: true
    };

    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {lang === 'mr' ? 'शेतकरी प्रोफाईल व शेती सेटिंग्ज' : 'Farmer Profile & Farm Settings'}
              </h2>
              <p className="text-xs text-stone-400">
                {lang === 'mr'
                  ? 'तुमचा पत्ता, पीक आणि उत्पादन प्रमाण येथे कधीही बदला'
                  : 'Update your contact info, crop, quantity & location anytime'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs p-3 rounded-xl flex items-center gap-2 font-bold animate-fade-in">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>
                {lang === 'mr'
                  ? 'तुमची शेतकरी सेटिंग्ज यशस्वीरित्या जतन केली गेली!'
                  : 'Settings successfully updated & applied!'}
              </span>
            </div>
          )}

          {/* Language selector in Settings */}
          <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
              <Languages className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'mr' ? 'अ‍ॅप भाषा (Language):' : 'App Language:'}</span>
            </div>
            <div className="flex items-center gap-1">
              {(['mr', 'hi', 'en'] as SupportedLanguage[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => onLanguageChange(l)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    lang === l
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {l === 'mr' ? 'मराठी' : l === 'hi' ? 'हिन्दी' : 'English'}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              {lang === 'mr' ? 'वैयक्तिक माहिती' : 'Personal Information'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'mr' ? 'शेतकऱ्याचे नाव' : 'Farmer Name'}
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    id="input_settings_name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'mr' ? 'मोबाईल नंबर' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    id="input_settings_phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'mr' ? 'गाव / पत्ता' : 'Village / Address'}
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                  <input
                    id="input_settings_address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'mr' ? 'जिल्हा / कृषी केंद्र' : 'District'}
                </label>
                <select
                  id="select_settings_district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                >
                  {maharashtraDistricts.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Crop & Harvest Defaults */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              {lang === 'mr' ? 'पीक व उत्पादन प्राधान्ये' : 'Crop & Harvest Preferences'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'mr' ? 'मुख्य पीक' : 'Primary Crop'}
                </label>
                <select
                  id="select_settings_crop"
                  value={primaryCrop}
                  onChange={(e) => setPrimaryCrop(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                >
                  {cropOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'mr' ? 'प्रमाण (किलो)' : 'Quantity (kg)'}
                </label>
                <input
                  id="input_settings_qty"
                  type="number"
                  min="50"
                  step="50"
                  required
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(Number(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'mr' ? 'मालाची प्रत' : 'Produce Grade'}
                </label>
                <select
                  id="select_settings_grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                >
                  <option value="Grade A">Grade A (Premium)</option>
                  <option value="Grade B">Grade B (Standard)</option>
                  <option value="Grade C">Grade C (Mixed)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
            <button
              type="button"
              id="btn_settings_logout"
              onClick={onLogout}
              className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'बाहेर पडा (Log Out)' : 'Log Out'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs transition"
              >
                {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
              </button>

              <button
                type="submit"
                id="btn_settings_save"
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{lang === 'mr' ? 'बदल जतन करा' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
