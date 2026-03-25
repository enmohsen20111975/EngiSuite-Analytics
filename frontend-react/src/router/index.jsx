import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import {
  DashboardPage, LoginPage, RegisterPage, PlaceholderPage,
  CalculatorsPage, PipelinesPage, ReportsPage,
  ProfilePage, SettingsPage, LearningPage,
  AnalyticsPage, AIAssistantPage, PricingPage, BlogPage,
  VisualWorkflowPage, UnitConverterPage, SubscriptionPage,
  VerifyEmailPage, PrivacyPage, TermsPage, ApiDocsPage, CableSizingPage,
  ProjectsPage, ProjectDetailPage, DiagramStudioPage,
  LogicSimulatorPage, PDFEditorPage, VisualDataAnalysisPage,
  AdminDashboardPage, AdminUsersPage, AdminEquationsPage,
  AdminCalculatorsPage, AdminAIPage, AdminFinancialPage,
  AdminPricesPage, AdminSettingsPage, AdminSystemPage
} from '../pages';
import ScientificCalculatorPage from '../pages/ScientificCalculatorPage';
import AuthCallbackPage from '../pages/AuthCallbackPage';
// VDA Pages (Visual Data Analysis)
import DataUploadPage from '../pages/DataUploadPage';
import VisualQueryBuilderPage from '../pages/VisualQueryBuilderPage';
import VisualReportBuilderPage from '../pages/VisualReportBuilderPage';
import VisualDashboardBuilderPage from '../pages/VisualDashboardBuilderPage';
// Simulator Pages
import HydraulicSimulatorPage from '../pages/HydraulicSimulatorPage';
import ElectricalSimulatorPage from '../pages/ElectricalSimulatorPage';
import ElectricalSimulator2Page from '../pages/ElectricalSimulator2Page';
import FluidSimulatorPage from '../pages/FluidSimulatorPage';

/**
 * Application router configuration
 */
export const router = createBrowserRouter([
  // Auth routes (no layout)
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <PlaceholderPage title="Forgot Password" description="Password reset page coming soon." />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },

  // Full screen tool routes (no layout)
  {
    path: '/diagram-studio',
    element: <DiagramStudioPage />,
  },
  {
    path: '/logic-simulator',
    element: <LogicSimulatorPage />,
  },
  {
    path: '/logic-sim',
    element: <LogicSimulatorPage />,
  },
  {
    path: '/pdf-editor',
    element: <PDFEditorPage />,
  },
  {
    path: '/data-analysis',
    element: <VisualDataAnalysisPage />,
  },
  {
    path: '/visual-data-analysis',
    element: <VisualDataAnalysisPage />,
  },
  {
    path: '/data-upload',
    element: <DataUploadPage />,
  },
  {
    path: '/visual-query-builder',
    element: <VisualQueryBuilderPage />,
  },
  {
    path: '/visual-report-builder',
    element: <VisualReportBuilderPage />,
  },
  {
    path: '/visual-dashboard-builder',
    element: <VisualDashboardBuilderPage />,
  },

  // Protected routes (with layout)
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },

      // Dashboard
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },

      // Calculators
      {
        path: '/calculators',
        element: <CalculatorsPage />,
      },

      // Engineering Calculator
      {
        path: '/engineering-calculator',
        element: <ScientificCalculatorPage />,
      },

      // Pipelines
      {
        path: '/pipelines',
        element: <PipelinesPage />,
      },

      // Visual Workflow
      {
        path: '/visual-workflow',
        element: <VisualWorkflowPage />,
      },

      // Cable Sizing
      {
        path: '/cable-sizing',
        element: <CableSizingPage />,
      },

      // Hydraulic Simulator
      {
        path: '/simulators/hydraulic',
        element: <HydraulicSimulatorPage />,
      },

      // Electrical Simulator
      {
        path: '/simulators/electrical',
        element: <ElectricalSimulatorPage />,
      },

      // Electrical Simulator 2 (Google AI Studio)
      {
        path: '/simulators/electrical2',
        element: <ElectricalSimulator2Page />,
      },

      // Fluid Simulator (Google AI Studio)
      {
        path: '/simulators/fluid',
        element: <FluidSimulatorPage />,
      },

      // Reports
      {
        path: '/reports',
        element: <ReportsPage />,
      },

      // Projects
      {
        path: '/projects',
        element: <ProjectsPage />,
      },
      {
        path: '/projects/:projectId',
        element: <ProjectDetailPage />,
      },

      // Learning
      {
        path: '/learning',
        element: <LearningPage />,
      },

      // Pricing
      {
        path: '/pricing',
        element: <PricingPage />,
      },

      // Subscription
      {
        path: '/subscription',
        element: <SubscriptionPage />,
      },

      // Blog
      {
        path: '/blog',
        element: <BlogPage />,
      },

      // Analytics
      {
        path: '/analytics',
        element: <AnalyticsPage />,
      },

      // AI Assistant
      {
        path: '/ai-assistant',
        element: <AIAssistantPage />,
      },

      // Unit Converter
      {
        path: '/unit-converter',
        element: <UnitConverterPage />,
      },

      // API Docs
      {
        path: '/api-docs',
        element: <ApiDocsPage />,
      },

      // Profile
      {
        path: '/profile',
        element: <ProfilePage />,
      },

      // Settings
      {
        path: '/settings',
        element: <SettingsPage />,
      },

      // Admin Routes
      {
        path: '/admin',
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: '/admin/dashboard',
        element: <AdminDashboardPage />,
      },
      {
        path: '/admin/users',
        element: <AdminUsersPage />,
      },
      {
        path: '/admin/equations',
        element: <AdminEquationsPage />,
      },
      {
        path: '/admin/calculators',
        element: <AdminCalculatorsPage />,
      },
      {
        path: '/admin/ai',
        element: <AdminAIPage />,
      },
      {
        path: '/admin/financial',
        element: <AdminFinancialPage />,
      },
      {
        path: '/admin/prices',
        element: <AdminPricesPage />,
      },
      {
        path: '/admin/settings',
        element: <AdminSettingsPage />,
      },
      {
        path: '/admin/system',
        element: <AdminSystemPage />,
      },

    ],
  },

  // Redirects
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // 404
  {
    path: '*',
    element: <PlaceholderPage title="404" description="Page not found. The page you're looking for doesn't exist." />,
  },
]);

export default router;
