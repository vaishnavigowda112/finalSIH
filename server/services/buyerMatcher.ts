import { BuyerProfile, QualityMatchResult } from '../../src/types.js';
import { LocationAndRecommendationEngine } from './recommendationEngine.js';
import { REGION_COORDINATES } from '../data/mandiDatabase.js';

/**
 * Phase 11 - Buyer Reliability Score Calculation
 * 
 * Rules:
 * - Calculated strictly via deterministic mathematical formulas in the backend/database
 * - LLMs MUST NEVER invent or hallucinate this score!
 */
export function calculateBuyerReliabilityScore(buyer: {
  paymentHistoryRate: number; // 0-100%
  completedTransactions: number; // count
  isVerified: boolean;
  disputeCount: number;
  averagePaymentDays: number;
}): {
  overall_score: number;
  payment_history: number;
  transaction_history: number;
  disputes_count: number;
  avg_payment_days: number;
  trust_badge: 'Gold Verified' | 'Silver Verified' | 'Standard';
} {
  const paymentScore = Math.min(100, Math.max(0, buyer.paymentHistoryRate));
  const transactionScore = Math.min(100, Math.round((buyer.completedTransactions / 50) * 100));

  let score = (paymentScore * 0.45) + (transactionScore * 0.35);
  
  if (buyer.isVerified) {
    score += 10;
  }

  // Penalty for disputes
  score -= (buyer.disputeCount * 5);

  // Penalty for delayed settlements (> 3 days)
  if (buyer.averagePaymentDays > 3) {
    score -= (buyer.averagePaymentDays - 3) * 3;
  }

  const overall = Math.min(99, Math.max(10, Math.round(score)));

  let trust_badge: 'Gold Verified' | 'Silver Verified' | 'Standard' = 'Standard';
  if (overall >= 90 && buyer.isVerified && buyer.disputeCount === 0) {
    trust_badge = 'Gold Verified';
  } else if (overall >= 80) {
    trust_badge = 'Silver Verified';
  }

  return {
    overall_score: overall,
    payment_history: paymentScore,
    transaction_history: transactionScore,
    disputes_count: buyer.disputeCount,
    avg_payment_days: buyer.averagePaymentDays,
    trust_badge
  };
}

/**
 * Phase 10 - Quality and Lot Matching
 * Matches Farmer Produce Lot against Buyer Demand Specifications
 */
export function matchFarmerProduceWithBuyers(
  lot: {
    commodity: string;
    variety: string;
    quantityKg: number;
    grade: 'Grade A' | 'Grade B' | 'Grade C';
    avgSizeMm?: number;
    farmerLat: number;
    farmerLng: number;
  },
  buyers: BuyerProfile[]
): QualityMatchResult[] {
  const results: QualityMatchResult[] = [];

  for (const buyer of buyers) {
    const commodityMatch = buyer.commodity.toLowerCase() === lot.commodity.toLowerCase();
    if (!commodityMatch) continue;

    const quantitySufficient = lot.quantityKg >= (buyer.required_quantity_kg * 0.05);
    
    // Grade match
    let gradeMatch = false;
    if (buyer.quality_grade === 'Any') {
      gradeMatch = true;
    } else if (buyer.quality_grade === 'Grade A') {
      gradeMatch = lot.grade === 'Grade A';
    } else if (buyer.quality_grade === 'Grade B') {
      gradeMatch = lot.grade === 'Grade A' || lot.grade === 'Grade B';
    } else {
      gradeMatch = true;
    }

    // Size specification match
    let sizeMatch = true;
    if (buyer.size_spec_mm && lot.avgSizeMm) {
      sizeMatch = lot.avgSizeMm >= buyer.size_spec_mm.min && lot.avgSizeMm <= buyer.size_spec_mm.max;
    }

    // Calculate match score
    let score = 40;
    if (quantitySufficient) score += 20;
    if (gradeMatch) score += 20;
    if (sizeMatch) score += 20;

    const distanceKm = LocationAndRecommendationEngine.calculateDistanceKm(
      lot.farmerLat,
      lot.farmerLng,
      buyer.latitude,
      buyer.longitude
    );

    const route = LocationAndRecommendationEngine.getRouteDetails(buyer.district, buyer.company, distanceKm, {
      originLat: lot.farmerLat,
      originLng: lot.farmerLng,
      destLat: buyer.latitude,
      destLng: buyer.longitude
    });

    const grossPayout = Math.round((lot.quantityKg / 100) * buyer.offered_price_per_qtl);
    const logistics = LocationAndRecommendationEngine.calculateGranularLogistics(
      lot.quantityKg,
      distanceKm,
      grossPayout,
      buyer.type === 'Processor' ? 'FOOD_PROCESSOR' : 'MODERN_RETAILER',
      { tollCharges: route.tollCharges, roadQuality: route.roadQuality }
    );
    const estimatedNetPayout = grossPayout - logistics.totalLogisticsAndDeductions;

    let aiExplanation = '';
    let aiExplanationMarathi = '';
    let aiExplanationHindi = '';

    if (score === 100) {
      aiExplanation = `Perfect match: Buyer requires ${buyer.quality_grade} (${buyer.size_spec_mm?.min}-${buyer.size_spec_mm?.max}mm) and offers ₹${buyer.offered_price_per_qtl}/qtl with ${buyer.payment_terms}. Trust score: ${buyer.reliability.overall_score}/100.`;
      aiExplanationMarathi = `उत्तम जुळणी: खरेदीदाराला ${buyer.quality_grade} प्रत हवी आहे. ₹${buyer.offered_price_per_qtl}/क्विंटल दर व ${buyer.payment_terms_marathi || buyer.payment_terms} पेमेंट अटी आहेत. विश्वासार्हता स्कोअर: ${buyer.reliability.overall_score}/100.`;
      aiExplanationHindi = `सटीक मिलान: खरीदार को ${buyer.quality_grade} माल चाहिए। ₹${buyer.offered_price_per_qtl}/क्विंटल भाव और ${buyer.payment_terms} की सुविधा है। विश्वसनीयता स्कोर: ${buyer.reliability.overall_score}/100.`;
    } else if (gradeMatch && !sizeMatch) {
      aiExplanation = `Grade matches (${lot.grade}), but fruit size (${lot.avgSizeMm}mm) slightly deviates from ideal ${buyer.size_spec_mm?.min}-${buyer.size_spec_mm?.max}mm window.`;
      aiExplanationMarathi = `ग्रेड योग्य आहे (${lot.grade}), मात्र फळांचा आकार (${lot.avgSizeMm}mm) खरेदीदाराच्या अपेक्षेपेक्षा किंचित वेगळा आहे.`;
      aiExplanationHindi = `ग्रेड मेल खाता है (${lot.grade}), लेकिन आकार में थोड़ा अंतर है।`;
    } else {
      aiExplanation = `Partial match on commodity. Verify if buyer accepts ${lot.grade} at negotiated tier.`;
      aiExplanationMarathi = `शेतमाल जुळतो. खरेदीदार ${lot.grade} प्रत स्वीकारतात का याची खात्री करा.`;
      aiExplanationHindi = `फसल मेल खाती है। पुष्टि करें कि खरीदार ${lot.grade} स्वीकार करता है।`;
    }

    results.push({
      buyer,
      matchScorePct: score,
      matchedCriteria: {
        commodityMatch,
        quantitySufficient,
        gradeMatch,
        sizeMatch
      },
      distanceKm,
      transportCost: logistics.totalLogisticsAndDeductions,
      terrainType: route.roadQuality,
      terrainRatePerKm: logistics.terrainRatePerKm,
      estimatedNetPayout,
      aiExplanation,
      aiExplanationMarathi,
      aiExplanationHindi
    });
  }

  return results.sort((a, b) => b.matchScorePct - a.matchScorePct || b.estimatedNetPayout - a.estimatedNetPayout);
}

export class BuyerDiscoveryAndQualityEngine {
  public static matchBuyers(
    farmerProduce: {
      commodity: string;
      variety: string;
      quantityKg: number;
      grade: 'Grade A' | 'Grade B' | 'Grade C';
      avgSizeMm?: number;
      location: string;
    },
    candidateBuyers: BuyerProfile[]
  ): QualityMatchResult[] {
    let fLat = 19.9975; // Nashik
    let fLng = 73.7898;

    const key = farmerProduce.location.toLowerCase().trim();
    if (REGION_COORDINATES[key]) {
      fLat = REGION_COORDINATES[key].lat;
      fLng = REGION_COORDINATES[key].lng;
    }

    return matchFarmerProduceWithBuyers(
      {
        ...farmerProduce,
        farmerLat: fLat,
        farmerLng: fLng
      },
      candidateBuyers
    );
  }
}
