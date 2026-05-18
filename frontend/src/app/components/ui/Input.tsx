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
        <label htmlFor={inputId} className="block text-sm font-medium text-[#1a1a1a] mb-2">
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={errorId}
        className={`w-full px-4 py-2.5 border border-[#E0E0E0] rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:border-[#0066CC] transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-500 ${
          error ? "border-[#d32f2f]" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-2 text-sm text-[#d32f2f]">
          {error}
        </p>
      )}
    </div>
  );
}
