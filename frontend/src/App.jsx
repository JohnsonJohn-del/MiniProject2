import { Navigate, Route, Routes } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/public/LandingPage";
import PricingPage from "./pages/public/PricingPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ClientDashboardPage from "./pages/client/ClientDashboardPage";
import IngredientsPage from "./pages/client/IngredientsPage";
import RecipesPage from "./pages/client/RecipesPage";
import PricingAdvisorPage from "./pages/client/PricingAdvisorPage";
import OperationalCostsPage from "./pages/client/OperationalCostsPage";
import AnalyticsPage from "./pages/client/AnalyticsPage";
import SubscriptionPage from "./pages/client/SubscriptionPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import ReportsPage from "./pages/admin/ReportsPage";
import SubscriptionsPage from "./pages/admin/SubscriptionsPage";
import RecipesAdminPage from "./pages/admin/RecipesAdminPage";
import IngredientsAdminPage from "./pages/admin/IngredientsAdminPage";
import AiUsagePage from "./pages/admin/AiUsagePage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
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
  );
}
