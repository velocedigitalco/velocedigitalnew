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

// Pinned API version (a stable past date, per Sanity's dating convention) -
// not "today's date", just a fixed snapshot of the query API shape.
const API_VERSION = '2024-06-01';

const HOME_PAGE_QUERY = `*[_type == "homePage"][0]{
  heroHeading,
  heroSubheading,
  ctaPrimary,
  ctaSecondary,
  capabilityCards[]{
    title,
    description,
    icon
  }
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
