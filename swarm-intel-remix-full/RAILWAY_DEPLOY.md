# Railway deploy guide (remix-full)

This document shows how to run the remix-full bootstrap as a one-off job on Railway.

1) Create Railway project and connect repo gavinmadden87-hub/gangstergod
2) Set Environment Variables in Railway (Project -> Settings -> Environment):
   - SHOP
   - ADMIN_TOKEN
   - RUNTIME_URL (your staging runtime domain)
   - DISCOUNT_CODE, DISCOUNT_PCT, DISCOUNT_EXPIRES
   - LIMIT_TO_REPEAT_CUSTOMERS
   - PREFER_GRAPHQL
3) Run a one-off job:
   - Open the project, click "New Job" -> "Run Command"
   - Command: `node swarm-intel-remix-full/ghostos-shopify-bootstrap.mjs`
4) Inspect logs for webhook creation and discount creation messages. Check Shopify Admin console for created webhooks and discounts.
