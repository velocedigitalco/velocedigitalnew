import type {StructureResolver} from 'sanity/structure'

// homePage and siteSettings are both singletons (the web build always
// queries the one and only document of each type). Pin each to a fixed
// document ID and give it its own menu entry so no one can accidentally
// create a second one from the default "+ Create" list. caseStudy isn't
// a singleton -- there can be many -- so it gets a normal (non-pinned-ID)
// list item instead, just surfaced above the divider since it's the type
// most likely to be edited often.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home Page')
        .id('homePage')
        .child(S.document().schemaType('homePage').documentId('homePage')),
      S.listItem()
        .title('Site Settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.documentTypeListItem('caseStudy').title('Case Studies'),
      S.documentTypeListItem('service').title('Services'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !['homePage', 'siteSettings', 'caseStudy', 'service'].includes(item.getId() ?? '')
      ),
    ])
