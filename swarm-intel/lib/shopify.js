import crypto from 'crypto';

const API_VERSION = '2025-01';

export function shopAdminBase(shop) {
  return `https://${shop}/admin/api/${API_VERSION}`;
}

export function defaultHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': token
  };
}

export async function shopifyFetch(shop, token, path, opts = {}) {
  const url = path.startsWith('http') ? path : `${shopAdminBase(shop)}${path}`;
  const res = await fetch(url, {
    headers: defaultHeaders(token),
    ...opts
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { throw new Error(`Invalid JSON response from ${url}: ${text}`); }
  if (!res.ok) {
    const err = new Error(`Shopify API ${res.status} ${res.statusText}: ${JSON.stringify(json)}`);
    err.response = json;
    throw err;
  }
  return json;
}

// Webhooks
export async function listWebhooks(shop, token) {
  const json = await shopifyFetch(shop, token, `/webhooks.json`);
  return json?.webhooks || [];
}

export async function createWebhook(shop, token, topic, address) {
  const body = {
    webhook: { topic, address, format: 'json' }
  };
  const json = await shopifyFetch(shop, token, `/webhooks.json`, { method: 'POST', body: JSON.stringify(body) });
  return json?.webhook;
}

// Price rules (fallback approach for discount creation)
export async function listPriceRules(shop, token, params = '') {
  const json = await shopifyFetch(shop, token, `/price_rules.json${params ? `?${params}` : ''}`);
  return json?.price_rules || [];
}

export async function createPriceRule(shop, token, payload) {
  const body = { price_rule: payload };
  const json = await shopifyFetch(shop, token, `/price_rules.json`, { method: 'POST', body: JSON.stringify(body) });
  return json?.price_rule;
}

export async function listDiscountCodes(shop, token, priceRuleId) {
  const json = await shopifyFetch(shop, token, `/price_rules/${priceRuleId}/discount_codes.json`);
  return json?.discount_codes || [];
}

export async function createDiscountCode(shop, token, priceRuleId, code) {
  const body = { discount_code: { code } };
  const json = await shopifyFetch(shop, token, `/price_rules/${priceRuleId}/discount_codes.json`, { method: 'POST', body: JSON.stringify(body) });
  return json?.discount_code;
}

// Orders
export async function listOrdersSince(shop, token, isoDate) {
  // status=any to include closed/cancelled for audit; your production may limit
  const path = `/orders.json?status=any&created_at_min=${encodeURIComponent(isoDate)}&limit=250`;
  const json = await shopifyFetch(shop, token, path);
  return json?.orders || [];
}

// Utility: compute HMAC (for local simulator checks)
export function computeShopifyHmac(payloadString, secret) {
  return crypto.createHmac('sha256', secret).update(payloadString, 'utf8').digest('base64');
}
