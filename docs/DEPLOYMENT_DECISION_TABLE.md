# Deployment Decision Table

Use this page to choose the right deployment path quickly.

## Quick Decision Matrix

| Criterion | Cloudflare Workers + D1 | Bun + SQLite (Bare Server) | Docker (Bun + SQLite) |
|---|---|---|---|
| Setup speed | Fast | Medium | Medium |
| Ongoing ops | Low | Medium/High | Medium |
| Infra control | Low | High | High |
| Scaling | Automatic | Manual | Manual |
| Cost model | Serverless usage | VM/server cost | VM/server cost |
| Best for | Production with low ops | Full control/self-hosted | Reproducible self-hosted |
| Database | D1 (managed) | SQLite file | SQLite volume |
| Secrets management | Wrangler secrets | Env vars / secret manager | Env vars / secret manager |
| Team familiarity needed | Cloudflare | Linux + Bun | Docker + Linux |
| Local dev parity | Medium | High | High |

## Recommended By Scenario

| Scenario | Recommendation |
|---|---|
| You want easiest production path | Cloudflare Workers + D1 |
| You want minimal infra management | Cloudflare Workers + D1 |
| You need full backend/runtime control | Bun + SQLite |
| You deploy on your own VPS | Bun + SQLite or Docker |
| You need reproducible environment across machines | Docker |
| You want to avoid Cloudflare lock-in | Bun + SQLite or Docker |

## URL Mapping Rules (All Options)

- `BETTER_AUTH_URL`: backend public URL
- `APP_URL`: frontend public URL
- `TRUSTED_ORIGINS`: allowed frontend origin(s), comma-separated

Example:

```env
BETTER_AUTH_URL=https://api.yourdomain.com
APP_URL=https://app.yourdomain.com
TRUSTED_ORIGINS=https://app.yourdomain.com
```

## Telegram OAuth Note

Telegram OAuth requires public HTTPS callback URLs.

- Do not use localhost callback for Telegram OAuth
- Use Cloudflare Tunnel or ngrok in development

## Next Step Links

- Cloudflare flow: `docs/CLOUDFLARE_DEPLOY_WORKFLOW.md`
- Bun flow: `docs/BUN_SQLITE_DEPLOY_WORKFLOW.md`
- Full deployment details: `docs/DEPLOYMENT.md`
