import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { mongoDB } from './server/database.js';
import { MandiDataCollector } from './server/services/collector.js';
import { LocationAndRecommendationEngine } from './server/services/recommendationEngine.js';
import { MandiPricePredictor } from './server/services/mlPredictor.js';
import { BuyerDiscoveryAndQualityEngine } from './server/services/buyerMatcher.js';
import { GeminiAgriculturalAdvisor } from './server/services/aiAdvisor.js';
import { REGION_COORDINATES } from './server/data/mandiDatabase.js';
import { analyticsRouter } from './server/routes/analyticsRoutes.js';
import { gpsRouter } from './server/routes/gpsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use('/api/analytics', analyticsRouter);
app.use('/api/gps', gpsRouter);

// ==========================================
// 1. DATA COLLECTOR & INGESTION APIS (Phase 1 & 2)
// ==========================================

app.post('/api/mandi/collector/sync', async (req: Request, res: Response) => {
  try {
    const { endpointUrl, manualRecords, apiKey, commodity } = req.body;

    let rawRecords: any[] = [];
    let source = 'Direct Payload';

    if (manualRecords && Array.isArray(manualRecords)) {
      rawRecords = manualRecords;
    } else {
      const fetchResult = await MandiDataCollector.fetchFromGovernmentApi(endpointUrl, undefined, apiKey, commodity);
      rawRecords = fetchResult.data;
      source = fetchResult.source;
    }

    const validationResult = MandiDataCollector.cleanAndValidateDataset(rawRecords);
    
    if (validationResult.validRecords.length > 0) {
      mongoDB.insertManyMandiRecords(validationResult.validRecords);
    }

    res.json({
      status: 'success',
      source,
      summary: {
        totalReceived: validationResult.totalReceived,
        validInserted: validationResult.validCount,
        rejectedCount: validationResult.rejectedCount,
      },
      validRecords: validationResult.validRecords,
      rejectionReport: validationResult.rejectionReport,
      warnings: validationResult.warnings
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Data sync failed' });
  }
});

app.post('/api/mandi/validate-record', (req: Request, res: Response) => {
  const result = MandiDataCollector.validateAndCleanRecord(req.body);
  res.json(result);
});

// ==========================================
// 2. MANDI SEARCH & BACKEND ENDPOINTS
// ==========================================

app.get('/api/mandi/search', (req: Request, res: Response) => {
  const { commodity, state, district, market, search } = req.query;

  const results = mongoDB.findMandiPrices({
    commodity: commodity as string,
    state: state as string,
    district: district as string,
    market: market as string,
    search: search as string,
  });

  res.json({
    count: results.length,
    results
  });
});

app.get('/api/mandi/latest', (req: Request, res: Response) => {
  const all = mongoDB.getAllMandiPrices();
  const latestDate = all[0]?.arrival_date || new Date().toISOString().split('T')[0];
  res.json({
    total: all.length,
    date: latestDate,
    commodities: mongoDB.getDistinctCommodities(),
    markets: mongoDB.getDistinctMarkets(),
    records: all
  });
});

// ==========================================
// 3. MANDI TREND & MAP ENDPOINTS
// ==========================================

app.get('/api/mandi/trend', (req: Request, res: Response) => {
  try {
    const commodity = (req.query.commodity as string) || 'Onion';
    const market = (req.query.market as string) || 'Lasalgaon';
    const variety = (req.query.variety as string) || 'Local';

    const history = mongoDB.getHistoricalPriceSeries(commodity, market);
    const forecast = MandiPricePredictor.predictFuturePrices(commodity, market, variety, history);

    res.json({
      commodity,
      market,
      variety,
      history,
      forecast
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to fetch price trend' });
  }
});

app.get('/api/mandi/map', (req: Request, res: Response) => {
  const commodity = (req.query.commodity as string) || 'Onion';
  const locationParam = (req.query.location as string) || 'Nashik';
  
  let farmerLat = parseFloat(req.query.lat as string);
  let farmerLng = parseFloat(req.query.lng as string);

  if (isNaN(farmerLat) || isNaN(farmerLng)) {
    const locKey = locationParam.toLowerCase().trim();
    if (REGION_COORDINATES[locKey]) {
      farmerLat = REGION_COORDINATES[locKey].lat;
      farmerLng = REGION_COORDINATES[locKey].lng;
    } else {
      farmerLat = 19.9975;
      farmerLng = 73.7898;
    }
  }

  const matches = mongoDB.findMandiPrices({ commodity });

  const mapData = matches.map(m => {
    const distanceKm = LocationAndRecommendationEngine.calculateDistanceKm(
      farmerLat,
      farmerLng,
      m.latitude,
      m.longitude
    );

    const route = LocationAndRecommendationEngine.getRouteDetails(locationParam, m.market, distanceKm, {
      originLat: farmerLat,
      originLng: farmerLng,
      destLat: m.latitude,
      destLng: m.longitude
    });

    const estLogistics = LocationAndRecommendationEngine.calculateGranularLogistics(
      1000,
      distanceKm,
      m.modal_price * 10,
      'APMC_MANDI',
      { tollCharges: route.tollCharges, roadQuality: route.roadQuality }
    );

    return {
      id: m.id,
      market: m.market,
      marketMarathi: m.marketMarathi,
      district: m.district,
      districtMarathi: m.districtMarathi,
      state: m.state,
      commodity: m.commodity,
      commodityMarathi: m.commodityMarathi,
      modal_price: m.modal_price,
      min_price: m.min_price,
      max_price: m.max_price,
      arrivals_tonnes: m.arrivals_tonnes || 120,
      latitude: m.latitude,
      longitude: m.longitude,
      distanceKm,
      roadQuality: route.roadQuality,
      terrainName: route.terrainName,
      terrainRatePerKm: estLogistics.terrainRatePerKm,
      tollCharges: route.tollCharges,
      estimatedTransportCost: estLogistics.totalLogisticsAndDeductions
    };
  });

  const avgPrice = mapData.length > 0 
    ? Math.round(mapData.reduce((acc, curr) => acc + curr.modal_price, 0) / mapData.length)
    : 0;

  res.json({
    commodity,
    farmerLocation: locationParam,
    center: { lat: farmerLat, lng: farmerLng },
    averageModalPrice: avgPrice,
    marketCount: mapData.length,
    markets: mapData
  });
});

// ==========================================
// 4. SALES CHANNELS COMPARISON (MANDIS vs PROCESSORS vs RETAILERS)
// ==========================================

app.get('/api/mandi/channels', (req: Request, res: Response) => {
  const { commodity, channelType } = req.query;
  const channels = mongoDB.findChannels({
    commodity: commodity as string,
    channelType: channelType as string
  });
  res.json({ count: channels.length, channels });
});

app.get('/api/mandi/routes/presets', (_req: Request, res: Response) => {
  const presets = mongoDB.getRoutePresets();
  res.json({ presets });
});

app.post('/api/mandi/channels/compare', async (req: Request, res: Response) => {
  try {
    const {
      location = 'Nashik',
      commodity = 'Tomato',
      variety = 'Local Red',
      quantityKg = 1000,
      grade = 'Grade A',
      coordinates = null,
      logisticsConfig = {}
    } = req.body;

    let candidateChannels = mongoDB.findChannels({ commodity });
    if (candidateChannels.length === 0) {
      candidateChannels = mongoDB.getAllChannels();
    }

    const comparisonResponse = LocationAndRecommendationEngine.evaluateSalesChannels(
      {
        location,
        commodity,
        variety,
        quantityKg: Number(quantityKg),
        grade,
        coords: coordinates
      },
      candidateChannels,
      logisticsConfig
    );

    try {
      const aiAdvisory = await GeminiAgriculturalAdvisor.explainChannelComparison(comparisonResponse);
      comparisonResponse.aiTradeAdvisory = aiAdvisory;
    } catch (_aiErr) {
      // Optional AI advisory skipped gracefully
    }

    res.json(comparisonResponse);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Channel comparison evaluation failed' });
  }
});

app.post('/api/mandi/analytics/deep', async (req: Request, res: Response) => {
  try {
    const {
      commodity = 'Onion',
      farmerLocation = 'Nashik',
      quantityKg = 1000,
      grade = 'Grade A',
      logisticsConfig = {}
    } = req.body;

    const candidateMarkets = mongoDB.findMandiPrices({ commodity });
    const candidateChannels = mongoDB.findChannels({ commodity });

    const deepAnalytics = await GeminiAgriculturalAdvisor.generateDeepMarketAnalytics({
      commodity,
      farmerLocation,
      quantityKg: Number(quantityKg),
      grade,
      candidateMarkets,
      candidateChannels,
      logisticsConfig
    });

    res.json(deepAnalytics);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Deep market analytics generation failed' });
  }
});

app.post('/api/mandi/logistics/estimate', (req: Request, res: Response) => {
  try {
    const {
      quantityKg = 1000,
      distanceKm = 150,
      grossProduceValue = 25000,
      channelType = 'APMC_MANDI',
      config = {}
    } = req.body;

    const breakdown = LocationAndRecommendationEngine.calculateGranularLogistics(
      Number(quantityKg),
      Number(distanceKm),
      Number(grossProduceValue),
      channelType,
      config
    );

    res.json({ breakdown });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Logistics calculation failed' });
  }
});

// ==========================================
// 5. LOCATION & MANDI RECOMMENDATION ENGINE
// ==========================================

app.post('/api/mandi/recommend', async (req: Request, res: Response) => {
  try {
    const { location = 'Nashik', coordinates, commodity = 'Onion', quantityKg = 1000 } = req.body;

    const candidateMandis = mongoDB.findMandiPrices({ commodity });
    if (candidateMandis.length === 0) {
      return res.status(404).json({ error: `No active Mandis found for commodity: ${commodity}` });
    }

    const recResult = LocationAndRecommendationEngine.evaluateMarkets(
      location,
      coordinates || null,
      commodity,
      Number(quantityKg),
      candidateMandis
    );

    try {
      const aiExplanation = await GeminiAgriculturalAdvisor.explainRecommendation(recResult);
      recResult.aiExplanation = aiExplanation;
    } catch (_aiErr) {
      // Optional AI explanation skipped gracefully
    }

    res.json(recResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Recommendation calculation failed' });
  }
});

// ==========================================
// 6. BUYER DISCOVERY & QUALITY MATCHING
// ==========================================

app.get('/api/buyers', (req: Request, res: Response) => {
  const { commodity, grade, state } = req.query;
  const buyers = mongoDB.findBuyers({
    commodity: commodity as string,
    grade: grade as string,
    state: state as string
  });
  res.json({ count: buyers.length, buyers });
});

app.post('/api/buyers/match', (req: Request, res: Response) => {
  try {
    const {
      commodity = 'Onion',
      variety = 'Red Onion',
      quantityKg = 1000,
      grade = 'Grade A',
      avgSizeMm = 60,
      location = 'Nashik'
    } = req.body;

    const candidateBuyers = mongoDB.findBuyers({ commodity });
    const matches = BuyerDiscoveryAndQualityEngine.matchBuyers(
      {
        commodity,
        variety,
        quantityKg: Number(quantityKg),
        grade,
        avgSizeMm: avgSizeMm ? Number(avgSizeMm) : undefined,
        location
      },
      candidateBuyers
    );

    res.json({
      farmerProduce: { commodity, variety, quantityKg, grade, avgSizeMm, location },
      totalMatches: matches.length,
      matches
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Buyer matching error' });
  }
});

// ==========================================
// 7. FARMER AI CHATBOT (Trilingual Audio/Text)
// ==========================================

app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], context = {} } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const aiReply = await GeminiAgriculturalAdvisor.chatWithFarmer(message, history, context);
    res.json({ reply: aiReply });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Chat error' });
  }
});

// ==========================================
// 8. VITE DEV SERVER / STATIC ASSETS
// ==========================================

// Ensure all unmatched API requests strictly return JSON, NEVER HTML <!doctype>
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    error: 'API endpoint not found',
    path: req.path
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KisanMandi Maharashtra AI Server] Running on http://localhost:${PORT}`);
  });
}

startServer();
