import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: 'Shown in the header on every page. Works best as a wide/horizontal mark.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'navLinks',
      title: 'Nav Links',
      type: 'array',
      of: [{type: 'navLink'}],
      description: 'Shown in the header, in this order, on every page.',
      initialValue: [
        {_type: 'navLink', label: 'Work', href: '/work'},
        {_type: 'navLink', label: 'Studio', href: '/studio'},
        {_type: 'navLink', label: 'Services', href: '/services'},
        {_type: 'navLink', label: 'Pricing', href: '/pricing'},
        {_type: 'navLink', label: 'Journal', href: '/journal'},
        {_type: 'navLink', label: 'Contact', href: '/contact'},
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'email',
      title: 'Contact Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Contact Phone',
      type: 'string',
      description: 'Optional — leave blank to hide it in the footer.',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      initialValue: 'Lahore, PK',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [{type: 'socialLink'}],
      description: 'Shown in the footer. Leave empty if none are live yet.',
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
