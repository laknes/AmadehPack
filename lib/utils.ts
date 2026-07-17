import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value?: number | string | null) {
  if (value === null || value === undefined) return "استعلام";
  const numberValue = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("fa-IR").format(numberValue) + " تومان";
}

export function orderNumber() {
  return `AP-${Date.now().toString(36).toUpperCase()}`;
}
