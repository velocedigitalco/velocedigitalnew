/**
 * Minimal Portable Text -> HTML renderer.
 *
 * Deliberately hand-rolled instead of pulling in @portabletext/to-html:
 * this is a static Astro site with no client-side framework, and the
 * actual content surface here (paragraphs, a couple of heading levels,
 * bold/italic, inline images) is small enough to render directly without
 * a new dependency, per the same "ask before adding a package" rule
 * documented in sanity.ts.
 *
 * The output is trusted HTML injected via `set:html` in CaseStudyModal —
 * safe here because every span of text is escaped below, and every image
 * URL comes from Sanity's own asset CDN (resolved server-side via the
 * asset-> dereference in the GROQ query), never from free-typed input.
 */

interface PortableTextSpan {
  text: string;
  marks?: string[];
}

interface PortableTextBlock {
  _type: 'block';
  style?: string;
  children: PortableTextSpan[];
}

interface PortableTextImage {
  _type: 'image';
  url: string;
  width: number;
  height: number;
  alt?: string;
}

export type PortableTextContent = (PortableTextBlock | PortableTextImage)[];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSpan(span: PortableTextSpan): string {
  let html = escapeHtml(span.text);
  if (span.marks?.includes('strong')) html = `<strong>${html}</strong>`;
  if (span.marks?.includes('em')) html = `<em>${html}</em>`;
  return html;
}

const HEADING_STYLES = new Set(['h2', 'h3', 'h4']);

export function renderPortableText(blocks: PortableTextContent): string {
  return blocks
    .map((block) => {
      if (block._type === 'image') {
        const altText = escapeHtml(block.alt ?? '');
        return `<img src="${block.url}" width="${block.width}" height="${block.height}" alt="${altText}" loading="lazy" />`;
      }

      const inner = block.children.map(renderSpan).join('');
      const tag = block.style && HEADING_STYLES.has(block.style) ? block.style : 'p';
      return `<${tag}>${inner}</${tag}>`;
    })
    .join('\n');
}
