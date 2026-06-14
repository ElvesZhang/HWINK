import { Wallet, History, Key, Settings } from 'lucide-react';

interface MenuCardProps {
  title: string;
  subtitle?: string;
  icon: 'wallet' | 'history' | 'key' | 'settings';
  onClick?: () => void;
}

export function MenuCard({ title, subtitle, icon, onClick }: MenuCardProps) {
  const icons = {
    wallet: Wallet,
    history: History,
    key: Key,
    settings: Settings,
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
        {subtitle && <div className="text-lg mt-1 text-black group-hover:text-[#838383] uppercase font-light leading-none">{subtitle}</div>}
      </div>
    </button>
  );
}