# Handoff

## Last Completed

**TASK-1.14, 1.15, 1.17, 1.18**: External service integrations

- UploadThing configured with v7+ SDK (`UPLOADTHING_TOKEN`)
  - `src/lib/uploadthing.ts` - server-side file router
  - `src/lib/uploadthing-client.ts` - client utilities (UploadButton, UploadDropzone)
  - `server/routes/api/uploadthing.ts` - Nitro API endpoint
- Resend email utility created
  - `src/lib/email.ts` - `sendEmail` function
- Vercel project created and deployed to production
- `develop` branch created for staging
- Using Convex preview deployments (same project)
- Added `h3` dependency for Nitro event handling

## Next Task

**TASK-1.22**: Verify entire setup works end-to-end

- `pnpm dev` starts without errors
- `pnpm build` compiles without errors
- `pnpm typecheck` passes (if available)
- `pnpm lint` passes
- Hot reload works
- Test deploy to Vercel

## Environment Variables Required

```bash
# .env.local
UPLOADTHING_TOKEN=...
RESEND_API_KEY=re_...
VITE_CONVEX_URL=...
```

## Pending (optional)

- Custom staging domain (staging.betania.app)
- WorkOS authentication integration
