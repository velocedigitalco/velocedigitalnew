/**
 * POST /api/contact
 *
 * Handles the contact form. This runs server-side on Cloudflare's Workers
 * runtime (not in the browser), which is the whole point: it's the only
 * place that ever sees SANITY_WRITE_TOKEN. That token can create documents
 * in this project, so it must never reach client-side JS or the page
 * source — if it did, anyone could use it to write arbitrary data.
 *
 * Writes to the "inquiries" dataset specifically, not "production". That
 * dataset is private (unlike production, which is public so the site's
 * own content can be read at build time) — see studio's dataset list for
 * why: this holds visitor PII and shouldn't be queryable by anyone who
 * finds the project ID, which production's content readably is.
 */

interface Env {
  SANITY_PROJECT_ID: string;
  SANITY_WRITE_TOKEN: string;
}

interface ContactPayload {
  name?: string;
  email?: string;
  message?: string;
  serviceInterest?: string;
  company?: string; // honeypot — a field real visitors never see or fill
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let payload: ContactPayload;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400);
  }

  // A bot that fills in every field trips the honeypot. Pretend success so
  // it doesn't learn to leave the field blank next time, but never
  // actually write anything.
  if (payload.company) {
    return jsonResponse({ ok: true }, 200);
  }

  const name = (payload.name ?? '').trim();
  const email = (payload.email ?? '').trim();
  const message = (payload.message ?? '').trim();
  const serviceInterest = (payload.serviceInterest ?? '').trim();

  if (!name || !email || !message) {
    return jsonResponse({ error: 'Name, email, and message are all required.' }, 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    return jsonResponse({ error: "That email address doesn't look right." }, 400);
  }

  if (!env.SANITY_PROJECT_ID || !env.SANITY_WRITE_TOKEN) {
    // Loud in Cloudflare's function logs, generic to the visitor — no
    // internal configuration details leak into the response body.
    console.error('Contact form: SANITY_PROJECT_ID or SANITY_WRITE_TOKEN is not set.');
    return jsonResponse(
      { error: 'Something went wrong on our end. Please email us directly instead.' },
      500
    );
  }

  const endpoint = `https://${env.SANITY_PROJECT_ID}.api.sanity.io/v2024-06-01/data/mutate/inquiries`;

  const sanityResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.SANITY_WRITE_TOKEN}`,
    },
    body: JSON.stringify({
      mutations: [
        {
          create: {
            _type: 'inquiry',
            name,
            email,
            message,
            serviceInterest: serviceInterest || undefined,
            submittedAt: new Date().toISOString(),
          },
        },
      ],
    }),
  });

  if (!sanityResponse.ok) {
    console.error('Contact form: Sanity mutate failed', await sanityResponse.text());
    return jsonResponse(
      { error: 'Something went wrong on our end. Please email us directly instead.' },
      500
    );
  }

  return jsonResponse({ ok: true }, 200);
};
