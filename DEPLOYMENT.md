# Deployment (Socially)

This repository runs the bot as a Node.js service (`npm start`).

## 1) Worker (VPS)

### Requirements

- Node.js 20

### Environment

Set:

- `NETWORK` (e.g. `base` / `arbitrum` / `degen`)
- `EVM_NETWORK` (optional; defaults used if `EVM_RPC_URL` is not provided)
- `EVM_RPC_URL` (recommended in production)
- `POIDH_EVM_CONTRACT_ADDRESS` (required for networks without a known contract in `src/blockchain/networks.js`)
- `ANTHROPIC_API_KEY` (required)
- `PINATA_API_KEY` and `PINATA_SECRET_KEY` (required for IPFS uploads)

### Run

```bash
npm ci
npm start
```
