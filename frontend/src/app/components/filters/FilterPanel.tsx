import { X } from "lucide-react";
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
    <div className="bg-white border border-[#E0E0E0] rounded-lg p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[#1a1a1a]">Filtros</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="p-1 hover:bg-[#F5F7FA] rounded"
          >
            <X className="w-4 h-4 text-[#666666]" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        <fieldset>
          <legend className="text-sm font-semibold text-[#1a1a1a] mb-3">Tipo de recurso</legend>
          <div className="space-y-2.5">
            {typeOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={values.types.includes(option.value)}
                  onChange={() => toggleType(option.value)}
                  className="w-4 h-4 text-[#0066CC] border-[#E0E0E0] rounded focus:ring-2 focus:ring-[#0066CC]"
                />
                <span className="text-sm text-[#666666] group-hover:text-[#1a1a1a] flex-1">{option.label}</span>
                {option.count !== undefined && <span className="text-xs text-[#999999]">({option.count})</span>}
              </label>
            ))}
            {typeOptions.length === 0 && <p className="text-sm text-[#999999]">Sin tipos disponibles</p>}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-[#1a1a1a] mb-3">Calificación mínima</legend>
          <div className="space-y-2.5">
            {RATING_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="minRating"
                  checked={values.minRating === option.value}
                  onChange={() => onChange({ ...values, minRating: option.value })}
                  className="w-4 h-4 text-[#0066CC] border-[#E0E0E0] focus:ring-2 focus:ring-[#0066CC]"
                />
                <span className="text-sm text-[#666666] group-hover:text-[#1a1a1a]">{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 pt-5 border-t border-[#E0E0E0]">
        <Button variant="ghost" size="sm" className="w-full" onClick={() => onClear?.()}>
          Limpiar filtros
        </Button>
      </div>
    </div>
  );
}
