/**
 * Report Generator Service
 * Generates technical engineering reports in various formats
 */

import { prisma } from './database.service.js';

// Report template interface
interface ReportTemplate {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  reportType: string;
  sections: string | null;
  stylingConfig: string | null;
  isPublic: boolean;
}

// Default templates for fallback
const DEFAULT_TEMPLATES: ReportTemplate[] = [
  {
    id: 1,
    name: 'Engineering Calculation Report',
    slug: 'engineering-calculation',
    description: 'Standard engineering calculation report with inputs, calculations, and results',
    category: 'engineering',
    reportType: 'calculation',
    sections: JSON.stringify([
      { title: 'Summary', type: 'summary', content: '{{summary}}' },
      { title: 'Inputs', type: 'data', content: '{{inputs}}' },
      { title: 'Calculations', type: 'calculations', content: '{{calculations}}' },
      { title: 'Results', type: 'results', content: '{{results}}' }
    ]),
    stylingConfig: null,
    isPublic: true
  },
  {
    id: 2,
    name: 'Technical Analysis Report',
    slug: 'technical-analysis',
    description: 'Comprehensive technical analysis with methodology and findings',
    category: 'analysis',
    reportType: 'analysis',
    sections: JSON.stringify([
      { title: 'Executive Summary', type: 'summary', content: '{{summary}}' },
      { title: 'Methodology', type: 'data', content: '{{methodology}}' },
      { title: 'Data Analysis', type: 'calculations', content: '{{analysis}}' },
      { title: 'Findings', type: 'results', content: '{{findings}}' },
      { title: 'Recommendations', type: 'recommendations', content: '{{recommendations}}' }
    ]),
    stylingConfig: null,
    isPublic: true
  },
  {
    id: 3,
    name: 'Project Report',
    slug: 'project-report',
    description: 'General project report with sections for overview, progress, and status',
    category: 'project',
    reportType: 'project',
    sections: JSON.stringify([
      { title: 'Project Overview', type: 'summary', content: '{{overview}}' },
      { title: 'Progress', type: 'data', content: '{{progress}}' },
      { title: 'Status', type: 'results', content: '{{status}}' },
      { title: 'Next Steps', type: 'recommendations', content: '{{nextSteps}}' }
    ]),
    stylingConfig: null,
    isPublic: true
  }
];

// Report section interface
interface ReportSection {
  title: string;
  type: 'summary' | 'data' | 'calculations' | 'results' | 'charts' | 'recommendations' | 'appendix';
  content: string | Record<string, unknown>;
  order: number;
}

// Generated report data
interface GeneratedReportData {
  title: string;
  subtitle?: string;
  author?: string;
  date: string;
  projectName?: string;
  sections: ReportSection[];
  metadata?: Record<string, unknown>;
}

/**
 * Report Generator Service
 */
export class ReportGeneratorService {
  /**
   * Get all report templates
   */
  async getTemplates(): Promise<ReportTemplate[]> {
    try {
      // Check if reportTemplate model exists in prisma
      if ('reportTemplate' in prisma) {
        const templates = await (prisma as any).reportTemplate.findMany({
          where: { isPublic: true },
          orderBy: { name: 'asc' },
        });
        return templates.length > 0 ? templates : DEFAULT_TEMPLATES;
      }
      return DEFAULT_TEMPLATES;
    } catch (error) {
      console.warn('ReportTemplate model not available, using default templates');
      return DEFAULT_TEMPLATES;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(id: number): Promise<ReportTemplate | null> {
    try {
      if ('reportTemplate' in prisma) {
        const template = await (prisma as any).reportTemplate.findUnique({
          where: { id },
        });
        if (template) return template;
      }
      // Fallback to default templates
      return DEFAULT_TEMPLATES.find(t => t.id === id) || null;
    } catch (error) {
      return DEFAULT_TEMPLATES.find(t => t.id === id) || null;
    }
  }

  /**
   * Get template by slug
   */
  async getTemplateBySlug(slug: string): Promise<ReportTemplate | null> {
    try {
      if ('reportTemplate' in prisma) {
        const template = await (prisma as any).reportTemplate.findFirst({
          where: { slug, isPublic: true },
        });
        if (template) return template;
      }
      // Fallback to default templates
      return DEFAULT_TEMPLATES.find(t => t.slug === slug) || null;
    } catch (error) {
      return DEFAULT_TEMPLATES.find(t => t.slug === slug) || null;
    }
  }

  /**
   * Generate report from template
   */
  async generateFromTemplate(templateId: number, data: Record<string, unknown>) {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const sections = template.sections ? JSON.parse(template.sections) : [];
    const populatedSections = this.populateSections(sections, data);

    const reportData: GeneratedReportData = {
      title: data.title as string || template.name,
      subtitle: data.subtitle as string || template.description || undefined,
      author: data.author as string,
      date: new Date().toISOString(),
      projectName: data.projectName as string,
      sections: populatedSections,
      metadata: data.metadata as Record<string, unknown>,
    };

    return reportData;
  }

  /**
   * Populate sections with data
   */
  private populateSections(sections: ReportSection[], data: Record<string, unknown>): ReportSection[] {
    return sections.map((section, index) => {
      let content = section.content;
      
      // Replace placeholders with data
      if (typeof content === 'string') {
        content = this.replacePlaceholders(content, data);
      } else if (typeof content === 'object') {
        content = JSON.parse(this.replacePlaceholders(JSON.stringify(content), data));
      }

      return {
        ...section,
        content,
        order: index,
      };
    });
  }

  /**
   * Replace placeholders in content
   */
  private replacePlaceholders(content: string, data: Record<string, unknown>): string {
    return content.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let value: unknown = obj;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Generate HTML report
   */
  generateHtml(reportData: GeneratedReportData): string {
    const sectionsHtml = reportData.sections
      .sort((a, b) => a.order - b.order)
      .map(section => this.sectionToHtml(section))
      .join('\n');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportData.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 210mm; 
      margin: 0 auto; 
      padding: 20mm;
      background: #fff;
    }
    .report-header { 
      text-align: center; 
      border-bottom: 3px solid #1976d2; 
      padding-bottom: 20px; 
      margin-bottom: 30px; 
    }
    .report-title { 
      font-size: 28px; 
      font-weight: bold; 
      color: #1976d2; 
      margin-bottom: 10px; 
    }
    .report-subtitle { 
      font-size: 16px; 
      color: #666; 
      margin-bottom: 10px; 
    }
    .report-meta { 
      font-size: 12px; 
      color: #888; 
    }
    .section { 
      margin-bottom: 30px; 
      page-break-inside: avoid;
    }
    .section-title { 
      font-size: 18px; 
      font-weight: bold; 
      color: #1976d2; 
      border-bottom: 1px solid #ddd; 
      padding-bottom: 8px; 
      margin-bottom: 15px; 
    }
    .section-content { 
      font-size: 14px; 
    }
    .data-table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 15px 0; 
    }
    .data-table th, .data-table td { 
      border: 1px solid #ddd; 
      padding: 10px; 
      text-align: left; 
    }
    .data-table th { 
      background: #f5f5f5; 
      font-weight: bold; 
    }
    .data-table tr:nth-child(even) { 
      background: #fafafa; 
    }
    .result-box { 
      background: #e8f5e9; 
      border: 1px solid #4caf50; 
      border-radius: 8px; 
      padding: 15px; 
      margin: 15px 0; 
    }
    .result-label { 
      font-size: 12px; 
      color: #2e7d32; 
      text-transform: uppercase; 
    }
    .result-value { 
      font-size: 24px; 
      font-weight: bold; 
      color: #1b5e20; 
    }
    .warning-box { 
      background: #fff3e0; 
      border: 1px solid #ff9800; 
      border-radius: 8px; 
      padding: 15px; 
      margin: 15px 0; 
    }
    .error-box { 
      background: #ffebee; 
      border: 1px solid #f44336; 
      border-radius: 8px; 
      padding: 15px; 
      margin: 15px 0; 
    }
    .formula { 
      font-family: 'Courier New', monospace; 
      background: #f5f5f5; 
      padding: 10px; 
      border-radius: 4px; 
      margin: 10px 0; 
    }
    .footer { 
      margin-top: 50px; 
      padding-top: 20px; 
      border-top: 1px solid #ddd; 
      text-align: center; 
      font-size: 12px; 
      color: #888; 
    }
    @media print {
      body { padding: 0; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <div class="report-title">${reportData.title}</div>
    ${reportData.subtitle ? `<div class="report-subtitle">${reportData.subtitle}</div>` : ''}
    <div class="report-meta">
      ${reportData.author ? `Prepared by: ${reportData.author} | ` : ''}
      Date: ${new Date(reportData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      ${reportData.projectName ? ` | Project: ${reportData.projectName}` : ''}
    </div>
  </div>
  
  ${sectionsHtml}
  
  <div class="footer">
    <p>Generated by EngiSuite Engineering Platform</p>
    <p>Report Date: ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Convert section to HTML
   */
  private sectionToHtml(section: ReportSection): string {
    let contentHtml = '';
    
    if (typeof section.content === 'string') {
      contentHtml = section.content;
    } else if (typeof section.content === 'object') {
      contentHtml = this.contentObjectToHtml(section.content as Record<string, unknown>);
    }

    return `
      <div class="section">
        <h2 class="section-title">${section.title}</h2>
        <div class="section-content">
          ${contentHtml}
        </div>
      </div>
    `;
  }

  /**
   * Convert content object to HTML
   */
  private contentObjectToHtml(content: Record<string, unknown>): string {
    let html = '';

    // Handle text content
    if (content.text) {
      html += `<p>${content.text}</p>`;
    }

    // Handle data tables
    if (content.table && Array.isArray(content.table)) {
      const table = content.table as Array<Record<string, unknown>>;
      if (table.length > 0) {
        const headers = Object.keys(table[0]);
        html += '<table class="data-table">';
        html += '<thead><tr>';
        headers.forEach(h => {
          html += `<th>${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        table.forEach(row => {
          html += '<tr>';
          headers.forEach(h => {
            html += `<td>${row[h]}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody></table>';
      }
    }

    // Handle results
    if (content.results && typeof content.results === 'object') {
      const results = content.results as Record<string, unknown>;
      html += '<div class="result-box">';
      Object.entries(results).forEach(([key, value]) => {
        html += `
          <div style="margin-bottom: 10px;">
            <div class="result-label">${key.replace(/_/g, ' ')}</div>
            <div class="result-value">${value}</div>
          </div>
        `;
      });
      html += '</div>';
    }

    // Handle formulas
    if (content.formula) {
      html += `<div class="formula">${content.formula}</div>`;
    }

    // Handle warnings
    if (content.warnings && Array.isArray(content.warnings)) {
      html += '<div class="warning-box">';
      html += '<strong>⚠️ Warnings:</strong><ul>';
      (content.warnings as string[]).forEach(w => {
        html += `<li>${w}</li>`;
      });
      html += '</ul></div>';
    }

    // Handle recommendations
    if (content.recommendations && Array.isArray(content.recommendations)) {
      html += '<div class="section"><strong>Recommendations:</strong><ul>';
      (content.recommendations as string[]).forEach(r => {
        html += `<li>${r}</li>`;
      });
      html += '</ul></div>';
    }

    return html || JSON.stringify(content);
  }

  /**
   * Generate Markdown report
   */
  generateMarkdown(reportData: GeneratedReportData): string {
    const sectionsMd = reportData.sections
      .sort((a, b) => a.order - b.order)
      .map(section => this.sectionToMarkdown(section))
      .join('\n\n');

    return `# ${reportData.title}

${reportData.subtitle ? `*${reportData.subtitle}*\n\n` : ''}
**Date:** ${new Date(reportData.date).toLocaleDateString()}
${reportData.author ? `\n**Author:** ${reportData.author}` : ''}
${reportData.projectName ? `\n**Project:** ${reportData.projectName}` : ''}

---

${sectionsMd}

---
*Generated by EngiSuite Engineering Platform on ${new Date().toLocaleString()}*
`;
  }

  /**
   * Convert section to Markdown
   */
  private sectionToMarkdown(section: ReportSection): string {
    let contentMd = '';
    
    if (typeof section.content === 'string') {
      contentMd = section.content;
    } else if (typeof section.content === 'object') {
      contentMd = this.contentObjectToMarkdown(section.content as Record<string, unknown>);
    }

    return `## ${section.title}\n\n${contentMd}`;
  }

  /**
   * Convert content object to Markdown
   */
  private contentObjectToMarkdown(content: Record<string, unknown>): string {
    let md = '';

    if (content.text) {
      md += `${content.text}\n\n`;
    }

    if (content.table && Array.isArray(content.table)) {
      const table = content.table as Array<Record<string, unknown>>;
      if (table.length > 0) {
        const headers = Object.keys(table[0]);
        md += '| ' + headers.join(' | ') + ' |\n';
        md += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
        table.forEach(row => {
          md += '| ' + headers.map(h => row[h]).join(' | ') + ' |\n';
        });
        md += '\n';
      }
    }

    if (content.results && typeof content.results === 'object') {
      const results = content.results as Record<string, unknown>;
      md += '### Results\n\n';
      Object.entries(results).forEach(([key, value]) => {
        md += `- **${key.replace(/_/g, ' ')}:** ${value}\n`;
      });
      md += '\n';
    }

    if (content.formula) {
      md += `\`\`\`\n${content.formula}\n\`\`\`\n\n`;
    }

    return md;
  }

  /**
   * Generate JSON report
   */
  generateJson(reportData: GeneratedReportData): string {
    return JSON.stringify(reportData, null, 2);
  }

  /**
   * Save generated report to database
   */
  async saveReport(userId: number, data: {
    title: string;
    reportType: string;
    content: string | Record<string, unknown>;
    projectId?: number;
  }) {
    const report = await prisma.generatedReport.create({
      data: {
        userId,
        title: data.title,
        reportType: data.reportType,
        content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content),
        projectId: data.projectId,
      },
    });

    return report;
  }

  /**
   * Get user's reports
   */
  async getUserReports(userId: number) {
    const reports = await prisma.generatedReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return reports;
  }

  /**
   * Get report by ID
   */
  async getReport(id: number, userId: number) {
    const report = await prisma.generatedReport.findFirst({
      where: { id, userId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return report;
  }

  /**
   * Delete report
   */
  async deleteReport(id: number, userId: number) {
    const report = await prisma.generatedReport.findFirst({
      where: { id, userId },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    await prisma.generatedReport.delete({
      where: { id },
    });

    return { message: 'Report deleted successfully' };
  }
}

// Export singleton instance
export const reportGenerator = new ReportGeneratorService();
