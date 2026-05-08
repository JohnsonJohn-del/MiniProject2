import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    features: ["3 recipes", "5 AI requests/day", "Limited analytics"]
  },
  {
    name: "Pro",
    price: "$39",
    features: ["20 recipes", "30 AI requests/day", "Operational costing", "AI pricing suggestions"]
  },
  {
    name: "Premium",
    price: "$99",
    features: ["Unlimited recipes", "Unlimited AI requests", "Full analytics", "AI generated reports"]
  }
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pb-16 pt-8">
      <h1 className="text-center text-4xl font-extrabold tracking-tight text-slate-900">Simple subscription pricing</h1>
      <p className="mt-3 text-center text-slate-600">Choose the plan that matches your restaurant growth stage.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map((plan, index) => (
          <div
            key={plan.name}
            className={`glass-card p-7 ${index === 1 ? "border-brand-300 ring-2 ring-brand-100" : ""}`}
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{plan.name}</p>
            <p className="mt-4 text-4xl font-extrabold text-slate-900">{plan.price}</p>
            <p className="text-sm text-slate-500">per month</p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                  <Check size={16} className="text-brand-600" /> {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
