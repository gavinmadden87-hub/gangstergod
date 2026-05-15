ngrok helper for remix-full

1. Install ngrok: https://ngrok.com/download
2. Start your runtime on port 3000 (npm run dev)
3. Run:

```bash
ngrok http 3000 --bind-tls=true
```

4. Update RUNTIME_URL in .env.example to the ngrok HTTPS URL and run the bootstrap.

Local convenience script (swarm-intel-remix-full/ngrok-start.sh):
```bash
#!/usr/bin/env bash
PORT=${1:-3000}
ngrok http $PORT --bind-tls=true
```
