import { Shield, Radio, Globe, Info } from 'lucide-react';

interface SettingsCardProps {
  title: string;
  icon: 'shield' | 'radio' | 'globe' | 'info';
  summary: string;
  onClick?: () => void;
}

export function SettingsCard({ title, icon, summary, onClick }: SettingsCardProps) {
  const icons = {
    shield: Shield,
    radio: Radio,
    globe: Globe,
    info: Info,
  };

  const Icon = icons[icon];

  return (
    <button
      onClick={onClick}
      className="w-full h-full border-2 border-black rounded-sm bg-[#838383] hover:bg-black transition-colors duration-150 flex flex-col items-start justify-between p-5 group active:scale-[0.97]"
    >
      <Icon className="w-12 h-12 text-black group-hover:text-[#838383] transition-colors mb-auto" strokeWidth={2.5} />
      <div className="text-left w-full">
        <div className="font-bold text-xl text-black group-hover:text-[#838383] uppercase tracking-tight leading-tight">{title}</div>
        <div className="text-lg leading-snug mt-1 text-black group-hover:text-[#838383] font-normal">{summary}</div>
      </div>
    </button>
  );
}