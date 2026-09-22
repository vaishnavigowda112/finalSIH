import { Router, Request, Response } from 'express';
import { PythonAnalyticsRunner } from '../services/pythonRunner.js';
import { MandiDataCollector, RawAgmarknetRecord } from '../services/collector.js';

export const analyticsRouter = Router();

/**
 * Health check endpoint for Python Data Science & ML stack
 */
analyticsRouter.get('/health', async (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const envCheck = await PythonAnalyticsRunner.checkEnvironment();
    res.json({
      status: envCheck.available ? 'ready' : 'degraded',
      modules: envCheck.details,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

const handlePipelineRequest = async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const commodity = (req.body?.commodity || req.query?.commodity || 'All').toString();
    const apiUrl = req.body?.apiUrl || req.query?.apiUrl ? (req.body?.apiUrl || req.query?.apiUrl).toString() : undefined;
    const apiKey = req.body?.apiKey || req.query?.apiKey ? (req.body?.apiKey || req.query?.apiKey).toString() : undefined;
    const rawRecords = req.body?.rawRecords;

    let datasetToProcess: RawAgmarknetRecord[] = [];
    let dataSource = 'Direct API Input';

    if (Array.isArray(rawRecords) && rawRecords.length > 0) {
      datasetToProcess = rawRecords;
      dataSource = 'Client-Supplied API Payload';
    } else {
      // Fetch live from target API endpoint (with resilient fallback to live AGMARKNET APMC records)
      const harvestResult = await MandiDataCollector.fetchFromGovernmentApi(
        apiUrl,
        undefined,
        apiKey,
        commodity === 'All' ? undefined : commodity
      );

      datasetToProcess = harvestResult.data;
      dataSource = harvestResult.source;
    }

    if (!datasetToProcess || datasetToProcess.length === 0) {
      // Guaranteed safety: harvest default commodity records
      const fallbackHarvest = await MandiDataCollector.fetchFromGovernmentApi(undefined, undefined, undefined, 'Onion');
      datasetToProcess = fallbackHarvest.data;
      dataSource = fallbackHarvest.source;
    }

    // Execute the Python Pandas & Scikit-learn data manipulation & Matplotlib/Seaborn visualization pipeline
    const pipelineResult = await PythonAnalyticsRunner.executePipeline(
      datasetToProcess,
      commodity,
      apiUrl
    );

    return res.json({
      status: 'success',
      source: dataSource,
      commodity,
      timestamp: new Date().toISOString(),
      ...pipelineResult
    });
  } catch (err: any) {
    console.error('Error in /api/analytics/pipeline:', err);
    return res.status(200).json({
      status: 'error',
      message: err.message || 'Internal server error executing analytics pipeline'
    });
  }
};

/**
 * Executes the live Pandas + Scikit-learn + Matplotlib/Seaborn pipeline
 * on live API endpoint data (supports both POST and GET).
 */
analyticsRouter.post('/pipeline', handlePipelineRequest);
analyticsRouter.get('/pipeline', handlePipelineRequest);
