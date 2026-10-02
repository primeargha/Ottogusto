import { buildPartPdpHref } from "@/utils/build-part-pdp-url";
import { getCategoryImageUrl } from "@/utils/imageUtils";
import { appendCategorySearchQuery } from "@/utils/categorySearchUrl";
import { formatTitle } from "@/helpers/UtilityHelper";
import { Routes } from "@/config/routes";
import type { CategoryNode } from "@/types/categories";
import type { GetPartByIdResponse } from "@/type";
import Image from "next/image";

interface CategoryL3TopPartsSectionServerProps {
  products: GetPartByIdResponse[];
  l3Category: CategoryNode;
  locale: string;
  languageCountry: string;
  viewAllLabel: string;
  selectManufacturerLabel?: string;
  manufacturerIds?: string[] | null;
  brandName?: string;
}

export default function CategoryL3TopPartsSectionServer({
  products,
  l3Category,
  locale,
  languageCountry,
  viewAllLabel,
  selectManufacturerLabel,
  manufacturerIds,
  brandName,
}: CategoryL3TopPartsSectionServerProps) {
  const l3Title = l3Category.titles?.[locale] || l3Category.name || "";
  const items = products.slice(0, 8);

  const viewAllHref = appendCategorySearchQuery(Routes.viewCategory(languageCountry), {
    categoryId: l3Category.id,
    ...(manufacturerIds?.[0] ? { manufacturerIds: manufacturerIds[0] } : {}),
  });

  if (items.length === 0) {
    return null;
  }

  const viewAllText = brandName
    ? `${viewAllLabel}${brandName}`.trim()
    : `${viewAllLabel}${formatTitle(l3Title, locale as any).toLocaleLowerCase()}`;

  return (
    <div className="flex flex-col gap-space-md section-standard">
      {!brandName ? (
        <div className="flex flex-col gap-space-xs">
          <h2 className="text-color-text-emphasis typography-heading-03">
            {`Top ${formatTitle(l3Title, locale as any)}`}
          </h2>
          {selectManufacturerLabel ? (
            <p className="text-color-text-muted typography-body-02">{selectManufacturerLabel}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 grid-gap-listing gtsm:grid-cols-2 gtlg:grid-cols-4">
        {items.map((product) => {
          const href = buildPartPdpHref(languageCountry, product.id, {
            seoName: product.seo?.name ?? product.name ?? undefined,
          });

          const imgSrc =
            Array.isArray(product.images) && product.images.length > 0
              ? product.images[0].url
              : getCategoryImageUrl(l3Category.id, { width: 180, quality: 80 });

          return (
            <a
              key={product.id}
              href={href || undefined}
              className="border-color-border-subtle block rounded-[6px] border bg-color-background-default p-3 no-underline hover:border-color-primary-main"
            >
              <Image
                src={imgSrc}
                alt={product.title ?? ""}
                width={180}
                height={180}
                loading="lazy"
                className="w-full object-contain"
              />
              <p className="mt-2 line-clamp-2 text-color-text-emphasis typography-body-02">
                {product.title}
              </p>
              {product.priceInclVat != null && (
                <p className="mt-1 font-semibold text-color-text-emphasis typography-body-01">
                  €{product.priceInclVat.toFixed(2)}
                </p>
              )}
            </a>
          );
        })}
      </div>

      <div className="flex w-full justify-center">
        <a
          href={viewAllHref}
          className="w-full rounded-[6px] bg-button-primary-bg-default py-3 text-center font-semibold text-color-text-inverse typography-body-02 hover:bg-color-primary-hover"
        >
          {viewAllText}
        </a>
      </div>
    </div>
  );
}
