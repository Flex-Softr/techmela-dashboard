import { Checkbox } from "@/components/ui/checkbox";
import { PRODUCT_STATUS, PRODUCT_TYPE, STOCK_STATUS } from "@/const/products";
import {
  formatImageSrc,
  formatStockStatus,
  getStockStatusColor,
} from "@/lib/utils";
import { IAdminProduct } from "@/types/products";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductActions from "./ProductActions";

const getVariablePriceDisplay = (
  variations: NonNullable<IAdminProduct["variations"]>
) => {
  if (!variations || variations.length === 0) {
    return {
      minPrice: 0,
      maxPrice: 0,
      previousPrice: null,
      hasMultiplePrices: false,
    };
  }

  // Extract all sale and regular prices
  const salePrices = variations
    .map((v) => v.price.salePrice)
    .filter((price): price is number => price != null && price > 0);

  const regularPrices = variations
    .map((v) => v.price.regularPrice)
    .filter((price) => price > 0);

  // Calculate min/max for each type
  const minSalePrice = salePrices.length > 0 ? Math.min(...salePrices) : null;
  const maxSalePrice = salePrices.length > 0 ? Math.max(...salePrices) : null;
  const minRegularPrice =
    regularPrices.length > 0 ? Math.min(...regularPrices) : 0;
  const maxRegularPrice =
    regularPrices.length > 0 ? Math.max(...regularPrices) : 0;

  // Determine display prices (prefer sale price)
  const minPrice = minSalePrice || minRegularPrice || 0;
  const maxPrice = maxSalePrice || maxRegularPrice || 0;
  const hasMultiplePrices = minPrice !== maxPrice;

  // Determine previous price for strikethrough
  // Show strikethrough only if there's a sale AND prices are uniform
  const previousPrice =
    minSalePrice && minSalePrice < maxRegularPrice && !hasMultiplePrices
      ? maxRegularPrice
      : null;

  return { minPrice, maxPrice, previousPrice, hasMultiplePrices };
};

const getAggregateStockStatus = (
  variations: NonNullable<IAdminProduct["variations"]>
) => {
  if (!variations || variations.length === 0) return STOCK_STATUS.OUT_OF_STOCK;

  const statuses = variations.map((v) => v.inventory.stockStatus);

  if (statuses.includes(STOCK_STATUS.IN_STOCK)) return STOCK_STATUS.IN_STOCK;
  if (statuses.includes(STOCK_STATUS.LOW_STOCK)) return STOCK_STATUS.LOW_STOCK;
  return STOCK_STATUS.OUT_OF_STOCK;
};

const getTotalStockQuantity = (
  variations: NonNullable<IAdminProduct["variations"]>
) => {
  if (!variations || variations.length === 0) return 0;
  return variations.reduce(
    (acc, v) => acc + (v.inventory.stockAvailable || 0),
    0
  );
};

export const ProductColumns: ColumnDef<IAdminProduct>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex justify-start items-center py-2 px-2 -ml-2">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border border-white px-0"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center items-center py-2 px-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   accessorKey: "",
  //   header: "SL",
  //   cell: ({ row }) => (
  //     <div className="flex flex-col justify-center items-center">
  //       <span className="">{row.index + 1}</span>
  //     </div>
  //   ),
  // },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const { thumbnail } = row.original;
      return (
        <div className="h-16 w-16 relative p-2 my-3 shrink-0">
          <Image
            src={formatImageSrc(thumbnail?.src)}
            alt={thumbnail?.alt || row.original.title || "Product image"}
            fill
            className="object-cover rounded shadow-sm border border-gray-100"
            sizes="64px"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="flex flex-col items-start gap-1 py-2 px-4">
        <div className="flex items-center gap-2">
          {row.original.type === PRODUCT_TYPE.VARIABLE && (
            <button
              onClick={() => row.toggleExpanded()}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          <span title={row.original.title} className="font-semibold text-left">
            <Link
              href={`/dashboard/products/${row.original._id}`}
              className="hover:text-blue-700"
            >
              {row.original.title.length > 70
                ? `${row.original.title.substring(0, 70)}...`
                : row.original.title}
            </Link>
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "sku",
    header: () => <div className="text-center">SKU</div>,
    cell: ({ row }) =>
      row.original.type === PRODUCT_TYPE.SIMPLE ? (
        <div className="flex justify-center px-4 py-2 text-nowrap w-[1%] mx-auto">
          <span>
            {row.original.sku ? (
              row.original.sku
            ) : (
              <Minus className="h-4 w-4 mx-auto text-gray-500" />
            )}
          </span>
        </div>
      ) : (
        <div className="flex flex-col justify-start items-center gap-1 px-4 py-2 text-nowrap w-[1%] mx-auto whitespace-nowrap">
          <p className="flex items-center shrink-0">
            <span>{row.original.variations?.length} Variations</span>
          </p>
        </div>
      ),
  },
  {
    accessorKey: "price",
    header: () => <div className="text-center">Price</div>,
    cell: ({ row: { original } }) =>
      original.type === PRODUCT_TYPE.SIMPLE ? (
        <div className="flex flex-col items-center justify-center gap-0.5 px-4 py-2 text-nowrap w-[1%] mx-auto">
          <span className="text-sm font-semibold text-primary">
            &#2547;{original.salePrice ?? original.regularPrice}
          </span>
          {original.salePrice && (
            <span className="text-xs text-muted-foreground line-through">
              &#2547;{original.regularPrice}
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-col justify-start items-center gap-1 px-4 py-2 text-nowrap w-[1%] mx-auto whitespace-nowrap">
          <div className="flex flex-col items-center gap-0.5 shrink-0">
            {(() => {
              const priceData = getVariablePriceDisplay(original.variations!);

              if (priceData.minPrice > 0) {
                return (
                  <>
                    <span className="text-sm font-semibold text-primary">
                      &#2547;{priceData.minPrice}
                      {priceData.hasMultiplePrices &&
                        ` - &#2547;${priceData.maxPrice}`}
                    </span>
                    {priceData.previousPrice &&
                      !priceData.hasMultiplePrices && (
                        <span className="text-xs text-muted-foreground line-through">
                          &#2547;{priceData.previousPrice}
                        </span>
                      )}
                  </>
                );
              } else {
                return (
                  <span className="text-sm font-medium text-gray-400">
                    Unavailable
                  </span>
                );
              }
            })()}
          </div>
        </div>
      ),
  },
  {
    accessorKey: "stock",
    header: () => <div className="text-center">Stock</div>,
    cell: ({ row }) => {
      const isSimple = row.original.type === PRODUCT_TYPE.SIMPLE;
      const status = isSimple
        ? row.original.stockStatus
        : getAggregateStockStatus(row.original.variations!);

      return (
        <div className="flex flex-col justify-start items-center gap-1 px-4 py-2 w-[1%] mx-auto whitespace-nowrap">
          <div className="h-5 flex items-center shrink-0">
            <span className={getStockStatusColor(status)}>
              {formatStockStatus(status)}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "stockAvailable",
    header: () => <div className="text-center">Qty</div>,
    cell: ({ row: { original } }) => {
      const isSimple = original.type === PRODUCT_TYPE.SIMPLE;
      const qty = isSimple
        ? original.stockAvailable
        : getTotalStockQuantity(original.variations!);

      return (
        <div className="flex flex-col justify-start items-center gap-1 px-4 py-2 w-[1%] mx-auto whitespace-nowrap">
          <div className="h-5 flex items-center shrink-0">
            {!original.manageStock && qty === 0 ? (
              <Minus className="h-4 w-4" />
            ) : (
              <span className="font-semibold">{qty}</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: () => <div className="text-center">Category</div>,
    cell: ({ row }) => {
      const { category } = row.original;
      return (
        <div className="flex justify-center w-[1%] mx-auto">
          <span title={category?.[0]?.name} className="whitespace-nowrap">
            {category?.[0]?.name.length > 10
              ? category?.[0]?.name.slice(0, 10) + "..."
              : category?.[0]?.name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "publishedStatus",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => {
      const statusValue = row.original.publishedStatus;
      let colorClass = "";

      if (statusValue === PRODUCT_STATUS.PUBLISHED) {
        colorClass = "text-green-500";
      } else if (statusValue === PRODUCT_STATUS.DRAFT) {
        colorClass = "text-yellow-700";
      } else if (statusValue === PRODUCT_STATUS.PRIVATE) {
        colorClass = "text-red-600";
      }

      return (
        <div className="flex justify-center w-[1%] mx-auto">
          <span className={`capitalize ${colorClass} whitespace-nowrap`}>
            {statusValue}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Action</div>,
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex justify-center w-[1%] mx-auto">
        <ProductActions _id={row.original._id} slug={row.original.slug} />
      </div>
    ),
  },
];
