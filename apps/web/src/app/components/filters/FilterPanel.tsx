import { X } from "lucide-react";
import { Button } from "../ui/Button";

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterValues {
  typeId: string;
  courseId: string;
  professorId: string;
  academicPeriodId: string;
  minRating: number;
  kind: "" | "file" | "link";
}

interface FilterPanelProps {
  typeOptions: FilterOption[];
  courseOptions: FilterOption[];
  professorOptions: FilterOption[];
  periodOptions: FilterOption[];
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

const KIND_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Archivos", value: "file" },
  { label: "Links", value: "link" },
] as const;

function SelectFilter({
  id,
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-900">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FilterPanel({
  typeOptions,
  courseOptions,
  professorOptions,
  periodOptions,
  values,
  onChange,
  onClose,
  onClear,
}: FilterPanelProps) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white/90 p-5 shadow-sm shadow-blue-900/5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-slate-900">Filtros</h3>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Cerrar filtros" className="rounded p-1 hover:bg-blue-50">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        )}
      </div>

      <div className="space-y-5">
        <SelectFilter
          id="filter-type"
          label="Tipo de recurso"
          value={values.typeId}
          options={typeOptions}
          placeholder="Todos los tipos"
          onChange={(typeId) => onChange({ ...values, typeId })}
        />
        <SelectFilter
          id="filter-course"
          label="Curso"
          value={values.courseId}
          options={courseOptions}
          placeholder="Todos los cursos"
          onChange={(courseId) => onChange({ ...values, courseId })}
        />
        <SelectFilter
          id="filter-professor"
          label="Profesor"
          value={values.professorId}
          options={professorOptions}
          placeholder="Todos los profesores"
          onChange={(professorId) => onChange({ ...values, professorId })}
        />
        <SelectFilter
          id="filter-period"
          label="Semestre"
          value={values.academicPeriodId}
          options={periodOptions}
          placeholder="Todos los semestres"
          onChange={(academicPeriodId) => onChange({ ...values, academicPeriodId })}
        />

        <fieldset>
          <legend className="text-sm font-semibold text-slate-900 mb-3">Origen</legend>
          <div className="grid grid-cols-3 gap-2">
            {KIND_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-xl px-3 py-2 text-center text-sm transition-colors ${
                  values.kind === option.value ? "bg-blue-50 text-blue-900" : "bg-white text-slate-600 hover:bg-blue-50/50"
                } focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2`}
              >
                <input
                  type="radio"
                  name="kind"
                  checked={values.kind === option.value}
                  onChange={() => onChange({ ...values, kind: option.value })}
                  className="sr-only"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-semibold text-slate-900 mb-3">Calificacion minima</legend>
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
                <span className="text-sm text-slate-600">{option.label}</span>
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
