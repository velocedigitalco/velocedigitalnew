/**
 * Minimal Sanity data layer for the web build.
 *
 * No @sanity/client dependency — this calls Sanity's public Query HTTP
 * API directly with native fetch(). See:
 * https://www.sanity.io/docs/http-reference/query
 *
 * If a real SDK ever becomes worth it (typed GROQ, request retries,
 * perspectives/drafts, etc.) that's a one-package addition — ask
 * before adding it, per the standing "GSAP-only" dependency rule.
 */

export interface CTA {
  label: string;
  url: string;
}

export interface CapabilityCard {
  title: string;
  description: string;
  icon: string;
}

export interface HomePageData {
  heroHeading: string;
  heroSubheading: string;
  ctaPrimary: CTA;
  ctaSecondary: CTA;
  capabilityCards: CapabilityCard[];
}

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface SiteSettings {
  logo: {
    url: string;
    width: number;
    height: number;
  };
  navLinks: NavLink[];
  email: string;
  phone?: string;
  location: string;
  socialLinks: SocialLink[];
}

export interface CaseStudy {
  clientName: string;
  year: string;
  shortDescription: string;
  services: string[];
  stack: string[];
  cms?: string;
  liveUrl?: string;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  body: import('./portableText').PortableTextContent;
}

// Pinned API version (a stable past date, per Sanity's dating convention) -
// not "today's date", just a fixed snapshot of the query API shape.
const API_VERSION = '2024-06-01';

const HOME_PAGE_QUERY = `*[_type == "homePage"][0]{
  heroHeading,
  heroSubheading,
  ctaPrimary,
  ctaSecondary,
  "capabilityCards": coalesce(capabilityCards[]{
    title,
    description,
    icon
  }, [])
}`;

// asset-> dereferences the image asset document so we get its CDN url and
// dimensions directly from the query API - no @sanity/image-url needed.
// Every array field is wrapped in coalesce(..., []): GROQ returns null,
// not [], when a field was never touched in Studio (this is exactly what
// broke the first deploy -- socialLinks is optional and nobody had added
// one yet, so settings.socialLinks.length crashed on null).
const SITE_SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  logo{
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  "navLinks": coalesce(navLinks[]{label, href}, []),
  email,
  phone,
  location,
  "socialLinks": coalesce(socialLinks[]{platform, url}, [])
}`;

// Newest first. The "_type == 'image' => {...}" conditional projection
// only dereferences the asset for image items in the body array, leaving
// text blocks untouched via the "..." spread. Every array field coalesced
// to [] for the same reason as SITE_SETTINGS_QUERY above.
const CASE_STUDIES_QUERY = `*[_type == "caseStudy"] | order(_createdAt desc){
  clientName,
  year,
  shortDescription,
  "services": coalesce(services, []),
  "stack": coalesce(stack, []),
  cms,
  liveUrl,
  thumbnail{
    "url": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  },
  "body": coalesce(body[]{
    ...,
    _type == "image" => {
      "url": asset->url,
      "width": asset->metadata.dimensions.width,
      "height": asset->metadata.dimensions.height,
      "alt": alt
    }
  }, [])
}`;

interface QueryResponse<T> {
  result: T | null;
}

async function groq<T>(query: string): Promise<T | null> {
  const projectId = import.meta.env.SANITY_PROJECT_ID;
  const dataset = import.meta.env.SANITY_DATASET || 'production';

  if (!projectId) {
    throw new Error(
      'SANITY_PROJECT_ID is not set. Copy .env.example to .env and fill it in before building.'
    );
  }

  // CDN endpoint: edge-cached reads, the right choice for a static build
  // pulling published content. Swap to api.sanity.io if you ever need
  // to bypass the cache (e.g. querying drafts with a token).
  const endpoint = `https://${projectId}.apicdn.sanity.io/v${API_VERSION}/data/query/${dataset}`;
  const url = `${endpoint}?query=${encodeURIComponent(query)}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Sanity query failed (${res.status}): ${await res.text()}`);
  }

  const body = (await res.json()) as QueryResponse<T>;
  return body.result;
}

/**
 * Fetches the homePage singleton. Throws if it isn't published yet or
 * the request fails — deliberately no hardcoded fallback copy here,
 * so a missing document is a loud build error, not a silently wrong page.
 */
export async function getHomePage(): Promise<HomePageData> {
  const result = await groq<HomePageData>(HOME_PAGE_QUERY);

  if (!result) {
    throw new Error(
      'No published "homePage" document found in Sanity. Create and publish it in Studio, then rebuild.'
    );
  }

  return result;
}

/**
 * Fetches the siteSettings singleton (logo, nav, contact info). Same
 * no-fallback philosophy as getHomePage: every page renders through
 * BaseLayout, so missing settings should fail the whole build loudly
 * rather than silently rendering a broken header/footer.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const result = await groq<SiteSettings>(SITE_SETTINGS_QUERY);

  if (!result) {
    throw new Error(
      'No published "siteSettings" document found in Sanity. Create and publish it in Studio, then rebuild.'
    );
  }

  return result;
}

/**
 * Fetches all published case studies, newest first. Unlike getHomePage
 * and getSiteSettings, an empty array here is a normal, expected state
 * (no case studies published yet) rather than a build error, so this
 * doesn't throw — callers should handle a possibly-empty list.
 */
export async function getCaseStudies(): Promise<CaseStudy[]> {
  const result = await groq<CaseStudy[]>(CASE_STUDIES_QUERY);
  return result ?? [];
}
