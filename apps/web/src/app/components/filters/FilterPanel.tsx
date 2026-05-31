import { useEffect, useId, useMemo, useRef, useState } from "react";
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
  { label: "Todas las calificaciones", shortLabel: "Todas", value: 0 },
  { label: "1 estrella", value: 1 },
  { label: "2 estrellas", value: 2 },
  { label: "3 estrellas", value: 3 },
  { label: "4 estrellas", value: 4 },
  { label: "5 estrellas", value: 5 },
];

const KIND_OPTIONS = [
  { label: "Todos", value: "", description: "Mostrar archivos y links" },
  { label: "Archivos", value: "file", description: "Mostrar solo recursos subidos como archivo" },
  { label: "Links", value: "link", description: "Mostrar solo recursos guardados como enlace externo" },
] as const;

function SearchSelect({
  id,
  label,
  value,
  options,
  placeholder,
  emptyOptionLabel,
  emptyOptionDescription,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  placeholder: string;
  emptyOptionLabel?: string;
  emptyOptionDescription?: string;
  onChange: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();
  const [query, setQuery] = useState(selected?.label || "");
  const [open, setOpen] = useState(false);
  const hintId = useId();

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
    if (!normalized || selected?.label === query) return [];
    return options
      .filter((option) => `${option.label} ${option.description || ""}`.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [options, query, selected?.label]);

  const hasEmptyOption = Boolean(emptyOptionLabel);
  const hasVisibleOptions = hasEmptyOption || matches.length > 0;

  return (
    <div
      ref={containerRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-900">
        {label}
      </label>
      <div className="flex rounded-xl border border-blue-100 bg-white focus-within:ring-2 focus-within:ring-blue-500">
        <input
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-describedby={hintId}
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
      <p id={hintId} className="sr-only">
        Escriba para buscar opciones. Use Tab para moverse por las opciones mostradas y Enter para
        seleccionar una.
      </p>
      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={`Opciones de ${label}`}
          className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-blue-100 bg-white p-1 shadow-xl shadow-blue-900/10"
        >
          {hasEmptyOption && (
            <button
              type="button"
              role="option"
              aria-selected={!value}
              onClick={() => {
                onChange("");
                setQuery("");
                setOpen(false);
              }}
              className="w-full rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="block font-medium text-slate-900">{emptyOptionLabel}</span>
              {emptyOptionDescription && (
                <span className="block text-xs text-slate-500">{emptyOptionDescription}</span>
              )}
            </button>
          )}
          {!hasVisibleOptions ? (
            <p className="px-3 py-2 text-sm text-slate-500">Sin resultados</p>
          ) : (
            matches.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setQuery(option.label);
                  setOpen(false);
                }}
                className="w-full rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
          emptyOptionLabel="Sin profesor"
          emptyOptionDescription="No filtrar por profesor. Muestra recursos con y sin profesor asignado."
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
              <button
                key={option.value}
                type="button"
                aria-pressed={values.kind === option.value}
                aria-label={`${option.label}. ${option.description}`}
                onClick={() => onChange({ ...values, kind: option.value })}
                className={`rounded-xl px-3 py-2 text-center text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  values.kind === option.value
                    ? "bg-blue-50 text-blue-900"
                    : "bg-white text-slate-600 hover:bg-blue-50/50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-slate-900">Calificacion minima</legend>
          <div className="grid grid-cols-2 gap-2">
            {RATING_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={values.minRating === option.value}
                aria-label={
                  option.value === 0
                    ? "Mostrar recursos con cualquier calificacion"
                    : `Mostrar recursos con calificacion minima de ${option.label}`
                }
                onClick={() => onChange({ ...values, minRating: option.value })}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  values.minRating === option.value ? "bg-blue-50 text-blue-900" : "hover:bg-blue-50/50"
                }`}
              >
                {option.value === 0 ? (
                  <span className="text-sm text-slate-600">{option.shortLabel}</span>
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
              </button>
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
