// swarm-intel-remix-full/lib/shopify.js
// Combined REST + GraphQL helpers. Uses Node 18+ global fetch.
const API_VERSION = '2025-01';
export function shopAdminBase(shop) { return `https://${shop}/admin/api/${API_VERSION}`; }
export function shopGraphqlEndpoint(shop) { return `https://${shop}/admin/api/${API_VERSION}/graphql.json`; }
export function defaultHeaders(token) { return { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token }; }

export async function shopifyFetch(shop, token, path, opts = {}) {
  const url = path.startsWith('http') ? path : `${shopAdminBase(shop)}${path}`;
  const res = await fetch(url, { headers: defaultHeaders(token), ...opts });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { throw new Error(`Invalid JSON response from ${url}: ${text}`); }
  if (!res.ok) { const err = new Error(`Shopify API ${res.status} ${res.statusText}: ${JSON.stringify(json)}`); err.response = json; throw err; }
  return json;
}

export async function graphqlRequest(shop, token, query, variables = {}) {
  const res = await fetch(shopGraphqlEndpoint(shop), { method: 'POST', headers: defaultHeaders(token), body: JSON.stringify({ query, variables }) });
  const json = await res.json().catch(() => null);
  if (!res.ok || (json && json.errors)) { const err = new Error(`GraphQL error: ${JSON.stringify(json?.errors || json || { status: res.status })}`); err.response = json; throw err; }
  return json?.data;
}

// REST helpers
export async function listWebhooks(shop, token) { const json = await shopifyFetch(shop, token, `/webhooks.json`); return json?.webhooks || []; }
export async function createWebhook(shop, token, topic, address) { const body = { webhook: { topic, address, format: 'json' } }; const json = await shopifyFetch(shop, token, `/webhooks.json`, { method: 'POST', body: JSON.stringify(body) }); return json?.webhook; }
export async function listPriceRules(shop, token, params = '') { const json = await shopifyFetch(shop, token, `/price_rules.json${params ? `?${params}` : ''}`); return json?.price_rules || []; }
export async function createPriceRule(shop, token, payload) { const body = { price_rule: payload }; const json = await shopifyFetch(shop, token, `/price_rules.json`, { method: 'POST', body: JSON.stringify(body) }); return json?.price_rule; }
export async function listDiscountCodes(shop, token, priceRuleId) { const json = await shopifyFetch(shop, token, `/price_rules/${priceRuleId}/discount_codes.json`); return json?.discount_codes || []; }
export async function createDiscountCode(shop, token, priceRuleId, code) { const body = { discount_code: { code } }; const json = await shopifyFetch(shop, token, `/price_rules/${priceRuleId}/discount_codes.json`, { method: 'POST', body: JSON.stringify(body) }); return json?.discount_code; }
export async function listOrdersSince(shop, token, isoDate) { const path = `/orders.json?status=any&created_at_min=${encodeURIComponent(isoDate)}&limit=250`; const json = await shopifyFetch(shop, token, path); return json?.orders || []; }

// GraphQL discount helper
export async function ensureDiscountGraphQL(shop, token, code, pct, expiresIso, limitToRepeatCustomers = false) {
  const title = `GhostOS Auto Discount ${code}`;
  const mutation = `
    mutation discountCodeBasicCreate($input: DiscountCodeBasicCreateInput!) {
      discountCodeBasicCreate(input: $input) {
        userErrors { field message }
        discountCode { id code }
      }
    }
  `;
  const input = {
    basicCodeDiscount: {
      title, code, startsAt: new Date().toISOString(), endsAt: expiresIso, appliesOncePerCustomer: true,
      customerSelection: limitToRepeatCustomers ? 'PREREQUISITE_CUSTOMERS' : 'ALL', value: { amount: pct, type: 'PERCENTAGE' }
    }
  };
  const data = await graphqlRequest(shop, token, mutation, { input });
  const result = data?.discountCodeBasicCreate;
  if (result?.userErrors && result.userErrors.length) {
    const msg = result.userErrors.map(e => `${(e.field||[]).join(',')}: ${e.message}`).join('; ');
    const err = new Error(`GraphQL userErrors: ${msg}`); err.userErrors = result.userErrors; throw err;
  }
  return result?.discountCode || null;
}
