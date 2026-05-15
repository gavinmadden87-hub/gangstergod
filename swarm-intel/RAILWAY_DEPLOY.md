# Railway deployment guide for GhostOS runtime (swarm-intel)

This guide helps you deploy the GhostOS bootstrap script (and later the runtime) to Railway and configure environment variables.

1) Create a Railway project
   - Sign in to Railway (https://railway.app)
   - Create a new project and connect your GitHub repo `gavinmadden87-hub/gangstergod`.

2) Configure deployment
   - In Project Settings -> Deployments, connect the repository and set the root directory to `/swarm-intel` if deploying the runtime; for the bootstrap script you can run it in a one-off job.
   - Set the Start Command to: `node ghostos-shopify-bootstrap.mjs` for a one-off run, or keep scripts for runtime as needed.

3) Add Environment Variables (Secrets)
   - SHOP (e.g., your-shop.myshopify.com)
   - ADMIN_TOKEN (Shopify Admin API token)
   - RUNTIME_URL (public runtime URL; for Railway preview use the generated domain)
   - DISCOUNT_CODE, DISCOUNT_PCT, DISCOUNT_EXPIRES
   - LIMIT_TO_REPEAT_CUSTOMERS (true/false)
   - DO NOT add secrets to code or commit them.

4) Run a one-off job (Bootstrap)
   - In Railway, create a new job or run the project and execute: `npm run bootstrap` or `node ghostos-shopify-bootstrap.mjs` in the shell.

5) Verify
   - Check logs for webhook creation messages and discount creation messages.
   - Confirm webhooks in Shopify Admin and Test by posting HMAC-signed payloads.

Notes
- For local testing, use `ngrok` and set RUNTIME_URL to the ngrok HTTPS URL in .env.local.
- For production webhook endpoints, prefer a stable Railway or Vercel domain and secure the webhook with the shared secret HMAC verification in your runtime.
