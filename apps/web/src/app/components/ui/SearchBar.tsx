import { Search } from "lucide-react";
import { InputHTMLAttributes, useId } from "react";

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  large?: boolean;
  label?: string;
}

export function SearchBar({ large = false, className = "", label = "Buscar", id, ...props }: SearchBarProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const { "aria-describedby": ariaDescribedBy, ...inputProps } = props;
  const describedBy = [ariaDescribedBy, hintId].filter(Boolean).join(" ");

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <p id={hintId} className="sr-only">
        Escriba terminos de busqueda y presione Enter para ver resultados.
      </p>
      <Search
        aria-hidden="true"
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 ${large ? "w-5 h-5" : "w-4 h-4"}`}
      />
      <input
        id={inputId}
        type="search"
        aria-describedby={describedBy}
        className={`w-full rounded-full border border-blue-100 bg-white/85 shadow-sm shadow-blue-900/5 transition-colors focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 ${
          large ? "pl-12 pr-4 py-3.5 text-lg" : "pl-10 pr-4 py-2"
        }`}
        placeholder="Buscar cursos, recursos, temas..."
        {...inputProps}
      />
    </div>
  );
}
