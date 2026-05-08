export function SkeletonCard({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />;
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-11 animate-pulse rounded-xl bg-slate-200/60" />
      ))}
    </div>
  );
}
