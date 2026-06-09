import { Contrast } from "lucide-react";
import { useHighContrast } from "../../lib/high-contrast-context";

interface HighContrastToggleProps {
  compact?: boolean;
  className?: string;
}

export function HighContrastToggle({ compact = false, className = "" }: HighContrastToggleProps) {
  const { highContrast, toggleHighContrast } = useHighContrast();
  const label = highContrast ? "Desactivar alto contraste" : "Activar alto contraste";

  return (
    <button
      type="button"
      aria-pressed={highContrast}
      aria-label={label}
      onClick={toggleHighContrast}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-900/5 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
    >
      <Contrast aria-hidden="true" className="h-4 w-4" />
      <span className={compact ? "sr-only sm:not-sr-only" : ""}>{label}</span>
    </button>
  );
}
