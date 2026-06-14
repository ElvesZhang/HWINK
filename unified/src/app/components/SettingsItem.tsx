import { ChevronRight } from 'lucide-react';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  hasToggle?: boolean;
  isEnabled?: boolean;
  variant?: 'default' | 'danger';
  onClick?: () => void;
}

export function SettingsItem({ 
  title, 
  subtitle, 
  hasToggle = false, 
  isEnabled = false,
  variant = 'default',
  onClick
}: SettingsItemProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full min-h-[70px] border-2 border-black rounded-sm bg-[#838383] hover:bg-black transition-colors duration-150 p-4 group active:scale-[0.98] flex items-center gap-4"
    >
      <div className="text-left flex-1 min-w-0">
        <div className={`font-bold text-xl leading-tight uppercase tracking-tight ${
          variant === 'danger'
            ? 'text-black group-hover:text-[#838383]'
            : 'text-black group-hover:text-[#838383]'
        }`}>
          {title}
        </div>
        {subtitle && (
          <div className="text-lg leading-snug mt-1 text-black group-hover:text-[#838383] font-normal">
            {subtitle}
          </div>
        )}
      </div>
      
      {hasToggle ? (
        <div className={`w-12 h-6 border-2 border-black relative transition-colors flex-shrink-0 ${
          isEnabled ? 'bg-black group-hover:bg-[#838383]' : 'bg-[#838383] group-hover:bg-black'
        }`}>
          <div className={`absolute top-0.5 w-4 h-4 transition-all ${
            isEnabled 
              ? 'right-0.5 bg-[#838383] group-hover:bg-black' 
              : 'left-0.5 bg-black group-hover:bg-[#838383]'
          }`} />
        </div>
      ) : (
        <ChevronRight className="w-5 h-5 text-black group-hover:text-[#838383] flex-shrink-0" strokeWidth={2.5} />
      )}
    </button>
  );
}