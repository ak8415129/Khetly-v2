import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Input, Textarea, Select } from '@components/ui/Input'
import { Button } from '@components/ui/Button'
import { cn, getCurrentPosition } from '@lib/utils'
import type { LandListing, AddonType, LogisticsOption } from '@khetly/types'
import { ADDON_META } from '@lib/utils'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  landType: z.enum(['IRRIGATED_CANAL', 'IRRIGATED_BOREWELL', 'RAINFED', 'ORCHARD']),
  soilType: z.enum(['SANDY_LOAM', 'CLAY_LOAM', 'BLACK_COTTON', 'RED_LATERITE', 'ALLUVIAL', 'UNKNOWN']),
  plotSizeAcres: z.coerce.number().min(0.1, 'Must be at least 0.1 acres'),
  village: z.string().min(2, 'Required'),
  tehsil: z.string().min(2, 'Required'),
  district: z.string().min(2, 'Required'),
  state: z.string().min(2, 'Required'),
  pincode: z.string().length(6, 'Enter 6-digit pincode'),
  geoPoint: z.object({ lat: z.number(), lng: z.number() }).optional(),
  primaryCrop: z.string().min(2, 'Required'),
  seedVariety: z.string().min(2, 'Required'),
  harvestSeason: z.enum(['RABI', 'KHARIF', 'ZAID', 'YEAR_ROUND']),
  yieldMin: z.coerce.number().min(0),
  yieldMax: z.coerce.number().min(0),
  yieldUnit: z.string().default('quintal/acre'),
  estimatedPriceMin: z.coerce.number().min(0),
  estimatedPriceMax: z.coerce.number().min(0),
  fertilizerPlan: z.string().optional(),
  pesticidePlan: z.string().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  riskDescription: z.string().min(10, 'Please describe the risks (min 10 chars)'),
  pricePerMonth: z.coerce.number().min(100, 'Minimum ₹100/month'),
  minRentalMonths: z.coerce.number().min(1),
  logistics: z.array(z.string()).min(1, 'Select at least one logistics option'),
  addons: z.array(z.string()),
})

export type ListingFormValues = z.infer<typeof schema>

interface ListingFormProps {
  defaultValues?: Partial<ListingFormValues>
  onSubmit: (values: ListingFormValues) => void
  isSubmitting: boolean
  submitLabel?: string
}

const LOGISTICS_OPTIONS = [
  { value: 'DOORSTEP_DELIVERY', label: '🚚 Doorstep delivery' },
  { value: 'FARM_PICKUP', label: '🚜 Farm pickup only' },
  { value: 'MANDI_DROP', label: '🏪 Local mandi drop' },
  { value: 'COURIER', label: '📦 Courier (small packages)' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function ListingForm({ defaultValues, onSubmit, isSubmitting, submitLabel = 'Save listing' }: ListingFormProps) {
  const [locating, setLocating] = useState(false)
  const { register, handleSubmit, control, formState: { errors }, watch, setValue } = useForm<ListingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      landType: 'IRRIGATED_CANAL', soilType: 'UNKNOWN', harvestSeason: 'RABI',
      riskLevel: 'LOW', minRentalMonths: 1, yieldUnit: 'quintal/acre',
      logistics: [], addons: [],
      ...defaultValues,
    },
  })

  const logistics = watch('logistics')
  const addons = watch('addons')
  const geoPoint = watch('geoPoint')

  const toggleArray = (current: string[], value: string, onChange: (v: string[]) => void) => {
    onChange(current.includes(value) ? current.filter(v => v !== value) : [...current, value])
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

      {/* ── Basic info ── */}
      <Section title="Basic information">
        <Input label="Listing title" placeholder="e.g. Ramesh's Wheat Plot — 2 acres, Gurugram" error={errors.title?.message} {...register('title')} />
        <Textarea label="Description (optional)" placeholder="Tell renters about the land, access routes, water source…" {...register('description')} />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Land type" options={[
            { value: 'IRRIGATED_CANAL', label: 'Irrigated (canal)' },
            { value: 'IRRIGATED_BOREWELL', label: 'Irrigated (borewell)' },
            { value: 'RAINFED', label: 'Rainfed' },
            { value: 'ORCHARD', label: 'Orchard / tree land' },
          ]} error={errors.landType?.message} {...register('landType')} />
          <Select label="Soil type" options={[
            { value: 'SANDY_LOAM', label: 'Sandy loam' },
            { value: 'CLAY_LOAM', label: 'Clay loam' },
            { value: 'BLACK_COTTON', label: 'Black cotton' },
            { value: 'RED_LATERITE', label: 'Red laterite' },
            { value: 'ALLUVIAL', label: 'Alluvial' },
            { value: 'UNKNOWN', label: 'Not sure' },
          ]} error={errors.soilType?.message} {...register('soilType')} />
        </div>
        <Input label="Plot size (acres)" type="number" step="0.1" placeholder="e.g. 2" error={errors.plotSizeAcres?.message} {...register('plotSizeAcres')} />
      </Section>

      {/* ── Location ── */}
      <Section title="Location">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Village" placeholder="Sohna" error={errors.village?.message} {...register('village')} />
          <Input label="Tehsil" placeholder="Sohna" error={errors.tehsil?.message} {...register('tehsil')} />
          <Input label="District" placeholder="Gurugram" error={errors.district?.message} {...register('district')} />
          <Input label="State" placeholder="Haryana" error={errors.state?.message} {...register('state')} />
          <Input label="Pincode" placeholder="122103" maxLength={6} error={errors.pincode?.message} {...register('pincode')} />
        </div>

        <div className="mt-4 flex items-center justify-between p-3.5 bg-brand-50 rounded-xl border border-brand-200">
          <div>
            <p className="text-xs font-medium text-brand-900">Farm GPS Coordinates</p>
            <p className="text-xs text-brand-700 mt-0.5">
              {geoPoint?.lat
                ? `📍 Captured: ${geoPoint.lat.toFixed(4)}, ${geoPoint.lng.toFixed(4)}`
                : 'Helps renters find your farm by nearby distance'}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant={geoPoint?.lat ? 'secondary' : 'outline'}
            loading={locating}
            onClick={async () => {
              setLocating(true)
              try {
                const pos = await getCurrentPosition()
                setValue('geoPoint', { lat: pos.coords.latitude, lng: pos.coords.longitude })
                toast.success('Farm GPS location captured! 📍')
              } catch {
                toast.error('Could not detect GPS location. Address will be used.')
              } finally {
                setLocating(false)
              }
            }}
          >
            {geoPoint?.lat ? 'Update GPS' : '📍 Use Current GPS'}
          </Button>
        </div>
      </Section>

      {/* ── Crop ── */}
      <Section title="Crop & yield">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Primary crop" placeholder="Wheat" error={errors.primaryCrop?.message} {...register('primaryCrop')} />
          <Input label="Seed variety" placeholder="HD-2967" error={errors.seedVariety?.message} {...register('seedVariety')} />
          <Select label="Harvest season" options={[
            { value: 'RABI', label: 'Rabi (Oct–Mar)' },
            { value: 'KHARIF', label: 'Kharif (Jun–Nov)' },
            { value: 'ZAID', label: 'Zaid (Mar–Jun)' },
            { value: 'YEAR_ROUND', label: 'Year-round' },
          ]} error={errors.harvestSeason?.message} {...register('harvestSeason')} />
          <Input label="Yield unit" placeholder="quintal/acre" error={errors.yieldUnit?.message} {...register('yieldUnit')} />
          <Input label="Expected yield (min)" type="number" placeholder="18" error={errors.yieldMin?.message} {...register('yieldMin')} />
          <Input label="Expected yield (max)" type="number" placeholder="22" error={errors.yieldMax?.message} {...register('yieldMax')} />
          <Input label="Est. price (min) ₹" type="number" placeholder="2100" error={errors.estimatedPriceMin?.message} {...register('estimatedPriceMin')} />
          <Input label="Est. price (max) ₹" type="number" placeholder="2400" error={errors.estimatedPriceMax?.message} {...register('estimatedPriceMax')} />
        </div>
        <Textarea label="Fertilizer plan" placeholder="DAP at sowing + Urea top-dress at 30 DAS…" {...register('fertilizerPlan')} />
        <Textarea label="Pesticide / pest plan" placeholder="Neem-based spray, no synthetic pesticides…" {...register('pesticidePlan')} />
      </Section>

      {/* ── Risk ── */}
      <Section title="Pricing & risk">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Rental price (₹/month)" type="number" placeholder="4200" error={errors.pricePerMonth?.message} {...register('pricePerMonth')} />
          <Input label="Minimum rental (months)" type="number" placeholder="1" error={errors.minRentalMonths?.message} {...register('minRentalMonths')} />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Risk level</label>
          <Controller
            name="riskLevel"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-3">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => field.onChange(level)}
                    className={cn(
                      'py-3 px-4 rounded-xl border text-sm font-medium text-left transition-all',
                      field.value === level
                        ? level === 'LOW' ? 'bg-risk-low border-green-300 text-risk-low-text'
                          : level === 'MEDIUM' ? 'bg-risk-medium border-amber-300 text-risk-medium-text'
                          : 'bg-risk-high border-red-300 text-risk-high-text'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    )}
                  >
                    <div className="font-semibold">{level === 'LOW' ? '✅ Low' : level === 'MEDIUM' ? '⚠️ Medium' : '🔴 High'}</div>
                    <div className="text-xs mt-1 font-normal opacity-70">
                      {level === 'LOW' ? 'Irrigated, stable crop' : level === 'MEDIUM' ? 'Rainfed or new variety' : 'Experimental, drought-prone'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          />
          {errors.riskLevel && <p className="text-xs text-red-500 mt-1">{errors.riskLevel.message}</p>}
        </div>

        <Textarea label="Risk description (be honest)" placeholder="e.g. Plot near a nala — flooding risk in heavy rain. Yield can drop 20–30% in bad monsoon years." error={errors.riskDescription?.message} {...register('riskDescription')} />
      </Section>

      {/* ── Logistics ── */}
      <Section title="Logistics">
        <Controller
          name="logistics"
          control={control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {LOGISTICS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleArray(field.value, opt.value, field.onChange)}
                  className={cn(
                    'px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                    field.value.includes(opt.value)
                      ? 'bg-brand-50 border-brand-400 text-brand-800'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        />
        {errors.logistics && <p className="text-xs text-red-500 mt-1">{errors.logistics.message}</p>}
      </Section>

      {/* ── Add-ons ── */}
      <Section title="Add-on services (optional)">
        <Controller
          name="addons"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ADDON_META).map(([value, meta]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleArray(field.value, value, field.onChange)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl border text-left transition-all',
                    field.value.includes(value)
                      ? 'bg-brand-50 border-brand-400'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  )}
                >
                  <span className="text-lg">{meta.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-gray-900">{meta.label}</p>
                    <p className="text-xs text-gray-500">{meta.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        />
      </Section>

      <Button type="submit" variant="primary" fullWidth loading={isSubmitting} size="lg">
        {submitLabel}
      </Button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
