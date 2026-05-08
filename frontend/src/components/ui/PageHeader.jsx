export default function PageHeader({ title, description, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}
