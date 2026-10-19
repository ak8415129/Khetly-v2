export interface KnowledgeEntry {
  id: string
  title: string
  content: string
  category: 'renting' | 'listing' | 'trust_safety' | 'payments' | 'account' | 'agriculture' | 'crops'
}

/**
 * Source of truth for the RAG assistant's knowledge base.
 * Edit this file and re-run `pnpm --filter api seed:kb` to update what the assistant knows.
 * Keep each entry focused on one topic — smaller, specific chunks retrieve better than long ones.
 */
export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: 'kb-how-renting-works',
    title: 'How renting farmland on Khetly works',
    category: 'renting',
    content:
      'On Khetly, renters browse active farmland listings without needing to sign in. Each listing shows the crop, plot size, price per month, minimum rental duration, and a risk disclosure written by the farmer. To actually book, a renter signs in with Google, then submits an enquiry with a start date, duration, and optional add-ons. The farmer reviews the enquiry and can confirm or decline it. Once confirmed, the booking moves to active status for the agreed duration.',
  },
  {
    id: 'kb-risk-disclosure',
    title: 'Understanding risk levels on listings',
    category: 'renting',
    content:
      'Every listing has a risk level set by the farmer: Low, Medium, or High. Low risk usually means irrigated land with a stable, well-established crop. Medium risk often means rainfed land or a newer crop variety. High risk means experimental crops or land more exposed to drought or flooding. The farmer also writes a free-text risk description explaining specific threats like flooding history or pest issues. Renters should always read this before booking — Khetly does not guarantee yield outcomes.',
  },
  {
    id: 'kb-platform-fee',
    title: 'Platform fee and pricing',
    category: 'payments',
    content:
      'Khetly charges a platform fee of 8 percent on the total booking amount. The total is calculated as the listing price per month multiplied by the number of months rented. The farmer receives the remaining amount after the platform fee is deducted. This fee covers listing verification, farmer identity checks, and payment facilitation.',
  },
  {
    id: 'kb-farmer-verification',
    title: 'How farmer verification works',
    category: 'trust_safety',
    content:
      'Before a farmer can list land, they complete an onboarding flow that collects their bio, village, district, state, Aadhaar number, and bank account details including IFSC code. This submission goes to Khetly admins for verification. Once verified, the farmer gets a Verified badge shown on all their listings, which helps renters trust the listing. Unverified farmers can still create listings, but they stay pending until both the farmer and the specific listing are approved.',
  },
  {
    id: 'kb-listing-approval',
    title: 'Why a listing shows as pending review',
    category: 'listing',
    content:
      'When a farmer creates or edits an active listing, it goes into Pending Review status and is not visible to renters yet. A Khetly admin checks the listing details — crop information, pricing, and especially the risk description — before approving it. Most listings are reviewed within 24 hours. If rejected, the farmer sees the specific reason and can edit and resubmit. This review step exists to keep the marketplace trustworthy, since real money and real land are involved.',
  },
  {
    id: 'kb-addons',
    title: 'Add-on services available on listings',
    category: 'renting',
    content:
      'Some listings offer optional add-ons alongside the land rental: farm videos (monthly crop progress updates), farm visits (the renter can walk the land in person), tree rentals (renting a specific fruit tree), homemade farm products like ghee or pickles, harvest boxes (seasonal produce delivered to the renter), and harvest photos for documentation. These are shown on the listing detail page and can be selected when making a booking enquiry.',
  },
  {
    id: 'kb-roles',
    title: 'Account types on Khetly',
    category: 'account',
    content:
      'Khetly has three account types. A Renter browses and books farmland. A Farmer lists land for rent and manages bookings from renters. An Admin reviews and approves listings, verifies farmer identities, and manages user accounts — admin access is not self-selectable, it is assigned internally. After signing in with Google for the first time, a new user picks whether they are a Renter or a Farmer.',
  },
  {
    id: 'kb-cancellation',
    title: 'Cancelling a booking',
    category: 'renting',
    content:
      'A booking can be cancelled by the renter while it is still in Enquiry or Confirmed status, before it becomes Active. Once a booking is Active, it generally cannot be cancelled through the app and any changes should be worked out directly with the farmer. Completed bookings cannot be cancelled.',
  },
  {
    id: 'kb-login',
    title: 'Signing in to Khetly',
    category: 'account',
    content:
      'Khetly uses Google Sign-In for authentication — there is no password or OTP to manage. Clicking continue with Google opens a Google account picker, and after choosing an account, the user is signed in immediately. First-time users are asked to pick a role, Renter or Farmer, and enter their name before continuing.',
  },
  {
    id: 'kb-proximity',
    title: 'Finding farmland near you',
    category: 'renting',
    content:
      'Khetly shows listings sorted by distance from the renter when location is available, so nearby farmland appears first. This makes it practical to actually visit the land, coordinate with the farmer in person, and keep logistics simple compared to renting land far away.',
  },
  {
    id: 'kb-winter-crops-north-india',
    title: 'Winter Season Crops in North India (Rabi Season)',
    category: 'crops',
    content:
      'In North India (Punjab, Haryana, Uttar Pradesh, Rajasthan, Delhi-NCR, Bihar, and Madhya Pradesh), the winter agricultural season is known as the Rabi season. Sowing begins from October to November, and harvesting takes place in spring from March to April. Major winter crops include: 1. Wheat (Gehun) — the staple grain, requires cool growing temperatures and sunny dry ripening. Popular varieties: HD-2967, HD-3086, DBW-187. 2. Mustard / Sarson (Rai) — key cash oilseed crop, requires well-drained loamy soil and cool dry climate. 3. Chickpea / Chana (Bengal Gram) — high-protein pulse, fixes nitrogen in soil, drought tolerant. 4. Green Peas (Matar) and Lentils (Masoor). 5. Potatoes (Aloo) — high-yield commercial crop planted in October-November. 6. Winter vegetables: Cauliflower, Cabbage, Carrots, Radish, Spinach, Fenugreek (Methi), Garlic, and Onion. Winter crops generally have lower pest infestation than Kharif and enjoy high market demand.',
  },
  {
    id: 'kb-indian-crop-seasons',
    title: 'Overview of Indian Cropping Seasons: Rabi, Kharif, and Zaid',
    category: 'agriculture',
    content:
      'Agriculture in India operates on three primary seasonal cycles: 1. Kharif (Monsoon): Sown in June–July with monsoon rains, harvested in September–October. Crops include Paddy (Rice), Maize, Cotton, Bajra, Soybean, and Groundnut. 2. Rabi (Winter): Sown in October–November, harvested in March–April. Crops include Wheat, Mustard, Gram, Barley, Potato, and Peas. 3. Zaid (Summer): Sown from March to June between Rabi and Kharif. Crops include Watermelon, Muskmelon, Cucumber, Bitter gourd, and Moong pulse. On Khetly, farmland listings specify their harvest season and irrigation type (canal, borewell, rainfed) so renters can choose plots suited for their targeted crops.',
  },
  {
    id: 'kb-disputes-and-reviews',
    title: 'Disputes, Claims, and Farmer Ratings on Khetly',
    category: 'trust_safety',
    content:
      'Renters on Khetly have the right to raise a dispute or claim if a booking is active or completed and issues arise, such as land condition mismatch, crop yield discrepancy, or unreachability. Raising a dispute flags the transaction for admin investigation and pauses payout releases. Once a rental is marked completed, renters can submit a rating (1 to 5 stars) and review covering yield accuracy, farmer responsiveness, and value for money, which updates the farmer public profile rating.',
  },
]

