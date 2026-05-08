export default function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`ui-button-interactive inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
