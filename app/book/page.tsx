import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import BookingClient from './booking-client'
export const metadata: Metadata = {
  title: 'Book Your Consultation',
  description:
    'Schedule a physician-guided initial consultation with Velora Medical Institute — telemedicine appointments via secure CharmHealth booking.',
}

export default function BookPage() {
  return (
    <section className="bg-bone">
      <div className="container-velora pt-10 lg:pt-14 pb-12 sm:pb-16 lg:pb-24">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-[10px] sm:text-[10.5px] tracking-[0.46em] uppercase text-brown font-semibold">
            Book a Consultation
          </p>
          <h1
            className="mt-6 font-display text-ink leading-[1.02] tracking-[-0.022em]"
            style={{ fontSize: 'clamp(1.875rem, 4.4vw, 3.25rem)' }}
          >
            Select a time that
            <br />
            <em className="italic font-display text-brown">works for you.</em>
          </h1>
          <div className="mt-6 mx-auto flex items-center justify-center gap-3">
            <span className="w-6 h-px bg-gold/70" />
            <span className="size-1 rounded-full bg-gold" />
            <span className="w-6 h-px bg-gold/70" />
          </div>
          <div className="mt-6 inline-flex items-center gap-2.5">
            <ShieldCheck className="size-4 text-brown shrink-0" strokeWidth={1.8} />
            <span className="text-[12px] text-ink-soft leading-[1.45]">
              60-minute physician visit &middot; Telemedicine &middot;{' '}
              <span className="text-brown font-semibold">$295</span>
            </span>
          </div>
        </div>

        <BookingClient />

        {/* Trouble fallback */}
        <p className="mt-6 lg:mt-8 text-center text-[12px] text-ink-soft">
          Calendar not loading?{' '}
          <Link
            href="/contact"
            className="text-brown hover:text-brown-deep font-semibold border-b border-brown/40 hover:border-brown pb-0.5 transition-colors inline-flex items-center gap-1.5"
          >
            Reach a physician directly
            <ArrowRight className="size-3" />
          </Link>
        </p>
      </div>
    </section>
  )
}
