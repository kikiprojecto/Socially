# Deployment (Socially)

This repository supports a split deployment:

- Dashboard: Next.js app in `web/` (recommended deploy: Vercel)
- Worker: Node.js server `worker_server.js` (recommended deploy: VPS)

## 1) Worker (VPS)

### Requirements

- Node.js 20
- `WORKER_TOKEN` set (required)
- (Optional) Ollama running on the VPS or reachable over the network

### Environment

Set:

- `WORKER_PORT` (default: `8787`)
- `WORKER_TOKEN` (required)

Bot runtime variables (used by `src/main.js` → `poidh_main_bot.js`):

- `SOLANA_NETWORK` (`devnet` by default)
- `OLLAMA_API_URL` (default: `http://localhost:11434`)
- `OLLAMA_MODEL` (default: `llava`)
- `DEMO_MODE` (`true/false`)
- `DRY_RUN_PAYMENTS` (`true/false`)
- `POIDH_INDEXER_BASE_URL` (optional; enables real POIDH bounty/claim ingestion)
- `POIDH_CHAIN_ID` (optional; required with POIDH indexer, e.g. `8453`)
- `POIDH_BOUNTY_ID` (optional; required with POIDH indexer)
- `WORKER_RATE_LIMIT_RPM` (optional; default `120`)
- `WORKER_RATE_LIMIT_BURST` (optional; default `30`)

### Run

```bash
npm ci
npm run worker
```

Health:

- `GET /health`

Protected endpoints (Bearer `WORKER_TOKEN`):

- `GET /status`
- `GET /metrics`
- `GET /logs`
- `GET /events` (SSE stream)
- `POST /bot/start`
- `POST /bot/stop`
- `POST /bot/run-once`

## 2) Dashboard (Vercel)

### Root directory

Set Vercel project root to `web/`.

### Environment

Set:

- `WORKER_BASE_URL` (public URL of your worker, e.g. `https://your-vps.example.com:8787`)
- `WORKER_TOKEN` (same token as the worker)
- `DASHBOARD_KEY` (optional but recommended; protects start/stop/run actions)

### Notes

- The dashboard streams events using `GET /api/events` which proxies the worker `/events` stream.
- Start/stop/run buttons require the dashboard key if `DASHBOARD_KEY` is set.
