import { PAGE_IDS, SUB_PAGE_IDS, type PageKey } from '../config/pageIds';

interface PageDebugIdProps {
  page: PageKey;
  subPage?: string;
  showDebugId?: boolean;
}

export function PageDebugId({ page, subPage, showDebugId = true }: PageDebugIdProps) {
  if (!showDebugId) return null;
  
  const mainId = PAGE_IDS[page];
  
  // Get sub-page ID if exists
  let displayId = `${mainId}`;
  if (subPage && page in SUB_PAGE_IDS) {
    const subPageIds = SUB_PAGE_IDS[page as keyof typeof SUB_PAGE_IDS];
    if (subPage in subPageIds) {
      const subId = subPageIds[subPage as keyof typeof subPageIds];
      displayId = `${mainId}-${subId}`;
    }
  }
  
  return (
    <div className="absolute top-1 right-1 text-[8px] text-black font-mono pointer-events-none select-none z-10">
      #{displayId}
    </div>
  );
}