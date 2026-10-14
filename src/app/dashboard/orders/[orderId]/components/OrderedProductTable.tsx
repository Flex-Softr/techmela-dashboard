"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import config from "@/config/config";
import { formatImageSrc } from "@/lib/utils";
import { TOrderedProducts } from "@/types/order.interface";

import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export const columns: ColumnDef<TOrderedProducts>[] = [
  {
    accessorKey: "",
    header: "SL",
    cell: ({ row }) => (
      <div className="capitalize flex flex-col justify-center items-center">
        <span className="">{row.index + 1}</span>
      </div>
    ),
  },
  {
    accessorKey: "image",
    header: "Products",
    cell: ({ row }) => {
      const {
        image,
        title,
        slug,
        // variation,
        attributes = {},
      } = row.original;

      const variationProps = Object.keys(attributes)
        .map((key) => `${key}: ${attributes[key]}`)
        .join(", ");

      return (
        <div className="flex justify-start items-center gap-3">
          <div>
            <Image
              width={100}
              height={100}
              src={formatImageSrc(image?.src)}
              alt={image?.alt || title || "Product image"}
            />
          </div>
          <div>
            <Link
              href={`${config.client_base_url}/product/${slug}`}
              className="hover:text-blue-700"
              target="_blank"
            >
              {title}
              {variationProps && (
                <span className="italic font-semibold text-secondary">
                  {""} ({variationProps})
                </span>
              )}
            </Link>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "unitPrice",
    header: "Price",
    cell: ({ row }) => (
      <div className="lowercase text-center">{row.getValue("unitPrice")}</div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => (
      <div className="lowercase text-center">{row.getValue("quantity")}</div>
    ),
  },
  {
    accessorKey: "total",
    header: "Amount",
    cell: ({ row }) => (
      <div className="lowercase text-center">{row.getValue("total")}</div>
    ),
  },
  // {
  //   accessorKey: "amount",
  //   header: () => <div className="text-right">Sub Total</div>,
  //   cell: ({ row }) => {
  //     return <div className="text-right font-medium">450BDT</div>;
  //   },
  // },
];

export function OrderedProductTable({
  products,
}: {
  products: TOrderedProducts[];
}) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <Table className="min-w-[600px]">
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="border-b border-border hover:bg-muted"
            >
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="py-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table?.getRowModel()?.rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No product
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
