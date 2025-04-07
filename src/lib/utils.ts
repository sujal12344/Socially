import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUrlForDisplay(url: string): string {
  let formatted = url.replace(/^https?:\/\//, "");
  if (formatted.endsWith("/")) formatted = formatted.slice(0, -1);
  return formatted;
}
