import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const LandingPage = lazy(() => import("./pages/public/LandingPage"));
const PricingPage = lazy(() => import("./pages/public/PricingPage"));
const LoginPage = lazy(() => import("./pages/public/LoginPage"));
const RegisterPage = lazy(() => import("./pages/public/RegisterPage"));
const PagesDirectoryPage = lazy(() => import("./pages/public/PagesDirectoryPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const ClientDashboardPage = lazy(() => import("./pages/client/ClientDashboardPage"));
const IngredientsPage = lazy(() => import("./pages/client/IngredientsPage"));
const RecipesPage = lazy(() => import("./pages/client/RecipesPage"));
const PricingAdvisorPage = lazy(() => import("./pages/client/PricingAdvisorPage"));
const OperationalCostsPage = lazy(() => import("./pages/client/OperationalCostsPage"));
const AnalyticsPage = lazy(() => import("./pages/client/AnalyticsPage"));
const SubscriptionPage = lazy(() => import("./pages/client/SubscriptionPage"));
const ImportPage = lazy(() => import("./pages/client/ImportPage"));

const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const UsersPage = lazy(() => import("./pages/admin/UsersPage"));
const ReportsPage = lazy(() => import("./pages/admin/ReportsPage"));
const SubscriptionsPage = lazy(() => import("./pages/admin/SubscriptionsPage"));
const RecipesAdminPage = lazy(() => import("./pages/admin/RecipesAdminPage"));
const IngredientsAdminPage = lazy(() => import("./pages/admin/IngredientsAdminPage"));
const AiUsagePage = lazy(() => import("./pages/admin/AiUsagePage"));

function RouteLoader() {
  return (
    <div className="grid min-h-[55vh] place-items-center px-6">
      <div className="glass-card w-full max-w-lg p-6 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        <p className="mt-4 text-sm font-medium text-slate-600">Loading workspace...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/pages" element={<PagesDirectoryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute roles={["client"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/app" element={<ClientDashboardPage />} />
            <Route path="/app/ingredients" element={<IngredientsPage />} />
            <Route path="/app/recipes" element={<RecipesPage />} />
            <Route path="/app/operational-costs" element={<OperationalCostsPage />} />
            <Route path="/app/pricing-advisor" element={<PricingAdvisorPage />} />
            <Route path="/app/analytics" element={<AnalyticsPage />} />
            <Route path="/app/subscription" element={<SubscriptionPage />} />
            <Route path="/app/import" element={<ImportPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/admin/recipes" element={<RecipesAdminPage />} />
            <Route path="/admin/ingredients" element={<IngredientsAdminPage />} />
            <Route path="/admin/ai-usage" element={<AiUsagePage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />
      </Routes>
    </Suspense>
  );
}
