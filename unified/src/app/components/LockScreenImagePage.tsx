import { useState } from 'react';
import {
  ChevronLeft, Check, Upload,
  Lock, Waves, Mountain, Trees, Sun, Moon,
  Image as ImageIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageDebugId } from './PageDebugId';

interface LockScreenImagePageProps {
  onBack: () => void;
  showDebugId?: boolean;
}

interface LockImage {
  id: string;
  name: string;
  Icon: LucideIcon;       // Monochrome SVG (e-ink compatible) — follows currentColor
  isCustom?: boolean;
}

// Preset lock-screen images. Lucide icons render as 1-color SVGs that inherit
// text color, so they stay pure black on the #838383 e-ink background.
const PRESET_IMAGES: LockImage[] = [
  { id: 'default',  name: 'Default',  Icon: Lock },
  { id: 'wave',     name: 'Wave',     Icon: Waves },
  { id: 'mountain', name: 'Mountain', Icon: Mountain },
  { id: 'forest',   name: 'Forest',   Icon: Trees },
  { id: 'desert',   name: 'Desert',   Icon: Sun },
  { id: 'aurora',   name: 'Aurora',   Icon: Moon },
];

const IMAGES_PER_PAGE = 4;

export function LockScreenImagePage({ onBack, showDebugId }: LockScreenImagePageProps) {
  const [selectedImage, setSelectedImage] = useState('default');
  const [images, setImages] = useState<LockImage[]>(PRESET_IMAGES);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);
  const startIdx = currentPage * IMAGES_PER_PAGE;
  const currentImages = images.slice(startIdx, startIdx + IMAGES_PER_PAGE);

  const handleSelect = (id: string) => {
    setSelectedImage(id);
  };

  const handleUploadCustom = () => {
    // Prototype stub: append a custom slot. In a real device this would open a file picker.
    const newId = `custom-${Date.now()}`;
    setImages((prev) => [
      ...prev,
      { id: newId, name: 'Custom', Icon: ImageIcon, isCustom: true },
    ]);
    setSelectedImage(newId);
    setCurrentPage(Math.floor(images.length / IMAGES_PER_PAGE));
  };

  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="lock-screen" showDebugId={showDebugId} />
      {/* Header */}
      <div className="h-[45px] px-5 flex items-center border-b-2 border-black flex-shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">Lock Screen</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-black uppercase mb-2">Select Image</h2>
          <p className="text-lg text-black">
            Choose a lock screen background
          </p>
        </div>

        {/* Upload Custom Button */}
        <button
          onClick={handleUploadCustom}
          className="w-full h-14 border-2 border-black rounded-sm bg-black text-[#838383] hover:bg-[#838383] hover:text-black active:scale-95 transition-all mb-4 flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" strokeWidth={2.5} />
          <span className="font-bold text-lg uppercase">Upload Custom Image</span>
        </button>

        {/* Image Grid */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          {currentImages.map((image) => {
            const Icon = image.Icon;
            return (
              <button
                key={image.id}
                onClick={() => handleSelect(image.id)}
                className={`border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all p-4 flex flex-col items-center justify-center gap-3 relative ${
                  selectedImage === image.id ? 'bg-black text-[#838383]' : ''
                }`}
              >
                {/* Preview — monochrome Lucide icon, inherits currentColor */}
                <Icon className="w-12 h-12" strokeWidth={1.5} />

                {/* Name */}
                <div className="text-lg font-bold text-center">{image.name}</div>

                {/* Custom Badge */}
                {image.isCustom && (
                  <div className="absolute top-2 left-2 text-lg font-bold">
                    Custom
                  </div>
                )}

                {/* Selected Indicator */}
                {selectedImage === image.id && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex gap-3 mt-4">
            {currentPage > 0 && (
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                className="flex-1 h-12 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all font-bold text-lg uppercase"
              >
                Previous
              </button>
            )}
            {currentPage < totalPages - 1 && (
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                className="flex-1 h-12 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all font-bold text-lg uppercase"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}