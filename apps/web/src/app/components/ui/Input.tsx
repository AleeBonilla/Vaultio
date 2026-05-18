import { InputHTMLAttributes, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", id, required, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-sm font-medium text-slate-900">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
        className={`w-full rounded-md border border-blue-100 bg-white px-4 py-2.5 transition-colors focus:outline-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? "border-red-600" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
