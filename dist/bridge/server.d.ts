/**
 * ClawdBot Bridge Server
 *
 * HTTP API that bridges the Python autoresearch system and the
 * TypeScript ClawdBot agent. Enables:
 *
 * - Python → TS: Train results → agent memory, strategy updates
 * - TS → Python: Agent triggers training runs, reads results
 * - Automation: Cron-like endpoints for full research cycles
 *
 * Endpoints:
 *   POST /api/agent/chat      — Chat with agent
 *   POST /api/agent/observe    — Trigger OODA observation
 *   POST /api/agent/research   — Start research loop
 *   POST /api/agent/remember   — Store to vault
 *   GET  /api/agent/recall     — Query vault
 *   GET  /api/agent/status     — Agent status + token usage
 *   POST /api/python/result    — Report Python training result
 *   POST /api/python/trigger   — Trigger Python training run
 *   GET  /api/python/results   — Get all Python results
 *   POST /api/automate/full    — Full automation cycle
 *   GET  /api/health           — Healthcheck
 */
export {};
//# sourceMappingURL=server.d.ts.map