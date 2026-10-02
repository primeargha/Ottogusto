import Typography from "@/components/og-components/Typography";
import { Product } from "@/types/product";

type ViewMode = "grid" | "list";

interface ProductCardProps {
  product: Product;
  viewMode: ViewMode;
}

export function ProductCard({ product, viewMode }: ProductCardProps) {
  return (
    <div
      className={`rounded-lg border p-4 shadow-sm transition-all hover:shadow-md ${
        viewMode === "list" ? "w-full" : ""
      }`}
    >
      <div className={viewMode === "list" ? "flex items-start gap-4" : ""}>
        <div className={viewMode === "list" ? "flex-1" : ""}>
          <Typography type="h3" className="mb-2 text-lg font-semibold">
            {product.name}
          </Typography>
          <p className="mb-2 text-sm text-gray-600">{product.description}</p>
          <p className="mb-1 text-sm text-gray-500">OE Reference: {product.oeReference}</p>
        </div>
        <div className={viewMode === "list" ? "text-right" : "mt-4"}>
          <p className="text-lg font-bold">€{product.priceInclVat.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Excl. VAT: €{product.priceInclVat.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
