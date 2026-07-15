import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fields: [
    defineField({
      name: 'clientName',
      title: 'Client Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'string',
      description: 'e.g. "2025" or "2025–2026"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 2,
      description: 'Shown on the card face in the homepage marquee.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [{type: 'string'}],
      description: 'e.g. "E-Commerce Website" — shown in the case study\'s info panel.',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'stack',
      title: 'Stack',
      type: 'array',
      of: [{type: 'string'}],
      description: 'e.g. "Astro", "Eleventy" — shown in the info panel.',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'cms',
      title: 'CMS',
      type: 'string',
      description: 'e.g. "Sanity", "Decap CMS" — leave blank if none.',
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live URL',
      type: 'url',
      description: 'Leave blank if the project isn\'t live or publicly linkable.',
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {hotspot: true},
      description: 'Card image in the homepage marquee, and the header image in the full case study.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Full Case Study',
      type: 'array',
      of: [
        {type: 'block'},
        {
          type: 'image',
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
      description: 'The full write-up shown in the scrollable case-study modal.',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'clientName', subtitle: 'year', media: 'thumbnail'},
  },
})
