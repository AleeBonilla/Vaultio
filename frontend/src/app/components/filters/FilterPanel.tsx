import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterSection {
  title: string;
  type: 'checkbox' | 'radio';
  options: FilterOption[];
}

interface FilterPanelProps {
  sections: FilterSection[];
  onClose?: () => void;
}

export function FilterPanel({ sections, onClose }: FilterPanelProps) {
  return (
    <div className="bg-white border border-[#E0E0E0] rounded-lg p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[#1a1a1a]">Filtros</h3>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-[#F5F7FA] rounded">
            <X className="w-4 h-4 text-[#666666]" />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h4 className="text-sm font-semibold text-[#1a1a1a] mb-3">{section.title}</h4>
            <div className="space-y-2.5">
              {section.options.map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type={section.type}
                    name={section.title}
                    value={option.value}
                    className="w-4 h-4 text-[#0066CC] border-[#E0E0E0] rounded focus:ring-2 focus:ring-[#0066CC]"
                  />
                  <span className="text-sm text-[#666666] group-hover:text-[#1a1a1a] flex-1">
                    {option.label}
                  </span>
                  {option.count !== undefined && (
                    <span className="text-xs text-[#999999]">({option.count})</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-6 pt-5 border-t border-[#E0E0E0]">
        <Button variant="ghost" size="sm" className="flex-1">
          Limpiar
        </Button>
        <Button variant="primary" size="sm" className="flex-1">
          Aplicar
        </Button>
      </div>
    </div>
  );
}
