import Image from "next/image";
import type { CategoryNode } from "@/types/categories";
import { Box } from "@/components/ui/box";
import { getCategoryImageUrl } from "@/utils/imageUtils";

interface CategoryDescriptionProps {
  category: CategoryNode;
  lang: string;
}

export default function CategoryDescription({ category, lang }: CategoryDescriptionProps) {
  const description = category.descriptions?.[lang] || category.descriptions?.en || "";
  const alt = category.titles?.[lang] || category.name || "";
  // 560px width: enough for 280px @2x, reduces transfer vs 800 on mobile
  const imageUrl = getCategoryImageUrl(category.id, { width: 560, quality: 80 });

  return (
    <Box
      className={`flex h-auto grid-gap-listing section-standard base:flex-col base:items-start gtlg:flex-row ${description ? "base:justify-start gtsm:justify-start gtlg:justify-start" : "gtsm:justify-center gtlg:justify-center"} `}
    >
      {/* Box filled by image – compact size; sizes hint for layout stability */}
      <Box className="relative h-[120px] max-h-[120px] shrink-0 items-center overflow-hidden rounded-[6px] bg-color-background-default base:w-full base:justify-center gtlg:w-[120px] gtlg:max-w-[120px]">
        <Image
          src={imageUrl}
          alt={alt}
          title={alt}
          // fill
          // sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px" //Argha da, plz keep this sizes 120px:120px for all screens
          className="object-cover"
          height={120}
          width={120}
          priority
          fetchPriority="high"
        />
      </Box>
      {description && (
        <Box className="min-w-0 flex-1 layout-width-text">
          {/* PERF/LCP: native <p> keeps description in server HTML without client Typography hydration */}
          <p className="leading-relaxed text-color-text-muted typography-body-02">{description}</p>
        </Box>
      )}
    </Box>
  );
}
