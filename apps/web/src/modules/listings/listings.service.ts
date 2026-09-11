import { apiClient } from '@lib/api-client'
import type {
  LandListing,
  CreateListingPayload,
  PaginatedResponse,
  ListingSearchParams,
} from '@khetly/types'

export const listingsService = {
  search: (params: ListingSearchParams) =>
    apiClient.get<PaginatedResponse<LandListing>>('/listings', { params }) as Promise<
      PaginatedResponse<LandListing>
    >,

  getById: (id: string) =>
    apiClient.get<LandListing>(`/listings/${id}`) as Promise<LandListing>,

  create: (payload: CreateListingPayload) =>
    apiClient.post<LandListing>('/listings', payload) as Promise<LandListing>,

  update: (id: string, payload: Partial<CreateListingPayload>) =>
    apiClient.patch<LandListing>(`/listings/${id}`, payload) as Promise<LandListing>,

  delete: (id: string) =>
    apiClient.delete(`/listings/${id}`) as Promise<void>,

  // Farmer's own listings
  myListings: () =>
    apiClient.get<LandListing[]>('/farmer/listings') as Promise<LandListing[]>,

  // Upload photos
  uploadPhoto: (listingId: string, file: File) => {
    const form = new FormData()
    form.append('photo', file)
    return apiClient.post<{ url: string }>(`/listings/${listingId}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) as Promise<{ url: string }>
  },
}
