import { ChevronLeft, Smartphone, QrCode } from 'lucide-react';
import { PageDebugId } from './PageDebugId';

interface DownloadAppPageProps {
  onBack: () => void;
  showDebugId?: boolean;
}

export function DownloadAppPage({ onBack, showDebugId }: DownloadAppPageProps) {
  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="download-app" showDebugId={showDebugId} />
      {/* Header */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">Download App</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pt-8">
        <Smartphone className="w-16 h-16 text-black mb-3" strokeWidth={1.5} />
        
        <div className="text-lg font-bold text-black uppercase mb-1 text-center">
          Pairing App
        </div>
        
        <div className="text-lg text-black mb-5 text-center">
          Scan QR code with your phone
        </div>

        {/* QR Code with SafePal Logo in Center */}
        <div className="border-4 border-black rounded-sm p-2 bg-[#838383] mb-4 relative">
          <div className="w-[160px] h-[160px] bg-[#838383] grid grid-cols-10 gap-0">
            {/* Simulated QR Code Pattern */}
            {[
              1,1,1,1,1,0,1,1,1,1,
              1,0,0,0,1,0,1,0,0,1,
              1,0,1,0,1,1,0,0,1,1,
              1,0,1,0,1,0,1,0,1,1,
              1,1,1,1,1,0,0,0,0,0,
              0,0,0,0,0,0,0,0,0,0,
              1,1,0,1,1,0,1,0,1,1,
              1,0,1,0,1,1,0,1,0,1,
              1,0,0,1,0,0,1,1,1,1,
              1,1,1,1,1,0,1,0,0,1,
            ].map((cell, index) => (
              <div
                key={index}
                className={cell === 1 ? 'bg-black' : 'bg-[#838383]'}
              />
            ))}
          </div>
          
          {/* SafePal Logo in Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#838383] border-2 border-black rounded-sm p-1.5">
            <div className="w-[40px] h-[40px] bg-[#838383] flex flex-col items-center justify-center">
              {/* Shield Icon */}
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                className="text-black"
                strokeWidth="2.5"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              {/* SP Text */}
              <div className="text-lg font-bold text-black tracking-tight mt-0.5">SP</div>
            </div>
          </div>
        </div>

        {/* Info — flat fields under a section divider (sign-screen rhythm). */}
        <div className="w-full">
          <div className="h-[2px] bg-black flex-shrink-0 mb-3.5" />
          <div>
            <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5">Compatible Platforms</div>
            <div className="flex gap-4 text-lg text-black">
              <div>• iOS 13.0+</div>
              <div>• Android 8.0+</div>
            </div>
          </div>

          <div className="mt-2.5">
            <div className="text-lg font-light text-black uppercase tracking-wide leading-none mb-1.5">Or Visit</div>
            <div className="text-xl font-normal text-black font-mono">
              app.safepal.io/download
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}