/**
 * Analytics Routes
 * Converted from Python FastAPI analytics router
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as XLSX from 'xlsx';
import { prisma } from '../services/database.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * GET /api/analytics/datasets
 * List user's datasets
 */
router.get('/datasets', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId ?? 1;

    const datasets = await prisma.analyticsDataset.findMany({
      where: { userId },
      include: {
        sheets: true,
      },
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
 * POST /api/analytics/datasets
 * Upload a new dataset
 */
router.post('/datasets', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId ?? 1;
    const { name, description, dataType, data } = req.body;

    if (!name || !data) {
      throw new ValidationError('Name and data are required');
    }

    // Parse data
    let parsedData: Record<string, unknown>[];
    let columns: Array<{ name: string; type: string; nullable: boolean }>;

    if (dataType === 'json') {
      parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      columns = Object.keys(parsedData[0] || {}).map(key => ({
        name: key,
        type: typeof parsedData[0][key] === 'number' ? 'number' : 'string',
        nullable: true,
      }));
    } else if (dataType === 'csv') {
      const workbook = XLSX.read(data, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as Record<string, unknown>[];
      columns = Object.keys(parsedData[0] || {}).map(key => ({
        name: key,
        type: typeof parsedData[0][key] === 'number' ? 'number' : 'string',
        nullable: true,
      }));
    } else if (dataType === 'excel') {
      const buffer = Buffer.from(data, 'base64');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      parsedData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as Record<string, unknown>[];
      columns = Object.keys(parsedData[0] || {}).map(key => ({
        name: key,
        type: typeof parsedData[0][key] === 'number' ? 'number' : 'string',
        nullable: true,
      }));
    } else {
      parsedData = [];
      columns = [];
    }

    const dataset = await prisma.analyticsDataset.create({
      data: {
        userId,
        name,
        description,
        dataType,
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
 * GET /api/analytics/datasets/:id
 * Get dataset by ID
 */
router.get('/datasets/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);

    const dataset = await prisma.analyticsDataset.findFirst({
      where: { id },
      include: {
        sheets: true,
      },
    });

    if (!dataset) {
      throw new NotFoundError('Dataset not found');
    }

    res.json({
      success: true,
      data: dataset,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/analytics/datasets/:id
 * Delete a dataset
 */
router.delete('/datasets/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string, 10);

    await prisma.analyticsDataset.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Dataset deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/analytics/query
 * Execute a query on a dataset
 */
router.post('/query', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { datasetId, query, aggregations, groupBy, orderBy, limit, offset } = req.body;

    const dataset = await prisma.analyticsDataset.findFirst({
      where: { id: datasetId },
    });

    if (!dataset) {
      throw new NotFoundError('Dataset not found');
    }

    // Parse data
    const data = JSON.parse(dataset.data);
    let result = [...data];

    // Apply filters
    if (query && Array.isArray(query)) {
      result = result.filter(row => {
        return query.every((condition: { column: string; operator: string; value: unknown }) => {
          const value = row[condition.column];
          switch (condition.operator) {
            case 'eq': return value === condition.value;
            case 'ne': return value !== condition.value;
            case 'gt': return Number(value) > Number(condition.value);
            case 'gte': return Number(value) >= Number(condition.value);
            case 'lt': return Number(value) < Number(condition.value);
            case 'lte': return Number(value) <= Number(condition.value);
            case 'like': return String(value).includes(String(condition.value));
            case 'in': return Array.isArray(condition.value) && condition.value.includes(value);
            default: return true;
          }
        });
      });
    }

    // Apply grouping and aggregations
    if (groupBy && aggregations) {
      const groups: Record<string, unknown[]> = {};
      
      result.forEach(row => {
        const key = groupBy.map((col: string) => row[col]).join('|');
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
      });

      result = Object.entries(groups).map(([key, rows]) => {
        const groupResult: Record<string, unknown> = {};
        const keyParts = key.split('|');
        groupBy.forEach((col: string, i: number) => {
          groupResult[col] = keyParts[i];
        });

        aggregations.forEach((agg: { column: string; function: string; alias?: string }) => {
          const values = (rows as Record<string, unknown>[]).map(r => Number(r[agg.column]) || 0);
          const alias = agg.alias || `${agg.function}_${agg.column}`;
          
          switch (agg.function) {
            case 'sum':
              groupResult[alias] = values.reduce((a, b) => a + b, 0);
              break;
            case 'avg':
              groupResult[alias] = values.reduce((a, b) => a + b, 0) / values.length;
              break;
            case 'count':
              groupResult[alias] = rows.length;
              break;
            case 'min':
              groupResult[alias] = Math.min(...values);
              break;
            case 'max':
              groupResult[alias] = Math.max(...values);
              break;
          }
        });

        return groupResult;
      });
    }

    // Apply ordering
    if (orderBy && Array.isArray(orderBy)) {
      result.sort((a, b) => {
        for (const order of orderBy) {
          const aVal = a[order.column];
          const bVal = b[order.column];
          const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          if (cmp !== 0) return order.direction === 'desc' ? -cmp : cmp;
        }
        return 0;
      });
    }

    // Apply pagination
    const total = result.length;
    const pageOffset = offset || 0;
    const pageLimit = limit || 100;
    result = result.slice(pageOffset, pageOffset + pageLimit);

    res.json({
      success: true,
      data: result,
      pagination: {
        page: Math.floor(pageOffset / pageLimit) + 1,
        limit: pageLimit,
        total,
        totalPages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
