import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066CC] focus:border-[#0066CC] transition-colors bg-white ${
          error ? 'border-[#d32f2f]' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-2 text-sm text-[#d32f2f]">{error}</p>}
    </div>
  );
}