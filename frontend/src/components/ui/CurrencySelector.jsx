import { useCurrency } from "../../hooks/useCurrency";

function flagEmoji(flagCode) {
  if (flagCode === "EU") return "🇪🇺";
  return flagCode
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

export default function CurrencySelector({ compact = false }) {
  const { region, regionCode, regionOptions, setRegion } = useCurrency();

  return (
    <label className={`inline-flex items-center gap-2 ${compact ? "" : "rounded-xl border border-slate-200 bg-white px-3 py-2"}`}>
      {!compact ? <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</span> : null}
      <select
        value={regionCode}
        onChange={(event) => setRegion(event.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-brand-400"
        aria-label="Select pricing region"
      >
        {regionOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {`${flagEmoji(option.flag)} ${option.label} (${option.currency})`}
          </option>
        ))}
      </select>
      {compact ? (
        <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600">
          {flagEmoji(region.flag)} {region.currency}
        </span>
      ) : null}
    </label>
  );
}
