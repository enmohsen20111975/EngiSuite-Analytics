import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Plus, LoaderCircle, CircleAlert, LayoutGrid, ChartGantt, 
  Calendar, Users, FileText, ClipboardList, Mail, Package,
  Activity, Settings, ChevronRight, Clock, CircleCheckBig, TriangleAlert,
  Ellipsis, Trash2, Pencil, Eye
} from 'lucide-react';
import { Card, Input } from '../components/ui';
import projectService from '../services/projectService';
import { cn } from '../lib/utils';

// Tab configuration
const TABS = [
  { key: 'kanban', label: 'Kanban', icon: LayoutGrid },
  { key: 'gantt', label: 'Gantt', icon: ChartGantt },
  { key: 'list', label: 'List', icon: ClipboardList },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
  { key: 'team', label: 'Team', icon: Users },
  { key: 'files', label: 'Files', icon: FileText },
  { key: 'rfi', label: 'RFI', icon: Mail },
  { key: 'bom', label: 'BOM', icon: Package },
  { key: 'activity', label: 'Activity', icon: Activity },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const KANBAN_COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'bg-slate-500' },
  { key: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { key: 'in_review', label: 'In Review', color: 'bg-amber-500' },
  { key: 'done', label: 'Done', color: 'bg-emerald-500' },
  { key: 'blocked', label: 'Blocked', color: 'bg-rose-500' },
];

const PRIORITY_COLORS = {
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  critical: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
};

function UpgradeRequired({ message }) {
  return (
    <Card className="p-8 text-center">
      <CircleAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Professional Plan Required</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{message || 'Projects are available on Pro and Enterprise plans.'}</p>
      <a href="/pricing" className="inline-flex px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Upgrade Plan</a>
    </Card>
  );
}

function TaskCard({ task, onDragStart, onClick }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onClick?.(task)}
      className={cn(
        "group rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 cursor-grab hover:shadow-md transition-all",
        isOverdue && "border-l-4 border-l-rose-500"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">{task.title}</p>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0", PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium)}>
          {task.priority}
        </span>
      </div>
      {task.description && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{task.description}</p>}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className={cn("flex items-center gap-1", isOverdue && "text-rose-500")}>
          {isOverdue ? <TriangleAlert className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
        </span>
        {task.completion_pct > 0 && task.status !== 'done' && (
          <div className="flex items-center gap-1">
            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${task.completion_pct}%` }} />
            </div>
            <span>{task.completion_pct}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanView({ projectId, columns, onCreateTask, onTaskClick }) {
  const queryClient = useQueryClient();
  const [newTaskColumn, setNewTaskColumn] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const createTaskMutation = useMutation({
    mutationFn: (data) => projectService.createTask(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-kanban', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-dashboard-widgets'] });
      setNewTaskColumn(null);
      setNewTaskTitle('');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }) => projectService.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-kanban', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-dashboard-widgets'] });
    },
  });

  const handleDragStart = (event, task) => {
    event.dataTransfer.setData('taskId', String(task.id));
  };

  const handleDrop = (event, status) => {
    event.preventDefault();
    const taskId = Number(event.dataTransfer.getData('taskId'));
    if (!taskId) return;
    updateStatusMutation.mutate({ taskId, status });
  };

  const handleAddTask = (status) => {
    if (!newTaskTitle.trim()) return;
    createTaskMutation.mutate({
      title: newTaskTitle,
      status,
      priority: 'medium',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {KANBAN_COLUMNS.map((column) => {
        const tasks = columns[column.key] || [];
        return (
          <div
            key={column.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, column.key)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 min-h-[400px] flex flex-col"
          >
            <div className={cn("px-3 py-2 border-b border-gray-200 dark:border-gray-700 rounded-t-xl flex items-center justify-between", column.color + "/10")}>
              <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full", column.color)} />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{column.label}</h3>
              </div>
              <span className="text-xs text-gray-500 bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded">{tasks.length}</span>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[60vh]">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onDragStart={handleDragStart} onClick={onTaskClick} />
              ))}
              {newTaskColumn === column.key ? (
                <div className="p-2 bg-white dark:bg-gray-900 rounded-lg border border-blue-300 dark:border-blue-600">
                  <input
                    autoFocus
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddTask(column.key);
                      if (e.key === 'Escape') { setNewTaskColumn(null); setNewTaskTitle(''); }
                    }}
                    placeholder="Enter task title..."
                    className="w-full text-sm bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => { setNewTaskColumn(null); setNewTaskTitle(''); }} className="text-xs text-gray-500 hover:text-gray-700">Cancel</button>
                    <button onClick={() => handleAddTask(column.key)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Add</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setNewTaskColumn(column.key)}
                  className="w-full p-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Add task
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ tasks, onTaskClick }) {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      return new Date(a.due_date || '9999-12-31') - new Date(b.due_date || '9999-12-31');
    });
  }, [tasks]);

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Task</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Due Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTasks.map((task) => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
              return (
                <tr 
                  key={task.id} 
                  onClick={() => onTaskClick?.(task)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                    {task.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      task.status === 'done' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                      task.status === 'in_progress' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                      task.status === 'in_review' && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                      task.status === 'blocked' && "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
                      task.status === 'todo' && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
                    )}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2 py-0.5 rounded font-medium", PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium)}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs", isOverdue && "text-rose-500 font-medium")}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${task.completion_pct || 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{task.completion_pct || 0}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function GanttView({ project, tasks }) {
  // Simple Gantt chart visualization
  const today = new Date();
  const projectStart = project?.start_date ? new Date(project.start_date) : today;
  const projectEnd = project?.end_date ? new Date(project.end_date) : new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const totalDays = Math.max(30, Math.ceil((projectEnd - projectStart) / (1000 * 60 * 60 * 24)));
  const days = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(projectStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const tasksWithDates = tasks.filter(t => t.start_date || t.due_date);

  return (
    <Card className="p-4 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header with dates */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
            <div className="w-48 shrink-0 text-xs font-semibold text-gray-600 dark:text-gray-300">Task</div>
            <div className="flex-1 flex">
              {days.filter((_, i) => i % 7 === 0).map((day, i) => (
                <div key={i} className="flex-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                  {day.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Task rows */}
          <div className="space-y-2">
            {tasksWithDates.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No tasks with dates to display</p>
            ) : (
              tasksWithDates.map((task) => {
                const taskStart = task.start_date ? new Date(task.start_date) : projectStart;
                const taskEnd = task.due_date ? new Date(task.due_date) : taskStart;
                const startOffset = Math.max(0, Math.floor((taskStart - projectStart) / (1000 * 60 * 60 * 24)));
                const duration = Math.max(1, Math.ceil((taskEnd - taskStart) / (1000 * 60 * 60 * 24)));
                const leftPercent = (startOffset / totalDays) * 100;
                const widthPercent = (duration / totalDays) * 100;
                
                return (
                  <div key={task.id} className="flex items-center group">
                    <div className="w-48 shrink-0 text-sm text-gray-900 dark:text-white truncate pr-2">{task.title}</div>
                    <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded relative">
                      <div
                        className={cn(
                          "absolute h-4 top-1 rounded transition-all",
                          task.status === 'done' ? "bg-emerald-500" :
                          task.status === 'blocked' ? "bg-rose-500" :
                          task.status === 'in_progress' ? "bg-blue-500" :
                          "bg-slate-400"
                        )}
                        style={{ left: `${leftPercent}%`, width: `${Math.min(widthPercent, 100 - leftPercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function CalendarView({ tasks }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      if (task.due_date) {
        const dateKey = new Date(task.due_date).toDateString();
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(task);
      }
    });
    return map;
  }, [tasks]);

  const monthName = currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' });

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <h3 className="font-semibold text-gray-900 dark:text-white">{monthName}</h3>
        <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs text-center text-gray-500 py-2 font-medium">{day}</div>
        ))}
        {blanks.map(i => (
          <div key={`blank-${i}`} className="h-20" />
        ))}
        {days.map(day => {
          const date = new Date(year, month, day);
          const dateKey = date.toDateString();
          const dayTasks = tasksByDate[dateKey] || [];
          const isToday = new Date().toDateString() === dateKey;
          
          return (
            <div key={day} className={cn(
              "h-20 p-1 border border-gray-100 dark:border-gray-800 rounded-lg",
              isToday && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            )}>
              <span className={cn("text-xs font-medium", isToday && "text-blue-600 dark:text-blue-400")}>{day}</span>
              <div className="mt-1 space-y-0.5 overflow-hidden">
                {dayTasks.slice(0, 2).map(task => (
                  <div key={task.id} className={cn(
                    "text-[10px] px-1 py-0.5 rounded truncate",
                    task.status === 'done' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  )}>
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-[10px] text-gray-500 px-1">+{dayTasks.length - 2} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TeamView({ project }) {
  // Mock team members - would come from API
  const members = [
    { id: 1, name: 'Project Owner', role: 'owner', email: 'owner@example.com' },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Team Members</h3>
        <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1">
          <Plus className="w-3 h-3" /> Invite
        </button>
      </div>
      <div className="space-y-3">
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
            </div>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full font-medium capitalize",
              member.role === 'owner' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
              member.role === 'manager' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
              member.role === 'member' && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
            )}>
              {member.role}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FilesView() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Project Files</h3>
        <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1">
          <Plus className="w-3 h-3" /> Upload
        </button>
      </div>
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No files uploaded yet</p>
        <p className="text-xs mt-1">Upload drawings, documents, and specifications</p>
      </div>
    </Card>
  );
}

function RFIView() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">RFI Log</h3>
        <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1">
          <Plus className="w-3 h-3" /> New RFI
        </button>
      </div>
      <div className="text-center py-12 text-gray-500">
        <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No RFIs yet</p>
        <p className="text-xs mt-1">Track requests for information</p>
      </div>
    </Card>
  );
}

function BOMView() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Bill of Materials</h3>
        <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add Item
        </button>
      </div>
      <div className="text-center py-12 text-gray-500">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No BOM items yet</p>
        <p className="text-xs mt-1">Track materials and equipment</p>
      </div>
    </Card>
  );
}

function ActivityView({ projectId }) {
  // Mock activity - would come from API
  const activities = [
    { id: 1, action: 'project_created', user: 'System', time: 'Just now', details: 'Project was created' },
  ];

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-900 dark:text-white">{activity.details}</p>
              <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SettingsView({ project, projectId }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'planning',
    priority: project?.priority || 'medium',
    category: project?.category || 'general',
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data) => projectService.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Project Settings</h3>
      <div className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Project Name</label>
          <Input
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
            >
              <option value="none">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
          >
            <option value="general">General</option>
            <option value="electrical">Electrical</option>
            <option value="mechanical">Mechanical</option>
            <option value="civil">Civil</option>
            <option value="mep">MEP</option>
            <option value="infrastructure">Infrastructure</option>
          </select>
        </div>
        <button
          onClick={() => updateProjectMutation.mutate(form)}
          disabled={updateProjectMutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {updateProjectMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </Card>
  );
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState('kanban');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getProject(projectId),
    enabled: !!projectId,
  });

  const kanbanQuery = useQuery({
    queryKey: ['project-kanban', projectId],
    queryFn: () => projectService.getKanban(projectId),
    enabled: !!projectId,
  });

  const isUpgradeError = projectQuery.error?.response?.status === 402 || kanbanQuery.error?.response?.status === 402;

  const columns = useMemo(() => kanbanQuery.data?.columns || {}, [kanbanQuery.data]);
  const allTasks = useMemo(() => {
    return Object.values(columns).flat();
  }, [columns]);

  if (projectQuery.isLoading || kanbanQuery.isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoaderCircle className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isUpgradeError) {
    const message = projectQuery.error?.response?.data?.detail?.message || kanbanQuery.error?.response?.data?.detail?.message;
    return <UpgradeRequired message={message} />;
  }

  const project = projectQuery.data;

  const statusColors = {
    planning: 'bg-slate-500',
    active: 'bg-blue-500',
    on_hold: 'bg-amber-500',
    completed: 'bg-emerald-500',
    cancelled: 'bg-rose-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project?.name}</h1>
            <span className={cn("text-xs px-2 py-1 rounded-full text-white font-medium", statusColors[project?.status] || statusColors.planning)}>
              {project?.status?.replace('_', ' ')}
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{project?.description || 'No description provided.'}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-gray-500 mb-1">Progress</div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(100, project?.progress || 0)}%` }} />
            </div>
            <span className="text-lg font-bold text-blue-600">{Math.round(project?.progress || 0)}%</span>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {project?.category} • {project?.priority} priority
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all shrink-0",
                  isActive 
                    ? "border-blue-500 text-blue-600 dark:text-blue-400" 
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'kanban' && (
          <KanbanView 
            projectId={projectId} 
            columns={columns} 
            onTaskClick={(task) => { setSelectedTask(task); setShowTaskModal(true); }}
          />
        )}
        {activeTab === 'list' && (
          <ListView 
            tasks={allTasks} 
            onTaskClick={(task) => { setSelectedTask(task); setShowTaskModal(true); }}
          />
        )}
        {activeTab === 'gantt' && <GanttView project={project} tasks={allTasks} />}
        {activeTab === 'calendar' && <CalendarView tasks={allTasks} />}
        {activeTab === 'team' && <TeamView project={project} />}
        {activeTab === 'files' && <FilesView />}
        {activeTab === 'rfi' && <RFIView />}
        {activeTab === 'bom' && <BOMView />}
        {activeTab === 'activity' && <ActivityView projectId={projectId} />}
        {activeTab === 'settings' && <SettingsView project={project} projectId={projectId} />}
      </div>
    </div>
  );
}
