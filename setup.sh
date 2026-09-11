#!/bin/bash

# =============================================================================
# Khetly — Full project bootstrap script
# Run this once in any empty folder to create the entire project
# Usage: bash setup.sh
# =============================================================================

set -e  # Stop on any error

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

echo ""
echo "🌾  Khetly — Project Setup"
echo "================================"
echo ""

# ─── Check prerequisites ──────────────────────────────────────────────────────

info "Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org (v20+)"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js v20+ required. You have $(node -v)"
  exit 1
fi
log "Node.js $(node -v) found"

if ! command -v pnpm &> /dev/null; then
  info "Installing pnpm..."
  npm install -g pnpm@9
fi
log "pnpm $(pnpm -v) found"

# ─── Create directory structure ───────────────────────────────────────────────

info "Creating project structure..."

mkdir -p khetly
cd khetly

# Root
mkdir -p scripts

# Web app
mkdir -p apps/web/src/pages/auth
mkdir -p apps/web/src/pages/farmer
mkdir -p apps/web/src/pages/user
mkdir -p apps/web/src/pages/dashboard
mkdir -p apps/web/src/pages/onboarding
mkdir -p apps/web/src/components/ui
mkdir -p apps/web/src/components/forms
mkdir -p apps/web/src/components/layout
mkdir -p apps/web/src/components/maps
mkdir -p apps/web/src/components/common
mkdir -p apps/web/src/modules/auth
mkdir -p apps/web/src/modules/listings
mkdir -p apps/web/src/modules/farmer
mkdir -p apps/web/src/modules/user
mkdir -p apps/web/src/modules/ai
mkdir -p apps/web/src/hooks
mkdir -p apps/web/src/store
mkdir -p apps/web/src/services
mkdir -p apps/web/src/lib
mkdir -p apps/web/src/styles
mkdir -p apps/web/src/assets/icons
mkdir -p apps/web/public/icons

# API
mkdir -p apps/api/src/routes
mkdir -p apps/api/src/controllers
mkdir -p apps/api/src/middleware
mkdir -p apps/api/src/models
mkdir -p apps/api/src/services
mkdir -p apps/api/src/lib
mkdir -p apps/api/src/config
mkdir -p apps/api/src/modules/auth
mkdir -p apps/api/src/modules/listings
mkdir -p apps/api/src/modules/farmer
mkdir -p apps/api/src/modules/user
mkdir -p apps/api/src/modules/ai
mkdir -p apps/api/src/modules/uploads
mkdir -p apps/api/prisma

# Packages
mkdir -p packages/types/src
mkdir -p packages/utils/src
mkdir -p packages/config/src

log "Directory structure created"

# ─── Root config files ────────────────────────────────────────────────────────

info "Writing root config files..."

cat > package.json << 'EOF'
{
  "name": "khetly",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "engines": { "node": ">=20.0.0", "pnpm": ">=9.0.0" },
  "scripts": {
    "dev": "turbo run dev --parallel",
    "dev:web": "pnpm --filter web dev",
    "dev:api": "pnpm --filter api dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\" --ignore-path .gitignore",
    "clean": "turbo run clean && rm -rf node_modules",
    "db:generate": "pnpm --filter api prisma generate",
    "db:migrate": "pnpm --filter api prisma migrate dev",
    "db:seed": "pnpm --filter api prisma db seed",
    "db:studio": "pnpm --filter api prisma studio"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.2.5",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "typescript": "^5.4.5",
    "@typescript-eslint/eslint-plugin": "^7.9.0",
    "@typescript-eslint/parser": "^7.9.0",
    "eslint": "^9.3.0"
  },
  "workspaces": ["apps/*", "packages/*"]
}
EOF

cat > pnpm-workspace.yaml << 'EOF'
packages:
  - "apps/*"
  - "packages/*"
EOF

cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "test": { "dependsOn": ["^build"], "outputs": ["coverage/**"] },
    "lint": { "dependsOn": ["^build"] },
    "typecheck": { "dependsOn": ["^build"] },
    "clean": { "cache": false }
  }
}
EOF

cat > tsconfig.base.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "exclude": ["node_modules", "dist", ".turbo"]
}
EOF

cat > .gitignore << 'EOF'
node_modules/
.pnpm-store/
dist/
build/
.turbo/
.env
.env.local
.env.*.local
!.env.example
*.log
.DS_Store
*.tsbuildinfo
coverage/
apps/api/uploads/
EOF

cat > .prettierrc << 'EOF'
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
EOF

log "Root config files written"

# ─── packages/types ───────────────────────────────────────────────────────────

info "Writing @khetly/types..."

cat > packages/types/package.json << 'EOF'
{
  "name": "@khetly/types",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "devDependencies": { "typescript": "^5.4.5" }
}
EOF

cat > packages/types/src/index.ts << 'TYPES_EOF'
export type UserRole = 'RENTER' | 'FARMER' | 'ADMIN'
export type VerificationStatus = 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'
export type ListingStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED'
export type BookingStatus = 'ENQUIRY' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED'
export type HarvestSeason = 'RABI' | 'KHARIF' | 'ZAID' | 'YEAR_ROUND'
export type LandType = 'IRRIGATED_CANAL' | 'IRRIGATED_BOREWELL' | 'RAINFED' | 'ORCHARD'
export type SoilType = 'SANDY_LOAM' | 'CLAY_LOAM' | 'BLACK_COTTON' | 'RED_LATERITE' | 'ALLUVIAL' | 'UNKNOWN'
export type LogisticsOption = 'DOORSTEP_DELIVERY' | 'FARM_PICKUP' | 'MANDI_DROP' | 'COURIER'
export type AddonType = 'FARM_VIDEO' | 'FARM_VISIT' | 'TREE_RENTAL' | 'HOMEMADE_PRODUCTS' | 'HARVEST_BOX' | 'HARVEST_PHOTOS'
export type Language = 'en' | 'hi'

export interface GeoPoint { lat: number; lng: number }
export interface AuthUser {
  id: string; phone: string; role: UserRole; name: string
  isVerified: boolean; avatarUrl?: string; preferredLanguage: Language; createdAt: string
}
export interface AuthTokens { accessToken: string; refreshToken: string; expiresIn: number }
export interface AuthResponse { user: AuthUser; tokens: AuthTokens; isNewUser: boolean }
export interface OtpSendPayload { phone: string; role?: UserRole }
export interface OtpSendResponse { maskedPhone: string; expiresInSeconds: number; devOtp?: string }
export interface OtpVerifyPayload { phone: string; otp: string; role: UserRole }

export interface Address {
  line1?: string; village: string; tehsil: string
  district: string; state: string; pincode: string; geoPoint: GeoPoint
}
export interface FarmerProfile {
  id: string; userId: string; name: string; phone: string; bio: string
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
  photos: string[]; videoUrl?: string; viewCount: number; bookingCount: number
  createdAt: string; updatedAt: string
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
TYPES_EOF

log "@khetly/types written"

# ─── packages/utils ───────────────────────────────────────────────────────────

info "Writing @khetly/utils..."

cat > packages/utils/package.json << 'EOF'
{
  "name": "@khetly/utils",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "devDependencies": { "typescript": "^5.4.5" }
}
EOF

cat > packages/utils/src/index.ts << 'UTILS_EOF'
export function maskPhone(phone: string): string {
  const c = phone.replace(/\D/g, '').slice(-10)
  return `+91 ${c.slice(0,5)} ****${c.slice(-2)}`
}
export function normalisePhone(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.startsWith('91') && d.length === 12) return d.slice(2)
  return d.slice(-10)
}
export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(normalisePhone(phone))
}
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}
export function formatINRCompact(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount/10_000_000).toFixed(1)}Cr`
  if (amount >= 100_000) return `₹${(amount/100_000).toFixed(1)}L`
  if (amount >= 1_000) return `₹${(amount/1_000).toFixed(1)}K`
  return `₹${amount}`
}
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371, dLat = toRad(lat2-lat1), dLng = toRad(lng2-lng1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
function toRad(d: number) { return d * Math.PI / 180 }
export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km*1000)} m` : `${km.toFixed(1)} km`
}
export function initials(name: string): string {
  return name.split(' ').slice(0,2).map(w => w[0]?.toUpperCase() ?? '').join('')
}
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}
export function calcPlatformFee(amount: number, feePercent = 8) {
  const platformFee = Math.round(amount * feePercent / 100)
  return { platformFee, farmerReceives: amount - platformFee }
}
export function slugify(str: string): string {
  return str.toLowerCase().trim().replace(/[^\w\s-]/g,'').replace(/[\s_-]+/g,'-').replace(/^-+|-+$/g,'')
}
export function generateOtp(): string { return Math.floor(100_000 + Math.random()*900_000).toString() }
export function isValidAadhaar(a: string): boolean { return /^\d{12}$/.test(a.replace(/\s/g,'')) }
export function isValidIFSC(ifsc: string): boolean { return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase()) }
UTILS_EOF

log "@khetly/utils written"

# ─── Web app package.json ─────────────────────────────────────────────────────

info "Writing web app files..."

cat > apps/web/package.json << 'EOF'
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "clean": "rm -rf dist .turbo"
  },
  "dependencies": {
    "@khetly/types": "workspace:*",
    "@khetly/utils": "workspace:*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.23.1",
    "zustand": "^4.5.2",
    "immer": "^10.1.1",
    "@tanstack/react-query": "^5.40.0",
    "@tanstack/react-query-devtools": "^5.40.0",
    "axios": "^1.7.2",
    "react-hook-form": "^7.51.5",
    "zod": "^3.23.8",
    "@hookform/resolvers": "^3.4.2",
    "react-hot-toast": "^2.4.1",
    "lucide-react": "^0.383.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "date-fns": "^3.6.0",
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/leaflet": "^1.9.12",
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.2.13",
    "vite-plugin-pwa": "^0.20.1",
    "typescript": "^5.4.5",
    "tailwindcss": "^3.4.3",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "vitest": "^1.6.0",
    "@testing-library/react": "^15.0.7",
    "@testing-library/jest-dom": "^6.4.5",
    "jsdom": "^24.1.0"
  }
}
EOF

cat > apps/web/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@pages/*": ["src/pages/*"],
      "@hooks/*": ["src/hooks/*"],
      "@store/*": ["src/store/*"],
      "@services/*": ["src/services/*"],
      "@lib/*": ["src/lib/*"],
      "@modules/*": ["src/modules/*"],
      "@styles/*": ["src/styles/*"],
      "@assets/*": ["src/assets/*"]
    },
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src/**/*", "vite.config.ts"],
  "exclude": ["node_modules", "dist"]
}
EOF

cat > apps/web/postcss.config.js << 'EOF'
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
EOF

cat > apps/web/.env.example << 'EOF'
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_MAPS_KEY=
VITE_SENTRY_DSN=
EOF

# Copy .env.example to .env for local dev
cp apps/web/.env.example apps/web/.env

log "Web app config written"

# ─── API package.json ─────────────────────────────────────────────────────────

info "Writing API app files..."

cat > apps/api/package.json << 'EOF'
{
  "name": "api",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -b",
    "start": "node dist/index.js",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist .turbo",
    "prisma": "prisma"
  },
  "dependencies": {
    "@khetly/types": "workspace:*",
    "@khetly/utils": "workspace:*",
    "express": "^4.19.2",
    "@prisma/client": "^5.15.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "zod": "^3.23.8",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "express-rate-limit": "^7.3.1",
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.4.5",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/multer": "^1.4.11",
    "@types/uuid": "^10.0.0",
    "@types/node": "^20.14.2",
    "typescript": "^5.4.5",
    "tsx": "^4.15.1",
    "prisma": "^5.15.0"
  }
}
EOF

cat > apps/api/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@routes/*": ["src/routes/*"],
      "@controllers/*": ["src/controllers/*"],
      "@middleware/*": ["src/middleware/*"],
      "@models/*": ["src/models/*"],
      "@services/*": ["src/services/*"],
      "@lib/*": ["src/lib/*"],
      "@config/*": ["src/config/*"]
    },
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

cat > apps/api/.env.example << 'EOF'
# Server
PORT=4000
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/khetly_dev"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# OTP (use real SMS provider in production)
OTP_EXPIRY_SECONDS=300
OTP_LENGTH=6

# File uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10

# SMS Provider (MSG91 / Fast2SMS)
SMS_PROVIDER=dev
MSG91_AUTH_KEY=
MSG91_SENDER_ID=KHETLY
FAST2SMS_API_KEY=

# Anthropic (Phase 2 AI)
ANTHROPIC_API_KEY=
EOF

cp apps/api/.env.example apps/api/.env

log "API config written"

# ─── Prisma schema ────────────────────────────────────────────────────────────

info "Writing Prisma schema..."

cat > apps/api/prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole { RENTER FARMER ADMIN }
enum VerificationStatus { PENDING IN_REVIEW VERIFIED REJECTED }
enum RiskLevel { LOW MEDIUM HIGH }
enum ListingStatus { DRAFT PENDING_REVIEW ACTIVE PAUSED ARCHIVED }
enum BookingStatus { ENQUIRY CONFIRMED ACTIVE COMPLETED CANCELLED DISPUTED }
enum HarvestSeason { RABI KHARIF ZAID YEAR_ROUND }
enum LandType { IRRIGATED_CANAL IRRIGATED_BOREWELL RAINFED ORCHARD }
enum SoilType { SANDY_LOAM CLAY_LOAM BLACK_COTTON RED_LATERITE ALLUVIAL UNKNOWN }
enum LogisticsOption { DOORSTEP_DELIVERY FARM_PICKUP MANDI_DROP COURIER }
enum AddonType { FARM_VIDEO FARM_VISIT TREE_RENTAL HOMEMADE_PRODUCTS HARVEST_BOX HARVEST_PHOTOS }
enum PayoutStatus { PENDING PROCESSING PAID FAILED }

model User {
  id                String    @id @default(uuid())
  phone             String    @unique
  role              UserRole  @default(RENTER)
  name              String    @default("")
  avatarUrl         String?
  preferredLanguage String    @default("en")
  isVerified        Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  farmerProfile FarmerProfile?
  bookings      Booking[]     @relation("RenterBookings")
  reviews       Review[]      @relation("ReviewerReviews")
  otps          Otp[]
  refreshTokens RefreshToken[]
}

model Otp {
  id        String   @id @default(uuid())
  userId    String
  phone     String
  code      String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([phone])
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([token])
}

model FarmerProfile {
  id                  String             @id @default(uuid())
  userId              String             @unique
  bio                 String             @default("")
  village             String             @default("")
  tehsil              String             @default("")
  district            String             @default("")
  state               String             @default("")
  pincode             String             @default("")
  experienceYears     Int                @default(0)
  aadhaarVerified     Boolean            @default(false)
  bankVerified        Boolean            @default(false)
  verificationStatus  VerificationStatus @default(PENDING)
  bankAccountNumber   String?
  ifscCode            String?
  accountHolderName   String?
  upiId               String?
  rating              Float              @default(0)
  reviewCount         Int                @default(0)
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  listings            LandListing[]
  bookings            Booking[]          @relation("FarmerBookings")
}

model LandListing {
  id              String          @id @default(uuid())
  farmerId        String
  title           String
  description     String
  landType        LandType
  soilType        SoilType        @default(UNKNOWN)
  plotSizeAcres   Float
  village         String
  tehsil          String
  district        String
  state           String
  pincode         String
  lat             Float
  lng             Float
  primaryCrop     String
  seedVariety     String
  harvestSeason   HarvestSeason
  yieldMin        Float
  yieldMax        Float
  yieldUnit       String          @default("quintal/acre")
  priceMin        Float
  priceMax        Float
  priceUnit       String          @default("per quintal")
  fertilizerPlan  String
  pesticidePlan   String
  riskLevel       RiskLevel
  riskDescription String
  logistics       LogisticsOption[]
  addons          AddonType[]
  pricePerMonth   Float
  minRentalMonths Int             @default(1)
  status          ListingStatus   @default(DRAFT)
  photos          String[]
  videoUrl        String?
  viewCount       Int             @default(0)
  bookingCount    Int             @default(0)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  farmer          FarmerProfile   @relation(fields: [farmerId], references: [id])
  bookings        Booking[]
  reviews         Review[]
  @@index([lat, lng])
  @@index([status])
  @@index([farmerId])
}

model Booking {
  id                String        @id @default(uuid())
  listingId         String
  renterId          String
  farmerId          String
  status            BookingStatus @default(ENQUIRY)
  startDate         DateTime
  endDate           DateTime
  durationMonths    Int
  totalAmount       Float
  platformFeePercent Float        @default(8)
  platformFee       Float
  farmerReceives    Float
  selectedAddons    AddonType[]
  notes             String?
  payoutStatus      PayoutStatus  @default(PENDING)
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  listing           LandListing   @relation(fields: [listingId], references: [id])
  renter            User          @relation("RenterBookings", fields: [renterId], references: [id])
  farmer            FarmerProfile @relation("FarmerBookings", fields: [farmerId], references: [id])
  review            Review?
}

model Review {
  id                    String      @id @default(uuid())
  bookingId             String      @unique
  reviewerId            String
  listingId             String
  rating                Int
  comment               String
  yieldAccuracy         Int
  farmerResponsiveness  Int
  valueForMoney         Int
  createdAt             DateTime    @default(now())
  booking               Booking     @relation(fields: [bookingId], references: [id])
  reviewer              User        @relation("ReviewerReviews", fields: [reviewerId], references: [id])
  listing               LandListing @relation(fields: [listingId], references: [id])
}
EOF

log "Prisma schema written"

# ─── API src/index.ts ─────────────────────────────────────────────────────────

info "Writing API server entry..."

cat > apps/api/src/index.ts << 'EOF'
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'

const app = express()
const PORT = process.env['PORT'] ?? 4000

// ── Security middleware ──
app.use(helmet())
app.use(cors({
  origin: process.env['NODE_ENV'] === 'production'
    ? ['https://khetly.in', 'https://app.khetly.in']
    : ['http://localhost:3000'],
  credentials: true,
}))

// ── Rate limiting ──
app.use('/v1/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Too many requests', code: 'RATE_LIMITED', statusCode: 429 },
}))

// ── Body parsing ──
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Logging ──
app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'))

// ── Health check ──
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '0.1.0' })
})

// ── Routes (add as you build them) ──
// app.use('/v1/auth', authRouter)
// app.use('/v1/listings', listingsRouter)
// app.use('/v1/bookings', bookingsRouter)
// app.use('/v1/farmer', farmerRouter)
// app.use('/v1/ai', aiRouter)

// ── 404 handler ──
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', code: 'NOT_FOUND', statusCode: 404 })
})

// ── Error handler ──
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR', statusCode: 500 })
})

app.listen(PORT, () => {
  console.info(`🌾 Khetly API running on http://localhost:${PORT}`)
  console.info(`   Health: http://localhost:${PORT}/health`)
})

export default app
EOF

log "API server entry written"

# ─── Final summary ────────────────────────────────────────────────────────────

echo ""
echo "================================"
echo "🌾  Khetly project created!"
echo "================================"
echo ""
echo "📁 Location: $(pwd)"
echo ""
echo "Next steps:"
echo ""
echo "  1. cd khetly"
echo "  2. pnpm install"
echo "  3. pnpm dev:web        ← start frontend only"
echo ""
echo "  For API (needs PostgreSQL):"
echo "  4. Edit apps/api/.env  ← add your DATABASE_URL"
echo "  5. pnpm db:migrate"
echo "  6. pnpm dev:api"
echo ""
echo "  Open in VS Code:"
echo "  code ."
echo ""
