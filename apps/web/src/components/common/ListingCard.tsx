import { MapPin, Star, Maximize2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@lib/utils'
import { formatINR, formatDistance } from '@khetly/utils'
import { RiskBadge, VerifiedBadge } from '@components/ui/Badge'
import { ADDON_META, SEASON_LABELS } from '@lib/utils'
import type { LandListing } from '@khetly/types'

interface ListingCardProps {
  listing: LandListing
  className?: string
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const navigate = useNavigate()
  const photo = listing.photos[0] ?? null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/listings/${listing.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/listings/${listing.id}`)}
      className={cn(
        'card overflow-hidden cursor-pointer hover:shadow-card-hover transition-shadow group',
        className
      )}
    >
      {/* Photo */}
      <div className="relative h-44 bg-brand-50 overflow-hidden flex-shrink-0">
        {photo ? (
          <img
            src={photo}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🌾</div>
        )}

        {/* Distance badge */}
        {listing.distanceKm !== undefined && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
            <MapPin className="w-3 h-3 text-brand-600" />
            {formatDistance(listing.distanceKm)}
          </div>
        )}

        {/* Risk badge */}
        <div className="absolute top-2 right-2">
          <RiskBadge level={listing.riskLevel} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Farmer row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 truncate max-w-[120px]">
              {listing.farmer.name}
            </span>
            <VerifiedBadge status={listing.farmer.verificationStatus} />
          </div>
          {listing.farmer.rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              <span className="font-medium">{listing.farmer.rating.toFixed(1)}</span>
              <span className="text-gray-400">({listing.farmer.reviewCount})</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">{listing.title}</h3>

        {/* Location */}
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          {listing.address.village}, {listing.address.district}
        </p>

        {/* Crop tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">
            {listing.cropDetails.primaryCrop}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {listing.cropDetails.seedVariety}
          </span>
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {SEASON_LABELS[listing.cropDetails.harvestSeason]}
          </span>
        </div>

        {/* Plot size + yield */}
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Maximize2 className="w-3 h-3" />
            {listing.plotSizeAcres} acres
          </span>
          <span>•</span>
          <span>
            {listing.cropDetails.yieldMin}–{listing.cropDetails.yieldMax}{' '}
            {listing.cropDetails.yieldUnit}
          </span>
        </div>

        {/* Addons */}
        {listing.addons.length > 0 && (
          <div className="flex gap-1 mb-3">
            {listing.addons.slice(0, 4).map((addon) => (
              <span key={addon} title={ADDON_META[addon]?.label} className="text-base">
                {ADDON_META[addon]?.icon ?? '➕'}
              </span>
            ))}
            {listing.addons.length > 4 && (
              <span className="text-xs text-gray-400 self-center">+{listing.addons.length - 4}</span>
            )}
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-base font-semibold text-brand-600">
              {formatINR(listing.pricePerMonth)}
            </span>
            <span className="text-xs text-gray-400"> / month</span>
          </div>
          <span className="text-xs text-gray-500">
            Min {listing.minRentalMonths} {listing.minRentalMonths === 1 ? 'month' : 'months'}
          </span>
        </div>
      </div>
    </div>
  )
}
