import { useEffect, useMemo, useRef, useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "../ui/Button";

export interface FilterOption {
  label: string;
  value: string;
  description?: string;
  count?: number;
}

export interface FilterValues {
  typeId: string;
  careerId: string;
  courseId: string;
  professorId: string;
  academicPeriodId: string;
  minRating: number;
  kind: "" | "file" | "link";
}

interface FilterPanelProps {
  typeOptions: FilterOption[];
  careerOptions: FilterOption[];
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
  { label: "1+ estrella", value: 1 },
  { label: "2+ estrellas", value: 2 },
  { label: "3+ estrellas", value: 3 },
  { label: "4+ estrellas", value: 4 },
  { label: "5 estrellas", value: 5 },
];

const KIND_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Archivos", value: "file" },
  { label: "Links", value: "link" },
] as const;

function SearchSelect({
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
  const selected = options.find((option) => option.value === value);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState(selected?.label || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(selected?.label || "");
  }, [selected?.label]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized || selected?.label === query) return options.slice(0, 8);
    return options
      .filter((option) => `${option.label} ${option.description || ""}`.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [options, query, selected?.label]);

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-900">
        {label}
      </label>
      <div className="flex rounded-xl border border-blue-100 bg-white focus-within:ring-2 focus-within:ring-blue-500">
        <input
          id={id}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (value) onChange("");
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl bg-transparent px-3 py-2 text-sm text-slate-700 outline-none"
        />
        {value && (
          <button
            type="button"
            aria-label={`Limpiar ${label}`}
            onClick={() => {
              onChange("");
              setQuery("");
              setOpen(false);
            }}
            className="px-3 text-slate-400 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-blue-100 bg-white p-1 shadow-xl shadow-blue-900/10">
          {matches.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">Sin resultados</p>
          ) : (
            matches.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setQuery(option.label);
                  setOpen(false);
                }}
                className="w-full rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-blue-50"
              >
                <span className="block font-medium text-slate-900">{option.label}</span>
                {option.description && (
                  <span className="block text-xs text-slate-500">{option.description}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

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
  careerOptions,
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
      <div className="mb-5 flex items-center justify-between">
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

      <div className="space-y-5">
        <SelectFilter
          id="filter-type"
          label="Tipo de recurso"
          value={values.typeId}
          options={typeOptions}
          placeholder="Todos los tipos"
          onChange={(typeId) => onChange({ ...values, typeId })}
        />
        {careerOptions.length > 0 && (
          <SearchSelect
            id="filter-career"
            label="Carrera"
            value={values.careerId}
            options={careerOptions}
            placeholder="Buscar por carrera..."
            onChange={(careerId) => onChange({ ...values, careerId })}
          />
        )}
        {courseOptions.length > 0 && (
          <SearchSelect
            id="filter-course"
            label="Curso"
            value={values.courseId}
            options={courseOptions}
            placeholder="Buscar por codigo o nombre..."
            onChange={(courseId) => onChange({ ...values, courseId })}
          />
        )}
        <SearchSelect
          id="filter-professor"
          label="Profesor"
          value={values.professorId}
          options={professorOptions}
          placeholder="Buscar profesor..."
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
          <legend className="mb-3 text-sm font-semibold text-slate-900">Origen</legend>
          <div className="grid grid-cols-3 gap-2">
            {KIND_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`cursor-pointer rounded-xl px-3 py-2 text-center text-sm transition-colors ${
                  values.kind === option.value
                    ? "bg-blue-50 text-blue-900"
                    : "bg-white text-slate-600 hover:bg-blue-50/50"
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
          <legend className="mb-3 text-sm font-semibold text-slate-900">Calificacion minima</legend>
          <div className="grid grid-cols-2 gap-2">
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
                {option.value === 0 ? (
                  <span className="text-sm text-slate-600">{option.label}</span>
                ) : (
                  <span
                    className="inline-flex items-center gap-0.5 text-sm text-slate-600"
                    aria-label={option.label}
                  >
                    {Array.from({ length: option.value }, (_, index) => (
                      <Star key={index} className="h-3.5 w-3.5 fill-blue-500 text-blue-500" />
                    ))}
                  </span>
                )}
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
