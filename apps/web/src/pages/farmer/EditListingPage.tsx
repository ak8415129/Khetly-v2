import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ListingForm, type ListingFormValues } from '@components/forms/ListingForm'
import { useListing, useUpdateListing } from '@modules/listings/listings.hooks'
import { PageSpinner } from '@components/common/PageSpinner'

export default function EditListingPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: listing, isLoading } = useListing(id ?? '')
  const updateListing = useUpdateListing(id ?? '')

  if (isLoading) return <PageSpinner />
  if (!listing) return <div className="text-center py-16 text-gray-500">Listing not found.</div>

  const defaultValues: Partial<ListingFormValues> = {
    title: listing.title,
    description: listing.description,
    landType: listing.landType,
    soilType: listing.soilType,
    plotSizeAcres: listing.plotSizeAcres,
    village: listing.address.village,
    tehsil: listing.address.tehsil,
    district: listing.address.district,
    state: listing.address.state,
    pincode: listing.address.pincode,
    primaryCrop: listing.cropDetails.primaryCrop,
    seedVariety: listing.cropDetails.seedVariety,
    harvestSeason: listing.cropDetails.harvestSeason,
    yieldMin: listing.cropDetails.yieldMin,
    yieldMax: listing.cropDetails.yieldMax,
    yieldUnit: listing.cropDetails.yieldUnit,
    estimatedPriceMin: listing.cropDetails.estimatedPriceMin,
    estimatedPriceMax: listing.cropDetails.estimatedPriceMax,
    fertilizerPlan: listing.cropDetails.fertilizerPlan,
    pesticidePlan: listing.cropDetails.pesticidePlan,
    riskLevel: listing.riskLevel,
    riskDescription: listing.riskDescription,
    pricePerMonth: listing.pricePerMonth,
    minRentalMonths: listing.minRentalMonths,
    logistics: listing.logistics as string[],
    addons: listing.addons as string[],
  }

  const handleSubmit = (values: ListingFormValues) => {
    updateListing.mutate({
      title: values.title,
      description: values.description,
      landType: values.landType,
      soilType: values.soilType,
      plotSizeAcres: values.plotSizeAcres,
      address: { village: values.village, tehsil: values.tehsil, district: values.district, state: values.state, pincode: values.pincode, geoPoint: values.geoPoint },
      cropDetails: {
        primaryCrop: values.primaryCrop, seedVariety: values.seedVariety,
        harvestSeason: values.harvestSeason, yieldMin: values.yieldMin, yieldMax: values.yieldMax,
        yieldUnit: values.yieldUnit, estimatedPriceMin: values.estimatedPriceMin,
        estimatedPriceMax: values.estimatedPriceMax, priceUnit: 'per quintal',
        fertilizerPlan: values.fertilizerPlan ?? '', pesticidePlan: values.pesticidePlan ?? '',
      },
      riskLevel: values.riskLevel,
      riskDescription: values.riskDescription,
      pricePerMonth: values.pricePerMonth,
      minRentalMonths: values.minRentalMonths,
      logistics: values.logistics as never[],
      addons: values.addons as never[],
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-medium text-gray-900">Edit listing</h1>
      </div>

      <div className="card p-6">
        <ListingForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={updateListing.isPending}
          submitLabel="Save changes"
        />
      </div>
    </div>
  )
}
