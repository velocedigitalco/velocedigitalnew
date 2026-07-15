import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'heroHeading',
      title: 'Hero Heading',
      type: 'string',
      initialValue: 'Built fast. Engineered to grow.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'heroSubheading',
      title: 'Hero Subheading',
      type: 'text',
      rows: 2,
      initialValue:
        'A digital studio crafting custom websites and e-commerce experiences — built to rank — for brands that refuse to blend in.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaPrimary',
      title: 'Primary CTA',
      type: 'cta',
      initialValue: {label: 'Start a Project', url: '/contact'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ctaSecondary',
      title: 'Secondary CTA',
      type: 'cta',
      initialValue: {label: 'View Our Work', url: '/work'},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'capabilityCards',
      title: 'Capability Cards',
      type: 'array',
      of: [{type: 'capabilityCard'}],
      initialValue: [
        {
          _type: 'capabilityCard',
          title: 'Custom Development',
          description:
            'Bespoke websites and web applications, engineered from the ground up — not templated, not generic.',
          icon: 'custom-development',
        },
        {
          _type: 'capabilityCard',
          title: 'Mobile-First Builds',
          description: 'Responsive, touch-first experiences designed for people who scroll, tap, and buy.',
          icon: 'mobile-first',
        },
        {
          _type: 'capabilityCard',
          title: 'Performance Engineered',
          description: 'Fast by default — optimized for speed, Core Web Vitals, and lower hosting costs.',
          icon: 'performance',
        },
        {
          _type: 'capabilityCard',
          title: 'SEO Foundations',
          description: 'Clean architecture, semantic markup, and technical SEO — built in, not bolted on after launch.',
          icon: 'seo',
        },
      ],
      validation: (Rule) =>
        Rule.required()
          .min(4)
          .max(4)
          .error('Exactly 4 cards — the heading and layout are both built for four.'),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Home Page'}
    },
  },
})
