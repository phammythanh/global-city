// Cloudflare Pages Function - receives the Liên hệ contact form and stores
// each lead in Cloudflare KV (binding declared in wrangler.toml). No email
// notification is wired up - Cloudflare Pages doesn't support the
// "send_email" binding in wrangler.toml, and once wrangler.toml manages any
// binding, the dashboard's manual binding UI is locked too. Leads can be
// read back with:
//   wrangler kv key list --namespace-id <LIEN_HE_LEADS id>
//   wrangler kv key get --namespace-id <id> <key>
interface Env {
  LIEN_HE_LEADS: KVNamespace;
}

const PRODUCT_TYPES = new Set(['Thấp tầng', 'Cao tầng']);
const PHONE_PATTERN = /^[0-9+()\s-]{8,15}$/;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  // Honeypot: real visitors never fill this hidden field. Bots that do get
  // a fake success so they don't know to try harder.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json({ ok: true });
  }

  const name = String(body.name ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const productType = String(body.productType ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (!name || name.length > 100) {
    return json({ ok: false, error: 'invalid_name' }, 400);
  }
  if (!PHONE_PATTERN.test(phone)) {
    return json({ ok: false, error: 'invalid_phone' }, 400);
  }
  if (!PRODUCT_TYPES.has(productType)) {
    return json({ ok: false, error: 'invalid_product_type' }, 400);
  }
  if (message.length > 1000) {
    return json({ ok: false, error: 'invalid_message' }, 400);
  }

  const createdAt = new Date();
  const id = `${createdAt.toISOString()}-${crypto.randomUUID()}`;

  await env.LIEN_HE_LEADS.put(
    id,
    JSON.stringify({ name, phone, productType, message, createdAt: createdAt.toISOString() })
  );

  return json({ ok: true });
};
