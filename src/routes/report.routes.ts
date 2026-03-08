/**
 * Report Routes
 * Enhanced with technical report generation and templates
 */

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../services/database.service.js';
import { reportGenerator } from '../services/reportGenerator.service.js';
import { NotFoundError, ValidationError } from '../middleware/error.middleware.js';

const router = Router();

/**
 * GET /api/reports
 * List user's generated reports
 */
router.get('/', async (_req: Request, res: Response, _next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware

    const reports = await prisma.generatedReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
    });

    res.json(reports);
  } catch (error) {
    console.error('Reports error:', error);
    res.json([]);
  }
});

/**
 * GET /api/reports/templates
 * Get report templates
 */
router.get('/templates', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await reportGenerator.getTemplates();
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/templates/:id
 * Get report template by ID
 */
router.get('/templates/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const template = await reportGenerator.getTemplate(id);
    
    if (!template) {
      throw new NotFoundError('Template not found');
    }
    
    res.json(template);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/templates/slug/:slug
 * Get report template by slug
 */
router.get('/templates/slug/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug;
    const template = await reportGenerator.getTemplateBySlug(slug);
    
    if (!template) {
      throw new NotFoundError('Template not found');
    }
    
    res.json(template);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reports/generate
 * Generate a report from template
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const { templateId, format = 'html', data = {}, save = true, projectId } = req.body;

    if (!templateId) {
      throw new ValidationError('Template ID is required');
    }

    // Generate report from template
    const reportData = await reportGenerator.generateFromTemplate(templateId, data);

    // Convert to requested format
    let content: string;
    let contentType: string;

    switch (format) {
      case 'html':
        content = reportGenerator.generateHtml(reportData);
        contentType = 'text/html';
        break;
      case 'markdown':
      case 'md':
        content = reportGenerator.generateMarkdown(reportData);
        contentType = 'text/markdown';
        break;
      case 'json':
        content = reportGenerator.generateJson(reportData);
        contentType = 'application/json';
        break;
      default:
        content = reportGenerator.generateHtml(reportData);
        contentType = 'text/html';
    }

    // Save report if requested
    let savedReport = null;
    if (save) {
      savedReport = await reportGenerator.saveReport(userId, {
        title: reportData.title,
        reportType: format,
        content,
        projectId,
      });
    }

    res.json({
      success: true,
      report: savedReport,
      content,
      contentType,
      format,
      generatedAt: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reports/generate-custom
 * Generate a custom report without template
 */
router.post('/generate-custom', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const { 
      title, 
      subtitle, 
      author, 
      projectName,
      sections = [], 
      format = 'html', 
      save = true,
      projectId 
    } = req.body;

    if (!title) {
      throw new ValidationError('Report title is required');
    }

    if (!sections || sections.length === 0) {
      throw new ValidationError('At least one section is required');
    }

    // Build report data
    const reportData = {
      title,
      subtitle,
      author,
      date: new Date().toISOString(),
      projectName,
      sections: sections.map((s: any, index: number) => ({
        ...s,
        order: index,
      })),
    };

    // Convert to requested format
    let content: string;
    let contentType: string;

    switch (format) {
      case 'html':
        content = reportGenerator.generateHtml(reportData);
        contentType = 'text/html';
        break;
      case 'markdown':
      case 'md':
        content = reportGenerator.generateMarkdown(reportData);
        contentType = 'text/markdown';
        break;
      case 'json':
        content = reportGenerator.generateJson(reportData);
        contentType = 'application/json';
        break;
      default:
        content = reportGenerator.generateHtml(reportData);
        contentType = 'text/html';
    }

    // Save report if requested
    let savedReport = null;
    if (save) {
      savedReport = await reportGenerator.saveReport(userId, {
        title,
        reportType: format,
        content,
        projectId,
      });
    }

    res.json({
      success: true,
      report: savedReport,
      content,
      contentType,
      format,
      generatedAt: new Date(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/:id
 * Get report by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const id = parseInt(String(req.params.id), 10);

    const report = await reportGenerator.getReport(id, userId);

    if (!report) {
      throw new NotFoundError('Report not found');
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reports
 * Create a new report (legacy endpoint)
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const { title, reportType, content, projectId } = req.body;

    const report = await reportGenerator.saveReport(userId, {
      title,
      reportType: reportType || 'html',
      content,
      projectId,
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/:id/export/html
 * Export report as HTML
 */
router.get('/:id/export/html', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const id = parseInt(String(req.params.id), 10);

    const report = await reportGenerator.getReport(id, userId);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/\s+/g, '_')}.html"`);
    res.send(report.content);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/:id/export/markdown
 * Export report as Markdown
 */
router.get('/:id/export/markdown', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const id = parseInt(String(req.params.id), 10);

    const report = await reportGenerator.getReport(id, userId);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    // If content is HTML, we need to regenerate as markdown
    // For now, just return the content
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/\s+/g, '_')}.md"`);
    res.send(report.content);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/:id/export/json
 * Export report as JSON
 */
router.get('/:id/export/json', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const id = parseInt(String(req.params.id), 10);

    const report = await reportGenerator.getReport(id, userId);
    if (!report) {
      throw new NotFoundError('Report not found');
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/\s+/g, '_')}.json"`);
    res.send(report.content);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/reports/:id
 * Delete a report
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = 1; // TODO: Get from auth middleware
    const id = parseInt(String(req.params.id), 10);

    const result = await reportGenerator.deleteReport(id, userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
