import type { PageSchema } from './schema'

/**
 * Default homepage schema — used when no saved schema exists.
 * Mirrors the hand-coded homepage at a section level, so the editor
 * opens to a real-looking page instead of a blank canvas.
 */
export const initialHomeSchema: PageSchema = {
  version: 1,
  blocks: [
    {
      id: 'home_hero',
      type: 'hero',
      props: {
        eyebrow: 'Physician-Led. Personalized. Results-Driven.',
        heading: 'Optimize Your Health.\nElevate Your Life.',
        body: 'Physician-led telemedicine care for weight management, hormone balance, and longevity. Personalized for you. Designed for lasting results.',
        primaryText: 'Schedule Consultation',
        primaryHref: '/book',
        secondaryText: 'Explore Programs',
        secondaryHref: '/programs',
        image: '/photos/hero-telehealth.png',
        backgroundColor: '#F4EBD3',
      },
    },
    {
      id: 'home_services',
      type: 'serviceGrid',
      props: {
        eyebrow: 'Our Service Areas',
        heading: 'Personalized Medicine for Every Stage of Life',
        backgroundColor: '#FDFAF1',
      },
      children: [
        {
          id: 'home_services_card_weight',
          type: 'serviceCard',
          props: {
            image:
              'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=80',
            title: 'Weight Management',
            body:
              'Physician-guided GLP-1 therapy and medical optimization programs to help you lose weight, improve metabolism, and sustain long-term results.',
            href: '/weight-management',
            ctaText: 'Learn More',
          },
        },
        {
          id: 'home_services_card_hormone',
          type: 'serviceCard',
          props: {
            image:
              'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1600&q=80',
            title: 'Hormone Optimization',
            body:
              'Restore balance, improve energy, enhance mood, and support overall hormonal health through personalized hormone therapy.',
            href: '/hormone-therapy',
            ctaText: 'Learn More',
          },
        },
        {
          id: 'home_services_card_longevity',
          type: 'serviceCard',
          props: {
            image:
              'https://images.unsplash.com/photo-1502323777036-f29e3972d82f?auto=format&fit=crop&w=1600&q=80',
            title: 'Longevity & Preventive Medicine',
            body:
              'Proactive, personalized strategies to optimize health, prevent disease, and support long-term vitality.',
            href: '/longevity',
            ctaText: 'Learn More',
          },
        },
      ],
    },
    {
      id: 'home_cta',
      type: 'ctaPanel',
      props: {
        eyebrow: 'Begin Your Care',
        heading: 'Begin physician-guided care today.',
        body: '60-minute initial consultation with a double board-certified physician. Personalized plan delivered in writing.',
        primaryText: 'Schedule Consultation',
        primaryHref: '/book',
        secondaryText: 'View Programs',
        secondaryHref: '/programs',
        backgroundColor: '#7C5436',
        color: '#F9F1DC',
      },
    },
  ],
}
