import { FlaskConical } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function DemoModeChip() {
  const { isDemo } = useAuth();
  if (!isDemo) return null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
      <FlaskConical size={12} /> Demo Mode
    </div>
  );
}
