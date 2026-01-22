# TASK-1.13: Create schema.ts with all tables

## Summary

Define complete Convex database schema with tables split across separate files for maintainability.

## Changes

### File Structure

```
convex/
├── schema.ts              # Main schema (combines all tables)
└── schema/
    ├── status.ts          # Status enums and validators
    ├── users.ts           # users table
    ├── organizations.ts   # organizations table
    ├── profiles.ts        # paymentOrderProfiles table
    ├── tags.ts            # tags table
    ├── orders.ts          # paymentOrders table
    ├── documents.ts       # paymentOrderDocuments table
    └── history.ts         # paymentOrderHistory table
```

### Tables

| Table                   | Indexes                                                                   |
| ----------------------- | ------------------------------------------------------------------------- |
| `users`                 | by_authKitId, by_email                                                    |
| `organizations`         | by_slug, by_owner                                                         |
| `paymentOrderProfiles`  | by_organization, by_owner, by_org_and_slug                                |
| `tags`                  | by_user                                                                   |
| `paymentOrders`         | by_profile, by_creator, by_status, by_profile_and_status, search_by_title |
| `paymentOrderDocuments` | by_paymentOrder                                                           |
| `paymentOrderHistory`   | by_paymentOrder                                                           |

### Type Exports (from `convex/schema.ts`)

- `PaymentOrderStatus` - 8 status values
- `HistoryAction` - 6 action types
- `paymentOrderStatuses` - array constant
- `historyActions` - array constant

## Files

| File                             | Purpose                                        |
| -------------------------------- | ---------------------------------------------- |
| `convex/schema.ts`               | Main schema, combines tables, re-exports types |
| `convex/schema/status.ts`        | Status/action enums and validators             |
| `convex/schema/users.ts`         | Users table definition                         |
| `convex/schema/organizations.ts` | Organizations table definition                 |
| `convex/schema/profiles.ts`      | Payment order profiles table                   |
| `convex/schema/tags.ts`          | Tags table definition                          |
| `convex/schema/orders.ts`        | Payment orders table                           |
| `convex/schema/documents.ts`     | Documents table                                |
| `convex/schema/history.ts`       | History table                                  |

## Verification

1. `pnpm tsc --noEmit` passes
2. `pnpm check` passes
3. `pnpm convex dev` syncs schema to Convex
4. Types generated in `convex/_generated/`
