/**
 * POST /api/contact
 *
 * Handles the contact form, writing submissions to a D1 database (see
 * wrangler.jsonc for the binding) rather than Sanity. Two reasons for D1
 * specifically: the Sanity project is on a free trial, so nothing meant to
 * persist long-term should live there; and D1 is bound directly via the
 * INQUIRIES_DB binding below, so there's no separate write-token secret to
 * configure or leak -- the binding itself is the access control.
 */

interface Env {
  INQUIRIES_DB: D1Database;
}

interface ContactPayload {
  name?: string;
  email?: string;
  reason?: string;
  message?: string;
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
  const reason = (payload.reason ?? '').trim();
  const message = (payload.message ?? '').trim();

  if (!name || !email || !message) {
    return jsonResponse({ error: 'Name, email, and message are all required.' }, 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    return jsonResponse({ error: "That email address doesn't look right." }, 400);
  }

  if (!env.INQUIRIES_DB) {
    // Loud in Cloudflare's function logs, generic to the visitor. If this
    // fires, the D1 binding either isn't deployed yet or the binding name
    // doesn't match wrangler.jsonc's "INQUIRIES_DB".
    console.error('Contact form: INQUIRIES_DB binding is not available.');
    return jsonResponse(
      { error: 'Something went wrong on our end. Please email us directly instead.' },
      500
    );
  }

  try {
    await env.INQUIRIES_DB.prepare(
      'INSERT INTO inquiries (name, email, reason, message) VALUES (?, ?, ?, ?)'
    )
      .bind(name, email, reason || null, message)
      .run();
  } catch (error) {
    console.error('Contact form: D1 insert failed', error);
    return jsonResponse(
      { error: 'Something went wrong on our end. Please email us directly instead.' },
      500
    );
  }

  return jsonResponse({ ok: true }, 200);
};
