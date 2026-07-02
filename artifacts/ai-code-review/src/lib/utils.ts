import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeArray<T>(data: unknown, contextName?: string): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    if (Array.isArray((data as any).data)) return (data as any).data as T[];
    if (Array.isArray((data as any).items)) return (data as any).items as T[];
    if (Array.isArray((data as any).results)) return (data as any).results as T[];
    if (Array.isArray((data as any).languages)) return (data as any).languages as T[];
    if (Array.isArray((data as any).reviews)) return (data as any).reviews as T[];
  }
  console.warn(`[API Response Mismatch] Expected array structure for ${contextName || "data"}, but received:`, data);
  return [];
}

