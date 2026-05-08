import { motion } from "framer-motion";

export default function PrimaryButton({ children, className = "", ...props }) {
  return (
    <motion.button
      {...props}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ y: 0, scale: 0.985 }}
      transition={{ type: "spring", stiffness: 360, damping: 22, mass: 0.7 }}
      className={`ui-button-interactive inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </motion.button>
  );
}
