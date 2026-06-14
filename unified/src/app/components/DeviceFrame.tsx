import { ReactNode } from 'react';

interface DeviceFrameProps {
  children: ReactNode;
}

export function DeviceFrame({ children }: DeviceFrameProps) {
  return (
    <div className="relative">
      {/* Device Body */}
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-[32px] p-6 shadow-2xl">
        {/* Screen Bezel */}
        <div className="bg-black rounded-[20px] p-2 shadow-inner">
          {/* Screen */}
          <div className="rounded-[12px] overflow-hidden shadow-lg">
            {children}
          </div>
        </div>
        
        {/* Brand Name */}
        <div className="absolute bottom-[6px] left-1/2 -translate-x-1/2 text-gray-400 text-[10px] font-semibold tracking-widest uppercase">
          SafePal Obsidian
        </div>
        
        {/* Side Button */}
        <div className="absolute right-0 top-[120px] w-1.5 h-12 bg-gray-700 rounded-l-sm"></div>
        
        {/* Power Indicator */}
        <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
      </div>
      
      {/* Device Shadow */}
      <div className="absolute inset-0 bg-black/20 blur-3xl -z-10 scale-95"></div>
    </div>
  );
}