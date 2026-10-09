"use client";

import { formatImageSrc } from "@/lib/utils";
import { ICollection } from "@/types/collection";
import { THomePageSection } from "@/types/homepageSection";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import HomepageSectionAction from "./HomepageSectionAction";
import UpdateHomepageSectionActiveStatus from "./UpdateHomepageSectionActiveStatus";

export const columns: ColumnDef<THomePageSection>[] = [
  {
    accessorKey: "sortOrder",
    header: "SL",
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const img = row.original.image as any;
      if (!img?.src) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }
      const src = formatImageSrc(img.src);
      return (
        <div className="relative h-10 w-16 overflow-hidden rounded border border-border bg-muted">
          <Image
            src={src}
            alt={row.original.title || "Section image"}
            fill
            className="object-contain"
          />
        </div>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {row.original.title || (
          <span className="text-xs text-muted-foreground italic">None</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "subtitle",
    header: "Subtitle",
    cell: ({ row }) => (
      <span className="block w-20 sm:w-auto truncate sm:whitespace-normal">
        {row.original.subtitle || (
          <span className="text-xs text-muted-foreground italic">-</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "collectionId",
    header: "Collection",
    cell: ({ row }) => {
      const collection = row.original.collectionId as ICollection;
      return <span className="whitespace-nowrap">{collection?.name}</span>;
    },
  },
  {
    accessorKey: "limit",
    header: "Product Qty",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <UpdateHomepageSectionActiveStatus homepageSection={row.original} />
    ),
  },
  {
    accessorKey: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <HomepageSectionAction homepageSection={row.original} />
      </div>
    ),
  },
];
