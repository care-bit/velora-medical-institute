import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'
import { HomeHero } from '@/components/site/home-hero'

export default function HomePage() {
  return (
    <>
      <HomeHero />

      {/* ===== 01 · OUR APPROACH — Physician-led composite (airy) ===== */}
      <section className="bg-bone border-t border-line/40">
        <div className="container-velora pt-10 lg:pt-14 pb-2 text-center">
          <ChapterEyebrow number="01" label="Our Approach" />
        </div>
        <div className="relative w-full aspect-[16/9] lg:max-h-[calc(100vh-78px)] overflow-hidden">
          <Image
            src="/physician-led-care.png"
            alt="Drs. Tolebeyan and Amini — double board-certified in Internal Medicine and Obesity Medicine — flanking the Velora care framework: Physician-Led Individualized Care; Physician-Directed Care; Personalized Treatment Plans; Telemedicine Visits; Direct-Pay Practice"
            fill
            sizes="100vw"
            className="object-contain object-center"
            priority
          />
        </div>
      </section>

      {/* ===== 02 · OUR SERVICE AREAS — 3 photo-forward cards ===== */}
      <section className="bg-paper">
        <div className="container-velora py-10 sm:py-14 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[10px] sm:text-[11px] tracking-[0.34em] uppercase text-brown font-semibold">
              Our Service Areas
            </p>
            <h2
              className="mt-5 font-display leading-[1.1] tracking-[-0.018em] text-ink"
              style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.625rem)' }}
            >
              Personalized Medicine for Every Stage of Life
            </h2>
          </div>

          <div className="mt-9 sm:mt-12 lg:mt-16 grid md:grid-cols-3 gap-7 lg:gap-9 max-w-6xl mx-auto">
            <ServiceCard
              href="/weight-management"
              image="/photos/card-weight-glp1.png"
              title="Weight Management"
              body="Physician-guided GLP-1 therapy and medical weight management programs to help you lose weight, improve metabolism, and sustain long-term results."
            />
            <ServiceCard
              href="/hormone-therapy"
              image="/photos/card-hormone-therapy.png"
              title="Hormone Optimization"
              body="Restore balance, improve energy, enhance mood, and support overall hormonal health through personalized hormone therapy."
            />
            <ServiceCard
              href="/longevity"
              image="/photos/card-longevity-coast.png"
              title="Longevity & Preventive Medicine"
              body="Proactive, personalized strategies to optimize health, prevent disease, and support long-term vitality."
            />
          </div>
        </div>
      </section>

      {/* ===== START YOUR JOURNEY — single editorial composite ===== */}
      <section className="bg-bone" aria-label="Start your journey">
        <div className="container-velora py-10 sm:py-12 lg:py-16">
          <div className="relative max-w-6xl mx-auto">
            <Image
              src="/photos/start-your-journey.png"
              alt="Start your journey — Book Initial Consult, See the Doctor, Choose Your Care Path. Two paths: A Individual Follow-Up Visits (flexible, pay-per-visit care) or B Structured Programs (recommended; guided plans for long-term results)."
              width={1717}
              height={916}
              sizes="(min-width: 1024px) 1100px, 100vw"
              className="w-full h-auto rounded-xl"
              priority
            />
            {/* Clickable hotspots over the A and B cards */}
            <Link
              href="/individual-visits"
              aria-label="View Individual Follow-Up Visits"
              className="absolute left-[3%] top-[46%] w-[45%] h-[50%] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brown"
            />
            <Link
              href="/programs"
              aria-label="View Structured Programs"
              className="absolute left-[52%] top-[46%] w-[45%] h-[50%] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brown"
            />
          </div>
        </div>
      </section>


      {/* ===== 05 · THE PHYSICIANS — matches /about ===== */}
      <section className="bg-bone border-t border-line/40">
        <div className="container-velora py-12 sm:py-14 lg:py-16">
          <div className="text-center max-w-2xl mx-auto">
            <ChapterEyebrow number="05" label="The Physicians" />
            <h2
              className="mt-5 font-display text-ink leading-[1.04] tracking-[-0.018em]"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
            >
              Trained in Internal Medicine.
              <br />
              <em className="italic font-display text-brown">Specialized in Obesity Medicine.</em>
            </h2>
          </div>

          <div className="mt-9 lg:mt-11 grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            <PhysicianCard
              src="/dr-amini.png"
              name="Afshin Amini, MD"
              credentials="Double Board-Certified · Internal Medicine · Obesity Medicine"
              bio="Dr. Amini is a double board-certified physician with focused expertise in metabolic health, weight management, hormone optimization, and longevity & preventive medicine. His practice emphasizes thorough clinical assessment, evidence-based treatment, and continuous physician-guided refinement over time."
            />
            <PhysicianCard
              src="/dr-tolebeyan.jpeg"
              name="Amirseena Tolebeyan, MD"
              credentials="Double Board-Certified · Internal Medicine · Obesity Medicine"
              bio="Dr. Tolebeyan is a double board-certified physician focused on metabolic and hormonal health. His care model is rooted in individualized treatment planning, clinical rigor, and long-term continuity — the qualities he believes patients deserve and rarely receive."
            />
          </div>
        </div>
      </section>

      {/* ===== PATIENT VOICES — auto-scrolling testimonial marquee ===== */}
      <section className="bg-paper border-t border-line/40 overflow-hidden">
        <div className="container-velora pt-14 lg:pt-20 pb-2 text-center">
          <p className="text-[10px] sm:text-[11px] tracking-[0.34em] uppercase text-brown font-semibold">
            Patient Voices
          </p>
          <h2
            className="mt-5 font-display text-ink leading-[1.1] tracking-[-0.018em]"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2.125rem)' }}
          >
            What patients say
          </h2>
        </div>

        <div
          className="marquee-mask mt-10 lg:mt-12 pb-14 lg:pb-20"
          style={{
            WebkitMaskImage:
              'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)',
            maskImage:
              'linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)',
          }}
        >
          <div className="marquee-track gap-5 lg:gap-7">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <Testimonial key={i} quote={t.quote} name={t.name} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== 06 · BEGIN YOUR CARE — tight brown band (desktop only) ===== */}
      <section className="hidden lg:block bg-brown text-cream">
        <div className="container-velora py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-8 text-center sm:text-left">
            <div className="flex flex-wrap items-baseline justify-center sm:justify-start gap-x-3 gap-y-1">
              <h2
                className="font-display text-cream leading-none tracking-[-0.012em]"
                style={{ fontSize: 'clamp(1.125rem, 1.7vw, 1.5rem)' }}
              >
                Begin physician-guided care today.
              </h2>
              <span className="hidden sm:inline text-cream/40" aria-hidden>&mdash;</span>
              <p className="text-[10.5px] tracking-[0.2em] uppercase text-cream/65">
                60-minute visit &middot; Written plan &middot;{' '}
                <span className="text-cream font-semibold">$295</span>
              </p>
            </div>

            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2.5 bg-cream text-brown hover:bg-paper px-6 py-3 rounded-full text-[11px] tracking-[0.22em] uppercase font-semibold transition-colors shrink-0"
            >
              <Calendar className="size-4" strokeWidth={2} />
              Schedule Consultation
            </Link>
          </div>
        </div>
      </section>

    </>
  )
}

/* Helpers */

const TESTIMONIALS = [
  {
    quote:
      'Velora made me feel heard from the very first visit. The care was thoughtful, personalized, and far more comprehensive than anything I had experienced before.',
    name: 'Sarah M.',
  },
  {
    quote:
      'The structured program gave me accountability, consistency, and physician guidance that truly helped me make sustainable progress. I finally feel like I have a long-term plan that works.',
    name: 'Michael R.',
  },
  {
    quote:
      'What stood out most was the level of physician involvement and attention to detail. Every recommendation felt individualized and evidence-based rather than rushed or generic.',
    name: 'Jennifer L.',
  },
]

function Testimonial({ quote, name }: { quote: string; name: string }) {
  return (
    <figure className="w-[300px] sm:w-[380px] lg:w-[440px] shrink-0 bg-cream rounded-2xl border border-line/60 shadow-[0_24px_50px_-32px_rgba(74,52,28,0.35)] px-7 py-8 lg:px-9 lg:py-10 flex flex-col">
      <span className="font-display text-brown/30 leading-none text-[44px]" aria-hidden>
        &ldquo;
      </span>
      <blockquote className="-mt-3 text-[14px] lg:text-[15px] text-ink-soft leading-[1.7] flex-1">
        {quote}
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="w-7 h-px bg-gold/70" />
        <span className="text-[11px] tracking-[0.22em] uppercase text-brown font-semibold">
          {name}
        </span>
      </figcaption>
    </figure>
  )
}

function ChapterEyebrow({ number, label }: { number: string; label: string }) {
  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 max-w-full">
      <span className="w-6 h-px bg-gold/70" />
      <p className="text-[10px] tracking-[0.24em] sm:tracking-[0.42em] uppercase text-brown font-semibold">
        {number} &middot; {label}
      </p>
      <span className="w-6 h-px bg-gold/70" />
    </div>
  )
}

function ServiceCard({
  href, image, title, body,
}: { href: string; image: string; title: string; body: string }) {
  return (
    <Link href={href} className="group flex flex-col text-center">
      {/* Photo — photo-forward, gently rounded */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg ring-1 ring-line/50 shadow-[0_22px_45px_-30px_rgba(74,52,28,0.4)]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      {/* Copy — centered under photo */}
      <h3
        className="mt-7 font-display text-ink leading-[1.15] tracking-[-0.012em]"
        style={{ fontSize: 'clamp(1.375rem, 2vw, 1.625rem)' }}
      >
        {title}
      </h3>
      <p className="mt-4 mx-auto max-w-[320px] text-[13.5px] text-ink-soft leading-[1.7]">
        {body}
      </p>
      <span className="mt-6 inline-flex items-center justify-center gap-2 text-brown group-hover:text-brown-deep text-[11px] sm:text-[10.5px] tracking-[0.26em] sm:tracking-[0.28em] uppercase font-semibold transition-colors">
        Learn More
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

function PhysicianCard({
  src, name, credentials, bio,
}: {
  src: string; name: string; credentials: string; bio: string
}) {
  return (
    <div className="bg-paper rounded-2xl border border-line/60 p-5 lg:p-6 shadow-[0_28px_60px_-32px_rgba(74,52,28,0.35)] flex flex-col sm:flex-row gap-5 sm:gap-6">
      <div className="relative w-full sm:w-40 lg:w-48 shrink-0 aspect-[3/4] rounded-xl overflow-hidden">
        <Image
          src={src}
          alt={name}
          fill
          sizes="(min-width: 1024px) 12rem, (min-width: 640px) 10rem, 100vw"
          className="object-cover"
          style={{ objectPosition: 'center 20%' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-[20px] md:text-[22px] leading-tight text-ink">
          {name}
        </h3>
        <div className="mt-2.5 w-8 h-px bg-gold/70" />
        <p className="mt-2.5 text-[9.5px] tracking-[0.24em] uppercase text-brown/85 font-semibold">
          {credentials}
        </p>
        <p className="mt-3.5 text-[13px] text-ink-soft leading-[1.65]">
          {bio}
        </p>
      </div>
    </div>
  )
}

