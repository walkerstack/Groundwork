import type { ClassValue } from "clsx";
import { env } from "@/env";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { HOME_DOMAIN } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;

  if (env.NODE_ENV === "production") return HOME_DOMAIN;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: "accurate" | "normal";
  } = {},
) {
  const { decimals = 0, sizeType = "normal" } = opts;

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === "accurate"
      ? (accurateSizes[i] ?? "Bytes")
      : (sizes[i] ?? "Bytes")
  }`;
}

let formatter: Intl.NumberFormat | undefined;
let compactFormatter: Intl.NumberFormat | undefined;
let currencyFormatter: Intl.NumberFormat | undefined;
export function formatNumber(
  num: number,
  style: "decimal" | "compact" | "currency" = "decimal",
) {
  let formatterToUse;

  if (style === "decimal") {
    if (!formatter) {
      formatter = new Intl.NumberFormat("en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      });
    }
    formatterToUse = formatter;
  } else if (style === "currency") {
    if (!currencyFormatter) {
      currencyFormatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }
    formatterToUse = currencyFormatter;
  } else {
    if (!compactFormatter) {
      compactFormatter = new Intl.NumberFormat("en-US", {
        notation: "compact",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      });
    }
    formatterToUse = compactFormatter;
  }

  return formatterToUse.format(num);
}

export function formatMs(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  if (seconds > 0) {
    return `${seconds}s`;
  }
  return `${ms}ms`;
}
