import Link from 'next/link'
import type { Metadata } from 'next'
import { Calendar, ArrowRight } from 'lucide-react'
import { FaqAccordion } from '@/components/site/faq-accordion'
import { JsonLd } from '@/components/analytics/json-ld'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  alternates: { canonical: '/faq' },
  description:
    'Common questions about medical weight management, hormone therapy, longevity & preventive medicine, telemedicine visits, GLP-1 medications, BHRT, and Velora Medical Institute care.',
}

const WEIGHT_FAQ = [
  { q: 'Who is a candidate for medical weight management?', a: 'Many adults who struggle with excess weight, metabolic health concerns, or difficulty achieving results despite lifestyle changes may benefit from physician-guided weight management.' },
  { q: 'What’s the difference between compounded and FDA-approved GLP-1 medications?', a: 'FDA-approved medications are standardized and extensively studied, while compounded versions are prepared by pharmacies and are not FDA-approved in the same way. Your physician will help determine the most appropriate option based on your individual needs.' },
  { q: 'What are GLP-1 medications, and how do they support weight management?', a: 'GLP-1 receptor agonists are medications that help regulate appetite, slow gastric emptying, and improve metabolic signaling. When used appropriately as part of a comprehensive treatment plan, they can support meaningful and sustainable weight reduction.' },
  { q: 'Are medications such as semaglutide or tirzepatide safe?', a: 'These medications have been extensively studied and are FDA-approved for weight management in appropriate patients. During your consultation, your physician will review your medical history to determine whether they are a safe and appropriate option for you.' },
  { q: 'Is medication required as part of treatment?', a: 'No. Treatment plans are individualized. While medications may be beneficial for some patients, care may also include nutrition guidance, lifestyle strategies, and metabolic evaluation without the use of medication.' },
  { q: 'How much weight can I expect to lose?', a: 'Results vary between individuals. Many patients using evidence-based therapies may experience a meaningful reduction in body weight over time, particularly when combined with lifestyle modifications and ongoing medical guidance.' },
  { q: 'Are visits conducted through telemedicine?', a: 'Yes. All consultations and follow-up visits are conducted via secure telemedicine, allowing you to receive physician-guided care from the convenience of your home.' },
]

const HORMONE_FAQ = [
  { q: 'What is bioidentical hormone therapy (BHRT)?', a: 'Bioidentical hormone therapy uses hormones that are chemically identical to those naturally produced by the body. Treatment is designed to restore hormonal balance and improve symptoms associated with hormonal changes.' },
  { q: 'Who may benefit from hormone therapy?', a: 'Hormone therapy may be appropriate for individuals experiencing symptoms such as fatigue, low energy, sleep disturbances, changes in metabolism, decreased libido, mood changes, or menopause-related symptoms.' },
  { q: 'How is it determined whether my symptoms are hormone-related?', a: 'Your physician will review your symptoms, medical history, and overall health. Laboratory testing may be recommended to evaluate hormone levels and guide treatment decisions.' },
  { q: 'Is hormone therapy safe?', a: 'When prescribed appropriately and monitored by a qualified physician, hormone therapy can be a safe and effective treatment option. Treatment is individualized and adjusted over time based on clinical response and safety considerations.' },
  { q: 'What types of hormone therapy are available?', a: 'Treatment may include estrogen, progesterone, testosterone, or other therapies depending on individual needs. These may be delivered through various forms, including topical, injectable, or oral options.' },
  { q: 'Can women use testosterone?', a: 'In select cases, low-dose testosterone may be used off-label for symptoms such as low libido. Treatment is carefully individualized and monitored to ensure safety and effectiveness.' },
  { q: 'How long does it take to notice improvement?', a: 'Some patients begin to notice improvement within several weeks. Full benefits may take a few months as hormone levels are optimized and treatment is adjusted over time.' },
]

const PRACTICE_FAQ = [
  { q: 'How does payment work?', a: 'Velora Medical Institute is a direct-pay practice. Payment is required prior to your appointment, which is confirmed once payment has been received. Services are not billed to insurance, and pricing is fully transparent.' },
  { q: 'Is insurance accepted?', a: 'No. Velora is a direct-pay practice. This allows our physicians to focus on personalized clinical care without insurance limitations on treatment plans, follow-up cadence, or laboratory ordering.' },
  { q: 'What happens if I need to cancel?', a: 'Appointments must be canceled or rescheduled at least 24 hours in advance to avoid a late cancellation fee. Patients enrolled in structured programs may cancel at any time, with applicable early termination fees as outlined in the program agreement.' },
  { q: 'Are medication and laboratory costs included?', a: 'No. Visit fees cover physician time and clinical care. Medication, pharmacy, and laboratory costs are billed separately by the respective provider. Your physician will discuss expected costs during your visit.' },
]

const CATEGORIES = [
  { id: 'weight', label: 'Weight Management' },
  { id: 'hormone', label: 'Hormone Therapy' },
  { id: 'practice', label: 'Practice & Payment' },
] as const

const allFaqItems = [...WEIGHT_FAQ, ...HORMONE_FAQ, ...PRACTICE_FAQ]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allFaqItems.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: a,
    },
  })),
}

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      {/* ===== HERO — dark band, no photo (the photo has baked text) ===== */}
      <section className="relative bg-[#0B0907] text-cream overflow-hidden">
        {/* Subtle warm key light top-right for depth (no photo) */}
        <div
          className="absolute -top-32 -right-32 w-[700px] h-[520px] opacity-25 pointer-events-none"
          style={{
            background: 'radial-gradient(closest-side, rgba(201,160,100,0.55), rgba(201,160,100,0) 70%)',
            filter: 'blur(70px)',
          }}
          aria-hidden
        />

        <div className="relative container-velora py-14 sm:py-16 lg:py-20 text-center">
          <p className="text-[10px] sm:text-[10.5px] tracking-[0.42em] uppercase text-gold font-semibold">
            Frequently Asked Questions
          </p>
          <h1
            className="mt-4 font-display leading-[1.04] tracking-[-0.018em] text-cream max-w-3xl mx-auto"
            style={{ fontSize: 'clamp(1.875rem, 4.4vw, 3.25rem)' }}
          >
            Real answers from{' '}
            <em className="italic font-display text-gold">your physician.</em>
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-[13.5px] sm:text-[14.5px] leading-[1.6] text-cream/75">
            Telemedicine, GLP-1 weight management, hormone therapy, longevity care,
            direct-pay billing &mdash; explained plainly.
          </p>

          {/* Category jump links */}
          <nav className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`#${c.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-cream/40 text-cream/95 hover:bg-gold hover:border-gold hover:text-ink px-4 py-2 text-[10.5px] tracking-[0.22em] uppercase font-semibold transition-colors"
              >
                {c.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      {/* ===== ONE consolidated FAQ section ===== */}
      <section className="bg-bone">
        <div className="container-velora py-12 lg:py-16">
          <div className="max-w-3xl mx-auto space-y-12 lg:space-y-16">

            <CategoryBlock id="weight" label="Weight Management" intro="GLP-1 medications, eligibility, individualized care, and results — explained by your physician.">
              <FaqAccordion items={WEIGHT_FAQ} />
            </CategoryBlock>

            <CategoryBlock id="hormone" label="Hormone Therapy" intro="BHRT for men and women — symptoms, safety, and what to expect.">
              <FaqAccordion items={HORMONE_FAQ} />
            </CategoryBlock>

            <CategoryBlock id="practice" label="Practice & Payment" intro="Direct-pay, telemedicine, scheduling, and policies.">
              <FaqAccordion items={PRACTICE_FAQ} />
            </CategoryBlock>
          </div>
        </div>
      </section>

      {/* ===== Tight brown closer ===== */}
      <section className="bg-brown text-cream">
        <div className="container-velora py-8 lg:py-10">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-6 max-w-4xl mx-auto">
            <div className="text-center md:text-left">
              <p className="text-[10.5px] tracking-[0.32em] uppercase text-gold font-semibold">
                Still Have Questions?
              </p>
              <h2
                className="mt-2 font-display leading-[1.1] tracking-[-0.012em]"
                style={{ fontSize: 'clamp(1.375rem, 2.2vw, 1.75rem)' }}
              >
                Talk to a physician.
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2 bg-cream text-brown hover:bg-paper px-6 py-3.5 rounded-md text-[11px] tracking-[0.24em] uppercase font-semibold transition-colors"
              >
                <Calendar className="size-4" strokeWidth={2} />
                Schedule Consultation
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 border border-cream/40 text-cream hover:bg-cream/10 px-6 py-3.5 rounded-md text-[11px] tracking-[0.24em] uppercase font-semibold transition-colors"
              >
                Contact the Practice
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function CategoryBlock({
  id,
  label,
  intro,
  children,
}: {
  id: string
  label: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <div id={id} className="scroll-mt-28">
      <div className="flex items-center gap-3">
        <span className="w-8 h-px bg-gold/70" />
        <p className="text-[10px] sm:text-[10.5px] tracking-[0.36em] uppercase text-brown font-semibold">
          {label}
        </p>
      </div>
      <p className="mt-3 text-[13.5px] sm:text-[14px] text-ink-soft leading-[1.65] max-w-[640px]">
        {intro}
      </p>
      <div className="mt-5">{children}</div>
    </div>
  )
}
