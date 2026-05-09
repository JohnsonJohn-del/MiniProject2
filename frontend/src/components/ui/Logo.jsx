export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 text-white font-bold shadow-sm">S</div>
      <div>
        <p className="text-sm font-semibold leading-tight text-slate-900">Smart Food Costing</p>
        <p className="text-xs text-slate-500">AI Pricing Advisor</p>
      </div>
    </div>
  );
}
