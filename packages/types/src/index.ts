export type UserRole = 'RENTER' | 'FARMER' | 'ADMIN'
export type VerificationStatus = 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type ListingStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'REJECTED'
export type BookingStatus = 'ENQUIRY' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED'
export type HarvestSeason = 'RABI' | 'KHARIF' | 'ZAID' | 'YEAR_ROUND'
export type LandType = 'IRRIGATED_CANAL' | 'IRRIGATED_BOREWELL' | 'RAINFED' | 'ORCHARD'
export type SoilType = 'SANDY_LOAM' | 'CLAY_LOAM' | 'BLACK_COTTON' | 'RED_LATERITE' | 'ALLUVIAL' | 'UNKNOWN'
export type LogisticsOption = 'DOORSTEP_DELIVERY' | 'FARM_PICKUP' | 'MANDI_DROP' | 'COURIER'
export type AddonType = 'FARM_VIDEO' | 'FARM_VISIT' | 'TREE_RENTAL' | 'HOMEMADE_PRODUCTS' | 'HARVEST_BOX' | 'HARVEST_PHOTOS'
export type Language = 'en' | 'hi'

export interface GeoPoint { lat: number; lng: number }

// ─── Auth — Google Sign-In based ───────────────────────────────────────────────
export interface AuthUser {
  id: string
  email: string
  role: UserRole
  name: string
  avatarUrl?: string
  isVerified: boolean
  profileCompleted: boolean
  preferredLanguage: Language
  createdAt: string
}
export interface AuthTokens { accessToken: string; refreshToken: string; expiresIn: number }

export interface Address {
  line1?: string; village: string; tehsil: string
  district: string; state: string; pincode: string; geoPoint?: GeoPoint
}
export interface FarmerProfile {
  id: string; userId: string; name: string; email: string; bio: string
  village: string; tehsil: string; district: string; state: string
  experienceYears: number; verificationStatus: VerificationStatus
  aadhaarVerified: boolean; bankVerified: boolean; rating: number
  reviewCount: number; totalListings: number; activeBookings: number
  avatarUrl?: string; createdAt: string; updatedAt: string
}
export interface CropDetails {
  primaryCrop: string; seedVariety: string; harvestSeason: HarvestSeason
  yieldMin: number; yieldMax: number; yieldUnit: string
  estimatedPriceMin: number; estimatedPriceMax: number; priceUnit: string
  fertilizerPlan: string; pesticidePlan: string
}
export interface LandListing {
  id: string; farmerId: string
  farmer: Pick<FarmerProfile, 'id' | 'name' | 'rating' | 'reviewCount' | 'verificationStatus' | 'avatarUrl'>
  title: string; description: string; landType: LandType; soilType: SoilType
  plotSizeAcres: number; address: Address; distanceKm?: number
  cropDetails: CropDetails; riskLevel: RiskLevel; riskDescription: string
  logistics: LogisticsOption[]; addons: AddonType[]
  pricePerMonth: number; minRentalMonths: number; status: ListingStatus
  rejectionReason?: string
  photos: string[]; videoUrl?: string; viewCount: number; bookingCount: number
  createdAt: string; updatedAt: string
}

export interface CreateListingPayload {
  title: string
  description?: string
  landType: LandType
  soilType?: SoilType
  plotSizeAcres: number
  address: Address
  cropDetails: CropDetails
  riskLevel: RiskLevel
  riskDescription: string
  logistics: LogisticsOption[]
  addons: AddonType[]
  pricePerMonth: number
  minRentalMonths: number
}
export interface Booking {
  id: string; listingId: string
  listing: Pick<LandListing, 'id' | 'title' | 'address' | 'pricePerMonth' | 'photos'>
  renterId: string; farmerId: string; status: BookingStatus
  startDate: string; endDate: string; durationMonths: number
  totalAmount: number; platformFeePercent: number; platformFee: number
  farmerReceives: number; selectedAddons: AddonType[]
  notes?: string; createdAt: string; updatedAt: string
}
export interface ListingSearchParams {
  lat?: number; lng?: number; radiusKm?: number; crop?: string
  riskLevel?: RiskLevel; landType?: LandType; maxPricePerMonth?: number
  page?: number; pageSize?: number; sortBy?: 'distance' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
}
export interface PaginatedResponse<T> {
  data: T[]; total: number; page: number; pageSize: number; totalPages: number; hasMore: boolean
}
export interface ApiSuccess<T = void> { success: true; data: T; message?: string }
export interface ApiError { success: false; error: string; code: string; statusCode: number; details?: Record<string, string[]> }
export type ApiResponse<T> = ApiSuccess<T> | ApiError

export type AiPersona = 'farmer' | 'renter'
export interface AiMessage { id: string; role: 'user' | 'assistant'; content: string; createdAt: string }
export interface AiChatPayload { message: string; persona: AiPersona; conversationId?: string }
export interface AiChatResponse { message: AiMessage; conversationId: string; suggestedFollowUps?: string[] }
