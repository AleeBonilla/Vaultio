import { ArrowDownUp } from "lucide-react";

interface SortSelectProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  label?: string;
}

export function SortSelect<T extends string>({ value, onChange, options, label = "Ordenar" }: SortSelectProps<T>) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/90 px-3 py-2 shadow-sm shadow-blue-900/5 transition-colors focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-500/20">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <ArrowDownUp className="h-4 w-4" />
      </span>
      <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 sm:inline">{label}</span>
      <select
        aria-label="Ordenar resultados"
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="cursor-pointer rounded-full border-0 bg-transparent py-1.5 pl-1 pr-7 text-sm font-semibold text-slate-900 outline-none focus:ring-0"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
