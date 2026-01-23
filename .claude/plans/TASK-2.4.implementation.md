# TASK-2.4: Set Up Route Guards with WorkOS AuthKit

## Summary

Configure WorkOS AuthKit middleware and create authenticated route guards. WorkOS handles the login UI - no custom login page needed.

## Changes

1. **Create `src/start.ts`** - Configure AuthKit middleware
2. **Create `src/routes/_authenticated.tsx`** - Layout guard redirects unauthenticated users to WorkOS
3. **Create `src/routes/logout.tsx`** - Logout handler
4. **Create `src/routes/_authenticated/dashboard.tsx`** - Basic protected dashboard
5. **Delete `src/routes/auth/login.tsx`** - Not needed (WorkOS handles login)
6. **Update `src/routes/index.tsx`** - Link to dashboard instead of `/auth/login`

## Files

| Action | File                                      |
| ------ | ----------------------------------------- |
| Create | `src/start.ts`                            |
| Create | `src/routes/_authenticated.tsx`           |
| Create | `src/routes/logout.tsx`                   |
| Create | `src/routes/_authenticated/dashboard.tsx` |
| Delete | `src/routes/auth/login.tsx`               |
| Edit   | `src/routes/index.tsx`                    |

## Notes

- TASK-2.5, 2.6, 2.7 (OTP server functions and verify route) are not needed - WorkOS handles these
- TASK-2.8 (callback route) already completed in previous session
- Authenticated routes go under `_authenticated/` folder - automatically protected by layout guard
