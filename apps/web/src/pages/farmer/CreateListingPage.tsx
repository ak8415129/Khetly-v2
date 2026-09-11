import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ListingForm, type ListingFormValues } from '@components/forms/ListingForm'
import { useCreateListing } from '@modules/listings/listings.hooks'

export default function CreateListingPage() {
  const navigate = useNavigate()
  const createListing = useCreateListing()

  const handleSubmit = (values: ListingFormValues) => {
    createListing.mutate({
      title: values.title,
      description: values.description ?? '',
      landType: values.landType,
      soilType: values.soilType,
      plotSizeAcres: values.plotSizeAcres,
      address: {
        village: values.village, tehsil: values.tehsil,
        district: values.district, state: values.state, pincode: values.pincode,
        geoPoint: values.geoPoint,
      },
      cropDetails: {
        primaryCrop: values.primaryCrop, seedVariety: values.seedVariety,
        harvestSeason: values.harvestSeason, yieldMin: values.yieldMin,
        yieldMax: values.yieldMax, yieldUnit: values.yieldUnit,
        estimatedPriceMin: values.estimatedPriceMin, estimatedPriceMax: values.estimatedPriceMax,
        priceUnit: 'per quintal', fertilizerPlan: values.fertilizerPlan ?? '',
        pesticidePlan: values.pesticidePlan ?? '',
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
        <div>
          <h1 className="text-xl font-medium text-gray-900">Create listing</h1>
          <p className="text-sm text-gray-500">It will be reviewed within 24 hours before going live</p>
        </div>
      </div>

      <div className="card p-6">
        <ListingForm
          onSubmit={handleSubmit}
          isSubmitting={createListing.isPending}
          submitLabel="Submit for review"
        />
      </div>
    </div>
  )
}
