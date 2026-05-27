import { motion } from "framer-motion";

export default function Toggle({ enabled, onChange, className = "" }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
        enabled ? "bg-brand-600" : "bg-slate-200"
      } ${className}`}
    >
      <span className="sr-only">Enable AI Assistance</span>
      <motion.span
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
      />
    </button>
  );
}
