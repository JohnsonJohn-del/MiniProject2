import { motion } from "framer-motion";

export default function PrimaryButton({ children, className = "", ...props }) {
  return (
    <motion.button
      {...props}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ y: 0, scale: 0.985 }}
      transition={{ type: "spring", stiffness: 360, damping: 22, mass: 0.7 }}
      className={`ui-button-interactive inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:from-brand-700 hover:to-violet-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {children}
    </motion.button>
  );
}
