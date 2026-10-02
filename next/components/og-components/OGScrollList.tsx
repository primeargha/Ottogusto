import React, { useRef, useEffect } from "react";
import { OGButton } from "./OGButton";
import { useBranding } from "@/contexts/BrandingContext";
import { OGProductcardSkeleton } from "./OGProductcardSkeleton";
import { MAX_COUNT } from "@/constants";

type Props = {
  children: React.ReactNode;
  items: any[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
  viewMode: string;
  scrollTargetId?: string;
};

// Matches ProductList.tsx's own item-grid wrapper classes exactly, so the
// "loading more" skeleton cards below line up in the same columns as the
// real cards above them instead of collapsing to a single column.
const gridWrapperClass =
  "base:flex base:flex-col base:grid-gap-listing gtsm:flex gtsm:flex-col gtsm:grid-gap-listing gtlg:grid gtlg:grid-cols-3 gtlg:gap-6 2xl:grid-cols-3";
const listWrapperClass = "flex flex-col grid-gap-listing";

const OGScrollList = (props: Props) => {
  const { getLabel } = useBranding();
  const { children, items, hasMore, onLoadMore, isLoading, viewMode, scrollTargetId } = props;
  const prevItemsLength = useRef(items.length);
  const isInitialMount = useRef(true);
  const pendingRestore = useRef(false);
  const savedPos = useRef(0);
  const usedWindow = useRef(false);

  // After new items mount, restore the previous scroll position
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevItemsLength.current = items.length;
      return;
    }

    if (items.length > prevItemsLength.current && pendingRestore.current) {
      requestAnimationFrame(() => {
        const el = scrollTargetId
          ? (document.getElementById(scrollTargetId) as HTMLElement | null)
          : null;
        if (!usedWindow.current && el) {
          el.scrollTop = savedPos.current;
        } else {
          window.scrollTo({ top: savedPos.current, behavior: "auto" });
        }
        pendingRestore.current = false;
      });
    }

    prevItemsLength.current = items.length;
  }, [items.length, scrollTargetId]);

  const handleLoadMore = () => {
    if (isLoading) return;
    const el = scrollTargetId
      ? (document.getElementById(scrollTargetId) as HTMLElement | null)
      : null;
    if (el && el.scrollHeight > el.clientHeight) {
      savedPos.current = el.scrollTop;
      usedWindow.current = false;
    } else {
      savedPos.current = window.scrollY;
      usedWindow.current = true;
    }
    pendingRestore.current = true;
    onLoadMore();
  };

  const showMoreText = () => {
    if (isLoading) return getLabel("load_more_products");
    const text = getLabel("product_listing_showmore");
    return text;
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col grid-gap-listing">
        {children}
        {hasMore && (
          <div className="">
            {isLoading && (
              <div className={viewMode === "grid" ? gridWrapperClass : listWrapperClass}>
                {Array.from({ length: MAX_COUNT }).map((_, index) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <OGProductcardSkeleton key={index} view={viewMode as "grid" | "list"} />
                ))}
              </div>
            )}
            {!isLoading && (
              <OGButton className="w-full" onClick={handleLoadMore} disabled={isLoading}>
                {showMoreText()}
              </OGButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OGScrollList;
