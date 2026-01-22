---
paths:
  - 'src/lib/uploadthing*.ts'
  - 'src/lib/email.ts'
  - 'src/routes/api/**/*.ts'
---

# External Services

## UploadThing (v7+)

- Uses single `UPLOADTHING_TOKEN` env var (not legacy `UPLOADTHING_SECRET`/`UPLOADTHING_APP_ID`)
- Pass token explicitly in route handler config
- File router in `src/lib/uploadthing.ts`
- Client utilities in `src/lib/uploadthing-client.ts`

```typescript
// API route must pass token explicitly
const handler = createRouteHandler({
  router: uploadRouter,
  config: { token: env.UPLOADTHING_TOKEN },
})
```

## Resend

- Uses `RESEND_API_KEY` env var
- Email utility in `src/lib/email.ts`
- Check if API key exists before sending (graceful degradation in dev)
