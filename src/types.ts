export type SupportedLanguage = 'en' | 'mr' | 'hi';

export interface MandiRecord {
  id: string;
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: number; // in INR per Quintal (100 kg)
  max_price: number;
  modal_price: number;
  unit: string;
  arrivals_tonnes?: number;
  latitude: number;
  longitude: number;
  districtMarathi?: string;
  marketMarathi?: string;
  commodityMarathi?: string;
}

export type FuelType = 'diesel' | 'petrol';
export type RoadQualityType = 'expressway' | 'state_highway' | 'ghat_rough' | 'rural_feeder';

export interface GranularLogisticsConfig {
  fuelType: FuelType;
  fuelPricePerLitre: number; // ₹92.80 Diesel, ₹104.20 Petrol
  mileageKmPerLitre: number; // e.g. 12 km/l
  roadQuality: RoadQualityType;
  isRoundTrip: boolean;
  tollCharges: number; // in INR
  autoDetectTerrain?: boolean; // When true, recalculates terrain rate & toll dynamically as location changes
  unexpectedHeads: {
    hamaliPerQtl: number; // Labor / Loading-Unloading per quintal (₹15-25)
    mandiCessPct: number; // APMC fee / Brokerage (1.5% - 6.0%)
    parkingAndEntryFee: number; // Market gate/weighbridge fee (₹50-150)
    transitDelayLossPct: number; // Spoilage/shrinkage percentage (1% - 8%)
  };
}

export interface DetailedLogisticsCostBreakdown {
  distanceKm: number;
  travelTimeHours: number;
  fuelType: FuelType;
  fuelPricePerLitre: number;
  litresConsumed: number;
  fuelCost: number;
  vehicleHireBaseFare: number;
  driverAndDistanceCost: number;
  tollCharges: number;
  terrainRatePerKm: number;
  terrainName: {
    en: string;
    mr: string;
    hi: string;
  };
  terrainElevationProfile?: string;
  roadQualityEffect: {
    roadType: RoadQualityType;
    fuelPenaltyPct: number;
    delayPenaltyHours: number;
    spoilageDamagePct: number;
    spoilageLossAmount: number;
  };
  hamaliCharges: number;
  mandiCessAmount: number;
  parkingAndEntryFee: number;
  totalLogisticsAndDeductions: number;
}

export type SalesChannelType = 'APMC_MANDI' | 'FOOD_PROCESSOR' | 'MODERN_RETAILER';

export interface ChannelProsCons {
  pros: { en: string; mr: string; hi: string }[];
  cons: { en: string; mr: string; hi: string }[];
}

export interface ChannelEntity {
  id: string;
  name: string;
  nameMarathi?: string;
  nameHindi?: string;
  companyOrAPMC: string;
  channelType: SalesChannelType;
  commodity: string;
  location: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  offeredPricePerQtl: number;
  paymentTerms: string;
  paymentTermsMarathi?: string;
  paymentDays: number;
  qualityTolerance: 'Flexible / All Grades' | 'Strict Grade A/B Only' | 'Industrial Processing Grade';
  rejectionRiskPct: number; // Estimated 0% to 20%
  weighingSystem: 'Digital Electronic Weighbridge' | 'APMC Manual Scale' | 'Certified Automated Terminal';
  prosCons: ChannelProsCons;
  verified: boolean;
  reliabilityScore: number; // 0-100
  contactPhone?: string;
}

export interface ChannelComparisonItem {
  channel: ChannelEntity;
  distanceKm: number;
  travelTimeHours: number;
  grossRevenue: number;
  logisticsBreakdown: DetailedLogisticsCostBreakdown;
  rejectionLossAmount: number;
  netRealization: number;
  netRatePerKg: number;
  rank: number;
  isBestOption: boolean;
  keyAdvantage: { en: string; mr: string; hi: string };
  keyWarning: { en: string; mr: string; hi: string };
}

export interface ChannelComparisonResponse {
  farmerProduce: {
    location: string;
    commodity: string;
    variety: string;
    quantityKg: number;
    grade: 'Grade A' | 'Grade B' | 'Grade C';
    harvestDate?: string;
  };
  logisticsConfig: GranularLogisticsConfig;
  comparisonList: ChannelComparisonItem[];
  bestOption: ChannelComparisonItem;
  aiTradeAdvisory?: {
    english: string;
    marathi: string;
    hindi: string;
    keyPoints: string[];
    riskAdvice: string;
  };
}

export interface MarketNetRealization {
  marketId: string;
  marketName: string;
  marketNameMarathi?: string;
  district: string;
  state: string;
  modalPricePerQtl: number;
  minPrice: number;
  maxPrice: number;
  distanceKm: number;
  travelTimeHours: number;
  quantityKg: number;
  quantityQtl: number;
  grossSellingValue: number;
  transportCost: number;
  transportDetails: {
    baseFare: number;
    distanceCharge: number;
    handlingLoadingFee: number;
    vehicleType: string;
  };
  roadQuality?: RoadQualityType;
  terrainRatePerKm?: number;
  tollCharges?: number;
  terrainName?: {
    en: string;
    mr: string;
    hi: string;
  };
  marketCharges: number;
  netRealization: number;
  netPerKg: number;
  rank: number;
  isBestChoice: boolean;
  notes: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface RecommendationResponse {
  farmer: {
    location: string;
    quantityKg: number;
    commodity: string;
    variety: string;
  };
  markets: MarketNetRealization[];
  bestOption: MarketNetRealization;
  aiExplanation?: {
    english: string;
    marathi?: string;
    hindi?: string;
    kannada?: string;
    tradeAdvice: string[];
    riskFactor: string;
  };
}

export interface HistoricalPricePoint {
  date: string;
  modal_price: number;
  min_price: number;
  max_price: number;
  arrivals_tonnes: number;
}

export interface TrajectoryPoint {
  date: string;
  dayName: string;
  shortDate: string;
  dayOffset: number; // -7 to +7, 0 = Today
  type: 'past' | 'today' | 'future';
  actualPrice?: number;
  predictedPrice?: number;
  displayPrice: number;
  lowerBand?: number;
  upperBand?: number;
  arrivalsTonnes?: number;
  isToday?: boolean;
}

export interface PastWeekDay {
  date: string;
  dayName: string;
  shortDate: string;
  actualPrice: number;
  predictedPrice: number;
  arrivalsTonnes: number;
  accuracyPct: number;
}

export interface TrajectoryStats {
  pastWeekStartPrice: number;
  pastWeekChangePct: number;
  presentPrice: number;
  nextWeekTargetPrice: number;
  nextWeekChangePct: number;
  backtestAccuracyPct: number;
}

export interface PriceForecast {
  commodity: string;
  market: string;
  variety: string;
  currentPrice: number;
  predictedTomorrow: number;
  priceChangePct: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidenceScorePct: number;
  historicalSeries: HistoricalPricePoint[];
  forecast7Days: Array<{
    date: string;
    dayName: string;
    predictedPrice: number;
    lowerBand: number;
    upperBand: number;
  }>;
  previous7Days?: PastWeekDay[];
  combinedTrajectory?: TrajectoryPoint[];
  trajectoryStats?: TrajectoryStats;
  mlFactors: {
    demandIndex: number;
    arrivalTrend: 'high_supply' | 'normal' | 'low_supply';
    volatility: 'low' | 'moderate' | 'high';
    recommendation: 'SELL_TODAY' | 'HOLD_2_DAYS' | 'HARVEST_EARLY';
    reasoning: string;
    reasoningMarathi?: string;
    reasoningHindi?: string;
  };
}

export interface BuyerProfile {
  id: string;
  name: string;
  company: string;
  type: 'Processor' | 'Wholesaler' | 'Retailer' | 'Institutional Buyer' | 'Exporter';
  commodity: string;
  required_quantity_kg: number;
  target_variety: string;
  quality_grade: 'Grade A' | 'Grade B' | 'Grade C' | 'Any';
  size_spec_mm?: {
    min: number;
    max: number;
  };
  offered_price_per_qtl: number;
  location: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  payment_terms: string;
  payment_terms_marathi?: string;
  verified: boolean;
  reliability: {
    overall_score: number;
    payment_history: number;
    transaction_history: number;
    disputes_count: number;
    avg_payment_days: number;
    trust_badge: 'Gold Verified' | 'Silver Verified' | 'Standard';
  };
  contact: {
    person: string;
    phone: string;
    whatsapp: string;
  };
}

export interface QualityMatchResult {
  buyer: BuyerProfile;
  matchScorePct: number;
  matchedCriteria: {
    commodityMatch: boolean;
    quantitySufficient: boolean;
    gradeMatch: boolean;
    sizeMatch: boolean;
  };
  distanceKm: number;
  transportCost?: number;
  terrainType?: RoadQualityType;
  terrainRatePerKm?: number;
  estimatedNetPayout: number;
  aiExplanation: string;
  aiExplanationMarathi?: string;
  aiExplanationHindi?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  audioBase64?: string;
  language?: SupportedLanguage;
}

export type DesignTheme =
  | 'fintech_emerald'
  | 'trader_terminal'
  | 'krishi_earth'
  | 'bento_executive';

export interface DeepAgriculturalAnalytics {
  marketOverview: {
    summaryEn: string;
    summaryMr: string;
    summaryHi: string;
    marketState: 'BULLISH' | 'BEARISH' | 'STABLE' | 'VOLATILE';
    volatilityIndex: number; // 0-100
  };
  arbitrageMatrix: Array<{
    route: string;
    fromMarket: string;
    toMarket: string;
    priceSpreadPerQtl: number;
    estimatedLogisticsCost: number;
    netArbitrageProfitPerQtl: number;
    recommendation: string;
    recommendationMr: string;
  }>;
  optimalTiming: {
    bestTimeToSell: string;
    bestTimeToSellMr: string;
    auctionWindow: string;
    auctionWindowMr: string;
    recommendedAction: 'SELL_TODAY' | 'HOLD_48_HOURS' | 'DISPATCH_NIGHT' | 'SELL_TO_PROCESSOR';
  };
  logisticsSensitivity: {
    dieselImpact: string;
    tollImpact: string;
    ghatDelayRisk: string;
  };
  strategicTakeaways: {
    en: string[];
    mr: string[];
    hi: string[];
  };
}

export interface FarmerProfile {
  name: string;
  phone: string;
  address: string;
  district: string;
  primaryCrop: string;
  harvestQuantityKg: number;
  grade: 'Grade A' | 'Grade B' | 'Grade C';
  preferredLanguage?: SupportedLanguage;
  onboardingCompleted: boolean;
  registeredAt?: string;
}

export interface UserSession {
  userId: string;
  phoneOrEmail: string;
  token?: string;
  profile: FarmerProfile;
}

