GhostOS Shopify Bootstrap
=========================

What this does
- Registers required webhooks (checkouts/create, carts/update, orders/create, customers/create) pointing at your runtime.
- Creates a 15% discount code (idempotent by price_rule title + code).
- Fetches last 7 days of orders for verification.

Files created
- .env.local — environment placeholders (DO NOT COMMIT)
- package.json — script "bootstrap"
- lib/shopify.js — Shopify API helpers
- ghostos-shopify-bootstrap.mjs — main bootstrap script
- README.md — this file

Before you run
1. Populate .env.local with your shop domain and ADMIN_TOKEN.
2. Ensure your runtime URL (RUNTIME_URL) is reachable via HTTPS.
3. Node 18+ is required.

Run
- Install node (>=18)
- Run:
  npm run bootstrap

Notes / Safety
- This script will NOT print your ADMIN_TOKEN. It performs idempotent checks to avoid duplicate webhooks and discount codes.
- Keep NEXT_PUBLIC_ENABLE_MUTATION_TEST=false in production; enable only for staging.
- You are responsible for secrets management. Use Railway/Vercel project secrets in CI; do not check .env.local into git.
