import { useState } from 'react';
import { ChevronLeft, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { PageDebugId } from './PageDebugId';

interface LanguagePageProps {
  onBack: () => void;
  showDebugId?: boolean;
}

// 10 common wallet languages: native name (primary) + English name (secondary).
const LANGUAGES: { native: string; english: string }[] = [
  { native: 'English', english: 'English' },
  { native: '简体中文', english: 'Chinese Simplified' },
  { native: '繁體中文', english: 'Chinese Traditional' },
  { native: '日本語', english: 'Japanese' },
  { native: '한국어', english: 'Korean' },
  { native: 'Español', english: 'Spanish' },
  { native: 'Français', english: 'French' },
  { native: 'Deutsch', english: 'German' },
  { native: 'Русский', english: 'Russian' },
  { native: 'Português', english: 'Portuguese' },
];

const ITEMS_PER_PAGE = 6;

export function LanguagePage({ onBack, showDebugId }: LanguagePageProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(LANGUAGES.length / ITEMS_PER_PAGE);
  const current = LANGUAGES.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div className="w-[400px] h-[600px] bg-[#838383] flex flex-col">
      <PageDebugId page="language" showDebugId={showDebugId} />
      {/* Header — back (left) + page number (top-right). */}
      <div className="h-[45px] px-5 flex items-center justify-between border-b-2 border-black flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-black" strokeWidth={2.5} />
          <span className="text-lg font-bold text-black uppercase tracking-wide">Language</span>
        </button>
        {totalPages > 1 && (
          <span className="text-lg font-bold text-black tabular-nums">{page + 1}/{totalPages}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <h2 className="text-xl font-bold text-black uppercase mb-3">Select Language</h2>

        {/* Language list — native name (bold) + English name (light) on one line. */}
        <div className="flex-1 space-y-2.5">
          {current.map((lang) => (
            <button
              key={lang.native}
              onClick={() => setSelectedLanguage(lang.native)}
              className="w-full h-14 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all px-4 flex items-center justify-between gap-3 group"
            >
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="text-lg font-bold whitespace-nowrap">{lang.native}</span>
                {lang.english !== lang.native && (
                  <span className="text-lg font-light truncate">{lang.english}</span>
                )}
              </div>
              {selectedLanguage === lang.native && (
                <Check className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
              )}
            </button>
          ))}
        </div>

        {/* Pagination — Sign History style. */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t-2 border-black">
            {page > 0 && (
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="flex-1 h-12 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-lg uppercase tracking-wide"
              >
                <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
                Prev
              </button>
            )}
            {page < totalPages - 1 && (
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                className="flex-1 h-12 border-2 border-black rounded-sm bg-[#838383] hover:bg-black hover:text-[#838383] active:scale-95 transition-all flex items-center justify-center gap-2 font-bold text-lg uppercase tracking-wide"
              >
                Next
                <ChevronDown className="w-5 h-5" strokeWidth={2.5} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
