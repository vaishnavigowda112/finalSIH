import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Database,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  Download,
  Share2,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { SupportedLanguage } from '../types.js';

interface DataScienceAnalyticsHubProps {
  lang: SupportedLanguage;
  currentCommodity: string;
  onSelectCommodity?: (comm: string) => void;
}

export const DataScienceAnalyticsHub: React.FC<DataScienceAnalyticsHubProps> = ({
  lang,
  currentCommodity,
  onSelectCommodity
}) => {
  // API connection & pipeline state
  const [endpointUrl, setEndpointUrl] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>(currentCommodity || 'Onion');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [activeChartModal, setActiveChartModal] = useState<{ title: string; imageSrc: string } | null>(null);
  const [searchTableQuery, setSearchTableQuery] = useState<string>('');

  // Translations
  const t = {
    title: {
      mr: 'थेट API डेटा सायन्स आणि ML अनालिटिक्स हब',
      hi: 'लाइव API डेटा साइंस और ML एनालिटिक्स हब',
      en: 'Live API Data Science & ML Analytics Hub'
    }[lang],
    subtitle: {
      mr: 'अधिकृत API वरून थेट डेटा • Pandas डेटा मॅनिपुलेशन • Scikit-learn प्रेडिक्टिव्ह मॉडेल्स • Seaborn आणि Matplotlib व्हिज्युअलायझेशन',
      hi: 'आधिकारिक API से सीधा डेटा • Pandas डेटा मैनिपुलेशन • Scikit-learn प्रेडिक्टिव मॉडल्स • Seaborn और Matplotlib विज़ुअलाइज़ेशन',
      en: 'Direct API Ingestion • Pandas Data Manipulation • Scikit-learn Predictive ML • Seaborn & Matplotlib Visualizations'
    }[lang],
    runPipelineBtn: {
      mr: 'थेट API डेटा फेच करा आणि Python Pipeline चालवा',
      hi: 'लाइव API डेटा फेच करें और Python Pipeline चलाएं',
      en: 'Fetch Live API & Run Python Pipeline'
    }[lang],
    zeroJunkBadge: {
      mr: 'कठोर डेटा स्वच्छता (शून्य जंक डेटा)',
      hi: 'सख्त डेटा स्वच्छता (शून्य जंक डेटा)',
      en: 'Strict Data Sanitization (Zero Junk Data)'
    }[lang],
    pandasStatsTitle: {
      mr: 'Pandas वर्णनात्मक आकडेवारी आणि मेट्रिक्स',
      hi: 'Pandas विवरणात्मक सांख्यिकी एवं मेट्रिक्स',
      en: 'Pandas Descriptive Statistics & Metrics'
    }[lang],
    sklearnTitle: {
      mr: 'Scikit-learn मशीन लर्निंग मॉडेल डायग्नोस्टिक्स',
      hi: 'Scikit-learn मशीन लर्निंग मॉडल डायग्नोस्टिक्स',
      en: 'Scikit-learn Machine Learning Diagnostics'
    }[lang],
    visualGalleryTitle: {
      mr: 'Seaborn आणि Matplotlib उच्च-रिझोल्यूशन व्हिज्युअलायझेशन',
      hi: 'Seaborn और Matplotlib उच्च-रिज़ॉल्यूशन विज़ुअलाइज़ेशन',
      en: 'Seaborn & Matplotlib High-Resolution Visualizations'
    }[lang]
  };

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch system health on mount
  useEffect(() => {
    fetch('/api/analytics/health')
      .then(res => (res.ok ? res.json() : { status: 'ready' }))
      .then(data => setSystemHealth(data))
      .catch(err => console.warn('Analytics health check notice:', err));
  }, []);

  // Run pipeline function
  const runAnalyticsPipeline = async (commodityParam?: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const targetCrop = commodityParam || selectedCrop;
      const res = await fetch('/api/analytics/pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          commodity: targetCrop,
          apiUrl: endpointUrl.trim() || undefined,
          apiKey: apiKeyInput.trim() || undefined
        })
      });

      const text = await res.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch (_parseErr) {
        throw new Error(
          `Analytics service returned a non-JSON response (HTTP ${res.status}). Retrying...`
        );
      }

      if (json.status === 'error') {
        throw new Error(json.message || 'Failed to process data through Python analytics pipeline');
      }

      setPipelineData(json);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error('Analytics pipeline execution error:', err);
      setError(err.message || 'Error communicating with Python Data Science backend');
    } finally {
      setLoading(false);
    }
  };

  // Run initial pipeline when tab mounts
  useEffect(() => {
    runAnalyticsPipeline();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedCrop]);

  const stats = pipelineData?.summary_stats;
  const regression = pipelineData?.regression_diagnostics;
  const clusters = pipelineData?.cluster_summaries || [];
  const charts = pipelineData?.charts || {};
  const cleanedRecords = pipelineData?.cleaned_records || [];

  const filteredRecords = cleanedRecords.filter((r: any) => {
    if (!searchTableQuery) return true;
    const q = searchTableQuery.toLowerCase();
    return (
      r.market?.toLowerCase().includes(q) ||
      r.district?.toLowerCase().includes(q) ||
      r.commodity?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-stone-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-900/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400" />
                Python 3.10 Engine • Pandas • Scikit-learn • Seaborn • Matplotlib
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-sky-400" />
                {t.zeroJunkBadge}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <BarChart3 className="w-7 h-7 text-emerald-400" />
              {t.title}
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => runAnalyticsPipeline()}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Executing Python ML...' : t.runPipelineBtn}
            </button>
          </div>
        </div>

        {/* System Architecture Metadata Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Data Pipeline</span>
            <span className="text-emerald-400 font-medium">REST API → Ingestion → Sanitization</span>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Analytics Engine</span>
            <span className="text-amber-300 font-medium">Pandas v{systemHealth?.modules?.pandas || '2.x'} & NumPy</span>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">ML & Modeling</span>
            <span className="text-sky-400 font-medium">Scikit-learn Regression & KMeans</span>
          </div>
          <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/50">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Visual Rendering</span>
            <span className="text-rose-300 font-medium">Seaborn & Matplotlib (Base64)</span>
          </div>
        </div>
      </div>

      {/* 2. Live API Connection & Commodity Selector Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold text-stone-600 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              Target Commodity:
            </label>
            {['Onion', 'Tomato', 'Pomegranate', 'Grapes', 'Soybean', 'Cotton', 'All'].map((crop) => (
              <button
                key={crop}
                onClick={() => {
                  setSelectedCrop(crop);
                  if (onSelectCommodity && crop !== 'All') onSelectCommodity(crop);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCrop === crop
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>
              Live Source: <strong className="text-stone-800">{pipelineData?.source || 'Official Agmarknet Gateway'}</strong>
            </span>
            {pipelineData?.records_count && (
              <span className="ml-2 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold text-[11px] border border-emerald-200">
                {pipelineData.records_count} Verified Records
              </span>
            )}
          </div>
        </div>

        {/* Custom API Endpoint Toggle Bar */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-2 text-xs">
          <span className="text-stone-500 shrink-0 font-medium">Live Endpoint URL (Optional Custom API):</span>
          <input
            type="text"
            placeholder="Default: https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            className="w-full flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-stone-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            onClick={() => runAnalyticsPipeline()}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-medium shrink-0"
          >
            Apply Endpoint
          </button>
        </div>
      </div>

      {/* Error Banner if any */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-4 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block text-sm">Pipeline Execution Notice</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* 3. Matplotlib & Seaborn Visualizations Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-600" />
            {t.visualGalleryTitle}
          </h2>
          <span className="text-xs text-stone-500">Rendered dynamically via Matplotlib Agg & Seaborn Backend</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Chart 1: Seaborn Distribution Plot */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Seaborn Histplot & KDE Density
                </span>
                <button
                  onClick={() => charts.price_distribution && setActiveChartModal({ title: 'Mandi Price Distribution (Seaborn)', imageSrc: charts.price_distribution })}
                  className="text-stone-400 hover:text-stone-700 transition-colors p-1"
                  title="Expand Chart"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-sm font-bold text-stone-900">Modal Price Distribution & Density Curve</h3>
              <p className="text-xs text-stone-500 mb-3">Computed via Seaborn KDE kernel estimation with Mean and Median markers</p>
            </div>
            <div className="relative bg-stone-50 rounded-lg overflow-hidden border border-stone-100 min-h-[260px] flex items-center justify-center">
              {charts.price_distribution ? (
                <img
                  src={charts.price_distribution}
                  alt="Seaborn Price Distribution"
                  className="w-full h-auto object-contain cursor-pointer"
                  onClick={() => setActiveChartModal({ title: 'Mandi Price Distribution (Seaborn)', imageSrc: charts.price_distribution })}
                />
              ) : (
                <div className="text-xs text-stone-400 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  Generating Seaborn Plot...
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Seaborn Regplot (Arrivals vs Modal Price) */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 hover:border-sky-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Seaborn Regplot & Scikit-learn Fit
                </span>
                <button
                  onClick={() => charts.volume_vs_price && setActiveChartModal({ title: 'Volume vs Price Elasticity (Seaborn & Scikit-learn)', imageSrc: charts.volume_vs_price })}
                  className="text-stone-400 hover:text-stone-700 transition-colors p-1"
                  title="Expand Chart"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-sm font-bold text-stone-900">Arrivals Volume vs Price Elasticity</h3>
              <p className="text-xs text-stone-500 mb-3">Regression line and 95% bootstrap confidence interval generated via Seaborn</p>
            </div>
            <div className="relative bg-stone-50 rounded-lg overflow-hidden border border-stone-100 min-h-[260px] flex items-center justify-center">
              {charts.volume_vs_price ? (
                <img
                  src={charts.volume_vs_price}
                  alt="Seaborn Volume vs Price"
                  className="w-full h-auto object-contain cursor-pointer"
                  onClick={() => setActiveChartModal({ title: 'Volume vs Price Elasticity (Seaborn & Scikit-learn)', imageSrc: charts.volume_vs_price })}
                />
              ) : (
                <div className="text-xs text-stone-400 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                  Rendering Regression Line...
                </div>
              )}
            </div>
          </div>

          {/* Chart 3: Matplotlib Top Mandis with Price Spread Bands */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Matplotlib Errorbar & Spread
                </span>
                <button
                  onClick={() => charts.top_mandis_spread && setActiveChartModal({ title: 'Top Realizing Mandis with Spread (Matplotlib)', imageSrc: charts.top_mandis_spread })}
                  className="text-stone-400 hover:text-stone-700 transition-colors p-1"
                  title="Expand Chart"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-sm font-bold text-stone-900">Top APMC Mandis by Modal Price & Spread</h3>
              <p className="text-xs text-stone-500 mb-3">Horizontal bars with min-to-max discovery interval error bars</p>
            </div>
            <div className="relative bg-stone-50 rounded-lg overflow-hidden border border-stone-100 min-h-[260px] flex items-center justify-center">
              {charts.top_mandis_spread ? (
                <img
                  src={charts.top_mandis_spread}
                  alt="Matplotlib Top Mandis Spread"
                  className="w-full h-auto object-contain cursor-pointer"
                  onClick={() => setActiveChartModal({ title: 'Top Realizing Mandis with Spread (Matplotlib)', imageSrc: charts.top_mandis_spread })}
                />
              ) : (
                <div className="text-xs text-stone-400 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  Generating Matplotlib Bar Plot...
                </div>
              )}
            </div>
          </div>

          {/* Chart 4: Seaborn KMeans Cluster Scatter */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 hover:border-amber-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Scikit-learn KMeans & Seaborn Scatter
                </span>
                <button
                  onClick={() => charts.kmeans_clusters && setActiveChartModal({ title: 'KMeans Market Segmentation (Scikit-learn & Seaborn)', imageSrc: charts.kmeans_clusters })}
                  className="text-stone-400 hover:text-stone-700 transition-colors p-1"
                  title="Expand Chart"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-sm font-bold text-stone-900">Market Segmentation Tiers</h3>
              <p className="text-xs text-stone-500 mb-3">Unsupervised KMeans clustering on Volume, Price, and Spread</p>
            </div>
            <div className="relative bg-stone-50 rounded-lg overflow-hidden border border-stone-100 min-h-[260px] flex items-center justify-center">
              {charts.kmeans_clusters ? (
                <img
                  src={charts.kmeans_clusters}
                  alt="Seaborn KMeans Clusters"
                  className="w-full h-auto object-contain cursor-pointer"
                  onClick={() => setActiveChartModal({ title: 'KMeans Market Segmentation (Scikit-learn & Seaborn)', imageSrc: charts.kmeans_clusters })}
                />
              ) : (
                <div className="text-xs text-stone-400 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                  Clustering Mandis in Scikit-learn...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Pandas Statistical Summary & Scikit-learn Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pandas Descriptive Statistics */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              {t.pandasStatsTitle}
            </h3>
            <span className="text-xs font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
              df.describe()
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/80">
              <span className="text-stone-500 block text-[11px]">Mean Modal Price</span>
              <span className="text-lg font-bold text-emerald-700 font-mono">
                ₹{stats?.mean_modal_price ?? '--'}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">per quintal</span>
            </div>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/80">
              <span className="text-stone-500 block text-[11px]">Median Price (50%)</span>
              <span className="text-lg font-bold text-stone-800 font-mono">
                ₹{stats?.median_modal_price ?? '--'}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">robust midpoint</span>
            </div>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/80">
              <span className="text-stone-500 block text-[11px]">Std Deviation (σ)</span>
              <span className="text-lg font-bold text-amber-700 font-mono">
                ±₹{stats?.std_modal_price ?? '--'}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">volatility spread</span>
            </div>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/80">
              <span className="text-stone-500 block text-[11px]">Interquartile Range (IQR)</span>
              <span className="text-base font-bold text-stone-800 font-mono">
                ₹{stats?.iqr_modal_price ?? '--'}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Q1: ₹{stats?.q25_modal_price} - Q3: ₹{stats?.q75_modal_price}
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/80">
              <span className="text-stone-500 block text-[11px]">Total Arrivals Sampled</span>
              <span className="text-base font-bold text-sky-800 font-mono">
                {stats?.total_arrivals_tonnes?.toLocaleString() ?? '--'} T
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Mean: {stats?.mean_arrivals_tonnes} T/mandi
              </span>
            </div>

            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200/80">
              <span className="text-stone-500 block text-[11px]">Min - Max Range</span>
              <span className="text-base font-bold text-stone-800 font-mono">
                ₹{stats?.min_modal_price} - ₹{stats?.max_modal_price}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">
                Avg Spread: ₹{stats?.mean_price_spread}
              </span>
            </div>
          </div>

          {/* District Breakdown */}
          {pipelineData?.top_districts && pipelineData.top_districts.length > 0 && (
            <div className="mt-3">
              <span className="text-xs font-semibold text-stone-700 block mb-1.5">
                Top Districts by Realization (Pandas Groupby):
              </span>
              <div className="flex flex-wrap gap-2">
                {pipelineData.top_districts.slice(0, 6).map((d: any) => (
                  <div key={d.district} className="px-2.5 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded text-xs">
                    <strong className="font-semibold">{d.district}:</strong> ₹{d.avg_modal_price}/qtl ({d.market_count} mandis)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scikit-learn Machine Learning Diagnostics */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-sky-600" />
              {t.sklearnTitle}
            </h3>
            <span className="text-xs font-mono bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200">
              LinearRegression & KMeans
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs mb-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Regression R² Score (Goodness of Fit)</span>
              <span className="text-xl font-bold text-sky-800 font-mono">
                {regression?.r2_score !== undefined ? (regression.r2_score * 100).toFixed(1) + '%' : '--'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Explains price variance via volume and range
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px]">Root Mean Squared Error (RMSE)</span>
              <span className="text-xl font-bold text-stone-800 font-mono">
                ₹{regression?.rmse ?? '--'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Model prediction residual standard error
              </span>
            </div>
          </div>

          {/* Model Weights */}
          <div className="bg-stone-50 rounded-lg p-3 text-xs border border-stone-200 mb-4">
            <span className="font-semibold text-stone-700 block mb-1">Feature Weights & Coefficients (Scikit-learn):</span>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div>
                <span className="text-stone-500 block">Min Price Beta:</span>
                <strong className="text-stone-800">{regression?.coeff_min_price ?? '--'}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Max Price Beta:</span>
                <strong className="text-stone-800">{regression?.coeff_max_price ?? '--'}</strong>
              </div>
              <div>
                <span className="text-stone-500 block">Volume Impact:</span>
                <strong className="text-rose-700">{regression?.coeff_arrivals_tonnes ?? '--'} ₹/tonne</strong>
              </div>
            </div>
          </div>

          {/* KMeans Clusters */}
          <div>
            <span className="font-semibold text-stone-700 text-xs block mb-2">
              KMeans Discovered Market Clusters:
            </span>
            <div className="space-y-2">
              {clusters.map((c: any) => (
                <div key={c.cluster_id} className="p-2.5 rounded-lg border border-stone-200 bg-stone-50 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="font-bold text-stone-900">{c.label}</strong>
                    <span className="text-[10px] px-2 py-0.5 bg-stone-200 rounded font-mono font-medium">
                      {c.market_count} markets
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-stone-600 mt-1 text-[11px]">
                    <span>Avg Price: <strong>₹{c.avg_modal_price}</strong></span>
                    <span>Avg Volume: <strong>{c.avg_arrivals} T</strong></span>
                    <span>Spread: <strong>₹{c.avg_spread}</strong></span>
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1 truncate">
                    Mandis: {c.markets?.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Clean Live Records Table (Zero Junk Data) */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Sanitized Real-Time API Data Stream
            </h3>
            <p className="text-xs text-stone-500">
              Only verified records directly extracted from the API endpoint (All junk data, negative values, and incomplete records excluded)
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search mandi, district..."
              value={searchTableQuery}
              onChange={(e) => setSearchTableQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 w-full sm:w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200 sticky top-0">
              <tr>
                <th className="px-4 py-2.5">APMC Market</th>
                <th className="px-4 py-2.5">District</th>
                <th className="px-4 py-2.5">Commodity</th>
                <th className="px-4 py-2.5 text-right">Modal Price (₹)</th>
                <th className="px-4 py-2.5 text-right">Min - Max Band (₹)</th>
                <th className="px-4 py-2.5 text-right">Spread (₹)</th>
                <th className="px-4 py-2.5 text-right">Arrivals (T)</th>
                <th className="px-4 py-2.5 text-center">KMeans Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredRecords.map((rec: any, idx: number) => (
                <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="px-4 py-2 font-semibold text-stone-900">{rec.market}</td>
                  <td className="px-4 py-2 text-stone-600">{rec.district}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-medium text-[11px]">
                      {rec.commodity}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right font-mono font-bold text-emerald-700">
                    ₹{rec.modal_price}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-stone-600">
                    ₹{rec.min_price} - ₹{rec.max_price}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-stone-500">
                    ₹{rec.price_spread}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-sky-800">
                    {rec.arrivals_tonnes}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                      Tier {rec.cluster + 1}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Lightbox / Modal */}
      {activeChartModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                {activeChartModal.title}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={activeChartModal.imageSrc}
                  download="agri_analytics_chart.png"
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PNG
                </a>
                <button
                  onClick={() => setActiveChartModal(null)}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-900"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="my-4 bg-white flex items-center justify-center rounded-xl overflow-hidden">
              <img
                src={activeChartModal.imageSrc}
                alt={activeChartModal.title}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
