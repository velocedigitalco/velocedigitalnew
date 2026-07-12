import type {StructureResolver} from 'sanity/structure'

// homePage is a singleton (the web build always queries the first and only
// document of this type). Pin it to a fixed document ID and give it its own
// menu entry so no one can accidentally create a second one from the
// default "+ Create" list.
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home Page')
        .id('homePage')
        .child(S.document().schemaType('homePage').documentId('homePage')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'homePage'),
    ])
