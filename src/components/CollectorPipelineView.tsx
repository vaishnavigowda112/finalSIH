import React, { useState } from 'react';
import {
  Layers,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Globe,
  Radio,
  FileCode,
  MapPin,
  Search,
  Filter,
  Volume2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { MandiRecord, SupportedLanguage } from '../types.js';
import { AudioAssistant } from '../utils/audioAssistant.js';

interface CollectorPipelineViewProps {
  lang: SupportedLanguage;
  onHarvestSuccess?: () => void;
  onSelectMarketForAnalysis?: (commodity: string, market: string) => void;
}

export function CollectorPipelineView({
  lang,
  onHarvestSuccess,
  onSelectMarketForAnalysis
}: CollectorPipelineViewProps) {
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [harvestedRecords, setHarvestedRecords] = useState<MandiRecord[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [commodityFilter, setCommodityFilter] = useState('ALL');
  const [apiKeyInput, setApiKeyInput] = useState(() => {
    return localStorage.getItem('agmarknet_api_key') || '';
  });
  const [customApiUrl, setCustomApiUrl] = useState('');
  const [customJsonInput, setCustomJsonInput] = useState('');
  const [showAdvancedTester, setShowAdvancedTester] = useState(false);
  const [validationTestOutput, setValidationTestOutput] = useState<any>(null);

  const handleApiKeyChange = (val: string) => {
    setApiKeyInput(val);
    localStorage.setItem('agmarknet_api_key', val.trim());
  };

  // Trigger Harvest from Backend
  const runHarvest = async (endpointUrl?: string, manualRecords?: any[], overrideCommodity?: string) => {
    setLoading(true);
    const targetCrop = overrideCommodity || (commodityFilter !== 'ALL' ? commodityFilter : undefined);
    try {
      const res = await fetch('/api/mandi/collector/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointUrl: endpointUrl || (customApiUrl.trim() ? customApiUrl.trim() : undefined),
          manualRecords: manualRecords || undefined,
          apiKey: apiKeyInput.trim() || undefined,
          commodity: targetCrop
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setSyncResult(data);
      if (Array.isArray(data.validRecords) && data.validRecords.length > 0) {
        setHarvestedRecords(data.validRecords);
      }

      // Voice readout of harvest result
      const summarySpeech =
        lang === 'mr'
          ? `महाराष्ट्र अ‍ॅगमार्कनेट हार्वेस्टिंग यशस्वी. ${data.summary?.validInserted || 0} बाजार समित्यांचे थेट दर नोंदवले गेले.`
          : lang === 'hi'
          ? `महाराष्ट्र एग्मार्कनेट डेटा सफलतापूर्वक प्राप्त हुआ। ${data.summary?.validInserted || 0} मंडियों के भाव अपडेट किए गए।`
          : `AGMARKNET Maharashtra Harvest complete. ${data.summary?.validInserted || 0} APMC Mandi price records ingested into database.`;

      AudioAssistant.speak(summarySpeech, lang);

      if (onHarvestSuccess) {
        onHarvestSuccess();
      }
    } catch (e: any) {
      console.error('Harvest pipeline error:', e);
      setSyncResult({
        status: 'error',
        source: endpointUrl || 'Maharashtra AGMARKNET Gateway',
        summary: { totalReceived: 0, validInserted: 0, rejectedCount: 0 },
        validRecords: [],
        rejectionReport: [{ index: 0, errors: [{ field: 'network', message: e.message || 'Connection timeout', value: null }] }],
        warnings: [e.message || 'Failed to reach harvesting gateway.']
      });
    } finally {
      setLoading(false);
    }
  };

  // Test single record validation
  const testCustomRecordValidation = async () => {
    if (!customJsonInput.trim()) return;
    try {
      const parsed = JSON.parse(customJsonInput);
      const isArray = Array.isArray(parsed);

      if (isArray) {
        // Run full sync with payload
        runHarvest(undefined, parsed);
      } else {
        // Validate single record via API
        const res = await fetch('/api/mandi/validate-record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        });
        const out = await res.json();
        setValidationTestOutput(out);
      }
    } catch (err: any) {
      setValidationTestOutput({
        isValid: false,
        errors: [{ field: 'json_syntax', message: `Invalid JSON syntax: ${err.message}`, value: null }],
        warnings: []
      });
    }
  };

  const samplePayloadSnippet = JSON.stringify(
    [
      {
        state: 'Maharashtra',
        district: 'Nashik',
        market: 'Lasalgaon',
        commodity: 'Onion',
        variety: 'Red Onion',
        min_price: 2100,
        max_price: 2850,
        modal_price: 2480,
        arrival_date: new Date().toISOString().split('T')[0],
        arrivals: 1550
      },
      {
        state: 'Maharashtra',
        district: 'Pune',
        market: 'Pune (Gultekdi / Marketyard)',
        commodity: 'Tomato',
        variety: 'Local Red',
        min_price: 2400,
        max_price: 3100,
        modal_price: 2750,
        arrival_date: new Date().toISOString().split('T')[0],
        arrivals: 620
      }
    ],
    null,
    2
  );

  // Filter records for table
  const filteredRecords = harvestedRecords.filter((rec) => {
    const matchesComm =
      commodityFilter === 'ALL' ||
      rec.commodity.toLowerCase() === commodityFilter.toLowerCase();
    const query = searchFilter.toLowerCase().trim();
    const matchesSearch =
      !query ||
      rec.market.toLowerCase().includes(query) ||
      (rec.marketMarathi && rec.marketMarathi.includes(query)) ||
      rec.district.toLowerCase().includes(query) ||
      (rec.districtMarathi && rec.districtMarathi.includes(query)) ||
      rec.commodity.toLowerCase().includes(query);
    return matchesComm && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Architecture & Pipeline Controller */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-md border border-stone-700 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                {lang === 'mr' ? 'अ‍ॅगमार्कनेट थेट डेटा पाईपलाईन' : 'LIVE AGMARKNET HARVESTING PIPELINE'}
              </span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full">
                MSAMB • data.gov.in v2.1
              </span>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Auto-Price Sanitizer
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white">
              {lang === 'mr'
                ? 'महाराष्ट्र कृषी उत्पन्न बाजार समिती (APMC) थेट डेटा संकलन'
                : 'Maharashtra AGMARKNET Harvesting & Ingestion Engine'}
            </h2>
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
              {lang === 'mr'
                ? 'लासलगाव, पिंपळगाव, वाशी, पुणे मार्केटयार्ड, सोलापूर, नागपूर इत्यादी प्रमुख बाजार समित्यांचे थेट दर, आवक व सरासरी किंमत स्वच्छ करून डेटाबेसमध्ये समाविष्ट करा.'
                : 'Automated ingestion pipeline for wholesale daily mandi arrivals, price bounds, geocoding coordinates, and Marathi nomenclature standardization.'}
            </p>

            {/* Direct Agmarknet API Key Field */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label className="text-[11px] font-mono text-stone-300 flex items-center gap-1.5 shrink-0">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Agmarknet / data.gov.in API Key:
              </label>
              <div className="flex items-center gap-2 w-full max-w-md">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="Paste your data.gov.in API key here..."
                  className="px-3 py-1.5 bg-stone-800/90 text-stone-100 placeholder-stone-400 border border-stone-600 rounded-xl text-xs font-mono w-full focus:outline-none focus:border-emerald-400 focus:bg-stone-800"
                />
                {apiKeyInput ? (
                  <span className="text-[10px] text-emerald-300 font-mono shrink-0 bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-700">
                    Key Active
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400 font-mono shrink-0 bg-stone-800 px-2 py-1 rounded-md border border-stone-700">
                    Optional
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              id="btn_trigger_harvest_primary"
              onClick={() => runHarvest()}
              disabled={loading}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs md:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-slate-950' : ''}`} />
              <span>
                {loading
                  ? lang === 'mr'
                    ? 'डेटा गोळा केला जात आहे...'
                    : 'Harvesting Live Mandis...'
                  : lang === 'mr'
                  ? 'सर्व महाराष्ट्र बाजार संकलन सुरू करा'
                  : 'Run Maharashtra AGMARKNET Harvest'}
              </span>
            </button>

            <button
              onClick={() => setShowAdvancedTester(!showAdvancedTester)}
              className="px-4 py-2.5 bg-stone-800/80 hover:bg-stone-700 text-stone-200 border border-stone-600 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>{showAdvancedTester ? 'Hide Payload Tester' : 'Custom Endpoint / JSON Injector'}</span>
            </button>
          </div>
        </div>

        {/* Live Pipeline Telemetry Ribbon */}
        {syncResult && (
          <div className="mt-6 pt-5 border-t border-stone-700/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700">
              <span className="text-stone-400 text-[10px] block font-mono">STATUS</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {syncResult.status === 'success' ? 'Ingestion Synchronized' : 'Fallback Processed'}
              </span>
            </div>
            <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700">
              <span className="text-stone-400 text-[10px] block font-mono">VALID MANDI RECORDS</span>
              <span className="font-bold text-white text-base font-mono mt-0.5">
                {syncResult.summary?.validInserted || 0}
              </span>
            </div>
            <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700">
              <span className="text-stone-400 text-[10px] block font-mono">REJECTED / INVALID</span>
              <span className="font-bold text-amber-400 text-base font-mono mt-0.5">
                {syncResult.summary?.rejectedCount || 0}
              </span>
            </div>
            <div className="bg-stone-800/60 p-3 rounded-xl border border-stone-700">
              <span className="text-stone-400 text-[10px] block font-mono">PRIMARY GATEWAY</span>
              <span className="font-medium text-stone-300 text-[11px] truncate block mt-0.5" title={syncResult.source}>
                MSAMB / AGMARKNET OGD
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Custom Endpoint / JSON Testing Drawer */}
      {showAdvancedTester && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-stone-900 text-sm md:text-base">
                {lang === 'mr' ? 'कस्टम API एंडपॉईंट व JSON व्हॅलिडेशन टेस्टर' : 'Custom AGMARKNET Endpoint & JSON Validator'}
              </h3>
            </div>
            <button
              onClick={() => setCustomJsonInput(samplePayloadSnippet)}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold underline"
            >
              Load Maharashtra Sample JSON
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                External Government / OGD REST API URL (Optional)
              </label>
              <input
                type="text"
                value={customApiUrl}
                onChange={(e) => setCustomApiUrl(e.target.value)}
                placeholder="https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=..."
                className="w-full text-xs font-mono p-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-stone-500">
                Leave empty to use pre-configured high-availability Maharashtra APMC mandi gateway.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 block">
                Raw JSON Payload (Array of records or single object)
              </label>
              <textarea
                rows={5}
                value={customJsonInput}
                onChange={(e) => setCustomJsonInput(e.target.value)}
                placeholder={samplePayloadSnippet}
                className="w-full text-xs font-mono p-3 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setCustomJsonInput('');
                setValidationTestOutput(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Clear
            </button>
            <button
              onClick={testCustomRecordValidation}
              disabled={loading || !customJsonInput.trim()}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Validate & Ingest Payload</span>
            </button>
          </div>

          {validationTestOutput && (
            <div className="mt-4 p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2 font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900">Validation Output:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${validationTestOutput.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                  {validationTestOutput.isValid ? 'PASSED (CLEANED)' : 'FAILED'}
                </span>
              </div>
              <pre className="text-[11px] text-stone-700 overflow-x-auto bg-white p-3 rounded-lg border border-stone-200">
                {JSON.stringify(validationTestOutput, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Harvest Presets by Maharashtra Agro Regions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            {lang === 'mr' ? 'महाराष्ट्र कृषी पट्टा विभागनिहाय संकलन' : 'Regional Maharashtra Agro Belt Harvest Presets'}
          </h3>
          <span className="text-[11px] text-stone-500 hidden sm:inline">
            Click any regional hub to harvest live rates instantly
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'nashik_belt',
              title: lang === 'mr' ? 'नाशिक-निफाड कांदा पट्टा' : 'Nashik-Niphad Onion Belt',
              subtitle: 'Lasalgaon, Pimpalgaon, Nashik APMC, Yeola',
              crops: 'Onion, Tomato, Grapes',
              tag: '1480 Tonnes/day'
            },
            {
              id: 'pune_mumbai',
              title: lang === 'mr' ? 'पुणे-मुंबई ग्राहक टर्मिनल्स' : 'Pune & Vashi Consumer Hubs',
              subtitle: 'Gultekdi Marketyard, Vashi Navi Mumbai APMC',
              crops: 'Vegetables, Fruits, Onion',
              tag: 'Highest Modal Rates'
            },
            {
              id: 'western_maha',
              title: lang === 'mr' ? 'सोलापूर-सांगली फळे कॉरिडॉर' : 'Solapur-Sangli Fruit Corridor',
              subtitle: 'Rahata, Solapur, Tasgaon, Sangamner',
              crops: 'Pomegranate, Grapes, Chilli',
              tag: 'Export Grade'
            },
            {
              id: 'vidarbha_marathwada',
              title: lang === 'mr' ? 'विदर्भ-मराठवाडा धान्य व कापूस' : 'Vidarbha & Marathwada Hubs',
              subtitle: 'Nagpur Kalamna, Latur, Amravati',
              crops: 'Soybean, Cotton, Santra',
              tag: 'Bulk Commercial'
            }
          ].map((preset) => (
            <div
              key={preset.id}
              className="p-4 bg-white border border-stone-200 hover:border-emerald-600 rounded-2xl shadow-2xs transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase bg-stone-100 group-hover:bg-emerald-50 text-stone-600 group-hover:text-emerald-800 px-2 py-0.5 rounded-md">
                  {preset.tag}
                </span>
                <button
                  onClick={() => runHarvest()}
                  disabled={loading}
                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg transition"
                  title="Harvest this region"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div>
                <h4 className="font-bold text-xs text-stone-900 group-hover:text-emerald-800">
                  {preset.title}
                </h4>
                <p className="text-[11px] text-stone-500">{preset.subtitle}</p>
              </div>

              <div className="text-[10px] text-stone-600 font-medium pt-1 border-t border-stone-100 flex items-center justify-between">
                <span>{preset.crops}</span>
                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                  Live Feed <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Harvested Live Mandis Table */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" />
              {lang === 'mr' ? 'थेट गोळा केलेले महाराष्ट्र बाजार समिती दर' : 'Ingested Maharashtra Mandi Price Ledger'}
            </h3>
            <p className="text-xs text-stone-500">
              {lang === 'mr'
                ? 'अ‍ॅगमार्कनेट प्रमाणीकृत किमान, कमाल व सरासरी दर (प्रति क्विंटल) व आवक'
                : 'AGMARKNET validated minimum, maximum, and modal wholesale rates (₹/Quintal) & arrivals'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={lang === 'mr' ? 'बाजार किंवा जिल्हा शोधा...' : 'Filter mandi / district...'}
                className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none w-48"
              />
            </div>

            {/* Commodity Filter */}
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs flex-wrap">
              <Filter className="w-3 h-3 text-stone-400 ml-1 mr-0.5" />
              {[
                { id: 'ALL', labelEn: 'All', labelMr: 'सर्व', labelHi: 'सभी' },
                { id: 'Onion', labelEn: 'Onion', labelMr: 'कांदा', labelHi: 'प्याज' },
                { id: 'Tomato', labelEn: 'Tomato', labelMr: 'टोमॅटो', labelHi: 'टमाटर' },
                { id: 'Pomegranate', labelEn: 'Pomegranate', labelMr: 'डाळिंब', labelHi: 'अनार' },
                { id: 'Grapes', labelEn: 'Grapes', labelMr: 'द्राक्षे', labelHi: 'अंगूर' },
                { id: 'Soybean', labelEn: 'Soybean', labelMr: 'सोयाबीन', labelHi: 'सोयाबीन' },
                { id: 'Cotton', labelEn: 'Cotton', labelMr: 'कापूस', labelHi: 'कपास' },
                { id: 'Orange (Santra)', labelEn: 'Orange', labelMr: 'संत्रा', labelHi: 'संतरा' },
                { id: 'Potato', labelEn: 'Potato', labelMr: 'बटाटा', labelHi: 'आलू' },
                { id: 'Green Chilli', labelEn: 'Chilli', labelMr: 'मिरची', labelHi: 'मिर्च' }
              ].map((comm) => (
                <button
                  key={comm.id}
                  onClick={() => setCommodityFilter(comm.id)}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                    commodityFilter === comm.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {lang === 'mr' ? comm.labelMr : (lang === 'hi' ? comm.labelHi : comm.labelEn)}
                </button>
              ))}

              <button
                onClick={() => runHarvest(undefined, undefined, commodityFilter !== 'ALL' ? commodityFilter : undefined)}
                disabled={loading}
                title={commodityFilter === 'ALL' ? 'Sync all crops' : `Sync live ${commodityFilter} data from Agmarknet`}
                className="ml-1 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg font-bold text-[11px] flex items-center gap-1 transition"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>{lang === 'mr' ? 'थेट सिंक' : 'Live Sync'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider font-mono">
              <tr>
                <th className="px-4 py-3">Mandi Market (बाजार समिती)</th>
                <th className="px-4 py-3">District (जिल्हा)</th>
                <th className="px-4 py-3">Commodity & Variety</th>
                <th className="px-4 py-3 text-right">Modal Rate (₹/Qtl)</th>
                <th className="px-4 py-3 text-right">Min - Max Bounds</th>
                <th className="px-4 py-3 text-right">Arrivals (Tonnes)</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-stone-50/80 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-stone-900">
                        {lang === 'mr' && rec.marketMarathi ? rec.marketMarathi : rec.market}
                      </div>
                      <div className="text-[10px] text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span>
                          {rec.latitude != null ? rec.latitude.toFixed(2) : '--'}°N, {rec.longitude != null ? rec.longitude.toFixed(2) : '--'}°E
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-stone-700">
                      <span className="font-medium">
                        {lang === 'mr' && rec.districtMarathi ? rec.districtMarathi : rec.district}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-emerald-800">
                        {lang === 'mr' && rec.commodityMarathi ? rec.commodityMarathi : rec.commodity}
                      </div>
                      <div className="text-[10px] text-stone-500">{rec.variety}</div>
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-black text-stone-900 text-sm">
                      ₹{rec.modal_price.toLocaleString('en-IN')}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono text-[11px] text-stone-600">
                      ₹{rec.min_price} - ₹{rec.max_price}
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-stone-800">
                      {rec.arrivals_tonnes || 120} T
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      {onSelectMarketForAnalysis && (
                        <button
                          onClick={() => onSelectMarketForAnalysis(rec.commodity, rec.market)}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg transition"
                        >
                          {lang === 'mr' ? 'निवडा' : 'Analyze'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-stone-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Layers className="w-8 h-8 text-stone-300" />
                      <p className="text-xs font-semibold">
                        {loading
                          ? 'Harvesting live Maharashtra APMC mandis...'
                          : 'No harvested records matching filter. Click "Run Maharashtra AGMARKNET Harvest" above.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
