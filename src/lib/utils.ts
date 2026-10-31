import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY, REF_DATE } from "@/lib/config";
import type { DemoCurrency } from "@/types";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const demoRates: Record<DemoCurrency, number> = { INR: 1, USD: 1 / 83, EUR: 1 / 90, GBP: 1 / 105 };

export function formatMoney(value: number, compact = false, currency: DemoCurrency = CURRENCY.code) {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency,
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(value * demoRates[currency]);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(iso),
  );
}

export function daysBetween(from: string, to: string) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

export function relativeDay(iso: string, ref = REF_DATE) {
  const d = daysBetween(iso, ref);
  if (d <= 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d} days ago`;
  return formatDate(iso);
}

export const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
