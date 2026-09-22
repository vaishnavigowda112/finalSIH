import {
  MandiRecord,
  MarketNetRealization,
  RecommendationResponse,
  ChannelEntity,
  ChannelComparisonResponse,
  ChannelComparisonItem,
  GranularLogisticsConfig,
  DetailedLogisticsCostBreakdown,
  RoadQualityType
} from '../../src/types.js';
import { REGION_COORDINATES, MAHARASHTRA_ROUTE_PRESETS } from '../data/mandiDatabase.js';

export const DEFAULT_LOGISTICS_CONFIG: GranularLogisticsConfig = {
  fuelType: 'diesel',
  fuelPricePerLitre: 92.80, // Maharashtra Diesel benchmark
  mileageKmPerLitre: 11.5, // Standard Tata Ace / Bolero Pickup
  roadQuality: 'state_highway',
  isRoundTrip: false,
  tollCharges: 185,
  unexpectedHeads: {
    hamaliPerQtl: 20, // ₹20/qtl loading & unloading
    mandiCessPct: 1.5, // 1.5% APMC user cess
    parkingAndEntryFee: 80, // Market entry & weighbridge ticket
    transitDelayLossPct: 2.5 // Transit shrinkage/bruise buffer
  }
};

export class LocationAndRecommendationEngine {

  /**
   * Calculates Haversine distance in Kilometers between two coordinates.
   */
  public static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c;
    // Road tortuosity multiplier (Maharashtra state highway factor ~ 1.22x)
    return Math.max(5, Math.round(dist * 1.22 * 10) / 10);
  }

  /**
   * Look up known route preset or calculate dynamic toll & road characteristics
   */
  public static detectRouteTerrain(
    fromLocation: string,
    toLocation: string,
    baseDistanceKm: number,
    coords?: { originLat?: number; originLng?: number; destLat?: number; destLng?: number }
  ): {
    roadQuality: RoadQualityType;
    tollCharges: number;
    terrainName: { en: string; mr: string; hi: string };
    terrainElevationProfile: string;
  } {
    const fromL = fromLocation.toLowerCase();
    const toL = toLocation.toLowerCase();

    // Check presets first
    const matchedPreset = MAHARASHTRA_ROUTE_PRESETS.find(p => 
      (fromL.includes(p.from.toLowerCase()) && toL.includes(p.to.toLowerCase())) ||
      (toL.includes(p.from.toLowerCase()) && fromL.includes(p.to.toLowerCase()))
    );

    if (matchedPreset) {
      let elevation = 'Rolling terrain';
      if (matchedPreset.roadQuality === 'ghat_rough') {
        elevation = 'Western Ghats hairpins & steep descent (580m → 15m elevation)';
      } else if (matchedPreset.roadQuality === 'expressway') {
        elevation = 'Access-controlled 6-lane concrete corridor (<1% gradient)';
      }
      return {
        roadQuality: matchedPreset.roadQuality,
        tollCharges: matchedPreset.tollCharges,
        terrainName: {
          en: matchedPreset.roadQuality === 'ghat_rough'
            ? 'Western Ghats Descent (Kasara / Sahyadri Pass)'
            : (matchedPreset.roadQuality === 'expressway' ? 'Access-Controlled Expressway' : 'Deccan Plateau Highway'),
          mr: matchedPreset.roadQuality === 'ghat_rough'
            ? 'पश्चिम घाट / सह्याद्री डोंगर रस्ता (कसारा घाट)'
            : (matchedPreset.roadQuality === 'expressway' ? 'अतिजलद एक्सप्रेसवे महामार्ग' : 'दख्खन पठार महामार्ग'),
          hi: matchedPreset.roadQuality === 'ghat_rough'
            ? 'पश्चिमी घाट पर्वतीय मार्ग (कसारा घाट)'
            : (matchedPreset.roadQuality === 'expressway' ? 'सुपर एक्सप्रेसवे कॉरिडोर' : 'दक्कन पठार राजमार्ग')
        },
        terrainElevationProfile: elevation
      };
    }

    const isCoastal = (name: string, lng?: number) => {
      const n = name.toLowerCase();
      return n.includes('vashi') || n.includes('mumbai') || n.includes('thane') ||
             n.includes('navi mumbai') || n.includes('ratnagiri') || n.includes('raigad') ||
             n.includes('alibag') || n.includes('palghar') || (lng !== undefined && lng < 73.25);
    };

    const isPlateauInland = (name: string, lng?: number) => {
      const n = name.toLowerCase();
      return n.includes('nashik') || n.includes('lasalgaon') || n.includes('pimpalgaon') ||
             n.includes('niphad') || n.includes('sangamner') || n.includes('pune') ||
             n.includes('ahmednagar') || n.includes('solapur') || n.includes('kolhapur') ||
             n.includes('sangli') || n.includes('satara') || n.includes('jalgaon') ||
             n.includes('dhule') || n.includes('aurangabad') || n.includes('sambhajinagar') ||
             n.includes('jalna') || n.includes('nagpur') || n.includes('amravati') ||
             n.includes('latur') || n.includes('nanded') || (lng !== undefined && lng >= 73.5);
    };

    const crossesGhats =
      (isCoastal(fromL, coords?.originLng) && isPlateauInland(toL, coords?.destLng)) ||
      (isCoastal(toL, coords?.destLng) && isPlateauInland(fromL, coords?.originLng)) ||
      fromL.includes('kasara') || toL.includes('kasara') ||
      fromL.includes('ghat') || toL.includes('ghat') ||
      fromL.includes('panchgani') || toL.includes('panchgani') ||
      fromL.includes('mahabaleshwar') || toL.includes('mahabaleshwar') ||
      fromL.includes('malshej') || toL.includes('malshej') ||
      fromL.includes('bhor') || toL.includes('bhor') ||
      fromL.includes('wai') || toL.includes('wai');

    // 1. Ghat / Mountain Section
    if (crossesGhats && !((fromL.includes('pune') && isCoastal(toL)) || (toL.includes('pune') && isCoastal(fromL)))) {
      const toll = baseDistanceKm > 50 ? Math.max(185, Math.round((baseDistanceKm / 60) * 95)) : 0;
      return {
        roadQuality: 'ghat_rough',
        tollCharges: toll,
        terrainName: {
          en: 'Western Ghats Mountain Route (Kasara / Sahyadri Pass)',
          mr: 'पश्चिम घाट / सह्याद्री डोंगर रस्ता (कसारा घाट)',
          hi: 'पश्चिमी घाट पर्वतीय मार्ग (कसारा घाट)'
        },
        terrainElevationProfile: 'Steep hairpins, heavy brake wear & 580m descent into Konkan basin'
      };
    }

    // 2. Expressway Corridor (Mumbai-Pune Expressway or Samruddhi Mahamarg)
    const isPuneMumbaiCorridor =
      (fromL.includes('pune') && isCoastal(toL)) ||
      (toL.includes('pune') && isCoastal(fromL));

    const isSamruddhiCorridor =
      (fromL.includes('nagpur') || fromL.includes('amravati') || fromL.includes('sambhajinagar') || fromL.includes('jalna')) &&
      (toL.includes('nagpur') || toL.includes('amravati') || toL.includes('sambhajinagar') || toL.includes('jalna') || toL.includes('shirdi'));

    const isSolapurPuneExpressway =
      (fromL.includes('solapur') && toL.includes('pune')) ||
      (toL.includes('solapur') && fromL.includes('pune'));

    if (isPuneMumbaiCorridor) {
      return {
        roadQuality: 'expressway',
        tollCharges: 320,
        terrainName: {
          en: 'Mumbai-Pune Yashwantrao Chavan Expressway',
          mr: 'मुंबई-पुणे यशवंतराव चव्हाण द्रुतगती महामार्ग',
          hi: 'मुंबई-पुणे यशवंतराव चव्हाण एक्सप्रेसवे'
        },
        terrainElevationProfile: '6-lane access-controlled concrete corridor, Bhor Ghat viaducts'
      };
    }

    if (isSamruddhiCorridor) {
      const toll = Math.round(baseDistanceKm * 1.73);
      return {
        roadQuality: 'expressway',
        tollCharges: toll,
        terrainName: {
          en: 'Samruddhi Mahamarg Super Expressway',
          mr: 'हिंदुहृदयसम्राट बाळासाहेब ठाकरे समृद्धी महामार्ग',
          hi: 'समृद्धि महामार्ग सुपर एक्सप्रेसवे'
        },
        terrainElevationProfile: 'High-speed 6-lane access-controlled corridor (<1% gradient)'
      };
    }

    if (isSolapurPuneExpressway) {
      return {
        roadQuality: 'expressway',
        tollCharges: 270,
        terrainName: {
          en: 'NH65 4-Lane High-Speed Corridor',
          mr: 'एनएच६५ चौपदरी गतिमान महामार्ग',
          hi: 'एनएच65 फोर-लेन राजमार्ग'
        },
        terrainElevationProfile: 'Smooth 4-lane plateau bypass corridor'
      };
    }

    // 3. Rural Feeder Road (< 45 km)
    if (baseDistanceKm <= 45) {
      return {
        roadQuality: 'rural_feeder',
        tollCharges: 0, // Toll-free rural interior links
        terrainName: {
          en: 'Rural Feeder & Local Mandi Link',
          mr: 'ग्रामीण अंतर्गत रस्ता व स्थानिक बाजार जोडणी',
          hi: 'ग्रामीण लिंक मार्ग व स्थानीय मंडी संपर्क'
        },
        terrainElevationProfile: 'Local agricultural taluka link road'
      };
    }

    // 4. Default: Deccan Plateau State / National Highway
    const toll = Math.round((baseDistanceKm / 60) * 85);
    return {
      roadQuality: 'state_highway',
      tollCharges: toll,
      terrainName: {
        en: 'Deccan Plateau 4-Lane / 2-Lane Highway',
        mr: 'दख्खनचे पठार राष्ट्रीय व राज्य महामार्ग',
        hi: 'दक्कन पठार राष्ट्रीय एवं राज्य राजमार्ग'
      },
      terrainElevationProfile: 'Rolling plateau terrain (500m - 750m elevation)'
    };
  }

  /**
   * Look up known route preset or calculate dynamic toll & road characteristics
   */
  public static getRouteDetails(
    fromLocation: string,
    toLocation: string,
    baseDistanceKm: number,
    coords?: { originLat?: number; originLng?: number; destLat?: number; destLng?: number }
  ) {
    const detected = this.detectRouteTerrain(fromLocation, toLocation, baseDistanceKm, coords);
    return {
      distanceKm: baseDistanceKm,
      tollCharges: detected.tollCharges,
      roadQuality: detected.roadQuality,
      terrainName: detected.terrainName,
      terrainElevationProfile: detected.terrainElevationProfile
    };
  }

  /**
   * Comprehensive Granular Logistics & Unexpected Head Calculator
   * Computes Fuel (Petrol/Diesel), Tolls, Road quality penalties, Hamali, Cess & transit spoilage
   */
  public static calculateGranularLogistics(
    quantityKg: number,
    distanceKm: number,
    grossProduceValue: number,
    channelType: 'APMC_MANDI' | 'FOOD_PROCESSOR' | 'MODERN_RETAILER',
    userConfig: Partial<GranularLogisticsConfig> = {}
  ): DetailedLogisticsCostBreakdown {
    const config: GranularLogisticsConfig = {
      ...DEFAULT_LOGISTICS_CONFIG,
      ...userConfig,
      unexpectedHeads: {
        ...DEFAULT_LOGISTICS_CONFIG.unexpectedHeads,
        ...(userConfig.unexpectedHeads || {})
      }
    };

    // 1. Vehicle Sizing & Base Freight
    let vehicleType = 'Small Goods Auto (Piaggio/Ape)';
    let baseHireFare = 250;
    let driverKmRate = 6.0;

    if (quantityKg <= 500) {
      vehicleType = 'Mini 3-Wheeler Auto (500kg)';
      baseHireFare = 250;
      driverKmRate = 5.0;
    } else if (quantityKg <= 1500) {
      vehicleType = 'Tata Ace / Bolero Maxi Truck (1.5T)';
      baseHireFare = 500;
      driverKmRate = 8.5;
    } else if (quantityKg <= 3500) {
      vehicleType = 'Tata 407 / Eicher Pro (3.5T)';
      baseHireFare = 900;
      driverKmRate = 12.0;
    } else {
      vehicleType = 'Heavy 6-Wheeler Truck (7T+)';
      baseHireFare = 1600;
      driverKmRate = 18.0;
    }

    // 2. Road Quality & Terrain Penalties
    let fuelPenaltyPct = 0;
    let avgSpeedKmh = 45;
    let delayPenaltyHours = 0;
    let spoilageDamagePct = 0.5; // Baseline damage
    let terrainRateMultiplier = 1.0;

    let terrainName = {
      en: 'Deccan Plateau 4-Lane / 2-Lane Highway',
      mr: 'दख्खनचे पठार राष्ट्रीय व राज्य महामार्ग',
      hi: 'दक्कन पठार राष्ट्रीय एवं राज्य राजमार्ग'
    };
    let terrainElevationProfile = 'Rolling plateau terrain (500m - 750m elevation)';

    if (config.roadQuality === 'expressway') {
      fuelPenaltyPct = 0;
      avgSpeedKmh = 72;
      delayPenaltyHours = 0;
      spoilageDamagePct = 0.7;
      terrainRateMultiplier = 0.95;
      terrainName = {
        en: 'Access-Controlled Expressway Corridor',
        mr: 'अतिजलद प्रवेश-नियंत्रित एक्सप्रेसवे महामार्ग',
        hi: 'प्रवेश-नियंत्रित सुपर एक्सप्रेसवे कॉरिडोर'
      };
      terrainElevationProfile = 'Graded smooth 6-lane surface (<1% gradient)';
    } else if (config.roadQuality === 'state_highway') {
      fuelPenaltyPct = 12; // +12% fuel consumed due to gear shifts & towns
      avgSpeedKmh = 44;
      delayPenaltyHours = Math.round((distanceKm / 100) * 0.4 * 10) / 10;
      spoilageDamagePct = 2.2;
      terrainRateMultiplier = 1.0;
      terrainName = {
        en: 'Deccan Plateau 4-Lane / 2-Lane Highway',
        mr: 'दख्खनचे पठार राष्ट्रीय व राज्य महामार्ग',
        hi: 'दक्कन पठार राष्ट्रीय एवं राज्य राजमार्ग'
      };
      terrainElevationProfile = 'Rolling plateau terrain (500m - 750m elevation)';
    } else if (config.roadQuality === 'ghat_rough') {
      fuelPenaltyPct = 30; // +30% fuel in ghat section (Kasara/Khambatki)
      avgSpeedKmh = 28;
      delayPenaltyHours = Math.round((distanceKm / 100) * 0.9 * 10) / 10;
      spoilageDamagePct = 5.2; // Fruit bruising & bumping risk
      terrainRateMultiplier = 1.35; // Hill terrain driver and brake wear surcharge
      terrainName = {
        en: 'Western Ghats Mountain Route (Kasara / Sahyadri Pass)',
        mr: 'पश्चिम घाट / सह्याद्री डोंगर रस्ता (कसारा घाट)',
        hi: 'पश्चिमी घाट पर्वतीय मार्ग (कसारा घाट)'
      };
      terrainElevationProfile = 'Steep mountain hairpins & descent (600m → 15m elevation)';
    } else if (config.roadQuality === 'rural_feeder') {
      fuelPenaltyPct = 16;
      avgSpeedKmh = 35;
      delayPenaltyHours = Math.round((distanceKm / 100) * 0.5 * 10) / 10;
      spoilageDamagePct = 2.8;
      terrainRateMultiplier = 1.10;
      terrainName = {
        en: 'Rural Feeder & Local Mandi Link',
        mr: 'ग्रामीण अंतर्गत रस्ता व स्थानिक बाजार जोडणी',
        hi: 'ग्रामीण लिंक मार्ग व स्थानीय मंडी संपर्क'
      };
      terrainElevationProfile = 'Local agricultural taluka link road';
    }

    // 3. Travel Time
    const travelTimeHours = Math.round(((distanceKm / avgSpeedKmh) + delayPenaltyHours) * 10) / 10;

    // 4. Fuel Consumption Math
    const effectiveKm = config.isRoundTrip ? distanceKm * 2 : distanceKm;
    const baseLitres = effectiveKm / Math.max(1, config.mileageKmPerLitre);
    const adjustedLitres = Math.round((baseLitres * (1 + fuelPenaltyPct / 100)) * 10) / 10;
    const fuelCost = Math.round(adjustedLitres * config.fuelPricePerLitre);

    // 5. Driver & Vehicle Distance Fee
    const driverAndDistanceCost = Math.round(distanceKm * driverKmRate * terrainRateMultiplier);

    // 6. Toll Charges
    const tollCharges = config.tollCharges || 0;

    // Combined transport freight & dynamic rate per km
    const totalFreightCost = fuelCost + baseHireFare + driverAndDistanceCost + tollCharges;
    const terrainRatePerKm = Math.round((totalFreightCost / Math.max(1, distanceKm)) * 10) / 10;

    // 7. Spoilage Loss Amount (Damage buffer due to road quality & transit vibration)
    const spoilageLossAmount = Math.round(grossProduceValue * (spoilageDamagePct / 100));

    // 8. Hamali / Loading-Unloading Charges (हमाली)
    const quintals = quantityKg / 100;
    const hamaliCharges = Math.round(quintals * config.unexpectedHeads.hamaliPerQtl);

    // 9. Mandi User Cess & Brokerage
    // Only APMC Mandis deduct 1.5-6% cess. Direct Processors & Retailers have 0% APMC cess!
    const mandiCessAmount = channelType === 'APMC_MANDI'
      ? Math.round(grossProduceValue * (config.unexpectedHeads.mandiCessPct / 100))
      : 0;

    // 10. Parking & Gate Weighbridge Fee (APMC Mandis only)
    const parkingAndEntryFee = channelType === 'APMC_MANDI'
      ? config.unexpectedHeads.parkingAndEntryFee
      : 0;

    // Total deductions = Fuel + Vehicle Hire + Driver + Toll + Hamali + Mandi Cess + Parking + Spoilage
    const totalLogisticsAndDeductions =
      fuelCost +
      baseHireFare +
      driverAndDistanceCost +
      tollCharges +
      hamaliCharges +
      mandiCessAmount +
      parkingAndEntryFee +
      spoilageLossAmount;

    return {
      distanceKm,
      travelTimeHours,
      fuelType: config.fuelType,
      fuelPricePerLitre: config.fuelPricePerLitre,
      litresConsumed: adjustedLitres,
      fuelCost,
      vehicleHireBaseFare: baseHireFare,
      driverAndDistanceCost,
      tollCharges,
      terrainRatePerKm,
      terrainName,
      terrainElevationProfile,
      roadQualityEffect: {
        roadType: config.roadQuality,
        fuelPenaltyPct,
        delayPenaltyHours,
        spoilageDamagePct,
        spoilageLossAmount
      },
      hamaliCharges,
      mandiCessAmount,
      parkingAndEntryFee,
      totalLogisticsAndDeductions
    };
  }

  /**
   * Core Recommendation Engine: Evaluates APMC Mandis vs Food Processors vs Modern Retailers
   * Computes side-by-side Net Realization with full logistics, rejection risks, and pros/cons
   */
  public static evaluateSalesChannels(
    farmerProduce: {
      location: string;
      commodity: string;
      variety: string;
      quantityKg: number;
      grade: 'Grade A' | 'Grade B' | 'Grade C';
      coords?: { lat: number; lng: number } | null;
    },
    candidateChannels: ChannelEntity[],
    userLogisticsConfig: Partial<GranularLogisticsConfig> = {}
  ): ChannelComparisonResponse {
    // Determine farmer's base coordinate in Maharashtra
    let fLat = 19.9975; // Default Nashik
    let fLng = 73.7898;

    if (farmerProduce.coords && farmerProduce.coords.lat && farmerProduce.coords.lng) {
      fLat = farmerProduce.coords.lat;
      fLng = farmerProduce.coords.lng;
    } else {
      const key = farmerProduce.location.toLowerCase().trim();
      if (REGION_COORDINATES[key]) {
        fLat = REGION_COORDINATES[key].lat;
        fLng = REGION_COORDINATES[key].lng;
      }
    }

    const quintals = farmerProduce.quantityKg / 100;

    const evaluatedList: ChannelComparisonItem[] = candidateChannels.map((channel) => {
      const rawDistance = this.calculateDistanceKm(fLat, fLng, channel.latitude, channel.longitude);
      const route = this.getRouteDetails(farmerProduce.location, channel.name, rawDistance, {
        originLat: fLat,
        originLng: fLng,
        destLat: channel.latitude,
        destLng: channel.longitude
      });

      // Auto-detect terrain and tolls per route dynamically unless user explicitly locked them
      const isAutoTerrain = userLogisticsConfig.autoDetectTerrain !== false;
      const roadQuality = isAutoTerrain ? route.roadQuality : (userLogisticsConfig.roadQuality || route.roadQuality);
      const tollCharges = isAutoTerrain ? route.tollCharges : (userLogisticsConfig.tollCharges !== undefined ? userLogisticsConfig.tollCharges : route.tollCharges);

      // Merge route presets with user logistics config
      const itemConfig: GranularLogisticsConfig = {
        ...DEFAULT_LOGISTICS_CONFIG,
        ...userLogisticsConfig,
        tollCharges,
        roadQuality,
        unexpectedHeads: {
          ...DEFAULT_LOGISTICS_CONFIG.unexpectedHeads,
          ...(userLogisticsConfig.unexpectedHeads || {})
        }
      };

      // 1. Gross Revenue = Quintals * Channel Offered Price
      const grossRevenue = Math.round(quintals * channel.offeredPricePerQtl);

      // 2. Granular Logistics & Unexpected Deductions Breakdown
      const logisticsBreakdown = this.calculateGranularLogistics(
        farmerProduce.quantityKg,
        route.distanceKm,
        grossRevenue,
        channel.channelType,
        itemConfig
      );

      // 3. Quality & Rejection Loss
      // Modern Retailers & Processors have quality rejection risk (e.g. 8-12%)
      // If farmer has Grade A produce, rejection risk is halved
      let effectiveRejectionPct = channel.rejectionRiskPct;
      if (farmerProduce.grade === 'Grade A') {
        effectiveRejectionPct = Math.round(channel.rejectionRiskPct * 0.5);
      } else if (farmerProduce.grade === 'Grade C') {
        effectiveRejectionPct = Math.min(30, channel.rejectionRiskPct * 2);
      }

      // Rejection loss = value of rejected produce assumed sold at 50% distress price locally
      const rejectedVal = Math.round(grossRevenue * (effectiveRejectionPct / 100));
      const rejectionLossAmount = Math.round(rejectedVal * 0.5); // 50% discount loss on rejected lot

      // 4. Final Net Realization (In-Pocket Cash)
      const netRealization = Math.round(
        grossRevenue -
        logisticsBreakdown.totalLogisticsAndDeductions -
        rejectionLossAmount
      );

      const netRatePerKg = Math.round((netRealization / farmerProduce.quantityKg) * 100) / 100;

      // Key Advantages & Warnings
      let keyAdvantage = {
        en: channel.prosCons.pros[0]?.en || 'Guaranteed channel',
        mr: channel.prosCons.pros[0]?.mr || 'हमी खरेदी केंद्र',
        hi: channel.prosCons.pros[0]?.hi || 'विश्वसनीय खरीद केंद्र'
      };
      let keyWarning = {
        en: channel.prosCons.cons[0]?.en || 'Check delivery terms',
        mr: channel.prosCons.cons[0]?.mr || 'नियम व अटी तपासा',
        hi: channel.prosCons.cons[0]?.hi || 'डिलीवरी शर्तें देखें'
      };

      return {
        channel,
        distanceKm: route.distanceKm,
        travelTimeHours: logisticsBreakdown.travelTimeHours,
        grossRevenue,
        logisticsBreakdown,
        rejectionLossAmount,
        netRealization,
        netRatePerKg,
        rank: 1,
        isBestOption: false,
        keyAdvantage,
        keyWarning
      };
    });

    // Sort descending by Net Realization
    evaluatedList.sort((a, b) => b.netRealization - a.netRealization);

    // Assign rank and best choice flag
    evaluatedList.forEach((item, index) => {
      item.rank = index + 1;
      item.isBestOption = index === 0;
    });

    const bestOption = evaluatedList[0];

    const currentConfig: GranularLogisticsConfig = {
      ...DEFAULT_LOGISTICS_CONFIG,
      ...userLogisticsConfig,
      unexpectedHeads: {
        ...DEFAULT_LOGISTICS_CONFIG.unexpectedHeads,
        ...(userLogisticsConfig.unexpectedHeads || {})
      }
    };

    return {
      farmerProduce: {
        location: farmerProduce.location,
        commodity: farmerProduce.commodity,
        variety: farmerProduce.variety,
        quantityKg: farmerProduce.quantityKg,
        grade: farmerProduce.grade
      },
      logisticsConfig: currentConfig,
      comparisonList: evaluatedList,
      bestOption
    };
  }

  /**
   * Traditional Mandi Net Realization Evaluator for APMC Mandis
   */
  public static evaluateMarkets(
    farmerLocationName: string,
    farmerCoords: { lat: number; lng: number } | null,
    commodity: string,
    quantityKg: number,
    candidateMandis: MandiRecord[]
  ): RecommendationResponse {
    let fLat = 19.9975; // Nashik
    let fLng = 73.7898;

    if (farmerCoords && farmerCoords.lat && farmerCoords.lng) {
      fLat = farmerCoords.lat;
      fLng = farmerCoords.lng;
    } else {
      const key = farmerLocationName.toLowerCase().trim();
      if (REGION_COORDINATES[key]) {
        fLat = REGION_COORDINATES[key].lat;
        fLng = REGION_COORDINATES[key].lng;
      }
    }

    const quantityQtl = quantityKg / 100;

    const evaluated: MarketNetRealization[] = candidateMandis.map((mandi) => {
      const distanceKm = this.calculateDistanceKm(fLat, fLng, mandi.latitude, mandi.longitude);
      const route = this.getRouteDetails(farmerLocationName, mandi.market, distanceKm, {
        originLat: fLat,
        originLng: fLng,
        destLat: mandi.latitude,
        destLng: mandi.longitude
      });
      const grossSellingValue = Math.round(quantityQtl * mandi.modal_price);

      const logistics = this.calculateGranularLogistics(
        quantityKg,
        route.distanceKm,
        grossSellingValue,
        'APMC_MANDI',
        { tollCharges: route.tollCharges, roadQuality: route.roadQuality }
      );

      const netRealization = grossSellingValue - logistics.totalLogisticsAndDeductions;
      const netPerKg = Math.round((netRealization / quantityKg) * 100) / 100;

      return {
        marketId: mandi.id,
        marketName: mandi.market,
        marketNameMarathi: mandi.marketMarathi,
        district: mandi.district,
        state: mandi.state,
        modalPricePerQtl: mandi.modal_price,
        minPrice: mandi.min_price,
        maxPrice: mandi.max_price,
        distanceKm: route.distanceKm,
        travelTimeHours: logistics.travelTimeHours,
        quantityKg,
        quantityQtl,
        grossSellingValue,
        transportCost: logistics.totalLogisticsAndDeductions,
        roadQuality: route.roadQuality,
        terrainRatePerKm: logistics.terrainRatePerKm,
        tollCharges: logistics.tollCharges,
        terrainName: logistics.terrainName,
        transportDetails: {
          baseFare: logistics.vehicleHireBaseFare,
          distanceCharge: logistics.driverAndDistanceCost + logistics.fuelCost,
          handlingLoadingFee: logistics.hamaliCharges,
          vehicleType: `${logistics.fuelType.toUpperCase()} Carrier (${logistics.litresConsumed}L)`
        },
        marketCharges: logistics.mandiCessAmount + logistics.parkingAndEntryFee,
        netRealization,
        netPerKg,
        rank: 1,
        isBestChoice: false,
        notes: '',
        coordinates: {
          lat: mandi.latitude,
          lng: mandi.longitude
        }
      };
    });

    // Sort descending by netRealization
    evaluated.sort((a, b) => b.netRealization - a.netRealization);

    evaluated.forEach((item, idx) => {
      item.rank = idx + 1;
      item.isBestChoice = idx === 0;

      if (idx === 0) {
        item.notes = `Highest net realization (₹${item.netRealization.toLocaleString('en-IN')}) after accounting for ₹${item.transportCost} fuel, tolls & logistics.`;
      } else {
        const diff = evaluated[0].netRealization - item.netRealization;
        item.notes = `₹${diff.toLocaleString('en-IN')} lower in net in-pocket earnings compared to ${evaluated[0].marketName}.`;
      }
    });

    return {
      farmer: {
        location: farmerLocationName,
        quantityKg,
        commodity,
        variety: candidateMandis[0]?.variety || 'Local'
      },
      markets: evaluated,
      bestOption: evaluated[0]
    };
  }
}
