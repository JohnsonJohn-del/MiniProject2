import { createContext, useContext, useState, useEffect } from "react";

const AiContext = createContext(null);

export function AiProvider({ children }) {
  const [aiEnabled, setAiEnabled] = useState(() => {
    const saved = localStorage.getItem("ai_assistance");
    return saved === null ? true : saved === "true"; // Default to true for premium feel
  });

  const toggleAi = (val) => {
    setAiEnabled(val);
    localStorage.setItem("ai_assistance", val ? "true" : "false");
  };

  return (
    <AiContext.Provider value={{ aiEnabled, toggleAi }}>
      {children}
    </AiContext.Provider>
  );
}

export const useAi = () => {
  const context = useContext(AiContext);
  if (!context) throw new Error("useAi must be used within an AiProvider");
  return context;
};
