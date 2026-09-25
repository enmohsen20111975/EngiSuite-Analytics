/**
 * Common type definitions for EngiSuite Analytics
 */

// ============================================
// User Types
// ============================================

export interface UserResponse {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  company: string | null;
  country: string | null;
  tier: string;
  subscriptionStatus: string;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  company?: string;
  country?: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
  refreshToken: string;
}

export interface GoogleOAuthRequest {
  idToken: string;
}

export interface TelegramOAuthRequest {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

// ============================================
// Calculator Types
// ============================================

export interface CalculatorInput {
  [key: string]: number | string | boolean;
}

export interface CalculatorOutput {
  [key: string]: number | string;
}

export interface CalculatorRequest {
  calculatorId: string;
  inputs: CalculatorInput;
}

export interface CalculatorResponse {
  calculatorId: string;
  inputs: CalculatorInput;
  outputs: CalculatorOutput;
  units: { [key: string]: string };
  timestamp: Date;
}

// ============================================
// Workflow Types
// ============================================

export interface WorkflowInput {
  slug: string;
  value: number | string | boolean;
}

export interface WorkflowExecuteRequest {
  workflowId: number;
  inputs: WorkflowInput[];
}

export interface WorkflowExecuteResponse {
  workflowId: number;
  inputs: { [key: string]: number | string | boolean };
  outputs: { [key: string]: number | string };
  steps: WorkflowStepResult[];
  timestamp: Date;
}

export interface WorkflowStepResult {
  stepNumber: number;
  name: string;
  inputs: { [key: string]: number | string };
  outputs: { [key: string]: number | string };
}

// ============================================
// Equation Types
// ============================================

export interface EquationSolveRequest {
  equationId: number;
  inputs: { [key: string]: number };
}

export interface EquationSolveResponse {
  equationId: number;
  equationName: string;
  inputs: { [key: string]: { value: number; unit: string } };
  outputs: { [key: string]: { value: number; unit: string } };
  formula: string;
}

// ============================================
// Analytics Types
// ============================================

export interface DatasetUploadRequest {
  name: string;
  description?: string;
  dataType: 'csv' | 'excel' | 'json';
  data: string; // Base64 encoded or JSON string
}

export interface DatasetResponse {
  id: number;
  name: string;
  rowCount: number;
  columns: ColumnDefinition[];
  sheets?: SheetData[];
}

export interface ColumnDefinition {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  nullable: boolean;
}

export interface SheetData {
  name: string;
  data: { [key: string]: unknown }[];
  columns: ColumnDefinition[];
}

// ============================================
// Query Builder Types
// ============================================

export interface QueryBuilderRequest {
  datasetId: number;
  query: QueryCondition[];
  aggregations?: QueryAggregation[];
  groupBy?: string[];
  orderBy?: QueryOrderBy[];
  limit?: number;
  offset?: number;
}

export interface QueryCondition {
  column: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';
  value: unknown;
}

export interface QueryAggregation {
  column: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max';
  alias?: string;
}

export interface QueryOrderBy {
  column: string;
  direction: 'asc' | 'desc';
}

// ============================================
// Report Builder Types
// ============================================

export interface ReportCreateRequest {
  title: string;
  reportType: 'pdf' | 'excel' | 'html';
  content: ReportSection[];
  projectId?: number;
}

export interface ReportSection {
  type: 'text' | 'chart' | 'table' | 'image';
  title?: string;
  content?: string;
  chartConfig?: ChartConfig;
  tableData?: { [key: string]: unknown }[];
  imageUrl?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  data: { [key: string]: unknown }[];
  xAxis?: string;
  yAxis?: string[];
  title?: string;
  colors?: string[];
}

// ============================================
// Learning Types
// ============================================

export interface CourseProgress {
  disciplineId: number;
  chapterId: number;
  lessonId: number;
  completed: boolean;
  score?: number;
  completedAt?: Date;
}

export interface QuizSubmitRequest {
  lessonId: number;
  answers: { problemId: number; choiceId: number }[];
}

export interface QuizSubmitResponse {
  lessonId: number;
  score: number;
  totalPoints: number;
  correctAnswers: number;
  totalQuestions: number;
  results: QuizResult[];
}

export interface QuizResult {
  problemId: number;
  question: string;
  selectedChoice: number;
  correctChoice: number;
  isCorrect: boolean;
  explanation?: string;
}

// ============================================
// Payment Types
// ============================================

export interface SubscriptionRequest {
  tier: 'starter' | 'pro' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
  paymentMethod: 'stripe' | 'paymob';
}

export interface SubscriptionResponse {
  subscriptionId: string;
  tier: string;
  status: string;
  amount: number;
  currency: string;
  paymentUrl?: string;
  clientSecret?: string;
}

export interface PaymentWebhookPayload {
  provider: 'stripe' | 'paymob';
  eventType: string;
  data: unknown;
}

// ============================================
// AI Types
// ============================================

export interface AIChatRequest {
  provider: 'deepseek' | 'qwen' | 'together';
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIChatResponse {
  provider: string;
  model: string;
  message: ChatMessage;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// ============================================
// Project Types
// ============================================

export interface ProjectCreateRequest {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  templateId?: number;
}

export interface ProjectResponse {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  budget: number | null;
  members: ProjectMemberResponse[];
  createdAt: Date;
}

export interface ProjectMemberResponse {
  userId: number;
  userName: string;
  role: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// File Upload Types
// ============================================

export interface FileUploadResponse {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

// ============================================
// Price Types
// ============================================

export interface PriceConfigResponse {
  service: string;
  tier: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
}

// ============================================
// Canvas Types
// ============================================

export interface CanvasSaveRequest {
  name: string;
  type: 'diagram' | 'workflow' | 'circuit';
  data: string; // JSON string
  thumbnail?: string;
  isPublic?: boolean;
}

export interface CanvasResponse {
  id: number;
  name: string;
  type: string;
  data: string;
  thumbnail: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
