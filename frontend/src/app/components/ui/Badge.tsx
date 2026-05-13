interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'purple' | 'orange' | 'gray' | 'red';
  className?: string;
}

export function Badge({ children, variant = 'blue', className = '' }: BadgeProps) {
  const variants = {
    blue: 'bg-[#E3F2FD] text-[#0066CC] border border-[#0066CC]/20',
    green: 'bg-green-50 text-green-700 border border-green-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border border-orange-200',
    gray: 'bg-gray-100 text-[#666666] border border-[#E0E0E0]',
    red: 'bg-red-50 text-red-700 border border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}