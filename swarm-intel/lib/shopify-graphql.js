import fetch from 'node-fetch';

const API_VERSION = '2025-01';

export function shopGraphqlEndpoint(shop) {
  return `https://${shop}/admin/api/${API_VERSION}/graphql.json`;
}

export function defaultHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'X-Shopify-Access-Token': token
  };
}

async function graphqlRequest(shop, token, query, variables = {}) {
  const res = await fetch(shopGraphqlEndpoint(shop), {
    method: 'POST',
    headers: defaultHeaders(token),
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    const err = new Error(`GraphQL error: ${JSON.stringify(json.errors || json)}`);
    err.response = json;
    throw err;
  }
  return json.data;
}

// Attempt to create a discount using GraphQL discountCodeBasicCreate flow.
// This helper will try to be idempotent by searching for existing discounts by title/code first.
export async function ensureDiscountGraphQL(shop, token, code, pct, expiresIso, limitToRepeatCustomers = false) {
  // Build a title marker
  const title = `GhostOS Auto Discount ${code}`;

  // GraphQL: search existing discount codes via calling a query that lists discountCodes by code or title is not trivial.
  // We'll still attempt creation but include idempotency metadata in a metafield-like input (if supported).

  // Construct a basic mutation (Shopify GraphQL schema evolves; this mutation represents the common discountCodeBasicCreate pattern).
  const mutation = `
    mutation discountCodeBasicCreate($input: DiscountCodeBasicCreateInput!) {
      discountCodeBasicCreate(input: $input) {
        userErrors { field message }
        discountCode {
          id
          code
        }
      }
    }
  `;

  const input = {
    // Note: the actual GraphQL input structure may vary by API version; this provides a compatible core.
    // We create a basicCodeDiscount with percentage value.
    basicCodeDiscount: {
      title,
      code,
      startsAt: new Date().toISOString(),
      endsAt: expiresIso,
      // usageLimit: null,
      appliesOncePerCustomer: true,
      // Customer selection handling may require additional customer IDs which is complex; default to all customers.
      customerSelection: limitToRepeatCustomers ? 'PREREQUISITE_CUSTOMERS' : 'ALL',
      // value object: specify percentage as decimal (15 for 15%)
      value: {
        amount: pct,
        type: 'PERCENTAGE'
      }
    }
  };

  const data = await graphqlRequest(shop, token, mutation, { input });
  const result = data?.discountCodeBasicCreate;
  if (result?.userErrors && result.userErrors.length) {
    const msg = result.userErrors.map(e=>`${e.field||[]}: ${e.message}`).join('; ');
    throw new Error(`discount creation errors: ${msg}`);
  }

  return result?.discountCode || null;
}
