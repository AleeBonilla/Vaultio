import { X } from "lucide-react";
import { ResourceTypeIcon } from "../resources/ResourceTypeIcon";
import { Button } from "../ui/Button";

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterValues {
  types: string[];
  minRating: number;
}

interface FilterPanelProps {
  typeOptions: FilterOption[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onClose?: () => void;
  onClear?: () => void;
}

const RATING_OPTIONS = [
  { label: "Todas", value: 0 },
  { label: "3+ estrellas", value: 3 },
  { label: "4+ estrellas", value: 4 },
];

export function FilterPanel({ typeOptions, values, onChange, onClose, onClear }: FilterPanelProps) {
  const toggleType = (option: string) => {
    const next = values.types.includes(option)
      ? values.types.filter((item) => item !== option)
      : [...values.types, option];
    onChange({ ...values, types: next });
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm shadow-blue-900/5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-slate-900">Filtros</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="rounded p-1 hover:bg-blue-50"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        <fieldset>
          <legend className="text-sm font-semibold text-slate-900 mb-3">Tipo de recurso</legend>
          <div className="space-y-2.5">
            {typeOptions.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition-colors ${
                  values.types.includes(option.value)
                    ? "border-blue-200 bg-blue-50"
                    : "border-transparent hover:border-blue-100 hover:bg-blue-50/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={values.types.includes(option.value)}
                  onChange={() => toggleType(option.value)}
                  className="h-4 w-4 rounded border-blue-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <ResourceTypeIcon type={option.label} className="!rounded-lg !p-1.5" />
                <span className="flex-1 text-sm text-slate-600 group-hover:text-slate-900">{option.label}</span>
                {option.count !== undefined && <span className="text-xs text-slate-400">({option.count})</span>}
              </label>
            ))}
            {typeOptions.length === 0 && <p className="text-sm text-slate-400">Sin tipos disponibles</p>}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-slate-900 mb-3">Calificación mínima</legend>
          <div className="space-y-2.5">
            {RATING_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 transition-colors ${
                  values.minRating === option.value ? "bg-blue-50 text-blue-900" : "hover:bg-blue-50/50"
                }`}
              >
                <input
                  type="radio"
                  name="minRating"
                  checked={values.minRating === option.value}
                  onChange={() => onChange({ ...values, minRating: option.value })}
                  className="h-4 w-4 border-blue-100 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 border-t border-blue-100 pt-5">
        <Button variant="ghost" size="sm" className="w-full" onClick={() => onClear?.()}>
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
