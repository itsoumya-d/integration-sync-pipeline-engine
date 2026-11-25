# Integration Sync Pipeline Engine

High-throughput, resilient integration synchronization pipeline engine designed for syncing enterprise third-party APIs with relational storage.

## Features
- **Adaptive Multi-Tenant Rate Limiting**: Token-bucket scheduler with jittered exponential backoff to handle upstream 429 and rate-limiting quotas.
- **Idempotency & State Tracking**: Cryptographic SHA-256 fingerprinting to eliminate redundant downstream record writes.
- **Deterministic Batch Upsert Generation**: Optimized PostgreSQL query generator supporting chunked upserts (`INSERT ... ON CONFLICT (...) DO UPDATE`).
- **Graceful Lifecycle Management**: In-flight drain tracking and shutdown handlers for zero-data-loss container restarts.

## Getting Started

```bash
npm install
npm test
```
