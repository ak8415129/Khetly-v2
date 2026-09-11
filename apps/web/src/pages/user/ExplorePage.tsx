import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, MapPin, X } from 'lucide-react'
import { useSearchListings } from '@modules/listings/listings.hooks'
import { useListingsStore } from '@modules/listings/listings.store'
import { ListingCard } from '@components/common/ListingCard'
import { ListingCardSkeleton } from '@components/ui/Skeleton'
import { EmptyState } from '@components/common/EmptyState'
import { Button } from '@components/ui/Button'
import { getCurrentPosition } from '@lib/utils'
import type { RiskLevel } from '@khetly/types'
import { cn } from '@lib/utils'
import toast from 'react-hot-toast'

const RISK_OPTIONS: { value: RiskLevel; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low risk', color: 'bg-risk-low text-risk-low-text' },
  { value: 'MEDIUM', label: 'Medium risk', color: 'bg-risk-medium text-risk-medium-text' },
  { value: 'HIGH', label: 'High risk', color: 'bg-risk-high text-risk-high-text' },
]

const CROP_OPTIONS = ['Wheat', 'Rice', 'Mustard', 'Sugarcane', 'Tomato', 'Mango']

const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest first' },
  { value: 'price_asc', label: 'Price: Low to high' },
  { value: 'price_desc', label: 'Price: High to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
]

export default function ExplorePage() {
  const { filters, setFilters, setUserLocation } = useListingsStore()
  const [showFilters, setShowFilters] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [locating, setLocating] = useState(false)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useSearchListings(filters)

  const allListings = data?.pages.flatMap((p) => p.data) ?? []

  // Auto-detect coordinates on mount (for distance display, without filtering out listings)
  useEffect(() => {
    getCurrentPosition()
      .then((pos) => setUserLocation(pos.coords.latitude, pos.coords.longitude))
      .catch(() => {})
  }, [])

  async function handleLocate() {
    setLocating(true)
    try {
      const pos = await getCurrentPosition()
      setUserLocation(pos.coords.latitude, pos.coords.longitude)
      setFilters({ radiusKm: 50, sortBy: 'distance' })
      toast.success('Location set! Showing farms within 50 km.')
    } catch {
      toast.error('Could not detect location. Showing all listings.')
    } finally {
      setLocating(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-medium text-gray-900">Explore farmland</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {filters.radiusKm
            ? `Showing listings within ${filters.radiusKm} km of your location`
            : 'Showing all available listings'}
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search crop, village, district…"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setFilters({ crop: searchText })}
            className="input-base pl-9 pr-4"
          />
          {searchText && (
            <button
              onClick={() => { setSearchText(''); setFilters({ crop: undefined }) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          variant="outline"
          leftIcon={<MapPin className="w-4 h-4" />}
          loading={locating}
          onClick={handleLocate}
          className="flex-shrink-0"
        >
          <span className="hidden sm:inline">Locate me</span>
        </Button>

        <Button
          variant={showFilters ? 'secondary' : 'outline'}
          leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          onClick={() => setShowFilters((v) => !v)}
          className="flex-shrink-0"
        >
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-4 space-y-4 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Risk */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Risk level
              </label>
              <div className="flex flex-wrap gap-2">
                {RISK_OPTIONS.map((r) => (
                  <button
                    key={r.value}
                    onClick={() =>
                      setFilters({ riskLevel: filters.riskLevel === r.value ? undefined : r.value })
                    }
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-full border font-medium transition-all',
                      filters.riskLevel === r.value
                        ? r.color + ' border-transparent'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Crop */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Crop type
              </label>
              <div className="flex flex-wrap gap-2">
                {CROP_OPTIONS.map((crop) => (
                  <button
                    key={crop}
                    onClick={() =>
                      setFilters({ crop: filters.crop === crop ? undefined : crop })
                    }
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-full border font-medium transition-all',
                      filters.crop === crop
                        ? 'bg-brand-50 border-brand-400 text-brand-800'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* Radius */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Nearby Radius
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'All', value: undefined },
                  { label: '25 km', value: 25 },
                  { label: '50 km', value: 50 },
                  { label: '100 km', value: 100 },
                ].map((d) => (
                  <button
                    key={d.label}
                    onClick={() => setFilters({ radiusKm: d.value })}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-full border font-medium transition-all',
                      filters.radiusKm === d.value
                        ? 'bg-brand-50 border-brand-400 text-brand-800'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Sort by
              </label>
              <select
                value={filters.sortBy ?? 'newest'}
                onChange={(e) => setFilters({ sortBy: e.target.value as typeof filters.sortBy })}
                className="input-base h-9 text-xs"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <button
              onClick={() => { useListingsStore.getState().resetFilters(); setSearchText('') }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Reset filters
            </button>
            <Button size="sm" onClick={() => setShowFilters(false)}>Apply</Button>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {(filters.crop || filters.riskLevel || filters.radiusKm) && (
        <div className="flex flex-wrap gap-2">
          {filters.radiusKm && (
            <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-800 text-xs font-medium px-3 py-1 rounded-full">
              📍 Within {filters.radiusKm} km
              <button onClick={() => setFilters({ radiusKm: undefined })}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.crop && (
            <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-800 text-xs font-medium px-3 py-1 rounded-full">
              🌾 {filters.crop}
              <button onClick={() => setFilters({ crop: undefined })}><X className="w-3 h-3" /></button>
            </span>
          )}
          {filters.riskLevel && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
              {filters.riskLevel} risk
              <button onClick={() => setFilters({ riskLevel: undefined })}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-gray-400">
          {data?.pages[0]?.total ?? 0} listings found
        </p>
      )}

      {/* Listings grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <EmptyState
          icon="⚠️"
          title="Could not load listings"
          description="Check your connection and try again."
          action={{ label: 'Retry', onClick: () => window.location.reload() }}
        />
      ) : allListings.length === 0 ? (
        <EmptyState
          icon="🌾"
          title="No listings found"
          description="Try expanding your radius or removing filters."
          action={{ label: 'Reset filters', onClick: () => useListingsStore.getState().resetFilters() }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                loading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                Load more listings
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
