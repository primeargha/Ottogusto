import { Box } from "@/components/ui/box";
import { getPersistedShowRibbon } from "@/stores/useRibbonStore";

/**
 * Reserves the exact vertical space of the real HeaderRow (ribbon + main header + search-links row)
 * so that initial paint matches post-hydration layout and there is no CLS / content jump.
 *
 * Heights mirror header-row.tsx:
 *  - Ribbon row:       base h-10  / gtsm h-11  / gtlg h-11 — only reserved if the visitor
 *                       hasn't dismissed it this session, matching what HeaderRow will render.
 *  - Main header row:  base h-14  / gtsm h-16  / gtlg h-16
 *  - Search links row: h-10 (py-2 content)
 */
export default function HeaderRowSkeleton() {
  const showRibbon = getPersistedShowRibbon();

  return (
    <Box
      className="sticky left-0 right-0 top-0 z-50 w-full flex-col"
      aria-hidden
      data-testid="header-row-skeleton"
    >
      {showRibbon ? (
        <Box className="w-full bg-color-accent-main base:h-10 gtsm:h-11 gtlg:h-11" />
      ) : null}
      <Box className="animate-pulse w-full bg-header-background base:h-[56px] gtsm:h-[64px] gtlg:h-[64px]" />
      <Box className="h-[58px] w-full border-b border-t border-color-header-divider bg-header-background" />
    </Box>
  );
}
