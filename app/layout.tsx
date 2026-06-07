import type { Metadata, Viewport } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { GoogleAnalytics } from '@/components/analytics/google-analytics'
import { JsonLd } from '@/components/analytics/json-ld'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['SOFT', 'opsz'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const SITE_URL = 'https://www.veloramedicalinstitute.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: 'hvePVkuf-LUGeW047VH88XHuXOizzyK6QmMS1jhwcTA',
  },
alternates: {
  canonical: '/',
},
  title: {
    default: 'Velora Medical Institute — Weight Management, Hormone Therapy & Longevity',
    template: '%s — Velora Medical Institute',
  },
  description:
    'Physician-directed care in medical weight management, bioidentical hormone therapy, and longevity & preventive medicine. Double board-certified physicians serving Chesterfield, MO and St. Louis area via telemedicine.',
  keywords: [
    'medical weight management',
    'hormone therapy',
    'longevity medicine',
    'preventive medicine',
    'bioidentical hormones',
    'GLP-1',
    'semaglutide',
    'tirzepatide',
    'BHRT',
    'telemedicine',
    'obesity medicine',
    'internal medicine',
    'Chesterfield Missouri',
    'St. Louis telemedicine',
    'Missouri weight loss doctor',
    'hormone therapy Missouri',
    'direct pay medical practice',
    'concierge medicine St Louis',
  ],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: 'Velora Medical Institute',
    description:
      'Physician-guided weight management, hormone therapy, and longevity & preventive medicine. Direct-pay telemedicine practice serving Chesterfield, MO and greater St. Louis.',
    siteName: 'Velora Medical Institute',
    images: [
      {
        url: '/velora-logo-full.png',
        width: 1536,
        height: 1024,
        alt: 'Velora Medical Institute — Physician-Directed Care',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Velora Medical Institute',
    description:
      'Physician-directed weight management, hormone therapy & longevity medicine. Telemedicine, Chesterfield MO.',
    images: ['/velora-logo-full.png'],
  },
  icons: {
    icon: '/velora-leaf-icon.png',
    apple: '/apple-icon.png',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#F4EBD3',
}

const medicalClinicSchema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: 'Velora Medical Institute',
  description:
    'Physician-directed, direct-pay telemedicine practice specializing in medical weight management, bioidentical hormone therapy, and longevity & preventive medicine.',
  url: SITE_URL,
  telephone: '+13142718668',
  email: 'care@veloramedicalinstitute.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '36 Four Seasons Shopping Center Ste 181',
    addressLocality: 'Chesterfield',
    addressRegion: 'MO',
    postalCode: '63017',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 38.6523,
    longitude: -90.5773,
  },
  areaServed: [
    { '@type': 'City', name: 'Chesterfield', containedIn: 'Missouri' },
    { '@type': 'City', name: 'St. Louis', containedIn: 'Missouri' },
    { '@type': 'State', name: 'Missouri' },
  ],
  medicalSpecialty: ['ObesityMedicine', 'InternalMedicine'],
  availableService: [
    { '@type': 'MedicalTherapy', name: 'Medical Weight Management' },
    { '@type': 'MedicalTherapy', name: 'Bioidentical Hormone Therapy' },
    { '@type': 'MedicalTherapy', name: 'Longevity & Preventive Medicine' },
    { '@type': 'MedicalTherapy', name: 'GLP-1 Receptor Agonist Therapy' },
  ],
  priceRange: '$$',
  currenciesAccepted: 'USD',
  paymentAccepted: 'Credit Card',
  sameAs: [`${SITE_URL}`],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-bone text-ink font-sans antialiased flex flex-col"
      >
        <JsonLd data={medicalClinicSchema} />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
