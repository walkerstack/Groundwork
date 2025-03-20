import type { ClassValue } from "clsx";
import { env } from "@/env";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;

  if (env.NODE_ENV === "production") return `https://app.agentset.ai`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return `http://localhost:${process.env.PORT ?? 3000}`;
}
