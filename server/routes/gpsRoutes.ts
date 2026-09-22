import { Router, Request, Response } from 'express';
import { LiveGpsService } from '../services/gpsService.js';
import { LocationAndRecommendationEngine } from '../services/recommendationEngine.js';
import { mongoDB } from '../database.js';

export const gpsRouter = Router();

/**
 * GET /api/gps/live-locate
 * Live Geolocation resolver using Google Maps Geolocation or Client IP
 */
gpsRouter.get('/live-locate', async (req: Request, res: Response) => {
  try {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const location = await LiveGpsService.liveLocate(clientIp);
    res.json(location);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Live GPS location failed' });
  }
});

/**
 * GET /api/gps/reverse-geocode
 * Reverse geocodes real coordinates to Maharashtra address/district
 */
gpsRouter.get('/reverse-geocode', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'Valid lat and lng query parameters required' });
    }

    const result = await LiveGpsService.reverseGeocode(lat, lng);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Reverse geocode failed' });
  }
});

/**
 * POST /api/gps/ping
 * Receives live device GPS ping and computes real-time distances to key mandis
 */
gpsRouter.post('/ping', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, accuracy, commodity = 'Onion' } = req.body;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({ error: 'latitude and longitude numbers required' });
    }

    const reverse = await LiveGpsService.reverseGeocode(latitude, longitude);
    const candidateMandis = mongoDB.findMandiPrices({ commodity });

    const mandiDistances = candidateMandis.slice(0, 8).map(m => {
      const distanceKm = LocationAndRecommendationEngine.calculateDistanceKm(
        latitude,
        longitude,
        m.latitude,
        m.longitude
      );
      return {
        mandiId: m.id,
        market: m.market,
        district: m.district,
        modalPrice: m.modal_price,
        distanceKm,
        estimatedHours: Math.round((distanceKm / 42) * 10) / 10
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      status: 'active',
      coords: { latitude, longitude, accuracy },
      location: reverse,
      nearestMandis: mandiDistances,
      timestamp: Date.now()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'GPS ping failed' });
  }
});
