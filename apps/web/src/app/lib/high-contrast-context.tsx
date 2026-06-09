import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "vaultio-high-contrast";

interface HighContrastContextValue {
  highContrast: boolean;
  toggleHighContrast: () => void;
  setHighContrast: (enabled: boolean) => void;
}

const HighContrastContext = createContext<HighContrastContextValue | null>(null);

function readInitialPreference() {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "true") return true;
  if (stored === "false") return false;
  return window.matchMedia?.("(prefers-contrast: more)").matches ?? false;
}

export function HighContrastProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = useState(readInitialPreference);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
    document.documentElement.setAttribute("data-contrast", highContrast ? "high" : "normal");
    window.localStorage.setItem(STORAGE_KEY, String(highContrast));
  }, [highContrast]);

  const value = useMemo(
    () => ({
      highContrast,
      setHighContrast,
      toggleHighContrast: () => setHighContrast((current) => !current),
    }),
    [highContrast],
  );

  return <HighContrastContext.Provider value={value}>{children}</HighContrastContext.Provider>;
}

export function useHighContrast() {
  const context = useContext(HighContrastContext);
  if (!context) throw new Error("useHighContrast debe usarse dentro de HighContrastProvider");
  return context;
}
