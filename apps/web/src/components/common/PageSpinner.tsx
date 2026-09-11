import { Leaf } from 'lucide-react'

export function PageSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        <Leaf className="absolute inset-0 m-auto w-5 h-5 text-brand-600" />
      </div>
      <p className="text-sm text-gray-400 font-medium tracking-wide">Khetly</p>
    </div>
  )
}

export function InlineSpinner({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className ?? ''}`}
    />
  )
}
