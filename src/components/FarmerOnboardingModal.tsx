import React, { useState } from 'react';
import {
  User,
  Phone,
  MapPin,
  Sprout,
  Scale,
  Award,
  ArrowRight,
  Sparkles,
  Settings,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { FarmerProfile, SupportedLanguage } from '../types';

interface FarmerOnboardingModalProps {
  initialPhoneOrEmail?: string;
  onComplete: (profile: FarmerProfile) => void;
  lang: SupportedLanguage;
}

export const FarmerOnboardingModal: React.FC<FarmerOnboardingModalProps> = ({
  initialPhoneOrEmail = '',
  onComplete,
  lang
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(
    /^\d+$/.test(initialPhoneOrEmail) ? initialPhoneOrEmail : ''
  );
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Nashik');
  const [primaryCrop, setPrimaryCrop] = useState('Onion');
  const [quantityKg, setQuantityKg] = useState<number>(1000);
  const [grade, setGrade] = useState<'Grade A' | 'Grade B' | 'Grade C'>('Grade A');
  const [error, setError] = useState('');

  const maharashtraDistricts = [
    { value: 'Nashik', label: 'Nashik (नाशिक)' },
    { value: 'Lasalgaon', label: 'Lasalgaon (लासलगाव / निफाड)' },
    { value: 'Sangamner', label: 'Sangamner (संगमनेर)' },
    { value: 'Pune', label: 'Pune (पुणे / जुन्नर / खेड)' },
    { value: 'Narayangaon', label: 'Narayangaon (नारायणगाव)' },
    { value: 'Ahmednagar', label: 'Ahmednagar (अहमदनगर / राहुरी)' },
    { value: 'Solapur', label: 'Solapur (सोलापूर / पंढरपूर)' },
    { value: 'Kolhapur', label: 'Kolhapur (कोल्हापूर)' },
    { value: 'Nagpur', label: 'Nagpur (नागपूर / कळमेश्वर)' },
    { value: 'Jalgaon', label: 'Jalgaon (जळगाव)' },
    { value: 'Sangli', label: 'Sangli (सांगली / तासगाव)' },
    { value: 'Latur', label: 'Latur (लातूर)' },
    { value: 'Satara', label: 'Satara (सातारा / वाई / फलटण)' }
  ];

  const cropOptions = [
    { value: 'Onion', label: 'कांदा (Onion)', emoji: '🧅', defaultQty: 1000 },
    { value: 'Tomato', label: 'टोमॅटो (Tomato)', emoji: '🍅', defaultQty: 500 },
    { value: 'Pomegranate', label: 'डाळिंब - भगवा (Pomegranate)', emoji: '🍎', defaultQty: 2000 },
    { value: 'Grapes', label: 'द्राक्षे - निर्यातक्षम (Grapes)', emoji: '🍇', defaultQty: 1500 },
    { value: 'Soybean', label: 'सोयाबीन (Soybean)', emoji: '🌱', defaultQty: 2500 },
    { value: 'Cotton', label: 'कापूस (Cotton)', emoji: '☁️', defaultQty: 2000 },
    { value: 'Orange (Santra)', label: 'संत्रा (Orange / Santra)', emoji: '🍊', defaultQty: 2500 },
    { value: 'Potato', label: 'बटाटा (Potato)', emoji: '🥔', defaultQty: 1200 },
    { value: 'Green Chilli', label: 'हिरवी मिरची (Green Chilli)', emoji: '🌶️', defaultQty: 600 }
  ];

  const handleSelectCrop = (cropVal: string) => {
    setPrimaryCrop(cropVal);
    const matched = cropOptions.find((c) => c.value === cropVal);
    if (matched) {
      setQuantityKg(matched.defaultQty);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(
        lang === 'mr'
          ? 'कृपया आपले नाव प्रविष्ट करा.'
          : lang === 'hi'
          ? 'कृपया अपना नाम दर्ज करें।'
          : 'Please enter your full name.'
      );
      return;
    }

    if (!phone.trim()) {
      setError(
        lang === 'mr'
          ? 'कृपया आपला संपर्क मोबाईल नंबर प्रविष्ट करा.'
          : lang === 'hi'
          ? 'कृपया अपना संपर्क मोबाइल नंबर दर्ज करें।'
          : 'Please enter your contact phone number.'
      );
      return;
    }

    if (!address.trim()) {
      setError(
        lang === 'mr'
          ? 'कृपया गाव किंवा पत्ता प्रविष्ट करा.'
          : lang === 'hi'
          ? 'कृपया अपना गांव या पता दर्ज करें।'
          : 'Please enter your village or address.'
      );
      return;
    }

    if (!quantityKg || quantityKg <= 0) {
      setError(
        lang === 'mr'
          ? 'कृपया वैध शेतमाल उत्पादन प्रमाण (किलो) प्रविष्ट करा.'
          : 'Please enter valid harvest quantity in kg.'
      );
      return;
    }

    const newProfile: FarmerProfile = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      district,
      primaryCrop,
      harvestQuantityKg: Number(quantityKg),
      grade,
      preferredLanguage: lang,
      onboardingCompleted: true,
      registeredAt: new Date().toISOString()
    };

    onComplete(newProfile);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-6">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 sm:p-7 relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700/80 border border-emerald-500/40 flex items-center justify-center text-emerald-100 shadow-sm shrink-0">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-700/50 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-200 mb-1">
                <Sparkles className="w-3 h-3" />
                {lang === 'mr' ? 'पहिली भेट • शेतकरी प्रोफाइल नोंदणी' : 'First-Time Farmer Profile Setup'}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {lang === 'mr' ? 'नमस्कार शेतकरी बंधूंनो!' : 'Welcome Farmer Partner!'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-0.5">
                {lang === 'mr'
                  ? 'आपली प्राथमिक माहिती भरा जेणेकरून डॅशबोर्ड आपोआप सर्वात फायदेशीर बाजार भाव शोधेल.'
                  : 'Tell us a bit about your crop & farm to optimize APMC mandi & buyer calculations.'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-200 bg-emerald-900/60 border border-emerald-700/50 px-3 py-1.5 rounded-xl">
            <Settings className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>
              {lang === 'mr'
                ? 'ही माहिती तुम्ही डॅशबोर्डवरील "सेटिंग्ज (Settings)" पर्यायातून भविष्यात कधीही बदलू शकता.'
                : 'Note: You can easily change this anytime from the Settings menu in your dashboard.'}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Farmer Personal Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'mr' ? '१. वैयक्तिक व संपर्क माहिती' : '1. Personal & Contact Details'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {lang === 'mr' ? 'शेतकऱ्याचे संपूर्ण नाव *' : 'Farmer Full Name *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input_onboarding_name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'mr' ? 'उदा. रमेश विष्णू पाटील' : 'e.g. Ramesh Vishnu Patil'}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {lang === 'mr' ? 'मोबाईल नंबर *' : 'Mobile Phone Number *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="input_onboarding_phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9822012345"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {lang === 'mr' ? 'गाव / फार्म पत्ता *' : 'Village / Farm Address *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    id="input_onboarding_address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={lang === 'mr' ? 'उदा. पिंपळगाव बसवंत, ता. निफाड' : 'e.g. Pimpalgaon Baswant, Niphad'}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {lang === 'mr' ? 'जिल्हा / जवळचे कृषी केंद्र *' : 'District / APMC Region *'}
                </label>
                <select
                  id="select_onboarding_district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
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

          {/* Section 2: Crop & Harvest Parameters */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-2">
              <Sprout className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'mr' ? '२. शेतमाल, पीक व उत्पादन तपशील' : '2. Primary Crop & Harvest Details'}</span>
            </h3>

            {/* Visual Crop Selector Grid */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-2">
                {lang === 'mr' ? 'तुमचे मुख्य पीक कोणते आहे? *' : 'Which is your primary crop? *'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {cropOptions.map((crop) => {
                  const isSelected = primaryCrop === crop.value;
                  return (
                    <button
                      type="button"
                      key={crop.value}
                      id={`btn_crop_select_${crop.value.toLowerCase().replace(/[^a-z]/g, '')}`}
                      onClick={() => handleSelectCrop(crop.value)}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-600'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span className="text-xl shrink-0">{crop.emoji}</span>
                      <div className="overflow-hidden">
                        <span className="text-xs block truncate">{crop.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quantity in kg */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-700">
                    {lang === 'mr' ? 'अपेक्षित उत्पादन / प्रमाण (किलो) *' : 'Expected Harvest Quantity (kg) *'}
                  </label>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {(quantityKg / 100).toFixed(1)} क्विंटल (Qtl)
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Scale className="w-4 h-4" />
                  </div>
                  <input
                    id="input_onboarding_quantity"
                    type="number"
                    min="50"
                    step="50"
                    required
                    value={quantityKg}
                    onChange={(e) => setQuantityKg(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                  />
                </div>

                {/* Quick Quantity Presets */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
                  {[500, 1000, 2000, 5000].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuantityKg(q)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition whitespace-nowrap ${
                        quantityKg === q
                          ? 'bg-emerald-700 text-white border-emerald-700'
                          : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {q >= 1000 ? `${q / 1000} टन (${q / 100} Qtl)` : `${q} kg`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Grade */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {lang === 'mr' ? 'मालाची प्रत / गुणवत्ता (Grade) *' : 'Produce Quality Grade *'}
                </label>
                <div className="space-y-1.5">
                  {(
                    [
                      { id: 'Grade A', label: lang === 'mr' ? 'Grade A - उत्कृष्ट प्रत (Export / Premium)' : 'Grade A (Premium)' },
                      { id: 'Grade B', label: lang === 'mr' ? 'Grade B - मध्यम प्रत (Standard Market)' : 'Grade B (Standard)' },
                      { id: 'Grade C', label: lang === 'mr' ? 'Grade C - मिश्रित प्रत (Local Mandi)' : 'Grade C (Mixed)' }
                    ] as const
                  ).map((g) => (
                    <label
                      key={g.id}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer text-xs transition ${
                        grade === g.id
                          ? 'bg-emerald-50 border-emerald-600 font-bold text-emerald-950 ring-1 ring-emerald-600'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="produce_grade_onboarding"
                        checked={grade === g.id}
                        onChange={() => setGrade(g.id)}
                        className="text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                      />
                      <span>{g.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>
                {lang === 'mr'
                  ? 'डॅशबोर्ड आपोआप या माहितीनुसार सुरू होईल.'
                  : 'Dashboard will auto-launch with these preferences.'}
              </span>
            </div>

            <button
              type="submit"
              id="btn_onboarding_submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              <span>{lang === 'mr' ? 'माहिती जतन करा आणि डॅशबोर्ड सुरू करा 🌾' : 'Save & Launch Dashboard 🌾'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
