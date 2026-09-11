import { cn } from '@lib/utils'
import { ShieldCheck } from 'lucide-react'
import type { RiskLevel, ListingStatus, BookingStatus, VerificationStatus } from '@khetly/types'

// ─── Generic badge ────────────────────────────────────────────────────────────

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-brand-50 text-brand-800',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  neutral: 'bg-gray-50 text-gray-600 border border-gray-200',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// ─── Risk badge ───────────────────────────────────────────────────────────────

export function RiskBadge({ level }: { level: RiskLevel }) {
  const map: Record<RiskLevel, { label: string; className: string }> = {
    LOW: { label: 'Low risk', className: 'risk-badge-low' },
    MEDIUM: { label: 'Medium risk', className: 'risk-badge-medium' },
    HIGH: { label: 'High risk', className: 'risk-badge-high' },
  }
  const { label, className } = map[level]
  return <span className={className}>{label}</span>
}

// ─── Listing status badge ─────────────────────────────────────────────────────

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  const map: Record<ListingStatus, { label: string; variant: BadgeProps['variant'] }> = {
    DRAFT: { label: 'Draft', variant: 'neutral' },
    PENDING_REVIEW: { label: 'In review', variant: 'warning' },
    ACTIVE: { label: 'Active', variant: 'success' },
    PAUSED: { label: 'Paused', variant: 'neutral' },
    ARCHIVED: { label: 'Archived', variant: 'default' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

// ─── Booking status badge ─────────────────────────────────────────────────────

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const map: Record<BookingStatus, { label: string; variant: BadgeProps['variant'] }> = {
    ENQUIRY: { label: 'Enquiry', variant: 'info' },
    CONFIRMED: { label: 'Confirmed', variant: 'warning' },
    ACTIVE: { label: 'Active', variant: 'success' },
    COMPLETED: { label: 'Completed', variant: 'neutral' },
    CANCELLED: { label: 'Cancelled', variant: 'danger' },
    DISPUTED: { label: 'Disputed', variant: 'danger' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}

// ─── Verified badge ───────────────────────────────────────────────────────────

export function VerifiedBadge({ status }: { status: VerificationStatus }) {
  if (status === 'VERIFIED') {
    return (
      <span className="verified-badge">
        <ShieldCheck className="w-3 h-3" /> Verified
      </span>
    )
  }
  if (status === 'IN_REVIEW') {
    return <Badge variant="warning">In review</Badge>
  }
  if (status === 'REJECTED') {
    return <Badge variant="danger">Rejected</Badge>
  }
  return <Badge variant="neutral">Unverified</Badge>
}
