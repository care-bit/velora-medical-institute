import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  ArrowRight,
  Monitor,
  UserRound,
  ClipboardList,
  ShieldCheck,
  Dna,
} from 'lucide-react'

/**
 * Homepage hero — 1:1 with brand reference.
 * Desktop: left dark text panel + right full-bleed photo (real <Image>,
 * object-cover so it never mis-positions). Mobile: photo on top, content below.
 * Bottom utility strip spans full width below, separated by a hairline.
 */
export function HomeHero() {
  return (
    <section className="relative bg-[#0B0907] text-cream -mt-[84px] overflow-hidden">
      <div className="relative min-h-[580px] sm:min-h-[680px] lg:min-h-[calc(100svh-58px)]">

        {/* ===== FULL-BLEED PHOTO — entire hero background, uncropped ===== */}
        <Image
          src="/photos/hero-telehealth-light.png"
          alt="A patient on a Velora telemedicine visit with a physician"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />

        {/* Left → dark for text legibility, fading to clear photo in the middle */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to right,
              rgba(11,9,7,0.95) 0%,
              rgba(11,9,7,0.90) 30%,
              rgba(11,9,7,0.55) 50%,
              rgba(11,9,7,0.15) 65%,
              rgba(11,9,7,0) 80%)`,
          }}
          aria-hidden
        />

        {/* Right → warm gold tint glazing the photo */}
        <div
          className="absolute inset-0 pointer-events-none mix-blend-soft-light"
          style={{
            background: `linear-gradient(to right,
              rgba(201,160,100,0) 45%,
              rgba(201,160,100,0.35) 75%,
              rgba(201,160,100,0.6) 100%)`,
          }}
          aria-hidden
        />
        {/* Subtle additional gold warmth (overlay on top of soft-light for richness) */}
        <div
          className="absolute inset-y-0 right-0 w-1/2 pointer-events-none"
          style={{
            background: `linear-gradient(to right,
              rgba(201,160,100,0) 0%,
              rgba(201,160,100,0.10) 50%,
              rgba(201,160,100,0.22) 100%)`,
          }}
          aria-hidden
        />

        {/* Subtle top vignette for depth */}
        <div
          className="absolute inset-x-0 top-0 h-24 sm:h-32 pointer-events-none"
          style={{ background: `linear-gradient(to bottom, rgba(11,9,7,0.5), rgba(11,9,7,0))` }}
          aria-hidden
        />

        {/* ===== CONTENT — sits on the dark-left side ===== */}
        <div className="relative z-10 container-velora flex flex-col justify-center min-h-[580px] sm:min-h-[680px] lg:min-h-[calc(100svh-58px)] pt-[100px] sm:pt-[110px] lg:pt-[94px] pb-8 lg:pb-10">
          <div className="max-w-[62%] sm:max-w-[58%] lg:max-w-[560px] w-full">
            {/* Eyebrow */}
            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1.5 text-[9px] sm:text-[10.5px] lg:text-[11px] tracking-[0.22em] sm:tracking-[0.26em] uppercase text-cream/90 font-semibold">
              <span>Physician-Led</span>
              <span className="size-[3px] rounded-full bg-gold" aria-hidden />
              <span>Evidence-Based</span>
            </div>

            {/* Headline */}
            <h1
              className="mt-3 sm:mt-4 font-display leading-[1.06] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(1.25rem, 4.2vw, 2.5rem)' }}
            >
              <span className="text-cream">Double Board-Certified</span>
              <br />
              <span className="text-cream">Physician-Guided</span>
              <br />
              <em className="not-italic font-display text-gold italic">
                Weight Management, Hormone Therapy
              </em>
              <br />
              <em className="not-italic font-display text-gold italic">&amp; Longevity Medicine</em>
            </h1>

            <div className="mt-4 sm:mt-5 w-10 sm:w-16 h-px bg-gold" />

            {/* Body */}
            <p className="mt-3 sm:mt-5 max-w-[440px] text-[11.5px] sm:text-[13.5px] lg:text-[14.5px] leading-[1.55] sm:leading-[1.65] text-cream/80">
              Personalized telemedicine care for metabolic health, weight management,
              and hormone balance &mdash; guided by double board-certified physicians and
              refined over time to support lasting results.
            </p>

            {/* CTAs */}
            <div className="mt-4 sm:mt-6 lg:mt-7 flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
              <Link
                href="https://ehr.charmtracker.com/publicCal.sas?method=getCal&digest=169f4dd01960b6c31cb1f577544c70e574ed96d3d580cebc1192a3b4b068b2f4c791341ca9a05ba47b16a2ad35a972fba0ae868b6eb0918a"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2.5 bg-gold text-ink hover:bg-gold/90 px-3.5 sm:px-7 py-2.5 sm:py-4 rounded-md text-[10px] sm:text-[11.5px] tracking-[0.16em] sm:tracking-[0.2em] uppercase font-semibold transition-colors"
              >
                <Calendar className="size-3.5 sm:size-4" strokeWidth={2} />
                Book Consultation
              </Link>
              <Link
                href="/programs"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2.5 border border-cream/45 text-cream hover:bg-cream hover:text-ink px-3.5 sm:px-7 py-2.5 sm:py-4 rounded-md text-[10px] sm:text-[11.5px] tracking-[0.16em] sm:tracking-[0.2em] uppercase font-semibold transition-colors"
              >
                View Programs
                <ArrowRight className="size-3.5 sm:size-4" strokeWidth={2} />
              </Link>
            </div>

            {/* Trust row — tablet+ only */}
            <div className="hidden sm:grid mt-6 sm:mt-8 grid-cols-1 sm:grid-cols-3 max-w-[640px]">
              <TrustItem
                icon={<Monitor className="size-5" strokeWidth={1.4} />}
                title="Telemedicine Visits"
                body={<>Private. Convenient.<br />Secure.</>}
              />
              <TrustItem
                divider
                icon={<UserRound className="size-5" strokeWidth={1.4} />}
                title="Physician-Led Care"
                body={<>Expert guidance<br />every step.</>}
              />
              <TrustItem
                divider
                icon={<ClipboardList className="size-5" strokeWidth={1.4} />}
                title="Personalized Plans"
                body={<>Tailored to your biology<br />and your goals.</>}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== Bottom utility strip — full width ===== */}
      <div className="relative border-t border-cream/12">
        <div className="container-velora py-3 sm:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-3 text-[10px] sm:text-[11px] tracking-[0.28em] uppercase text-cream/80 font-semibold">
            <ShieldCheck className="size-4 text-gold shrink-0" strokeWidth={1.6} />
            <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span>Physician-Led</span>
              <span className="text-gold">•</span>
              <span>Evidence-Based</span>
              <span className="text-gold">•</span>
              <span>Results-Driven</span>
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] sm:text-[11px] tracking-[0.28em] uppercase text-cream/85 font-semibold">
            <Dna className="size-4 text-gold shrink-0" strokeWidth={1.6} />
            <p>
              Optimize Your Health.{' '}
              <span className="text-gold">Elevate Your Life.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustItem({
  icon,
  title,
  body,
  divider,
}: {
  icon: React.ReactNode
  title: string
  body: React.ReactNode
  divider?: boolean
}) {
  return (
    <div
      className={[
        'flex items-start gap-3 py-1.5 sm:py-0',
        divider ? 'sm:pl-6 sm:border-l border-cream/15' : 'sm:pr-6',
      ].join(' ')}
    >
      <span className="mt-0.5 text-gold shrink-0">{icon}</span>
      <div>
        <p className="text-[10px] sm:text-[10.5px] tracking-[0.22em] uppercase text-cream font-semibold leading-[1.3]">
          {title}
        </p>
        <p className="mt-1.5 text-[12px] text-cream/55 leading-[1.45]">
          {body}
        </p>
      </div>
    </div>
  )
}
