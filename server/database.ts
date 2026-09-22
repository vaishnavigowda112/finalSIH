import { MandiRecord, BuyerProfile, ChannelEntity } from '../src/types.js';
import { INITIAL_MANDI_RECORDS, INITIAL_BUYERS, MAHARASHTRA_CHANNELS, MAHARASHTRA_ROUTE_PRESETS } from './data/mandiDatabase.js';

/**
 * Storage Abstraction Layer (Mock MongoDB / In-memory Collection Store with Query Capabilities)
 * Emulates pymongo `db.mandi_prices`, `db.buyers`, `db.channels`, `db.predictions` with filtering, projections, indexing, and stats.
 */
class MongoStorageManager {
  private mandiPrices: MandiRecord[] = [...INITIAL_MANDI_RECORDS];
  private buyers: BuyerProfile[] = [...INITIAL_BUYERS];
  private channels: ChannelEntity[] = [...MAHARASHTRA_CHANNELS];
  private historicalCache: Map<string, Array<{ date: string; modal_price: number; min_price: number; max_price: number; arrivals_tonnes: number }>> = new Map();

  constructor() {
    this.seedHistoricalSeries();
  }

  private seedHistoricalSeries() {
    // Generate realistic 14-day historical trend data for major Maharashtra commodities and mandis
    const commodities = ['Onion', 'Tomato', 'Pomegranate', 'Grapes', 'Soybean', 'Cotton', 'Orange (Santra)', 'Potato', 'Green Chilli'];
    const markets = [
      'Lasalgaon', 'Pune (Gultekdi / Marketyard)', 'Vashi (Navi Mumbai APMC)', 'Nashik APMC',
      'Pimpalgaon Baswant', 'Solapur APMC', 'Nagpur (Kalamna APMC)', 'Latur APMC', 'Kolhapur (Shahu Market Yard)'
    ];

    const today = new Date('2026-09-09');

    commodities.forEach((comm) => {
      markets.forEach((mkt) => {
        const key = `${comm.toLowerCase()}_${mkt.toLowerCase()}`;
        const basePrices: Record<string, number> = {
          'Onion': 2050,
          'Tomato': 2400,
          'Pomegranate': 9800,
          'Grapes': 6600,
          'Soybean': 4650,
          'Cotton': 7400,
          'Orange (Santra)': 4700,
          'Potato': 1950,
          'Green Chilli': 4400
        };

        const base = basePrices[comm] || 2500;
        const series = [];

        for (let i = 14; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];

          // Realistic price trend with slight upward momentum and day-to-day fluctuations
          const progress = (14 - i) / 14;
          const variance = Math.sin((14 - i) / 2) * 60 + (progress * 50) + (((i * 7) % 25) - 12);
          const modal = i === 0 ? base : Math.round(base - 50 + variance);
          const minP = Math.round(modal * 0.88);
          const maxP = Math.round(modal * 1.12);
          const arrivals = Math.round(120 + ((i * 19) % 90));

          series.push({
            date: dateStr,
            modal_price: modal,
            min_price: minP,
            max_price: maxP,
            arrivals_tonnes: arrivals
          });
        }
        this.historicalCache.set(key, series);
      });
    });
  }

  // --- Collection: mandi_prices ---
  public findMandiPrices(query: {
    commodity?: string;
    state?: string;
    district?: string;
    market?: string;
    search?: string;
  }): MandiRecord[] {
    return this.mandiPrices.filter(record => {
      if (query.commodity && record.commodity.toLowerCase() !== query.commodity.toLowerCase()) {
        return false;
      }
      if (query.state && record.state.toLowerCase() !== query.state.toLowerCase()) {
        return false;
      }
      if (query.district && !record.district.toLowerCase().includes(query.district.toLowerCase())) {
        return false;
      }
      if (query.market && !record.market.toLowerCase().includes(query.market.toLowerCase())) {
        return false;
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        const matches = 
          record.commodity.toLowerCase().includes(s) ||
          (record.commodityMarathi && record.commodityMarathi.includes(s)) ||
          record.market.toLowerCase().includes(s) ||
          (record.marketMarathi && record.marketMarathi.includes(s)) ||
          record.district.toLowerCase().includes(s) ||
          (record.districtMarathi && record.districtMarathi.includes(s)) ||
          record.state.toLowerCase().includes(s) ||
          record.variety.toLowerCase().includes(s);
        if (!matches) return false;
      }
      return true;
    });
  }

  public insertMandiRecord(record: MandiRecord): boolean {
    const existingIdx = this.mandiPrices.findIndex(
      r => r.market.toLowerCase() === record.market.toLowerCase() &&
           r.commodity.toLowerCase() === record.commodity.toLowerCase() &&
           r.arrival_date === record.arrival_date
    );
    if (existingIdx >= 0) {
      this.mandiPrices[existingIdx] = record;
    } else {
      this.mandiPrices.unshift(record);
    }
    return true;
  }

  public insertManyMandiRecords(records: MandiRecord[]): number {
    let inserted = 0;
    for (const rec of records) {
      this.insertMandiRecord(rec);
      inserted++;
    }
    return inserted;
  }

  public getAllMandiPrices(): MandiRecord[] {
    return this.mandiPrices;
  }

  // --- Collection: channels (Mandis, Processors, Retailers) ---
  public findChannels(query: { commodity?: string; channelType?: string }): ChannelEntity[] {
    return this.channels.filter(ch => {
      if (query.commodity && ch.commodity.toLowerCase() !== query.commodity.toLowerCase()) {
        return false;
      }
      if (query.channelType && ch.channelType !== query.channelType) {
        return false;
      }
      return true;
    });
  }

  public getAllChannels(): ChannelEntity[] {
    return this.channels;
  }

  public getRoutePresets() {
    return MAHARASHTRA_ROUTE_PRESETS;
  }

  // --- Collection: buyers ---
  public findBuyers(query: { commodity?: string; grade?: string; state?: string }): BuyerProfile[] {
    return this.buyers.filter(b => {
      if (query.commodity && b.commodity.toLowerCase() !== query.commodity.toLowerCase()) {
        return false;
      }
      if (query.grade && b.quality_grade !== 'Any' && b.quality_grade !== query.grade) {
        return false;
      }
      if (query.state && b.state.toLowerCase() !== query.state.toLowerCase()) {
        return false;
      }
      return true;
    });
  }

  public insertBuyer(buyer: BuyerProfile): boolean {
    this.buyers.push(buyer);
    return true;
  }

  // --- Historical Trend Series ---
  public getHistoricalPriceSeries(commodity: string, market: string): Array<{
    date: string;
    modal_price: number;
    min_price: number;
    max_price: number;
    arrivals_tonnes: number;
  }> {
    const directKey = `${commodity.toLowerCase()}_${market.toLowerCase()}`;
    if (this.historicalCache.has(directKey)) {
      return this.historicalCache.get(directKey)!;
    }

    // Fallback: match by partial commodity/market name
    for (const [key, series] of this.historicalCache.entries()) {
      if (key.startsWith(commodity.toLowerCase())) {
        return series;
      }
    }

    // Generate series on the fly based on current modal price
    const current = this.mandiPrices.find(r => r.commodity.toLowerCase() === commodity.toLowerCase())?.modal_price || 2400;
    const fallbackSeries = [];
    const today = new Date('2026-09-09');
    for (let i = 14; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const progress = (14 - i) / 14;
      const modal = i === 0 ? current : Math.round(current - (1 - progress) * 90 + (Math.sin(i) * 30));
      fallbackSeries.push({
        date: d.toISOString().split('T')[0],
        modal_price: modal,
        min_price: Math.round(modal * 0.88),
        max_price: Math.round(modal * 1.12),
        arrivals_tonnes: Math.round(100 + ((i * 19) % 70))
      });
    }
    return fallbackSeries;
  }

  public getDistinctCommodities(): string[] {
    const set = new Set<string>();
    this.mandiPrices.forEach(r => set.add(r.commodity));
    return Array.from(set);
  }

  public getDistinctMarkets(): string[] {
    const set = new Set<string>();
    this.mandiPrices.forEach(r => set.add(r.market));
    return Array.from(set);
  }
}

export const mongoDB = new MongoStorageManager();
