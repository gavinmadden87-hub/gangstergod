import nock from 'nock';
import assert from 'node:assert/strict';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'url';
import path from 'path';

const execp = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shop = 'test-shop.myshopify.com';
const adminPath = '/admin/api/2025-01';

export async function setupNock() {
  nock(`https://${shop}`)
    .get(`${adminPath}/webhooks.json`)
    .reply(200, { webhooks: [] });
  nock(`https://${shop}`)
    .post(`${adminPath}/webhooks.json`)
    .reply(201, { webhook: { id: 101 } })
    .persist();
  nock(`https://${shop}`)
    .post(`${adminPath}/price_rules.json`)
    .reply(201, { price_rule: { id: 202 } });
  nock(`https://${shop}`)
    .post(`${adminPath}/price_rules/202/discount_codes.json`)
    .reply(201, { discount_code: { id: 303, code: 'GHOST15-R3' } });
  nock(`https://${shop}`)
    .get(new RegExp(`${adminPath}/orders.json.*`))
    .reply(200, { orders: [ { id: 404 } ] });
}

export async function runBootstrapEnv(env) {
  const cwd = path.join(__dirname, '..');
  const envVars = { ...process.env, ...env };
  const { stdout, stderr } = await execp('node ghostos-shopify-bootstrap.mjs', { cwd, env: envVars, timeout: 30000 });
  return { stdout, stderr };
}

import test from 'node:test';

test('remix-full bootstrap (mocked)', async () => {
  await setupNock();
  const env = { SHOP: shop, ADMIN_TOKEN: 't', RUNTIME_URL: 'https://example', DISCOUNT_CODE: 'GHOST15-R3', DISCOUNT_PCT: '15', DISCOUNT_EXPIRES: new Date(Date.now()+86400000).toISOString(), LIMIT_TO_REPEAT_CUSTOMERS: 'false', PREFER_GRAPHQL: 'false' };
  const { stdout } = await runBootstrapEnv(env);
  assert.ok(stdout.includes('Created webhook id=101') || stdout.includes('Webhook exists'), 'webhook creation log missing');
  assert.ok(stdout.includes('Created discount code id=303') || stdout.includes('Discount code'), 'discount log missing');
});
