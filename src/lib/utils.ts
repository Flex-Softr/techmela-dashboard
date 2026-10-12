import config from "@/config/config";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decodeUTF8(str: string | undefined | null): string {
  if (!str) return "";

  // If the string contains any characters outside the Latin-1 range (0-255),
  // it is already a decoded Unicode string and should be returned as is.
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      return str;
    }
  }

  try {
    // Modern approach to handle UTF-8 bytes misinterpreted as ISO-8859-1
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch (e) {
    // Fallback to original string if decoding fails
    return str;
  }
}

export function formatImageSrc(src: string | undefined | null): string {
  // Return placeholder if src is missing
  if (!src) return "/placeholder.png";

  // Trim and replace backslashes
  let cleanSrc = src.trim().replace(/\\/g, "/");

  // Check for string "null" or "undefined"
  if (cleanSrc === "null" || cleanSrc === "undefined" || !cleanSrc) {
    return "/placeholder.png";
  }

  // Base URL normalization: remove trailing slash, and remove any trailing /server-api or /server-api/v1
  const rawBaseUrl = (config.api_base_url || "").trim().replace(/\/+$/, "");
  const origin = rawBaseUrl.replace(/\/server-api(\/v1)?$/i, "");

  // If already absolute HTTP/HTTPS URL
  if (cleanSrc.startsWith("http://") || cleanSrc.startsWith("https://")) {
    if (config.env === "production" && cleanSrc.includes("localhost:5000") && origin) {
      cleanSrc = cleanSrc.replace(/http:\/\/localhost:5000/g, origin);
    }
    if (
      cleanSrc.includes("/server-api/") &&
      !cleanSrc.includes("/server-api/uploads/") &&
      !cleanSrc.includes("/server-api/v1/")
    ) {
      cleanSrc = cleanSrc.replace(
        /\/server-api\/(?!uploads\/|v1\/)/,
        "/server-api/uploads/public/"
      );
    }
    cleanSrc = cleanSrc.replace(/\/server-api\/server-api\//g, "/server-api/");
    return cleanSrc;
  }

  // Local dashboard public assets
  if (
    cleanSrc.startsWith("/placeholder") ||
    cleanSrc.startsWith("/icons") ||
    cleanSrc.startsWith("/images")
  ) {
    return cleanSrc;
  }

  if (cleanSrc === "placeholder.png" || cleanSrc === "placeholder.webp") {
    return `/${cleanSrc}`;
  }

  // Strip leading slash if present
  if (cleanSrc.startsWith("/")) {
    cleanSrc = cleanSrc.substring(1);
  }

  // If cleanSrc starts with server-api/, strip it
  if (cleanSrc.startsWith("server-api/")) {
    cleanSrc = cleanSrc.replace(/^server-api\//, "");
  }

  // If cleanSrc starts with uploads/
  if (cleanSrc.startsWith("uploads/")) {
    return `${origin}/server-api/${cleanSrc}`;
  }

  // For backend relative storage keys (e.g. "general/...", "products/...")
  return `${origin}/server-api/uploads/public/${cleanSrc}`;
}

import { STOCK_STATUS, STOCK_STATUS_LABELS } from "@/const/products";

// ... existing imports ...

export function formatStockStatus(status: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    STOCK_STATUS_LABELS[status as keyof typeof STOCK_STATUS_LABELS] || status
  );
}

export function getStockStatusColor(status: string) {
  switch (status) {
    case STOCK_STATUS.IN_STOCK:
      return "text-green-500";
    case STOCK_STATUS.LOW_STOCK:
      return "text-yellow-600";
    case STOCK_STATUS.OUT_OF_STOCK:
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}
