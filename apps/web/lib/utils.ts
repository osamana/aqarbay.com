import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency: string = "ILS"): string {
  const currencySymbols: Record<string, string> = {
    ILS: "₪",
    USD: "$",
    JOD: "JD",
  }

  const symbol = currencySymbols[currency] || currency
  return `${symbol}${amount.toLocaleString()}`
}

export function getImageUrl(fileKey: string | null | undefined): string {
  if (!fileKey) return "/placeholder.jpg"
  // Client-side: use public API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  // Assuming MinIO is accessible through the API URL structure
  return `${apiUrl.replace(':8000', ':9000')}/realestate/${fileKey}`
}

