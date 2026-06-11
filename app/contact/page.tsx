'use client'

import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Clock,
  Check,
  AlertCircle,
  Instagram,
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

const SUBJECTS = [
  'General Question',
  'Book a Consultation',
  'Pricing',
  'Other',
]

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    const fd = new FormData(e.currentTarget)
    const payload = {
      name: String(fd.get('name') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      topic: String(fd.get('topic') ?? 'General Question'),
      message: String(fd.get('message') ?? '').trim(),
      submittedAt: new Date().toISOString(),
    }

    if (!payload.name || !payload.email || !payload.message) {
      setStatus('error')
      setErrorMsg('Please complete name, email, and message.')
      return
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
      trackEvent('contact_form_submit', { topic: payload.topic })
    } catch {
      setStatus('error')
      setErrorMsg('Could not send your message. Please try again or email care@veloramedicalinstitute.com.')
    }
  }

  return (
    <section className="bg-bone min-h-[calc(100svh-84px)] flex items-center">
      <div className="container-velora py-8 lg:py-10 w-full">
        <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-8 lg:gap-14 items-center">

          {/* LEFT — header + 2 contact rails */}
          <div className="max-w-[420px]">
            <p className="text-[10.5px] tracking-[0.42em] uppercase text-brown font-semibold">
              Contact
            </p>
            <h1
              className="mt-4 font-display text-ink leading-[0.98] tracking-[-0.022em]"
              style={{ fontSize: 'clamp(2rem, 4.4vw, 3.25rem)' }}
            >
              Reach a physician.
              <br />
              <em className="italic font-display text-brown">Directly.</em>
            </h1>
            <div className="mt-5 w-12 h-px bg-gold/80" />
            <p className="mt-5 text-[14px] text-ink-soft leading-[1.6]">
              Messages are read and answered personally by a Velora physician &mdash; not a
              call center, not an automated reply. For clinical concerns, please book a
              consultation.
            </p>

            {/* Two direct channels — composed, not stacked tiles */}
            <div className="mt-7 rounded-2xl bg-paper border border-line/60 px-5 sm:px-6 py-5 shadow-[0_24px_50px_-32px_rgba(74,52,28,0.3)]">
              <a
                href="mailto:care@veloramedicalinstitute.com"
                className="group flex items-center gap-4 pb-4 border-b border-line/60 -mx-1 px-1 rounded-md hover:bg-bone/60 transition-colors"
              >
                <span className="size-10 rounded-full bg-brown/10 text-brown flex items-center justify-center shrink-0">
                  <Mail className="size-4" strokeWidth={1.8} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[9.5px] tracking-[0.32em] uppercase text-ink-soft font-semibold">
                    Email a physician
                  </p>
                  <p className="mt-1 font-display text-ink text-[15.5px] md:text-[16.5px] leading-[1.2] truncate">
                    care@veloramedicalinstitute.com
                  </p>
                </div>
                <ArrowRight
                  className="size-4 text-brown/50 group-hover:text-brown group-hover:translate-x-0.5 transition-all shrink-0"
                  strokeWidth={1.6}
                />
              </a>

              <a
                href="tel:+13142718668"
                className="group flex items-center gap-4 py-4 border-b border-line/60 -mx-1 px-1 rounded-md hover:bg-bone/60 transition-colors"
              >
                <span className="size-10 rounded-full bg-brown/10 text-brown flex items-center justify-center shrink-0">
                  <Phone className="size-4" strokeWidth={1.8} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[9.5px] tracking-[0.32em] uppercase text-ink-soft font-semibold">
                    Call the practice
                  </p>
                  <p className="mt-1 font-display text-ink text-[15.5px] md:text-[16.5px] leading-[1.2]">
                    (314) 271-8668
                  </p>
                </div>
                <ArrowRight
                  className="size-4 text-brown/50 group-hover:text-brown group-hover:translate-x-0.5 transition-all shrink-0"
                  strokeWidth={1.6}
                />
              </a>

              <a
                href="https://maps.apple.com/?address=36+Four+Seasons+Shopping+Center+Ste+181,+Chesterfield,+MO+63017"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 py-4 border-b border-line/60 -mx-1 px-1 rounded-md hover:bg-bone/60 transition-colors"
              >
                <span className="size-10 rounded-full bg-brown/10 text-brown flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="size-4" strokeWidth={1.8} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[9.5px] tracking-[0.32em] uppercase text-ink-soft font-semibold">
                    Address
                  </p>
                  <p className="mt-1 font-display text-ink text-[14.5px] md:text-[15.5px] leading-[1.35]">
                    36 Four Seasons Shopping Center, Ste 181
                    <br />
                    Chesterfield, MO 63017
                  </p>
                </div>
                <ArrowRight
                  className="size-4 text-brown/50 group-hover:text-brown group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5"
                  strokeWidth={1.6}
                />
              </a>

              <div className="flex items-center gap-4 pt-4 -mx-1 px-1">
                <span className="size-10 rounded-full bg-brown/10 text-brown flex items-center justify-center shrink-0">
                  <Clock className="size-4" strokeWidth={1.8} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[9.5px] tracking-[0.32em] uppercase text-ink-soft font-semibold">
                    Hours
                  </p>
                  <p className="mt-1 font-display text-ink text-[15.5px] md:text-[16.5px] leading-[1.2]">
                    Monday &ndash; Friday
                  </p>
                </div>
                <p className="text-[10.5px] tracking-[0.18em] uppercase text-brown/80 font-semibold whitespace-nowrap">
                  &lt; 24h
                </p>
              </div>
            </div>
          </div>
<div className="mt-8">
  <p className="font-display text-lg">Follow us</p>
  <div className="mt-3 flex gap-5">
    <div className="mt-3 flex gap-5">
  <a href="https://www.instagram.com/veloramedicalinstitute" target="_blank">
  <Instagram size={28} />
</a>

<a href="https://www.facebook.com/veloramedicalinstitute" target="_blank">
  Facebook
</a>
</div>
</div>
          {/* RIGHT — form */}
          <div className="bg-cream rounded-2xl border border-line/60 p-6 sm:p-7 lg:p-9 shadow-[0_28px_60px_-30px_rgba(74,52,28,0.4)]">
            {status === 'success' ? (
              <SuccessPanel />
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h2
                  className="font-display text-ink leading-[1.1] tracking-[-0.012em]"
                  style={{ fontSize: 'clamp(1.25rem, 2.2vw, 1.625rem)' }}
                >
                  Write to us.{' '}
                  <em className="italic font-display text-brown">A physician will respond.</em>
                </h2>

                <div className="mt-5 grid sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <FormField label="Name" required htmlFor="contact-name">
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      className="velora-input"
                    />
                  </FormField>
                  <FormField label="Email" required htmlFor="contact-email">
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className="velora-input"
                    />
                  </FormField>
                  <FormField label="Phone (optional)" htmlFor="contact-phone">
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className="velora-input"
                    />
                  </FormField>
                  <FormField label="Subject" required htmlFor="contact-topic">
                    <select
                      id="contact-topic"
                      name="topic"
                      required
                      defaultValue="General Question"
                      className="velora-input"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField
                    label="Message"
                    required
                    htmlFor="contact-message"
                    className="sm:col-span-2"
                  >
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      required
                      className="velora-input resize-none"
                    />
                  </FormField>
                </div>

                {status === 'error' && (
                  <div
                    role="alert"
                    className="mt-4 flex items-start gap-3 rounded-md border border-brown/30 bg-brown/5 px-4 py-3 text-[13px] text-brown-deep leading-[1.5]"
                  >
                    <AlertCircle className="size-4 shrink-0 mt-0.5" strokeWidth={1.8} />
                    <span>{errorMsg || 'Something went wrong. Please try again.'}</span>
                  </div>
                )}

                <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-[11.5px] text-ink-soft/85 leading-[1.5] max-w-md">
                    Please don&rsquo;t include detailed medical information. For clinical
                    questions, book a consultation.
                  </p>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex items-center justify-center gap-2.5 bg-brown text-cream hover:bg-brown-deep disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3.5 rounded-md text-[11.5px] tracking-[0.24em] uppercase font-semibold transition-colors shrink-0 w-full sm:w-auto"
                  >
                    {status === 'submitting' ? 'Sending…' : 'Send Message'}
                    <ArrowRight className="size-4" strokeWidth={2} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Local input styling */}
      <style jsx global>{`
        .velora-input {
          width: 100%;
          background-color: var(--velora-cream, #f7f1e6);
          border: 1px solid rgba(74, 52, 28, 0.18);
          border-radius: 0.375rem;
          padding: 0.65rem 0.85rem;
          font-size: 14px;
          line-height: 1.5;
          color: inherit;
          transition: border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
          font-family: inherit;
        }
        .velora-input:hover {
          border-color: rgba(74, 52, 28, 0.32);
        }
        .velora-input:focus {
          outline: none;
          border-color: rgba(74, 52, 28, 0.55);
          box-shadow: 0 0 0 3px rgba(74, 52, 28, 0.12);
          background-color: #fffaf1;
        }
        .velora-input::placeholder {
          color: rgba(74, 52, 28, 0.45);
        }
        select.velora-input {
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, rgba(74,52,28,0.55) 50%),
                            linear-gradient(135deg, rgba(74,52,28,0.55) 50%, transparent 50%);
          background-position: calc(100% - 18px) 55%, calc(100% - 13px) 55%;
          background-size: 5px 5px, 5px 5px;
          background-repeat: no-repeat;
          padding-right: 2.25rem;
        }
            `}</style>
    </>
  )
} 

function FormField({
  label,
  required,
  htmlFor,
  className,
  children,
}: {
  label: string
  required?: boolean
  htmlFor: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className ?? ''}>
      <label
        htmlFor={htmlFor}
        className="block text-[9.5px] tracking-[0.28em] uppercase text-brown/85 font-semibold"
      >
        {label}
        {required && <span className="text-gold ml-1.5">*</span>}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function SuccessPanel() {
  return (
    <div className="text-center py-4">
      <span className="size-12 rounded-full bg-brown/10 text-brown flex items-center justify-center mx-auto">
        <Check className="size-6" strokeWidth={1.8} />
      </span>
      <p className="mt-5 text-[10.5px] tracking-[0.32em] uppercase text-brown font-semibold">
        Message Received
      </p>
      <h3
        className="mt-3 font-display text-ink leading-[1.1] tracking-[-0.012em]"
        style={{ fontSize: 'clamp(1.375rem, 2.4vw, 1.75rem)' }}
      >
        Thank you &mdash;{' '}
        <em className="italic font-display text-brown">a physician will respond shortly.</em>
      </h3>
      <div className="mt-5 mx-auto w-10 h-px bg-gold/70" />
      <p className="mt-5 text-[13.5px] text-ink-soft leading-[1.6] max-w-md mx-auto">
        Replies are written personally and typically arrive within one business day.
      </p>
    </div>
  )
}
