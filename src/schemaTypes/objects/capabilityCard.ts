import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'capabilityCard',
  title: 'Capability Card',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Must match one of the icons implemented in CapabilityIcon.astro',
      options: {
        list: [
          {title: 'Security', value: 'security'},
          {title: 'Caching', value: 'caching'},
          {title: 'Design', value: 'design'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'icon'},
  },
})
