#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  listWebhooks,
  createWebhook,
  listPriceRules,
  createPriceRule,
  listDiscountCodes,
  createDiscountCode,
  listOrdersSince
} from './lib/shopify-rest.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
function env(name, required = true) { const v = process.env[name]; if (required && !v) { console.error(`Missing env var ${name}.`); process.exit(1); } return v; }

async function ensureWebhooks(shop, token, runtimeUrl) {
  const existing = await listWebhooks(shop, token);
  const required = [
    { topic: 'checkouts/create', path: '/api/webhooks/shopify/checkouts_create' },
    { topic: 'carts/update', path: '/api/webhooks/shopify/carts_update' },
    { topic: 'orders/create', path: '/api/webhooks/shopify/orders_create' },
    { topic: 'customers/create', path: '/api/webhooks/shopify/customers_create' }
  ];
  const results = [];
  for (const r of required) {
    const address = `${runtimeUrl}${r.path}`;
    const found = existing.find(w => w.topic === r.topic && w.address === address);
    if (found) { results.push({ topic: r.topic, address, created: false, id: found.id }); continue; }
    const created = await createWebhook(shop, token, r.topic, address);
    results.push({ topic: r.topic, address, created: true, id: created.id });
  }
  return results;
}

async function ensureDiscount(shop, token, code, pct, expiresIso, limitToRepeatCustomers) {
  const title = `GhostOS Auto Discount ${code}`;
  const priceRules = await listPriceRules(shop, token);
  let matched = priceRules.find(pr => pr.title === title);
  if (!matched) {
    const payload = {
      title,
      target_type: 'line_item',
      target_selection: 'all',
      allocation_method: 'across',
      value_type: 'percentage',
      value: `-${pct.toString()}`,
      customer_selection: limitToRepeatCustomers ? 'prerequisite_customer_ids' : 'all',
      starts_at: new Date().toISOString(),
      ends_at: expiresIso,
      usage_limit: null,
      once_per_customer: true
    };
    matched = await createPriceRule(shop, token, payload);
  }
  const codes = await listDiscountCodes(shop, token, matched.id);
  const foundCode = codes.find(c => (c.code || '').toUpperCase() === code.toUpperCase());
  if (foundCode) return { price_rule_id: matched.id, discount_code: foundCode };
  const created = await createDiscountCode(shop, token, matched.id, code);
  return { price_rule_id: matched.id, discount_code: created };
}

function isoDaysAgo(days) { const d = new Date(); d.setUTCDate(d.getUTCDate() - days); return d.toISOString(); }
async function fetchRecentOrders(shop, token, days = 7) { const since = isoDaysAgo(days); const orders = await listOrdersSince(shop, token, since); return orders.map(o => ({ id: o.id, name: o.name, created_at: o.created_at, total_price: o.total_price, email: o.email, cart_token: o.cart_token || null })); }

async function main() {
  const envPath = path.join(__dirname, '.env.example');
  if (fs.existsSync(envPath)) { const envContent = fs.readFileSync(envPath, 'utf8'); for (const line of envContent.split(/\r?\n/)) { const m = line.match(/^\s*([^=#\s]+)\s*=\s*(.*)\s*$/); if (m) { const [_, k, vRaw] = m; if (!process.env[k]) process.env[k] = vRaw.replace(/^"(.+)"$/, '$1').replace(/^'(.+)'$/, '$1'); } } }

  const SHOP = env('SHOP'); const ADMIN_TOKEN = env('ADMIN_TOKEN'); const RUNTIME_URL = env('RUNTIME_URL'); const DISCOUNT_CODE = env('DISCOUNT_CODE') || 'GHOST15-R2'; const DISCOUNT_PCT = parseFloat(process.env.DISCOUNT_PCT || '15'); const DISCOUNT_EXPIRES = env('DISCOUNT_EXPIRES'); const LIMIT_TO_REPEAT_CUSTOMERS = (process.env.LIMIT_TO_REPEAT_CUSTOMERS || 'false').toLowerCase() === 'true';

  try {
    const webhooks = await ensureWebhooks(SHOP, ADMIN_TOKEN, RUNTIME_URL);
    const discount = await ensureDiscount(SHOP, ADMIN_TOKEN, DISCOUNT_CODE, DISCOUNT_PCT, DISCOUNT_EXPIRES, LIMIT_TO_REPEAT_CUSTOMERS);
    const orders = await fetchRecentOrders(SHOP, ADMIN_TOKEN, 7);
    console.log('Webhooks:', webhooks);
    console.log('Discount:', discount.discount_code || discount);
    console.log('Recent orders count:', orders.length);
  } catch (err) {
    console.error('Bootstrap failed:', err?.response || err?.message || err); process.exit(2);
  }
}

main();
