import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes without conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Delay for n ms (use sparingly — prefer CSS transitions) */
export function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

/** Get user's current geolocation as a Promise */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by this browser'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 60_000,
    })
  })
}

/** Read a File as base64 data URL */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Format file size: 1234567 → "1.2 MB" */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Debounce a function */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}

/** Pick a subset of object keys */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce(
    (acc, k) => {
      if (k in obj) acc[k] = obj[k]
      return acc
    },
    {} as Pick<T, K>
  )
}

/** Risk level to display label */
export const RISK_LABELS: Record<string, string> = {
  LOW: 'Low risk',
  MEDIUM: 'Medium risk',
  HIGH: 'High risk',
}

/** Harvest season to display label */
export const SEASON_LABELS: Record<string, string> = {
  RABI: 'Rabi (Oct–Mar)',
  KHARIF: 'Kharif (Jun–Nov)',
  ZAID: 'Zaid (Mar–Jun)',
  YEAR_ROUND: 'Year-round',
}

/** Land type to display label */
export const LAND_TYPE_LABELS: Record<string, string> = {
  IRRIGATED_CANAL: 'Irrigated (canal)',
  IRRIGATED_BOREWELL: 'Irrigated (borewell)',
  RAINFED: 'Rainfed',
  ORCHARD: 'Orchard / tree land',
}

/** Addon type to display info */
export const ADDON_META: Record<string, { label: string; icon: string; description: string }> = {
  FARM_VIDEO: { label: 'Farm video', icon: '📹', description: 'Monthly crop progress video' },
  FARM_VISIT: { label: 'Farm visit', icon: '🚜', description: 'Visit and walk the land' },
  TREE_RENTAL: { label: 'Rent a tree', icon: '🥭', description: 'Fruit tree rental' },
  HOMEMADE_PRODUCTS: { label: 'Farm products', icon: '🫙', description: 'Ghee, pickles, honey' },
  HARVEST_BOX: { label: 'Harvest box', icon: '📦', description: 'Seasonal produce delivery' },
  HARVEST_PHOTOS: { label: 'Harvest photos', icon: '📸', description: 'Photo documentation' },
}
