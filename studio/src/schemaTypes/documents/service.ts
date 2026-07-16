import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Development', value: 'development'},
          {title: 'Security', value: 'security'},
          {title: 'Infrastructure', value: 'infrastructure'},
          {title: 'Cloud', value: 'cloud'},
        ],
        layout: 'radio',
      },
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
      description: 'Must match one of the icons implemented in ServiceIcon.astro',
      options: {
        list: [
          {title: 'Web Development', value: 'web-development'},
          {title: 'Security', value: 'security'},
          {title: 'Domain', value: 'domain'},
          {title: 'Cloud', value: 'cloud'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'comingSoon',
      title: 'Coming Soon',
      type: 'boolean',
      description: 'Shows a "Coming Soon" badge instead of letting this read as an active offering.',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Lower numbers show first within their category. Leave blank to sort by creation date.',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'category', comingSoon: 'comingSoon'},
    prepare({title, subtitle, comingSoon}) {
      return {
        title,
        subtitle: comingSoon ? `${subtitle} · Coming Soon` : subtitle,
      }
    },
  },
})
