import { Check } from "lucide-react";
import { useState } from "react";
import CurrencySelector from "../../components/ui/CurrencySelector";
import PrimaryButton from "../../components/ui/PrimaryButton";
import MockPaymentModal from "../../components/ui/MockPaymentModal";
import { useCurrency } from "../../hooks/useCurrency";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    key: "free",
    features: ["3 recipes", "5 AI requests/day", "Limited analytics"]
  },
  {
    name: "Pro",
    key: "pro",
    features: ["20 recipes", "30 AI requests/day", "Operational costing", "AI pricing suggestions"]
  },
  {
    name: "Premium",
    key: "premium",
    features: ["Unlimited recipes", "Unlimited AI requests", "Full analytics", "AI generated reports"]
  }
];

export default function PricingPage() {
  const { region, formatNative } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelectPlan = (plan) => {
    if (!user) {
      navigate("/register");
      return;
    }
    if (user.subscription_plan === plan.key) return; // Already on this plan
    setSelectedPlan(plan);
  };

  const handlePaymentSuccess = () => {
    // Optionally refresh the page or show a toast
    window.location.href = "/app";
  };

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Simple subscription pricing</h1>
        <CurrencySelector />
      </div>
      <p className="mt-3 text-center text-slate-600">Choose the plan that matches your restaurant growth stage.</p>
      <p className="mt-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
        Auto-detected region: {region.label}
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map((plan, index) => (
          <div
            key={plan.name}
            className={`glass-card flex flex-col p-7 ${index === 1 ? "border-brand-300 ring-2 ring-brand-100" : ""}`}
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{plan.name}</p>
            <p className="mt-4 text-4xl font-extrabold text-slate-900">{formatNative(region.planPrices[plan.key])}</p>
            <p className="text-sm text-slate-500">per month</p>
            <ul className="mt-6 space-y-3 mb-6 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                  <Check size={16} className="text-brand-600" /> {feature}
                </li>
              ))}
            </ul>
            <PrimaryButton 
              onClick={() => handleSelectPlan(plan)}
              disabled={user?.subscription_plan === plan.key}
              className="w-full mt-auto"
            >
              {user?.subscription_plan === plan.key ? "Current Plan" : `Upgrade to ${plan.name}`}
            </PrimaryButton>
          </div>
        ))}
      </div>
      
      <MockPaymentModal 
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        plan={selectedPlan}
        amount={selectedPlan ? region.planPrices[selectedPlan.key] : 0}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
