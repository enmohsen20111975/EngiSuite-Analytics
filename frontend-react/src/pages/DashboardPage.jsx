import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { calculatorsService } from '../services/calculatorsService';
import { pipelinesService } from '../services/pipelinesService';
import projectService from '../services/projectService';
import apiClient from '../services/apiClient';
import { Card, Loader } from '../components/ui';
import { 
  Zap, Cog, Building2, FileText, History, 
  Bolt, Bot, Newspaper, TrendingUp,
  GraduationCap, Wrench, GitBranch, Microchip,
  FileSpreadsheet, ChevronRight, FolderKanban, SquareCheck,
  Calculator, Layers
} from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Stat Card Component
 */
function StatCard({ icon: Icon, iconColor, label, value, sublabel, bgColor }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", bgColor)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {sublabel}
      </div>
    </Card>
  );
}

/**
 * Quick Action Button
 */
function QuickAction({ icon: Icon, label, to, color, bgColor }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-2", bgColor)}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
        {label}
      </span>
    </Link>
  );
}

/**
 * Tool Card Component
 */
function ToolCard({ icon: Icon, title, subtitle, description, to, color, bgColor }) {
  return (
    <Link
      to={to}
      className="block p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all group"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", bgColor)}>
          <Icon className={cn("w-5 h-5", color)} />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
            {title}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
      <div className="mt-3 flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium">
        Open Tool <ChevronRight className="w-3 h-3 ml-1" />
      </div>
    </Link>
  );
}

/**
 * Recent Calculation Item
 */
function RecentCalculationItem({ calculation }) {
  const domainColors = {
    electrical: 'text-amber-500 bg-amber-500/10',
    mechanical: 'text-cyan-500 bg-cyan-500/10',
    civil: 'text-emerald-500 bg-emerald-500/10',
    mathematics: 'text-violet-500 bg-violet-500/10',
  };
  
  const colorClass = domainColors[calculation.domain] || domainColors.civil;
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorClass.split(' ')[1])}>
        <Zap className={cn("w-4 h-4", colorClass.split(' ')[0])} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {calculation.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {calculation.domain} • {calculation.time || 'Just now'}
        </p>
      </div>
      <div className="text-xs text-gray-400">
        {calculation.result}
      </div>
    </div>
  );
}

/**
 * Main Dashboard Page
 */
export default function DashboardPage() {
  // Fetch calculator stats
  const { data: calculatorsData, isLoading: loadingCalculators } = useQuery({
    queryKey: ['calculators-stats'],
    queryFn: calculatorsService.getAll,
  });
  
  // Fetch pipelines stats
  const { data: pipelinesData, isLoading: loadingPipelines } = useQuery({
    queryKey: ['pipelines-stats'],
    queryFn: pipelinesService.getAll,
  });

  // Fetch equations stats from database
  const { data: equationsStats } = useQuery({
    queryKey: ['equations-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/equations/stats');
      return response.data;
    },
  });

  // Fetch project widgets (Pro/Enterprise only)
  const { data: projectWidgets } = useQuery({
    queryKey: ['project-dashboard-widgets'],
    queryFn: projectService.getDashboardWidgets,
    retry: false,
  });
  
  // Calculate stats
  const stats = {
    electrical: calculatorsData?.electrical?.length || 0,
    mechanical: calculatorsData?.mechanical?.length || 0,
    civil: calculatorsData?.civil?.length || 0,
    pipelines: pipelinesData?.length || 0,
    equations: equationsStats?.data?.total || 0,
    equationCategories: equationsStats?.data?.categories || 0,
  };
  
  // Mock recent calculations (would come from API in production)
  const recentCalculations = [
    { id: 1, name: 'Voltage Drop Calculation', domain: 'electrical', time: '2 min ago', result: '2.4V' },
    { id: 2, name: 'Pump Power Sizing', domain: 'mechanical', time: '15 min ago', result: '5.2 kW' },
    { id: 3, name: 'Concrete Volume', domain: 'civil', time: '1 hour ago', result: '24.5 m³' },
    { id: 4, name: 'Cable Sizing', domain: 'electrical', time: '2 hours ago', result: '4x120mm²' },
  ];
  
  // Mock courses (would come from API in production)
  const courses = [
    { id: 1, title: 'Electrical Fundamentals', progress: 75, lessons: 12 },
    { id: 2, title: 'HVAC Design Basics', progress: 40, lessons: 8 },
    { id: 3, title: 'Structural Analysis', progress: 20, lessons: 15 },
  ];
  
  const isLoading = loadingCalculators || loadingPipelines;
  const myProjects = projectWidgets?.projects || [];
  const myTasks = projectWidgets?.tasks || [];
  
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, Engineer
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Your engineering workspace is ready. Here's what's happening today.
        </p>
      </div>
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Zap}
          iconColor="text-amber-500"
          label="Electrical"
          value={stats.electrical}
          sublabel="Calculations"
          bgColor="bg-amber-500/10"
        />
        <StatCard
          icon={Cog}
          iconColor="text-cyan-500"
          label="Mechanical"
          value={stats.mechanical}
          sublabel="Calculations"
          bgColor="bg-cyan-500/10"
        />
        <StatCard
          icon={Building2}
          iconColor="text-emerald-500"
          label="Civil"
          value={stats.civil}
          sublabel="Calculations"
          bgColor="bg-emerald-500/10"
        />
        <StatCard
          icon={Calculator}
          iconColor="text-purple-500"
          label="Equations"
          value={stats.equations}
          sublabel="Available"
          bgColor="bg-purple-500/10"
        />
        <StatCard
          icon={Layers}
          iconColor="text-violet-500"
          label="Pipelines"
          value={stats.pipelines}
          sublabel="Available"
          bgColor="bg-violet-500/10"
        />
      </div>
      
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Calculations */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <History className="w-4 h-4 text-cyan-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Latest Calculations
              </h3>
            </div>
            <Link 
              to="/calculators" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View All →
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-1">
              {recentCalculations.map((calc) => (
                <RecentCalculationItem key={calc.id} calculation={calc} />
              ))}
            </div>
          )}
        </Card>
        
        {/* Quick Actions */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Bolt className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <QuickAction
              icon={Zap}
              label="Electrical"
              to="/calculators?domain=electrical"
              color="text-amber-500"
              bgColor="bg-amber-500/10"
            />
            <QuickAction
              icon={Cog}
              label="Mechanical"
              to="/calculators?domain=mechanical"
              color="text-cyan-500"
              bgColor="bg-cyan-500/10"
            />
            <QuickAction
              icon={Building2}
              label="Civil"
              to="/calculators?domain=civil"
              color="text-emerald-500"
              bgColor="bg-emerald-500/10"
            />
            <QuickAction
              icon={TrendingUp}
              label="Pipelines"
              to="/pipelines"
              color="text-violet-500"
              bgColor="bg-violet-500/10"
            />
            <QuickAction
              icon={Bot}
              label="AI Assistant"
              to="/ai-assistant"
              color="text-rose-500"
              bgColor="bg-rose-500/10"
            />
            <QuickAction
              icon={Newspaper}
              label="Blog"
              to="/blog"
              color="text-slate-500"
              bgColor="bg-slate-500/10"
            />
          </div>
        </Card>
      </div>
      
      {/* Engineering Tools Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-violet-500" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Engineering Tools
          </h3>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-violet-500/20 text-violet-500">
            NEW
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ToolCard
            icon={GitBranch}
            title="Diagram Studio"
            subtitle="Professional diagrams"
            description="Create flowcharts, UML, ER diagrams with code generation in 10+ languages."
            to="/diagram-studio"
            color="text-violet-500"
            bgColor="bg-violet-500/10"
          />
          <ToolCard
            icon={Microchip}
            title="Logic Simulator"
            subtitle="Digital circuits"
            description="Design and simulate digital logic circuits with real-time visualization."
            to="/logic-sim"
            color="text-cyan-500"
            bgColor="bg-cyan-500/10"
          />
          <ToolCard
            icon={FileSpreadsheet}
            title="PDF Editor"
            subtitle="Pencil & annotate"
            description="Pencil PDFs, add annotations, signatures, and export professional documents."
            to="/pdf-editor"
            color="text-rose-500"
            bgColor="bg-rose-500/10"
          />
          <ToolCard
            icon={TrendingUp}
            title="Visual Data Analysis"
            subtitle="Data visualization"
            description="Analyze and visualize data with interactive charts, pivot tables, and advanced analytics."
            to="/vda"
            color="text-emerald-500"
            bgColor="bg-emerald-500/10"
          />
        </div>
      </Card>

      {/* Project Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FolderKanban className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">My Projects</h3>
            </div>
            <Link to="/projects" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {myProjects.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No projects available.</p>
            ) : (
              myProjects.slice(0, 3).map((project) => (
                <Link key={project.id} to={`/projects/${project.id}`} className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{project.name}</p>
                    <span className="text-xs text-gray-500">{Math.round(project.progress || 0)}%</span>
                  </div>
                  <div className="mt-2 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, project.progress || 0)}%` }} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <SquareCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">My Tasks</h3>
            </div>
            <Link to="/projects" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {myTasks.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No active tasks.</p>
            ) : (
              myTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.due_date ? `Due ${task.due_date}` : 'No due date'}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
      
      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Learning Courses */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-indigo-500" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Learning Courses
              </h3>
            </div>
            <Link 
              to="/learning" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Browse All →
            </Link>
          </div>
          
          <div className="space-y-3">
            {courses.map((course) => (
              <div 
                key={course.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {course.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {course.lessons} lessons
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                    {course.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        {/* AI Suggestions */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <Bot className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              AI Suggestions
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                💡 Try the new <Link to="/calculators?domain=electrical" className="text-blue-600 dark:text-blue-400 hover:underline">Cable Sizing Calculator</Link> for your next project.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                📚 Continue with <Link to="/learning" className="text-blue-600 dark:text-blue-400 hover:underline">Electrical Fundamentals</Link> course.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                🚀 New: <Link to="/visual-workflow" className="text-blue-600 dark:text-blue-400 hover:underline">Visual Workflow Builder</Link> is now available.
              </p>
            </div>
          </div>
          
          <Link
            to="/ai-assistant"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors text-sm font-medium"
          >
            <Bot className="w-4 h-4" />
            Open AI Assistant
          </Link>
        </Card>
      </div>
    </div>
  );
}
