# ngrok helper

This script and instructions help you run ngrok locally to expose your runtime URL for Shopify webhook testing.

1. Install ngrok: https://ngrok.com/download
2. Start your local runtime (e.g., npm run dev) on port 3000.
3. Run ngrok:

```bash
ngrok http 3000 --bind-tls=true
```

4. ngrok will print HTTPS forwarding URLs like `https://abcd1234.ngrok.io`. Use that as RUNTIME_URL in `.env.local` when testing locally.

Local convenience script (save as swarm-intel/ngrok-start.sh):

```bash
#!/usr/bin/env bash
set -euo pipefail
PORT=${1:-3000}
echo "Starting local runtime (assumes npm run dev is running on port $PORT)"
# Start ngrok and open in background
ngrok http $PORT --bind-tls=true
```

Note: Keep ngrok running while testing webhooks. Update your Shopify webhook endpoints to point at the ngrok URL + `/api/webhooks/shopify/<topic>`.
