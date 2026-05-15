// GraphQL-first Shopify helper (Node 18+ global fetch)
const API_VERSION = '2025-01';
export function shopGraphqlEndpoint(shop) {
  return `https://${shop}/admin/api/${API_VERSION}/graphql.json`;
}
export function defaultHeaders(token) {
  return { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token };
}
async function graphqlRequest(shop, token, query, variables = {}) {
  const res = await fetch(shopGraphqlEndpoint(shop), {
    method: 'POST', headers: defaultHeaders(token), body: JSON.stringify({ query, variables })
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || (json && json.errors)) {
    const err = new Error(`GraphQL error: ${JSON.stringify(json?.errors || json || { status: res.status })}`);
    err.response = json; throw err;
  }
  return json?.data;
}
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
      title, code, startsAt: new Date().toISOString(), endsAt: expiresIso,
      appliesOncePerCustomer: true,
      customerSelection: limitToRepeatCustomers ? 'PREREQUISITE_CUSTOMERS' : 'ALL',
      value: { amount: pct, type: 'PERCENTAGE' }
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
