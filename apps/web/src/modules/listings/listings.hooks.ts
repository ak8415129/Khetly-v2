import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { listingsService } from './listings.service'
import type { CreateListingPayload, ListingSearchParams } from '@khetly/types'

// ─── Query keys ───────────────────────────────────────────────────────────────

export const listingKeys = {
  all: ['listings'] as const,
  search: (params: ListingSearchParams) => ['listings', 'search', params] as const,
  detail: (id: string) => ['listings', 'detail', id] as const,
  myListings: ['listings', 'mine'] as const,
}

// ─── Search listings (infinite scroll) ───────────────────────────────────────

export function useSearchListings(params: ListingSearchParams) {
  return useInfiniteQuery({
    queryKey: listingKeys.search(params),
    queryFn: ({ pageParam = 1 }) =>
      listingsService.search({ ...params, page: pageParam as number, pageSize: 12 }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    staleTime: 2 * 60 * 1000,
  })
}

// ─── Single listing ───────────────────────────────────────────────────────────

export function useListing(id: string) {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: () => listingsService.getById(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  })
}

// ─── Farmer's own listings ────────────────────────────────────────────────────

export function useMyListings() {
  return useQuery({
    queryKey: listingKeys.myListings,
    queryFn: listingsService.myListings,
    staleTime: 1 * 60 * 1000,
  })
}

// ─── Create listing ───────────────────────────────────────────────────────────

export function useCreateListing() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (payload: CreateListingPayload) => listingsService.create(payload),
    onSuccess: (listing) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings })
      toast.success('Listing created! It will be reviewed within 24 hours.')
      navigate(`/farmer/listings`)
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to create listing')
    },
  })
}

// ─── Update listing ───────────────────────────────────────────────────────────

export function useUpdateListing(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<CreateListingPayload>) =>
      listingsService.update(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(listingKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings })
      toast.success('Listing updated successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update listing')
    },
  })
}

// ─── Delete listing ───────────────────────────────────────────────────────────

export function useDeleteListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => listingsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.myListings })
      toast.success('Listing deleted')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to delete listing')
    },
  })
}
