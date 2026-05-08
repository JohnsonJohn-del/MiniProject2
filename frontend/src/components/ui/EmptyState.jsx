export default function EmptyState({ title, description, cta }) {
  return (
    <div className="glass-card p-10 text-center">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{description}</p>
      {cta ? <div className="mt-5">{cta}</div> : null}
    </div>
  );
}
