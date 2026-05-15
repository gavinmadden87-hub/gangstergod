#!/usr/bin/env node
/**
 * ghostos-shopify-bootstrap.mjs
 *
 * Idempotent helper to:
 *  - register required webhooks
 *  - create a 15% discount code (idempotent by title + code lookup)
 *  - fetch last 7 days of orders
 *
 * This enhanced variant prefers GraphQL discount creation (production parity) and falls
 * back to REST price_rule/discount_code creation when GraphQL path fails.
 *
 * Usage:
 *   - populate .env.local with secrets
 *   - node ghostos-shopify-bootstrap.mjs
 *
 * This script never prints your ADMIN_TOKEN or SHOPIFY_SHARED_SECRET.
 */

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
} from './lib/shopify.js';
import { ensureDiscountGraphQL } from './lib/shopify-graphql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function env(name, required = true) {
  const v = process.env[name];
  if (required && !v) {
    console.error(`Missing env var ${name}. Create .env.local or export the variable.`);
    process.exit(1);
  }
  return v;
}

async function ensureWebhooks(shop, token, runtimeUrl) {
  console.log('Checking existing webhooks...');
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
    if (found) {
      console.log(`Webhook exists: ${r.topic} -> ${address} (id=${found.id})`);
      results.push({ topic: r.topic, address, created: false, id: found.id });
      continue;
    }
    console.log(`Creating webhook: ${r.topic} -> ${address}`);
    const created = await createWebhook(shop, token, r.topic, address);
    console.log(`Created webhook id=${created.id}`);
    results.push({ topic: r.topic, address, created: true, id: created.id });
  }
  return results;
}

// Attempt GraphQL discount creation first; fall back to REST if GraphQL fails.
async function ensureDiscount(shop, token, code, pct, expiresIso, limitToRepeatCustomers) {
  const preferGraphql = (process.env.PREFER_GRAPHQL || 'true').toLowerCase() === 'true';
  if (preferGraphql) {
    try {
      console.log('Attempting GraphQL discount creation...');
      const created = await ensureDiscountGraphQL(shop, token, code, pct, expiresIso, limitToRepeatCustomers);
      if (created) {
        console.log(`GraphQL discount created: id=${created.id} code=${created.code}`);
        return { graphql: true, discount: created };
      }
    } catch (gErr) {
      console.warn('GraphQL discount creation failed, falling back to REST. Error:', gErr.message || gErr);
    }
  }

  console.log('Falling back to REST price_rule + discount_code flow...');
  // REST path (idempotent by title + code)
  const title = `GhostOS Auto Discount ${code}`;
  const priceRules = await listPriceRules(shop, token);
  let matched = priceRules.find(pr => pr.title === title);
  if (!matched) {
    console.log('No existing price_rule found. Creating price_rule...');
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
    console.log(`Created price_rule id=${matched.id}`);
  } else {
    console.log(`Found existing price_rule id=${matched.id}`);
  }

  const codes = await listDiscountCodes(shop, token, matched.id);
  const foundCode = codes.find(c => (c.code || '').toUpperCase() === code.toUpperCase());
  if (foundCode) {
    console.log(`Discount code already exists: ${foundCode.code} (id=${foundCode.id})`);
    return { graphql: false, price_rule_id: matched.id, discount_code: foundCode };
  }

  console.log(`Creating discount code ${code} under price_rule ${matched.id}...`);
  const created = await createDiscountCode(shop, token, matched.id, code);
  console.log(`Created discount code id=${created.id}, code=${created.code}`);
  return { graphql: false, price_rule_id: matched.id, discount_code: created };
}

function isoDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

async function fetchRecentOrders(shop, token, days = 7) {
  console.log(`Fetching orders since ${days} days ago...`);
  const since = isoDaysAgo(days);
  const orders = await listOrdersSince(shop, token, since);
  return orders.map(o => ({
    id: o.id,
    name: o.name,
    created_at: o.created_at,
    total_price: o.total_price,
    email: o.email,
    cart_token: o.cart_token || null,
    checkout_id: o.checkout_id || null
  }));
}

async function main() {
  // Load .env.local if present
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split(/\r?\n/)) {
      const m = line.match(/^\s*([^=#\s]+)\s*=\s*(.*)\s*$/);
      if (m) {
        const [_, k, vRaw] = m;
        if (!process.env[k]) {
          const v = vRaw.replace(/^"(.+)"$/, '$1').replace(/^'(.+)'$/, '$1');
          process.env[k] = v;
        }
      }
    }
  }

  const SHOP = env('SHOP');
  const ADMIN_TOKEN = env('ADMIN_TOKEN');
  const RUNTIME_URL = env('RUNTIME_URL');
  const DISCOUNT_CODE = env('DISCOUNT_CODE') || 'GHOST15';
  const DISCOUNT_PCT = parseFloat(process.env.DISCOUNT_PCT || '15');
  const DISCOUNT_EXPIRES = env('DISCOUNT_EXPIRES');
  const LIMIT_TO_REPEAT_CUSTOMERS = (process.env.LIMIT_TO_REPEAT_CUSTOMERS || 'false').toLowerCase() === 'true';

  console.log('Starting GhostOS Shopify bootstrap (enhanced)...');
  try {
    const webhookResults = await ensureWebhooks(SHOP, ADMIN_TOKEN, RUNTIME_URL);
    const discountResult = await ensureDiscount(SHOP, ADMIN_TOKEN, DISCOUNT_CODE, DISCOUNT_PCT, DISCOUNT_EXPIRES, LIMIT_TO_REPEAT_CUSTOMERS);
    const recentOrders = await fetchRecentOrders(SHOP, ADMIN_TOKEN, 7);

    console.log('--- SUMMARY ---');
    console.log('Webhooks:');
    for (const w of webhookResults) {
      console.log(`  - ${w.topic} -> ${w.address} (id=${w.id})${w.created ? ' [created]' : ''}`);
    }
    if (discountResult.graphql) {
      console.log(`Discount (GraphQL): id=${discountResult.discount.id} code=${discountResult.discount.code}`);
    } else {
      console.log(`Discount: code=${discountResult.discount_code ? discountResult.discount_code.code : discountResult.discount?.code} price_rule_id=${discountResult.price_rule_id || 'n/a'}`);
    }
    console.log(`Recent orders (last ${recentOrders.length}):`);
    console.log(JSON.stringify(recentOrders, null, 2));
    console.log('Bootstrap complete. Verify webhooks in Shopify Admin and test runtime endpoint with HMAC-signed payloads.');
  } catch (err) {
    console.error('Bootstrap failed:', err?.response || err?.message || err);
    process.exit(2);
  }
}

main();
