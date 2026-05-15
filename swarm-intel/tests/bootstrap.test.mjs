import nock from 'nock';
import assert from 'node:assert/strict';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'url';
import path from 'path';

const execp = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Tests the bootstrap script in isolation by mocking Shopify API endpoints.
// Uses environment variables to configure behavior.

const shop = 'test-shop.myshopify.com';
const adminPath = '/admin/api/2025-01';

export async function setupNock() {
  // Webhooks GET -> empty
  nock(`https://${shop}`)
    .get(`${adminPath}/webhooks.json`)
    .reply(200, { webhooks: [] });

  // Webhook POST -> created object
  nock(`https://${shop}`)
    .post(`${adminPath}/webhooks.json`)
    .reply(201, { webhook: { id: 111, topic: 'checkouts/create', address: 'https://example/runtime/api/webhooks/shopify/checkouts_create' } })
    .persist();

  // Price rules GET -> empty
  nock(`https://${shop}`)
    .get(`${adminPath}/price_rules.json`)
    .reply(200, { price_rules: [] });

  // Price rule POST -> created
  nock(`https://${shop}`)
    .post(`${adminPath}/price_rules.json`)
    .reply(201, { price_rule: { id: 222 } });

  // Discount codes GET -> empty
  nock(`https://${shop}`)
    .get(`${adminPath}/price_rules/222/discount_codes.json`)
    .reply(200, { discount_codes: [] });

  // Discount codes POST -> created
  nock(`https://${shop}`)
    .post(`${adminPath}/price_rules/222/discount_codes.json`)
    .reply(201, { discount_code: { id: 333, code: 'GHOST15' } });

  // Orders GET -> one order
  nock(`https://${shop}`)
    .get(new RegExp(`${adminPath}/orders.json.*`))
    .reply(200, { orders: [ { id: 444, name: '#1001', created_at: new Date().toISOString(), total_price: '100.00', email: 'test@example.com', cart_token: 'ctok-123' } ] });
}

// Run the bootstrap script as a child process and capture stdout
export async function runBootstrapEnv(env) {
  const cwd = path.join(__dirname, '..');
  const envVars = { ...process.env, ...env, RUN_MAIN: 'true' };
  const { stdout, stderr } = await execp('node ghostos-shopify-bootstrap.mjs', { cwd, env: envVars, timeout: 30000 });
  return { stdout, stderr };
}

// Node test runner
import test from 'node:test';

test('bootstrap creates webhooks, discount and fetches recent orders (mocked)', async (t) => {
  await setupNock();
  const env = {
    SHOP: shop,
    ADMIN_TOKEN: 'test-token',
    RUNTIME_URL: 'https://example/runtime',
    DISCOUNT_CODE: 'GHOST15',
    DISCOUNT_PCT: '15',
    DISCOUNT_EXPIRES: new Date(Date.now()+86400000).toISOString(),
    LIMIT_TO_REPEAT_CUSTOMERS: 'false',
    PREFER_GRAPHQL: 'false'
  };
  const { stdout } = await runBootstrapEnv(env);
  // Assert output contains expected markers
  assert.ok(stdout.includes('Created webhook id=111') || stdout.includes('Webhook exists'), 'webhook creation log missing');
  assert.ok(stdout.match(/Created price_rule id=222/) || stdout.includes('Found existing price_rule'), 'price_rule log missing');
  assert.ok(stdout.includes('Created discount code id=333') || stdout.includes('Discount code already exists'), 'discount code log missing');
  assert.ok(stdout.includes('Recent orders (last'), 'recent orders log missing');
});
