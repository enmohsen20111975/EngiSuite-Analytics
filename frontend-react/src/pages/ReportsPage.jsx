import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, Download, Plus, Trash2, Eye, 
  Calendar, FileSpreadsheet, File, Search, ListFilter
} from 'lucide-react';
import { cn } from '../lib/utils';
import { reportsService } from '../services/reportsService';
import { Card, CardContent, Button, PageLoader, EmptyState } from '../components/ui';

// Report type icons
const typeIcons = {
  pdf: FileText,
  excel: FileSpreadsheet,
  calculation: File,
};

/**
 * Report card component
 */
function ReportCard({ report }) {
  const TypeIcon = typeIcons[report.type] || FileText;
  
  return (
    <Card hover className="group">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-accent/10 text-accent">
            <TypeIcon className="w-6 h-6" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[var(--color-text-primary)] truncate group-hover:text-accent transition-colors">
              {report.title}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {report.description}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-text-muted)]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {report.created_at}
              </span>
              <span className="uppercase">{report.type}</span>
              <span>{report.size}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]">
              <Eye className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-danger/10 text-danger">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Reports page component
 */
function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Fetch reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: reportsService.getAll,
    placeholderData: [
      { id: 1, title: 'Voltage Drop Analysis Report', description: 'Complete voltage drop analysis for Building A', type: 'pdf', created_at: '2026-02-28', size: '2.4 MB' },
      { id: 2, title: 'Cable Sizing Calculations', description: 'Cable sizing calculations for power distribution', type: 'excel', created_at: '2026-02-27', size: '1.1 MB' },
      { id: 3, title: 'Structural Beam Analysis', description: 'Beam design calculations and analysis report', type: 'pdf', created_at: '2026-02-26', size: '3.2 MB' },
      { id: 4, title: 'Pump System Design', description: 'Pump sizing and system design calculations', type: 'pdf', created_at: '2026-02-25', size: '1.8 MB' },
      { id: 5, title: 'Motor Starting Study', description: 'Motor starting current and voltage dip analysis', type: 'excel', created_at: '2026-02-24', size: '856 KB' },
    ],
  });
  
  // ListFilter reports
  const filteredReports = reports?.filter(report => {
    const matchesSearch = !searchQuery || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesType;
  });
  
  if (isLoading) {
    return <PageLoader message="Loading reports..." />;
  }
  
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
            Reports
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Generate and manage professional engineering reports.
          </p>
        </div>
        
        <Button>
          <Plus className="w-4 h-4" />
          New Report
        </Button>
      </div>
      
      {/* Search and filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports..."
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-lg',
                  'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                  'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
                  'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none'
                )}
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 'pdf', 'excel'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium text-sm capitalize transition-all',
                    filterType === type
                      ? 'bg-accent text-white'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Reports list */}
      {filteredReports?.length > 0 ? (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No reports found"
          description="Generate your first engineering report to get started."
          action={() => {}}
          actionLabel="Create Report"
        />
      )}
    </div>
  );
}

export default ReportsPage;
