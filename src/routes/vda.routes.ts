/**
 * Visual Data Analysis (VDA) Routes
 * Converted from Python FastAPI VDA router
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';

const router = Router();

/**
 * GET /api/vda/datasets
 * List VDA datasets
 */
router.get('/datasets', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const datasets = await prisma.analyticsDataset.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: datasets,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/vda/upload
 * Upload data for VDA
 */
router.post('/upload', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, data, type } = req.body;

    if (!name || !data) {
      throw new ValidationError('Name and data are required');
    }

    // Parse and validate data
    let parsedData: Record<string, unknown>[];
    if (typeof data === 'string') {
      parsedData = JSON.parse(data);
    } else {
      parsedData = data;
    }

    const columns = Object.keys(parsedData[0] || {}).map(key => ({
      name: key,
      type: typeof parsedData[0][key] === 'number' ? 'number' : 'string',
      nullable: true,
    }));

    const dataset = await prisma.analyticsDataset.create({
      data: {
        userId: 1, // Placeholder
        name,
        description: `VDA dataset - ${type || 'unknown'}`,
        dataType: type || 'json',
        data: JSON.stringify(parsedData),
        columns: JSON.stringify(columns),
        rowCount: parsedData.length,
      },
    });

    res.status(201).json({
      success: true,
      data: dataset,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/vda/analyze
 * Analyze data
 */
router.post('/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { datasetId, analysisType, columns } = req.body;

    const dataset = await prisma.analyticsDataset.findFirst({
      where: { id: datasetId },
    });

    if (!dataset) {
      throw new NotFoundError('Dataset not found');
    }

    const data = JSON.parse(dataset.data);
    const results: Record<string, unknown> = {};

    switch (analysisType) {
      case 'statistics':
        for (const col of columns || []) {
          const values = data.map((row: Record<string, unknown>) => Number(row[col])).filter(v => !isNaN(v));
          results[col] = {
            count: values.length,
            mean: values.reduce((a: number, b: number) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            sum: values.reduce((a: number, b: number) => a + b, 0),
          };
        }
        break;

      case 'correlation':
        // Simple correlation calculation
        if (columns && columns.length >= 2) {
          const col1 = data.map((row: Record<string, unknown>) => Number(row[columns[0]]));
          const col2 = data.map((row: Record<string, unknown>) => Number(row[columns[1]]));
          const n = col1.length;
          const sum1 = col1.reduce((a: number, b: number) => a + b, 0);
          const sum2 = col2.reduce((a: number, b: number) => a + b, 0);
          const sum1Sq = col1.reduce((a: number, b: number) => a + b * b, 0);
          const sum2Sq = col2.reduce((a: number, b: number) => a + b * b, 0);
          const pSum = col1.reduce((a: number, b: number, i: number) => a + b * col2[i], 0);
          
          const num = pSum - (sum1 * sum2 / n);
          const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
          
          results.correlation = den === 0 ? 0 : num / den;
        }
        break;

      default:
        results.message = 'Analysis type not implemented';
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/vda/chart
 * Generate chart data
 */
router.post('/chart', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { datasetId, chartType, xAxis, yAxis, groupBy } = req.body;

    const dataset = await prisma.analyticsDataset.findFirst({
      where: { id: datasetId },
    });

    if (!dataset) {
      throw new NotFoundError('Dataset not found');
    }

    const data = JSON.parse(dataset.data);
    const chartData: Record<string, unknown>[] = [];

    switch (chartType) {
      case 'line':
      case 'bar':
        for (const row of data) {
          chartData.push({
            x: row[xAxis],
            y: Number(row[yAxis]),
          });
        }
        break;

      case 'pie':
        const counts: Record<string, number> = {};
        for (const row of data) {
          const key = String(row[xAxis]);
          counts[key] = (counts[key] || 0) + 1;
        }
        for (const [key, value] of Object.entries(counts)) {
          chartData.push({ name: key, value });
        }
        break;

      case 'scatter':
        for (const row of data) {
          chartData.push({
            x: Number(row[xAxis]),
            y: Number(row[yAxis]),
          });
        }
        break;
    }

    res.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
