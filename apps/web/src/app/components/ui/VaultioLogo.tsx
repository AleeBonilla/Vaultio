import { useId } from "react";

interface VaultioLogoProps {
  textClassName?: string;
  iconClassName?: string;
}

export function VaultioLogo({ textClassName = "text-3xl", iconClassName = "h-9 w-9" }: VaultioLogoProps) {
  const gradientId = useId();

  return (
    <span className="inline-flex items-center gap-2">
      <svg
        viewBox="0 0 24 24"
        className={iconClassName}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill={`url(#${gradientId})`} />
      </svg>
      <span className={`font-extrabold tracking-tighter text-slate-900 lowercase ${textClassName}`}>
        vaultio
      </span>
    </span>
  );
}
