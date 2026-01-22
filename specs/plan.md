# Development Plan: Betania Payment Order Management System

## Project Information

| Field | Value |
|-------|-------|
| **Name** | Betania Payment Order Management System |
| **Version** | 1.0.0 |
| **Date** | January 2026 |
| **Estimated dedication** | 4-5 hours/week |
| **MVP Duration** | 17-26 weeks |

---

## 1. Executive Summary

### 1.1 Purpose

Digitize the authorization and review process for payment orders at Betania, including:

- Upload of supporting documents
- Approval from the approver user
- Complete history traceability
- Automatic email notifications
- Preparation for bank reconciliation (future phase)

### 1.2 Target Users

- **Payment order profile owners**: Users who receive and approve payment order requests
- **Payment order creators**: Authorized users who create payment order requests
- **Organization administrators**: Manage the organization and its profiles

### 1.3 Core Features (MVP)

1. OTP authentication via email (WorkOS AuthKit)
2. Organization and payment order profile management
3. Payment order creation with supporting documents
4. Review and approval workflow
5. Change history for each payment order
6. Email notifications
7. Search and filtering by tags
8. Basic reports and export
9. GDPR compliance

### 1.4 Future Features (Post-MVP)

1. Bank transaction download bot
2. Automatic bank reconciliation
3. Mobile application (React Native)

---

## 2. Technology Stack

### 2.1 Core

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Node.js | 20+ | JavaScript Runtime |
| **Package Manager** | pnpm | 9+ | Dependency management |
| **Framework** | TanStack Start | latest | Fullstack React framework |
| **UI Library** | React | 18+ | UI Library |
| **Language** | TypeScript | 5+ | Static typing |

### 2.2 Frontend

| Category | Technology | Purpose |
|----------|------------|---------|
| **Styles** | Tailwind CSS | Utility-first CSS |
| **Components** | shadcn/ui | Accessible components |
| **Server State** | TanStack Query + Convex | Cache and synchronization |
| **Local State** | Zustand | Client global state |
| **Forms** | TanStack Form + Zod | Forms and validation |
| **Routing** | TanStack Router | Type-safe routing |
| **DevTools** | TanStack DevTools | Query/Router/Form debugging |

### 2.3 Backend

| Category | Technology | Purpose |
|----------|------------|---------|
| **Database** | Convex | Reactive database |
| **Authentication** | WorkOS AuthKit | OTP Auth |
| **Storage** | UploadThing | Files and documents |
| **Email** | Resend | Transactional emails |

### 2.4 Infrastructure

| Category | Technology | Purpose |
|----------|------------|---------|
| **Hosting** | Vercel | Deploy and hosting |
| **Environment Variables** | @t3-oss/env + Zod | Env vars validation |
| **Environments** | Staging + Production | Separate environments |

### 2.5 Quality

| Category | Technology | Purpose |
|----------|------------|---------|
| **Unit Testing** | Vitest | Function tests |
| **E2E Testing** | Playwright | Integration tests |
| **Linting** | ESLint | Code quality |
| **Formatting** | Prettier | Consistent formatting |

---

## 3. Data Model

### 3.1 Entity Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────────┐
│   Users     │────<│  Organizations   │────<│ PaymentOrderProfiles    │
└─────────────┘     └──────────────────┘     └─────────────────────────┘
      │                                              │
      │                                              │
      ▼                                              ▼
┌─────────────┐                              ┌─────────────────┐
│    Tags     │                              │  PaymentOrders  │
└─────────────┘                              └─────────────────┘
                                                     │
                                    ┌────────────────┼────────────────┐
                                    ▼                ▼                ▼
                           ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                           │  Documents   │  │   History    │  │ OrderTags    │
                           └──────────────┘  └──────────────┘  └──────────────┘
```

### 3.2 Table: Users

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | `Id<"users">` | ✅ | Convex unique ID |
| `authKitId` | `string` | ✅ | WorkOS AuthKit ID |
| `email` | `string` | ✅ | User email (unique) |
| `name` | `string` | ✅ | Full name |
| `avatarUrl` | `string` | ❌ | Avatar URL |
| `createdAt` | `number` | ✅ | Creation timestamp |
| `updatedAt` | `number` | ✅ | Update timestamp |
| `deletedAt` | `number` | ❌ | Deletion timestamp (GDPR) |

**Indexes:**
- `by_authKitId`: For AuthKit lookup
- `by_email`: For email search

### 3.3 Table: Organizations

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | `Id<"organizations">` | ✅ | Convex unique ID |
| `name` | `string` | ✅ | Organization name |
| `slug` | `string` | ✅ | URL-friendly identifier (unique) |
| `ownerId` | `Id<"users">` | ✅ | Owner user |
| `createdAt` | `number` | ✅ | Creation timestamp |
| `updatedAt` | `number` | ✅ | Update timestamp |

**Indexes:**
- `by_slug`: For URL lookup
- `by_owner`: To list user's orgs

### 3.4 Table: PaymentOrderProfiles

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | `Id<"paymentOrderProfiles">` | ✅ | Convex unique ID |
| `organizationId` | `Id<"organizations">` | ✅ | Parent organization |
| `ownerId` | `Id<"users">` | ✅ | Profile owner user |
| `name` | `string` | ✅ | Profile name |
| `slug` | `string` | ✅ | URL-friendly identifier |
| `isPublic` | `boolean` | ✅ | Whether profile is enabled |
| `allowedEmails` | `string[]` | ✅ | Authorized emails |
| `createdAt` | `number` | ✅ | Creation timestamp |
| `updatedAt` | `number` | ✅ | Update timestamp |

**Indexes:**
- `by_organization`: To list org's profiles
- `by_owner`: To list user's profiles
- `by_org_and_slug`: For URL lookup

### 3.5 Table: Tags

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | `Id<"tags">` | ✅ | Convex unique ID |
| `userId` | `Id<"users">` | ✅ | Owner user |
| `name` | `string` | ✅ | Tag name |
| `color` | `string` | ✅ | Color in hex format |
| `createdAt` | `number` | ✅ | Creation timestamp |

**Indexes:**
- `by_user`: To list user's tags

### 3.6 Table: PaymentOrders

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | `Id<"paymentOrders">` | ✅ | Convex unique ID |
| `profileId` | `Id<"paymentOrderProfiles">` | ✅ | Payment order profile |
| `createdById` | `Id<"users">` | ✅ | Creator user |
| `title` | `string` | ✅ | Payment order title |
| `description` | `string` | ❌ | Optional description |
| `reason` | `string` | ✅ | Payment order reason |
| `amount` | `number` | ✅ | Payment order amount |
| `currency` | `string` | ✅ | Currency (COP, USD, etc.) |
| `status` | `PaymentOrderStatus` | ✅ | Current status |
| `tagIds` | `Id<"tags">[]` | ✅ | Associated tags |
| `createdAt` | `number` | ✅ | Creation timestamp |
| `updatedAt` | `number` | ✅ | Update timestamp |

**Possible statuses (`PaymentOrderStatus`):**

| Status | Description |
|--------|-------------|
| `CREATED` | Created, pending review |
| `IN_REVIEW` | Under review by approver |
| `NEEDS_SUPPORT` | Requires additional supporting docs |
| `APPROVED` | Approved |
| `PAID` | Paid |
| `RECONCILED` | Reconciled with bank transaction |
| `REJECTED` | Rejected |
| `CANCELLED` | Cancelled by creator |

**Indexes:**
- `by_profile`: To list profile's payment orders
- `by_creator`: To list user's payment orders
- `by_status`: To filter by status
- `by_profile_and_status`: To filter within a profile
- `search_by_title`: For full-text search

### 3.7 Table: PaymentOrderDocuments

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | `Id<"paymentOrderDocuments">` | ✅ | Convex unique ID |
| `paymentOrderId` | `Id<"paymentOrders">` | ✅ | Associated payment order |
| `uploadedById` | `Id<"users">` | ✅ | Uploader user |
| `fileName` | `string` | ✅ | Original name |
| `fileKey` | `string` | ✅ | UploadThing key |
| `fileUrl` | `string` | ✅ | File URL |
| `fileType` | `string` | ✅ | MIME type |
| `fileSize` | `number` | ✅ | Size in bytes |
| `createdAt` | `number` | ✅ | Creation timestamp |

**Indexes:**
- `by_paymentOrder`: To list payment order's documents

### 3.8 Table: PaymentOrderHistory

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | `Id<"paymentOrderHistory">` | ✅ | Convex unique ID |
| `paymentOrderId` | `Id<"paymentOrders">` | ✅ | Associated payment order |
| `userId` | `Id<"users">` | ✅ | User who performed the action |
| `action` | `string` | ✅ | Action type |
| `previousStatus` | `PaymentOrderStatus` | ❌ | Previous status |
| `newStatus` | `PaymentOrderStatus` | ❌ | New status |
| `comment` | `string` | ❌ | Optional comment |
| `metadata` | `object` | ❌ | Additional JSON data |
| `createdAt` | `number` | ✅ | Action timestamp |

**Possible actions:**
- `CREATED`: Payment order created
- `STATUS_CHANGED`: Status change
- `DOCUMENT_ADDED`: Document added
- `DOCUMENT_REMOVED`: Document removed
- `UPDATED`: Payment order updated
- `COMMENT_ADDED`: Comment added

**Indexes:**
- `by_paymentOrder`: To list payment order's history

---

## 4. User Flows

### 4.1 Payment Order Status Diagram

```
                              ┌──────────────┐
                              │   CREATED    │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                    ┌────────>│  IN_REVIEW   │<────────┐
                    │         └──────┬───────┘         │
                    │                │                 │
                    │    ┌───────────┼───────────┐     │
                    │    ▼           ▼           ▼     │
              ┌─────┴────────┐ ┌──────────┐ ┌─────────┴───┐
              │NEEDS_SUPPORT │ │ REJECTED │ │  APPROVED   │
              └──────────────┘ └──────────┘ └──────┬──────┘
                                                   │
                                                   ▼
                                            ┌──────────────┐
                                            │     PAID     │
                                            └──────┬───────┘
                                                   │
                                                   ▼
                                            ┌──────────────┐
                                            │  RECONCILED  │
                                            └──────────────┘

    * CANCELLED can occur from CREATED, IN_REVIEW or NEEDS_SUPPORT
```

### 4.2 Flow: Registration and Authentication

1. User accesses `/auth/login`
2. Enters their email
3. System sends OTP code via AuthKit
4. User enters code at `/auth/verify`
5. System validates code with AuthKit
6. If new user, creates record in Convex
7. Establishes session and redirects to `/dashboard`

### 4.3 Flow: Create Organization and Profile

1. Authenticated user accesses `/orgs/new`
2. Completes organization name
3. System generates automatic slug
4. User creates payment order profile within the org
5. Configures allowed emails list
6. Enables the profile (isPublic = true)
7. Gets public link: `/{orgSlug}/{profileSlug}`

### 4.4 Flow: Create a Payment Order

1. User accesses the profile's public link
2. System verifies authentication
3. System verifies email is in allowedEmails
4. User completes form:
   - Title (required)
   - Reason (required)
   - Description (optional)
   - Amount and currency (required)
   - Tags (optional)
5. User attaches supporting docs (optional at this point)
6. System creates payment order in `CREATED` status
7. System records in history
8. System notifies profile owner

### 4.5 Flow: Review and Approve Payment Order

1. Profile owner receives notification
2. Accesses `/dashboard/payment-orders/{id}`
3. Reviews information and documents
4. Options:
   - **Request supporting docs**: Changes to `NEEDS_SUPPORT`, adds comment
   - **Approve**: Changes to `APPROVED`
   - **Reject**: Changes to `REJECTED`, adds reason
5. System records in history
6. System notifies creator

### 4.6 Flow: Add Additional Supporting Documents

1. Creator receives `NEEDS_SUPPORT` notification
2. Accesses payment order detail
3. Uploads additional documents
4. System records in history
5. System changes status to `IN_REVIEW`
6. System notifies profile owner

---

## 5. Application Architecture

### 5.1 Folder Structure

```
payment-order-manager/
├── .env.local                    # Local environment variables
├── .env.example                  # Variables example
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tailwind.config.ts
├── app.config.ts                 # TanStack Start configuration
├── convex/
│   ├── _generated/               # Convex generated code
│   ├── schema.ts                 # Schema definition
│   ├── auth.ts                   # Authentication functions
│   ├── users.ts                  # User functions
│   ├── organizations.ts          # Organization functions
│   ├── paymentOrderProfiles.ts   # Profile functions
│   ├── paymentOrders.ts          # Payment order functions
│   ├── paymentOrderDocuments.ts  # Document functions
│   ├── paymentOrderHistory.ts    # History functions
│   ├── tags.ts                   # Tag functions
│   ├── notifications.ts          # Notification functions
│   └── http.ts                   # HTTP endpoints (webhooks)
├── src/
│   ├── routes/
│   │   ├── __root.tsx            # Root layout
│   │   ├── index.tsx             # Landing page
│   │   ├── auth/
│   │   │   ├── login.tsx         # Login page
│   │   │   ├── verify.tsx        # OTP verification
│   │   │   └── callback.tsx      # AuthKit callback
│   │   ├── dashboard/
│   │   │   ├── index.tsx         # Main dashboard
│   │   │   ├── payment-orders/
│   │   │   │   ├── index.tsx     # Payment orders list
│   │   │   │   └── $id.tsx       # Payment order detail
│   │   │   └── reports/
│   │   │       └── index.tsx     # Reports
│   │   ├── orgs/
│   │   │   ├── new.tsx           # Create organization
│   │   │   └── $orgSlug/
│   │   │       ├── index.tsx     # Org detail
│   │   │       └── profiles/
│   │   │           ├── new.tsx   # Create profile
│   │   │           └── $profileSlug.tsx
│   │   ├── settings/
│   │   │   ├── profile.tsx       # Profile settings
│   │   │   ├── tags.tsx          # Tag management
│   │   │   └── privacy.tsx       # Privacy and GDPR
│   │   ├── legal/
│   │   │   ├── privacy.tsx       # Privacy policy
│   │   │   └── terms.tsx         # Terms of use
│   │   └── $orgSlug/
│   │       └── $profileSlug/
│   │           └── index.tsx     # Public upload view
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── payment-orders/
│   │   │   ├── PaymentOrderForm.tsx
│   │   │   ├── PaymentOrderCard.tsx
│   │   │   ├── PaymentOrderList.tsx
│   │   │   ├── PaymentOrderDetail.tsx
│   │   │   ├── PaymentOrderTimeline.tsx
│   │   │   ├── PaymentOrderActions.tsx
│   │   │   ├── PaymentOrderStatusBadge.tsx
│   │   │   └── PaymentOrderDocuments.tsx
│   │   ├── tags/
│   │   │   ├── TagInput.tsx
│   │   │   ├── TagBadge.tsx
│   │   │   └── TagManager.tsx
│   │   ├── files/
│   │   │   ├── FileUploader.tsx
│   │   │   └── FilePreview.tsx
│   │   └── shared/
│   │       ├── AmountInput.tsx
│   │       ├── SearchBar.tsx
│   │       └── EmptyState.tsx
│   ├── lib/
│   │   ├── env.ts                # Env vars validation with t3-env
│   │   ├── convex.ts             # Convex client
│   │   ├── auth.ts               # Auth utilities
│   │   ├── uploadthing.ts        # UploadThing configuration
│   │   ├── utils.ts              # General utilities
│   │   └── validators/           # Zod schemas
│   │       ├── payment-order.ts
│   │       ├── organization.ts
│   │       └── user.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePaymentOrders.ts
│   │   ├── useTags.ts
│   │   └── useOrganizations.ts
│   ├── stores/
│   │   ├── uiStore.ts            # UI state (sidebar, modals)
│   │   └── filterStore.ts        # Filters and search
│   └── styles/
│       └── globals.css
├── public/
│   └── favicon.ico
└── tests/
    ├── unit/
    └── e2e/
```

### 5.2 Environment Variables Configuration

```typescript
// src/lib/env.ts
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    CONVEX_DEPLOYMENT: z.string().min(1),
    WORKOS_API_KEY: z.string().min(1),
    WORKOS_CLIENT_ID: z.string().min(1),
    RESEND_API_KEY: z.string().min(1),
    UPLOADTHING_SECRET: z.string().min(1),
    UPLOADTHING_APP_ID: z.string().min(1),
  },
  client: {
    VITE_CONVEX_URL: z.string().url(),
    VITE_WORKOS_CLIENT_ID: z.string().min(1),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
```

---

## 6. Project Phases

### 6.1 Phases Summary

| Phase | Name | Tasks | Estimate | Priority |
|-------|------|-------|----------|----------|
| 1 | Setup and Configuration | 22 | 10-12h | 🔴 Critical |
| 2 | Authentication and Users | 19 | 12-14h | 🔴 Critical |
| 3 | Organizations and Profiles | 18 | 10-12h | 🔴 Critical |
| 4 | Payment Order System | 28 | 18-22h | 🔴 Critical |
| 5 | Email Notifications | 15 | 8-10h | 🟡 High |
| 6 | Search, Tags and Reports | 17 | 10-12h | 🟡 High |
| 7 | GDPR and Compliance | 12 | 8-10h | 🟡 High |
| 8 | Testing and Deploy | 14 | 10-12h | 🟡 High |
| **Total** | | **145** | **86-104h** | |

### 6.2 Time Estimate

With 4-5 hours/week dedication:
- **Optimistic**: 17 weeks (~4 months)
- **Realistic**: 21 weeks (~5 months)
- **Pessimistic**: 26 weeks (~6 months)

---

## 7. Task Breakdown by Phase

---

## Phase 1: Base Setup and Configuration

**Objective**: Establish the project foundation with all tools and dependencies properly configured.

**Priority**: 🔴 Critical

**Total estimate**: 10-12 hours

---

### TASK-1.1: Initialize TanStack Start project

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Create the base project using the official TanStack Start template with pnpm.

**Acceptance Criteria**:
- [x] Project created with `pnpm create @tanstack/start`
- [x] Base folder structure generated correctly
- [x] `pnpm install` runs without errors
- [x] `pnpm dev` starts development server at `localhost:3000`
- [x] TanStack Start welcome page visible in browser
- [x] `pnpm-lock.yaml` file generated and committed

**Commands**:
```bash
pnpm create @tanstack/start payment-order-manager
cd payment-order-manager
pnpm install
pnpm dev
```

---

### TASK-1.2: Configure TypeScript with strict mode

**Priority**: 🔴 Critical

**Estimate**: 15 minutes

**Description**: Configure TypeScript with the strictest options for maximum type safety.

**Acceptance Criteria**:
- [x] `tsconfig.json` has `strict: true`
- [x] `noUncheckedIndexedAccess: true` enabled
- [x] `noImplicitReturns: true` enabled
- [x] `noFallthroughCasesInSwitch: true` enabled
- [x] `forceConsistentCasingInFileNames: true` enabled
- [x] Path aliases configured (`@/*` → `src/*`)
- [x] `pnpm typecheck` runs without errors

**File `tsconfig.json`**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@convex/*": ["convex/*"]
    }
  },
  "include": ["src", "convex"],
  "exclude": ["node_modules"]
}
```

---

### TASK-1.3: Install and configure Tailwind CSS

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Install Tailwind CSS with its configuration for the project.

**Acceptance Criteria**:
- [x] Dependencies installed: `tailwindcss`, `postcss`, `autoprefixer`
- [x] `tailwind.config.ts` file created with TypeScript configuration
- [x] `postcss.config.js` file created
- [x] Tailwind directives in `globals.css`
- [x] Content paths configured for `src/**/*.{ts,tsx}`
- [x] Tailwind class applied in a component and visible in browser
- [x] Dark mode configured with `class` strategy

**Commands**:
```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm dlx tailwindcss init -p --ts
```

---

### TASK-1.4: Install and configure shadcn/ui

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Initialize shadcn/ui with base configuration for the project.

**Acceptance Criteria**:
- [x] shadcn CLI initialized with `pnpm dlx shadcn@latest init`
- [x] `components.json` file generated
- [x] Base styles configured (New York style recommended)
- [x] CSS variables configured in `globals.css`
- [x] `src/components/ui` folder created
- [x] `cn()` utility available in `src/lib/utils.ts`
- [x] Dark mode theme as default

**Commands**:
```bash
pnpm dlx shadcn@latest init
```

---

### TASK-1.5: Configure dark mode theme by default with next-themes

**Priority**: 🟡 High

**Estimate**: 45 minutes

**Description**: Configure the theme system with next-themes, dark mode as default and light mode option.

**Acceptance Criteria**:
- [x] Dependency installed: `next-themes`
- [x] CSS variables defined for both themes in `globals.css`
- [x] `ThemeProvider` from next-themes configured in root layout
- [x] `defaultTheme` configured as `"dark"`
- [x] `attribute` configured as `"class"`
- [x] `useTheme` hook available for theme toggle
- [x] Theme persists in localStorage
- [x] Smooth transition between themes (150ms)
- [x] Theme colors consistent with minimalist design
- [x] No incorrect theme flash on load (use `enableSystem={false}`)

**Commands**:
```bash
pnpm add next-themes
```

**Provider configuration**:
```tsx
import { ThemeProvider } from 'next-themes'

<ThemeProvider 
  attribute="class" 
  defaultTheme="dark" 
  enableSystem={false}
  disableTransitionOnChange={false}
>
  {children}
</ThemeProvider>
```

**Suggested color palette**:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... more variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... more variables */
}
```

---

### TASK-1.6: Install base shadcn/ui components

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Install the shadcn/ui components that will be used in the project.

**Acceptance Criteria**:
- [x] Components installed and available in `src/components/ui/`:
  - [x] Button
  - [x] Input
  - [x] Label
  - [x] Card
  - [x] Dialog
  - [x] Dropdown Menu
  - [x] Select
  - [x] Textarea
  - [x] Badge
  - [x] Avatar
  - [x] Skeleton
  - [x] Toast (Sonner)
  - [x] Form (react-hook-form integration)
  - [x] Table
  - [x] Tabs
  - [x] Tooltip
- [x] Each component importable without errors
- [x] Button component renders correctly with variants

**Commands**:
```bash
pnpm dlx shadcn@latest add button input label card dialog dropdown-menu select textarea badge avatar skeleton sonner form table tabs tooltip
```

---

### TASK-1.7: Configure TanStack Query with Convex

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Configure TanStack Query to work with Convex as data fetching layer.

**Acceptance Criteria**:
- [x] Dependencies installed: `@tanstack/react-query`, `convex`, `@convex-dev/react-query`
- [x] `QueryClientProvider` configured in root (via router context)
- [x] `ConvexProvider` configured inside QueryClientProvider (via router's `Wrap`)
- [x] Custom hooks for Convex queries with TanStack Query
- [x] TanStack Query DevTools visible in development (grouped in TanStack DevTools panel)
- [x] Convex reactive updates (no manual invalidation needed)
- [x] `src/lib/convex.ts` file with configured client

**Additional work completed**:
- [x] Added `@tanstack/react-router-ssr-query` for SSR integration
- [x] Added `concurrently` for running app + convex simultaneously
- [x] Added npm scripts: `dev` (both), `dev:app`, `dev:convex`
- [x] Created `.claude/rules/convex.md` with LLM coding conventions
- [x] Updated `tsconfig.json` with `convex/**/*.ts` include and `@convex/*` path alias
- [x] Integrated ReactQueryDevtoolsPanel into unified TanStack DevTools

**Commands**:
```bash
pnpm add @tanstack/react-query convex @convex-dev/react-query @tanstack/react-router-ssr-query
pnpm add -D @tanstack/react-query-devtools concurrently
npx convex dev  # Initialize Convex project (interactive)
```

---

### TASK-1.8: Configure TanStack Form with Zod

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Configure TanStack Form with Zod as validator.

**Acceptance Criteria**:
- [ ] Dependencies installed: `@tanstack/react-form`, `@tanstack/zod-form-adapter`, `zod`
- [ ] Zod adapter configured
- [ ] Example form works with validation
- [ ] Validation errors display correctly
- [ ] TypeScript types inferred from Zod schemas
- [ ] `src/lib/validators/` folder created for schemas

**Commands**:
```bash
pnpm add @tanstack/react-form @tanstack/zod-form-adapter zod
```

---

### TASK-1.9: Configure Zustand for local state

**Priority**: 🟡 High

**Estimate**: 20 minutes

**Description**: Configure Zustand for application local state management.

**Acceptance Criteria**:
- [ ] Dependency installed: `zustand`
- [ ] Example store created (`uiStore.ts`)
- [ ] Devtools middleware configured
- [ ] Persist middleware configured (optional)
- [ ] TypeScript types for the store
- [ ] Store hook works in component

**Commands**:
```bash
pnpm add zustand
```

**File `src/stores/uiStore.ts`**:
```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  }))
);
```

---

### TASK-1.10: Configure TanStack DevTools

**Priority**: 🟢 Medium

**Estimate**: 20 minutes

**Description**: Configure DevTools for TanStack Query, Router and Form debugging.

**Acceptance Criteria**:
- [ ] TanStack Query DevTools visible in development
- [x] TanStack Router DevTools visible in development
- [x] DevTools only load in development mode
- [x] DevTools position doesn't interfere with UI
- [x] Lazy loading of DevTools to not affect bundle

**Commands**:
```bash
pnpm add -D @tanstack/react-query-devtools @tanstack/router-devtools
```

---

### TASK-1.11: Configure @t3-oss/env for environment variables

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Configure environment variables validation with Zod and @t3-oss/env.

**Acceptance Criteria**:
- [ ] Dependency installed: `@t3-oss/env-core`
- [ ] `src/lib/env.ts` file created
- [ ] Server variables validated with Zod
- [ ] Client variables validated (`VITE_` prefix)
- [ ] Descriptive error if required variable is missing
- [ ] `.env.example` file created with all variables
- [ ] `.env.local` in `.gitignore`
- [ ] TypeScript infers types from variables

**Commands**:
```bash
pnpm add @t3-oss/env-core
```

---

### TASK-1.12: Initialize Convex project

**Priority**: 🔴 Critical

**Estimate**: 20 minutes

**Description**: Initialize Convex and connect with the project.

**Acceptance Criteria**:
- [ ] `npx convex dev` executed and project created
- [ ] `convex/` folder generated with base files
- [ ] `CONVEX_DEPLOYMENT` added to `.env.local`
- [ ] `VITE_CONVEX_URL` added to `.env.local`
- [ ] Convex dashboard accessible
- [ ] Hot reload works when modifying functions

**Commands**:
```bash
pnpm add convex
pnpm convex dev
```

---

### TASK-1.13: Create schema.ts with all tables

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: Define the complete database schema in Convex.

**Acceptance Criteria**:
- [ ] `users` table defined with all fields
- [ ] `organizations` table defined with all fields
- [ ] `paymentOrderProfiles` table defined with all fields
- [ ] `tags` table defined with all fields
- [ ] `paymentOrders` table defined with all fields
- [ ] `paymentOrderDocuments` table defined with all fields
- [ ] `paymentOrderHistory` table defined with all fields
- [ ] `PaymentOrderStatus` enum defined
- [ ] All indexes created according to section 3
- [ ] `pnpm convex dev` syncs without errors
- [ ] Types generated in `convex/_generated/`

---

### TASK-1.14: Create UploadThing account and configure

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Create account on UploadThing and configure in the project.

**Acceptance Criteria**:
- [ ] Account created at uploadthing.com
- [ ] App created in UploadThing dashboard
- [ ] `UPLOADTHING_SECRET` obtained and in `.env.local`
- [ ] `UPLOADTHING_APP_ID` obtained and in `.env.local`
- [ ] Dependencies installed: `uploadthing`, `@uploadthing/react`
- [ ] `src/lib/uploadthing.ts` file created with configuration
- [ ] File router defined with allowed file types
- [ ] Upload endpoint functional

**Commands**:
```bash
pnpm add uploadthing @uploadthing/react
```

---

### TASK-1.15: Create Resend account and verify domain

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Configure Resend for transactional email sending.

**Acceptance Criteria**:
- [ ] Account created at resend.com
- [ ] API key generated
- [ ] `RESEND_API_KEY` in `.env.local`
- [ ] Domain verified (or use test domain)
- [ ] Dependency installed: `resend`
- [ ] Test email sent successfully

**Commands**:
```bash
pnpm add resend
```

---

### TASK-1.16: Configure ESLint and Prettier

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Configure linting and code formatting.

**Acceptance Criteria**:
- [x] ESLint configured with TypeScript rules
- [x] Prettier configured with project options
- [x] ESLint + Prettier integration without conflicts
- [x] Scripts in package.json: `lint`, `lint:fix`, `format`
- [ ] Husky configured for pre-commit hooks
- [ ] lint-staged to only check modified files
- [ ] Recommended VS Code settings in `.vscode/`

**Commands**:
```bash
pnpm add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier
pnpm add -D husky lint-staged
```

---

### TASK-1.17: Create project in Vercel

**Priority**: 🟡 High

**Estimate**: 15 minutes

**Description**: Create project in Vercel and connect with repository.

**Acceptance Criteria**:
- [ ] Project created in Vercel dashboard
- [ ] Git repository connected
- [ ] `main` branch configured for production
- [ ] Framework preset: Vite (or auto-detected)
- [ ] Build command: `pnpm build`
- [ ] Output directory configured correctly

---

### TASK-1.18: Configure staging environment

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Configure staging environment separate from production.

**Acceptance Criteria**:
- [ ] `develop` branch configured for staging
- [ ] Preview deployments enabled
- [ ] Staging environment variables configured
- [ ] Separate staging Convex deployment
- [ ] Staging URL accessible (e.g.: `staging.betania.app`)
- [ ] Documentation of differences between environments

---

### TASK-1.19: Create project folder structure

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Create folder structure according to defined architecture.

**Acceptance Criteria**:
- [ ] All folders from section 5.1 created
- [ ] `index.ts` barrel export files where applicable
- [ ] `.gitkeep` file in empty folders
- [ ] README.md in main folders explaining purpose
- [x] Imports work with path aliases (@/*)

---

### TASK-1.20: Configure root layout with providers

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Configure root layout with all necessary providers.

**Acceptance Criteria**:
- [ ] `QueryClientProvider` in root
- [ ] `ConvexProvider` configured
- [x] `ThemeProvider` for dark/light mode
- [x] `Toaster` from Sonner configured
- [x] TanStack DevTools included (dev only)
- [x] Basic meta tags configured
- [x] Fonts loaded correctly
- [x] Semantic HTML structure

---

### TASK-1.21: Create basic landing page

**Priority**: 🟢 Medium

**Estimate**: 30 minutes

**Description**: Create a basic landing page as entry point.

**Acceptance Criteria**:
- [ ] `/` route renders landing page
- [ ] Project title and description visible
- [ ] "Sign in" button redirects to `/auth/login`
- [ ] Minimalist design matching theme
- [ ] Responsive (mobile and desktop)
- [ ] Dark mode applied correctly

---

### TASK-1.22: Verify entire setup works end-to-end

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Verify all configuration works correctly.

**Acceptance Criteria**:
- [ ] `pnpm dev` starts without errors
- [ ] `pnpm build` compiles without errors
- [ ] `pnpm typecheck` passes without errors
- [ ] `pnpm lint` passes without errors
- [ ] Hot reload works in development
- [ ] Convex syncs changes automatically
- [ ] Environment variables load correctly
- [ ] Test deploy to Vercel successful

---

## Phase 2: Authentication and Users

**Objective**: Implement complete authentication system with WorkOS AuthKit using email OTP.

**Priority**: 🔴 Critical

**Total estimate**: 12-14 hours

---

### TASK-2.1: Create WorkOS account and configure AuthKit

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Configure WorkOS AuthKit for OTP authentication.

**Acceptance Criteria**:
- [ ] Account created at workos.com
- [ ] Organization created in dashboard
- [ ] AuthKit enabled
- [ ] `WORKOS_API_KEY` obtained
- [ ] `WORKOS_CLIENT_ID` obtained
- [ ] Variables added to `.env.local`
- [ ] Redirect URIs configured for development and production

---

### TASK-2.2: Enable OTP authentication in WorkOS

**Priority**: 🔴 Critical

**Estimate**: 15 minutes

**Description**: Configure OTP email authentication method.

**Acceptance Criteria**:
- [ ] OTP method enabled in AuthKit settings
- [ ] Email template customized (optional)
- [ ] Code expiration time configured (5-10 min)
- [ ] Code length configured (6 digits)
- [ ] OTP test email works

---

### TASK-2.3: Install WorkOS AuthKit SDK

**Priority**: 🔴 Critical

**Estimate**: 15 minutes

**Description**: Install and configure the WorkOS SDK.

**Acceptance Criteria**:
- [ ] Dependency installed: `@workos-inc/authkit-tanstack-start`
- [ ] WorkOS client initialized in `src/lib/auth.ts`
- [ ] TypeScript types available
- [ ] Client uses validated environment variables

**Commands**:
```bash
pnpm add @workos-inc/authkit-tanstack-start
```

---

### TASK-2.4: Create /auth/login route

**Priority**: 🔴 Critical

**Estimate**: 1.5 hours

**Description**: Create login page with email form.

**Acceptance Criteria**:
- [ ] `/auth/login` route accessible
- [ ] Form with email field
- [ ] Email validation with Zod (valid format)
- [ ] Validation with TanStack Form
- [ ] Loading state while sending
- [ ] Error handling for invalid email
- [ ] On submit, calls server function to initiate OTP
- [ ] Redirects to `/auth/verify` with email in state/URL
- [ ] Minimalist and responsive design
- [ ] Link to terms and privacy policy

**Zod Schema**:
```typescript
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
});
```

---

### TASK-2.5: Create server function to initiate OTP

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Create server function to request OTP code from WorkOS.

**Acceptance Criteria**:
- [ ] Server function created with TanStack Start
- [ ] Calls WorkOS API to send code
- [ ] Handles WorkOS errors (rate limit, etc.)
- [ ] Returns success/error status
- [ ] Log attempts for debugging
- [ ] Doesn't expose sensitive info to client

---

### TASK-2.6: Create /auth/verify route

**Priority**: 🔴 Critical

**Estimate**: 1.5 hours

**Description**: Create OTP code verification page.

**Acceptance Criteria**:
- [ ] `/auth/verify` route accessible
- [ ] Shows email where code was sent
- [ ] 6-digit input (OTP style)
- [ ] Auto-focus on first digit
- [ ] Auto-advance between digits
- [ ] Allows pasting complete code
- [ ] Format validation (numbers only, 6 digits)
- [ ] "Resend code" button with cooldown (60s)
- [ ] Remaining time counter for resend
- [ ] Error handling for invalid/expired code
- [ ] On successful verification, redirects to callback

---

### TASK-2.7: Create server function to verify OTP

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Create server function to verify OTP code with WorkOS.

**Acceptance Criteria**:
- [ ] Server function created
- [ ] Calls WorkOS API to verify code
- [ ] If valid, obtains session token
- [ ] Handles errors (invalid code, expired)
- [ ] Rate limiting of attempts
- [ ] Returns token or descriptive error

---

### TASK-2.8: Create /auth/callback route

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: Handle post-authentication callback.

**Acceptance Criteria**:
- [ ] `/auth/callback` route processes token
- [ ] Validates token with WorkOS
- [ ] Extracts user information (email, name)
- [ ] Calls Convex to create/update user
- [ ] Establishes secure session cookie
- [ ] Redirects to `/dashboard` or return URL
- [ ] Handles invalid token errors

---

### TASK-2.9: Create Convex function: users.getOrCreate

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Function to get or create user in Convex.

**Acceptance Criteria**:
- [ ] Mutation `users.getOrCreate` created
- [ ] Searches user by `authKitId`
- [ ] If doesn't exist, creates new user
- [ ] If exists, updates `updatedAt`
- [ ] Returns user data
- [ ] Validates input with Zod
- [ ] Handles duplicate email case

**Signature**:
```typescript
export const getOrCreate = mutation({
  args: {
    authKitId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => { ... }
});
```

---

### TASK-2.10: Create Convex function: users.getById

**Priority**: 🔴 Critical

**Estimate**: 15 minutes

**Description**: Query to get user by ID.

**Acceptance Criteria**:
- [ ] Query `users.getById` created
- [ ] Returns user or null
- [ ] Excludes users with `deletedAt` (soft delete)
- [ ] Correct return types

---

### TASK-2.11: Create Convex function: users.getByEmail

**Priority**: 🟡 High

**Estimate**: 15 minutes

**Description**: Query to get user by email.

**Acceptance Criteria**:
- [ ] Query `users.getByEmail` created
- [ ] Uses `by_email` index
- [ ] Returns user or null
- [ ] Case-insensitive (normalizes email)

---

### TASK-2.12: Create Convex function: users.update

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Mutation to update user data.

**Acceptance Criteria**:
- [ ] Mutation `users.update` created
- [ ] Allows updating: `name`, `avatarUrl`
- [ ] Validates user exists
- [ ] Validates authenticated user is the same
- [ ] Updates `updatedAt`
- [ ] Returns updated user

---

### TASK-2.13: Create Convex function: users.getCurrentUser

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Query to get current user based on session.

**Acceptance Criteria**:
- [ ] Query `users.getCurrentUser` created
- [ ] Uses Convex authentication context
- [ ] Returns complete user or null
- [ ] Cacheable by TanStack Query

---

### TASK-2.14: Create useAuth hook

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Custom hook for authentication management.

**Acceptance Criteria**:
- [ ] `useAuth` hook created in `src/hooks/useAuth.ts`
- [ ] Exposes: `user`, `isLoading`, `isAuthenticated`
- [ ] Exposes functions: `login`, `logout`, `refresh`
- [ ] Integrates with TanStack Query for cache
- [ ] Handles session state
- [ ] Complete TypeScript types

**Interface**:
```typescript
interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

---

### TASK-2.15: Create AuthGuard component

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Component to protect routes that require authentication.

**Acceptance Criteria**:
- [ ] `AuthGuard` component created
- [ ] Verifies authentication before rendering children
- [ ] Shows loading while verifying
- [ ] Redirects to `/auth/login` if not authenticated
- [ ] Preserves return URL in redirect
- [ ] Accepts optional `fallback` prop

**Usage**:
```tsx
<AuthGuard>
  <DashboardPage />
</AuthGuard>
```

---

### TASK-2.16: Create basic /dashboard page

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Create protected main dashboard page.

**Acceptance Criteria**:
- [ ] `/dashboard` route created
- [ ] Protected with AuthGuard
- [ ] Shows user name
- [ ] Layout with header and sidebar placeholder
- [ ] Welcome message
- [ ] Basic navigation links
- [ ] Functional logout button

---

### TASK-2.17: Create /settings/profile page

**Priority**: 🟡 High

**Estimate**: 1 hour

**Description**: Page to edit user profile.

**Acceptance Criteria**:
- [ ] `/settings/profile` route created
- [ ] Protected with AuthGuard
- [ ] Form with TanStack Form
- [ ] Fields: name, avatar
- [ ] Validation with Zod
- [ ] Avatar preview
- [ ] Avatar upload with UploadThing
- [ ] Success/error feedback on save
- [ ] Shows email (not editable)

---

### TASK-2.18: Implement logout

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Implement logout functionality.

**Acceptance Criteria**:
- [ ] Logout function in useAuth
- [ ] Clears session cookie
- [ ] Invalidates session in WorkOS
- [ ] Clears TanStack Query cache
- [ ] Redirects to landing page
- [ ] Works in all browsers

---

### TASK-2.19: Handle expired session

**Priority**: 🟡 High

**Estimate**: 45 minutes

**Description**: Handle expired or invalid session cases.

**Acceptance Criteria**:
- [ ] Detects 401 responses from Convex
- [ ] Shows expired session notification
- [ ] Automatically redirects to login
- [ ] Preserves current URL for return
- [ ] Doesn't show multiple notifications
- [ ] Clears local state on expiration

---

## Phase 3: Organizations and Payment Order Profiles

**Objective**: Allow creating organizations and configuring payment order profiles with access control.

**Priority**: 🔴 Critical

**Total estimate**: 10-12 hours

---

### TASK-3.1: Create Convex function: organizations.create

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Mutation to create a new organization.

**Acceptance Criteria**:
- [ ] Mutation `organizations.create` created
- [ ] Validates user is authenticated
- [ ] Generates automatic slug from name
- [ ] Validates slug uniqueness
- [ ] Sets current user as owner
- [ ] Creates timestamps
- [ ] Returns created organization

**Signature**:
```typescript
export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => { ... }
});
```

---

### TASK-3.2: Create Convex function: organizations.getByOwner

**Priority**: 🔴 Critical

**Estimate**: 15 minutes

**Description**: Query to list user's organizations.

**Acceptance Criteria**:
- [ ] Query `organizations.getByOwner` created
- [ ] Uses `by_owner` index
- [ ] Returns organizations array
- [ ] Ordered by `createdAt` descending

---

### TASK-3.3: Create Convex function: organizations.getBySlug

**Priority**: 🔴 Critical

**Estimate**: 15 minutes

**Description**: Query to get organization by slug.

**Acceptance Criteria**:
- [ ] Query `organizations.getBySlug` created
- [ ] Uses `by_slug` index
- [ ] Returns organization or null
- [ ] Includes owner info

---

### TASK-3.4: Create Convex function: organizations.update

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Mutation to update organization.

**Acceptance Criteria**:
- [ ] Mutation `organizations.update` created
- [ ] Only owner can update
- [ ] Allows changing name
- [ ] Regenerates slug if name changes
- [ ] Validates new slug uniqueness
- [ ] Updates `updatedAt`

---

### TASK-3.5: Create slug generation helper

**Priority**: 🟡 High

**Estimate**: 20 minutes

**Description**: Utility to generate URL-friendly slugs.

**Acceptance Criteria**:
- [ ] `generateSlug` function created
- [ ] Converts to lowercase
- [ ] Replaces spaces with hyphens
- [ ] Removes special characters
- [ ] Handles accents (Unicode normalization)
- [ ] Limits maximum length
- [ ] Adds numeric suffix if duplicate exists

**Example**:
```typescript
generateSlug("Betanía S.A.S.") // "betania-sas"
generateSlug("My Organization") // "my-organization"
```

---

### TASK-3.6: Create /orgs/new page

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: Page to create new organization.

**Acceptance Criteria**:
- [ ] `/orgs/new` route protected
- [ ] Form with TanStack Form
- [ ] Field: organization name
- [ ] Generated slug preview
- [ ] Validation: name required, min 3 characters
- [ ] Verifies slug availability in real-time
- [ ] On create, redirects to `/orgs/[slug]`
- [ ] Loading state while creating
- [ ] Error handling

---

### TASK-3.7: Create /orgs/[slug] page

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: Organization detail page.

**Acceptance Criteria**:
- [ ] `/orgs/$orgSlug` route created
- [ ] Shows organization information
- [ ] Lists payment order profiles
- [ ] Button to create new profile
- [ ] Only visible to owner
- [ ] 404 if org doesn't exist
- [ ] 403 if user is not owner

---

### TASK-3.8: Create Convex function: paymentOrderProfiles.create

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Mutation to create payment order profile.

**Acceptance Criteria**:
- [ ] Mutation `paymentOrderProfiles.create` created
- [ ] Validates user is org owner
- [ ] Generates slug from name
- [ ] Validates slug uniqueness within org
- [ ] `isPublic` starts as `false`
- [ ] `allowedEmails` starts empty
- [ ] Returns created profile

---

### TASK-3.9: Create Convex function: paymentOrderProfiles.getByOrganization

**Priority**: 🔴 Critical

**Estimate**: 15 minutes

**Description**: Query to list organization's profiles.

**Acceptance Criteria**:
- [ ] Query `paymentOrderProfiles.getByOrganization` created
- [ ] Uses `by_organization` index
- [ ] Includes payment order count per profile
- [ ] Ordered by `createdAt`

---

### TASK-3.10: Create Convex function: paymentOrderProfiles.getBySlug

**Priority**: 🔴 Critical

**Estimate**: 15 minutes

**Description**: Query to get profile by org and slug.

**Acceptance Criteria**:
- [ ] Query `paymentOrderProfiles.getBySlug` created
- [ ] Parameters: `orgSlug`, `profileSlug`
- [ ] Uses composite index
- [ ] Returns profile with org and owner data

---

### TASK-3.11: Create Convex function: paymentOrderProfiles.update

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Mutation to update payment order profile.

**Acceptance Criteria**:
- [ ] Mutation `paymentOrderProfiles.update` created
- [ ] Only owner can update
- [ ] Allows changing: name, isPublic
- [ ] Updates `updatedAt`
- [ ] Returns updated profile

---

### TASK-3.12: Create Convex function: paymentOrderProfiles.updateAllowedEmails

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Mutation to manage allowed emails list.

**Acceptance Criteria**:
- [ ] Mutation `paymentOrderProfiles.updateAllowedEmails` created
- [ ] Accepts operation: `add`, `remove`, `set`
- [ ] Validates email format
- [ ] Normalizes emails (lowercase)
- [ ] Doesn't allow duplicates
- [ ] Maximum email limit (e.g.: 100)

---

### TASK-3.13: Create Convex function: paymentOrderProfiles.togglePublic

**Priority**: 🟡 High

**Estimate**: 15 minutes

**Description**: Mutation to enable/disable public profile.

**Acceptance Criteria**:
- [ ] Mutation `paymentOrderProfiles.togglePublic` created
- [ ] Inverts `isPublic` value
- [ ] Returns new state

---

### TASK-3.14: Create /orgs/[slug]/profiles/new page

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: Page to create new payment order profile.

**Acceptance Criteria**:
- [ ] `/orgs/$orgSlug/profiles/new` route created
- [ ] Form with TanStack Form
- [ ] Field: profile name
- [ ] Slug and public URL preview
- [ ] Name validation
- [ ] On create, redirects to profile settings
- [ ] Navigation breadcrumb

---

### TASK-3.15: Create /orgs/[slug]/profiles/[profileSlug] page

**Priority**: 🔴 Critical

**Estimate**: 1.5 hours

**Description**: Payment order profile settings page.

**Acceptance Criteria**:
- [ ] `/orgs/$orgSlug/profiles/$profileSlug` route created
- [ ] Tabs: General, Access, Payment Orders
- [ ] General tab: edit name, view public URL
- [ ] Access tab: manage allowed emails
- [ ] Payment Orders tab: list profile's payment orders
- [ ] Switch to enable/disable profile
- [ ] Copy public URL to clipboard
- [ ] Visual status indicator (public/private)

---

### TASK-3.16: Create AllowedEmailsManager component

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Component to manage allowed emails list.

**Acceptance Criteria**:
- [ ] Input to add email
- [ ] Email format validation
- [ ] Email list with delete button
- [ ] Confirmation before delete
- [ ] Visual feedback on add/delete
- [ ] Email counter
- [ ] Search/filter if many emails

---

### TASK-3.17: Create PublicLinkCard component

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Component to display and copy public link.

**Acceptance Criteria**:
- [ ] Shows complete profile URL
- [ ] Copy to clipboard button
- [ ] Temporary "Copied!" feedback
- [ ] Status indicator (enabled/disabled)
- [ ] Preview of how link looks

---

### TASK-3.18: Validate access to organization routes

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Ensure only owner can access admin routes.

**Acceptance Criteria**:
- [ ] Middleware/loader validates ownership
- [ ] 404 if org doesn't exist
- [ ] 403 if user is not owner
- [ ] Redirect to login if not authenticated
- [ ] Appropriate error messages

---

## Phase 4: Payment Order System (Core)

**Objective**: Implement the complete flow for creating, reviewing and approving payment orders.

**Priority**: 🔴 Critical

**Total estimate**: 18-22 hours

---

### TASK-4.1: Create Convex function: paymentOrders.create

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Mutation to create a new payment order.

**Acceptance Criteria**:
- [ ] Mutation `paymentOrders.create` created
- [ ] Validates user is authenticated
- [ ] Validates profile exists and is public
- [ ] Validates user's email is in allowedEmails
- [ ] Creates payment order in `CREATED` status
- [ ] Creates history entry automatically
- [ ] Returns created payment order
- [ ] Triggers notification to owner (async)

---

### TASK-4.2: Create Convex function: paymentOrders.getById

**Priority**: 🔴 Critical

**Estimate**: 20 minutes

**Description**: Query to get payment order by ID with related data.

**Acceptance Criteria**:
- [ ] Query `paymentOrders.getById` created
- [ ] Includes profile data
- [ ] Includes creator data
- [ ] Includes expanded tags
- [ ] Includes document count
- [ ] Validates access permissions

---

### TASK-4.3: Create Convex function: paymentOrders.getByProfile

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Query to list profile's payment orders with pagination.

**Acceptance Criteria**:
- [ ] Query `paymentOrders.getByProfile` created
- [ ] Uses `by_profile` index
- [ ] Supports pagination (cursor-based)
- [ ] Supports status filter
- [ ] Supports date filter
- [ ] Ordered by `createdAt` descending
- [ ] Includes basic creator data

---

### TASK-4.4: Create Convex function: paymentOrders.getByCreator

**Priority**: 🟡 High

**Estimate**: 20 minutes

**Description**: Query to list payment orders created by a user.

**Acceptance Criteria**:
- [ ] Query `paymentOrders.getByCreator` created
- [ ] Uses `by_creator` index
- [ ] Supports pagination
- [ ] Includes profile data
- [ ] Ordered by `createdAt` descending

---

### TASK-4.5: Create Convex function: paymentOrders.updateStatus

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: Mutation to change payment order status.

**Acceptance Criteria**:
- [ ] Mutation `paymentOrders.updateStatus` created
- [ ] Validates valid state transitions
- [ ] Validates permissions per action
- [ ] Accepts optional comment
- [ ] Creates history entry
- [ ] Updates `updatedAt`
- [ ] Triggers appropriate notification

**Valid transitions matrix**:
```
CREATED -> IN_REVIEW, CANCELLED
IN_REVIEW -> APPROVED, REJECTED, NEEDS_SUPPORT, CANCELLED
NEEDS_SUPPORT -> IN_REVIEW, CANCELLED
APPROVED -> PAID
PAID -> RECONCILED
```

---

### TASK-4.6: Create Convex function: paymentOrders.update

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Mutation to update payment order data.

**Acceptance Criteria**:
- [ ] Mutation `paymentOrders.update` created
- [ ] Only creator can update
- [ ] Only in statuses: CREATED, NEEDS_SUPPORT
- [ ] Editable fields: title, description, reason, amount, tagIds
- [ ] Creates history entry
- [ ] Updates `updatedAt`

---

### TASK-4.7: Create Convex function: paymentOrderHistory.create

**Priority**: 🔴 Critical

**Estimate**: 20 minutes

**Description**: Internal mutation to record changes in history.

**Acceptance Criteria**:
- [ ] Mutation `paymentOrderHistory.create` created
- [ ] Records: action, user, statuses, comment
- [ ] Accepts optional metadata (JSON)
- [ ] Automatic timestamp

---

### TASK-4.8: Create Convex function: paymentOrderHistory.getByPaymentOrder

**Priority**: 🔴 Critical

**Estimate**: 15 minutes

**Description**: Query to get payment order's history.

**Acceptance Criteria**:
- [ ] Query `paymentOrderHistory.getByPaymentOrder` created
- [ ] Uses `by_paymentOrder` index
- [ ] Ordered by `createdAt` ascending
- [ ] Includes data of user who performed action

---

### TASK-4.9: Create Convex function: paymentOrderDocuments.create

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Mutation to add document to a payment order.

**Acceptance Criteria**:
- [ ] Mutation `paymentOrderDocuments.create` created
- [ ] Validates payment order exists
- [ ] Validates permissions (creator or owner)
- [ ] Records file metadata
- [ ] Creates history entry
- [ ] If status is NEEDS_SUPPORT, changes to IN_REVIEW

---

### TASK-4.10: Create Convex function: paymentOrderDocuments.getByPaymentOrder

**Priority**: 🔴 Critical

**Estimate**: 15 minutes

**Description**: Query to list payment order's documents.

**Acceptance Criteria**:
- [ ] Query `paymentOrderDocuments.getByPaymentOrder` created
- [ ] Uses `by_paymentOrder` index
- [ ] Includes uploader user data
- [ ] Ordered by `createdAt`

---

### TASK-4.11: Create Convex function: paymentOrderDocuments.delete

**Priority**: 🟡 High

**Estimate**: 20 minutes

**Description**: Mutation to delete document from a payment order.

**Acceptance Criteria**:
- [ ] Mutation `paymentOrderDocuments.delete` created
- [ ] Only uploader or owner can delete
- [ ] Not allowed in final statuses
- [ ] Records in history
- [ ] Deletes file from UploadThing (async)

---

### TASK-4.12: Create public route /[orgSlug]/[profileSlug]

**Priority**: 🔴 Critical

**Estimate**: 1.5 hours

**Description**: Public view to upload payment orders to a profile.

**Acceptance Criteria**:
- [ ] `/$orgSlug/$profileSlug` route created
- [ ] Verifies profile exists and is public
- [ ] If not authenticated, redirects to login with return URL
- [ ] If authenticated, verifies email in allowedEmails
- [ ] If not authorized, shows appropriate message
- [ ] If authorized, shows upload form
- [ ] Shows profile information (name, org)
- [ ] Professional and clear design

---

### TASK-4.13: Create PaymentOrderForm component

**Priority**: 🔴 Critical

**Estimate**: 2 hours

**Description**: Complete form to create/edit payment order.

**Acceptance Criteria**:
- [ ] Uses TanStack Form + Zod
- [ ] Fields: Title, Reason, Description, Amount, Currency, Tags
- [ ] Integrated documents section
- [ ] Real-time validation
- [ ] Clear error messages
- [ ] Loading state on submit
- [ ] Edit mode reuses same component

---

### TASK-4.14: Create FileUploader component

**Priority**: 🔴 Critical

**Estimate**: 1.5 hours

**Description**: Component to upload multiple files.

**Acceptance Criteria**:
- [ ] UploadThing integration
- [ ] Drag and drop functional
- [ ] Click to select files
- [ ] Multiple files support
- [ ] Allowed types: PDF, images, Excel, Word
- [ ] Maximum size per file (10MB)
- [ ] Selected files preview
- [ ] Progress bar per file
- [ ] Option to remove file before upload
- [ ] Error handling per file

---

### TASK-4.15: Create /dashboard/payment-orders page

**Priority**: 🔴 Critical

**Estimate**: 1.5 hours

**Description**: Payment orders list in dashboard.

**Acceptance Criteria**:
- [ ] `/dashboard/payment-orders` route created
- [ ] Tabs: "My payment orders" / "Pending approval"
- [ ] List with infinite pagination
- [ ] Filters: status, date, profile
- [ ] Search bar
- [ ] Sorting (most recent first)
- [ ] Empty state with call-to-action
- [ ] Loading skeletons while loading

---

### TASK-4.16: Create PaymentOrderCard component

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Payment order summary card for lists.

**Acceptance Criteria**:
- [ ] Shows: title, amount, status, date
- [ ] Status badge with color
- [ ] Tags visible
- [ ] Creator name (if applicable)
- [ ] Profile name
- [ ] Click goes to detail
- [ ] Attached documents indicator
- [ ] Responsive

---

### TASK-4.17: Create PaymentOrderStatusBadge component

**Priority**: 🟡 High

**Estimate**: 15 minutes

**Description**: Visual badge to show payment order status.

**Acceptance Criteria**:
- [ ] Different colors per status
- [ ] Translated text
- [ ] Sizes: sm, md
- [ ] Variant with optional icon

**Colors**:
```
CREATED: gray
IN_REVIEW: blue
NEEDS_SUPPORT: yellow
APPROVED: green
PAID: emerald
RECONCILED: purple
REJECTED: red
CANCELLED: gray
```

---

### TASK-4.18: Create /dashboard/payment-orders/[id] page

**Priority**: 🔴 Critical

**Estimate**: 2 hours

**Description**: Complete payment order detail page.

**Acceptance Criteria**:
- [ ] `/dashboard/payment-orders/$id` route created
- [ ] Header with title, status and actions
- [ ] General information section
- [ ] Attached documents section
- [ ] History timeline
- [ ] Actions panel (per role and status)
- [ ] Navigation breadcrumb
- [ ] 404 if payment order doesn't exist
- [ ] 403 if user doesn't have access

---

### TASK-4.19: Create PaymentOrderTimeline component

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: Visual timeline of change history.

**Acceptance Criteria**:
- [ ] Shows all history events
- [ ] Chronological order (oldest on top)
- [ ] Icon per action type
- [ ] Shows user, date and time
- [ ] Shows comments if they exist
- [ ] Timeline visual design
- [ ] Expandable if many events

---

### TASK-4.20: Create PaymentOrderDocumentsList component

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Attached documents list with preview.

**Acceptance Criteria**:
- [ ] Lists all documents
- [ ] Icon per file type
- [ ] Shows name, size, date
- [ ] Shows who uploaded
- [ ] Click opens in new tab
- [ ] Download button
- [ ] Delete option (if has permission)
- [ ] Inline image preview

---

### TASK-4.21: Create PaymentOrderActions component

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: Available actions panel for a payment order.

**Acceptance Criteria**:
- [ ] Shows actions per user role
- [ ] Shows actions per payment order status
- [ ] Owner can: Review, Approve, Reject, Request support, Mark as paid
- [ ] Creator can: Edit, Add documents, Cancel
- [ ] Each action has confirmation
- [ ] Loading state per action
- [ ] Success/error feedback

---

### TASK-4.22: Create RequestSupportModal modal

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Modal to request additional supporting documents.

**Acceptance Criteria**:
- [ ] Textarea for comment/instructions
- [ ] Comment required
- [ ] Cancel and Send buttons
- [ ] Sends notification to creator
- [ ] Closes modal on complete

---

### TASK-4.23: Create RejectPaymentOrderModal modal

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Modal to reject a payment order.

**Acceptance Criteria**:
- [ ] Clear irreversible action warning
- [ ] Textarea for rejection reason
- [ ] Reason required
- [ ] Cancel and Reject buttons
- [ ] Reject button is destructive (red)
- [ ] Sends notification to creator

---

### TASK-4.24: Create ApprovePaymentOrderModal modal

**Priority**: 🟡 High

**Estimate**: 20 minutes

**Description**: Confirmation modal to approve payment order.

**Acceptance Criteria**:
- [ ] Shows payment order summary
- [ ] Optional textarea for comment
- [ ] Cancel and Approve buttons
- [ ] Sends notification to creator

---

### TASK-4.25: Create AmountInput component

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Specialized input for monetary amounts.

**Acceptance Criteria**:
- [ ] Formats number with thousands separators
- [ ] Allows 2 decimals
- [ ] Only accepts numbers
- [ ] Integrated currency selector
- [ ] Shows currency symbol
- [ ] Internal value is clean number
- [ ] Range validation (positive)

---

### TASK-4.26: Implement public profile access validation

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Middleware to validate public profile access.

**Acceptance Criteria**:
- [ ] Verifies profile is public
- [ ] Verifies email is in allowedEmails
- [ ] If not authenticated, redirects to login
- [ ] If not authorized, shows error page
- [ ] Clear message about why no access

---

### TASK-4.27: Create Convex function: paymentOrders.search

**Priority**: 🟡 High

**Estimate**: 45 minutes

**Description**: Query for payment order search.

**Acceptance Criteria**:
- [ ] Query `paymentOrders.search` created
- [ ] Search by title (contains)
- [ ] Filter by tags
- [ ] Filter by status
- [ ] Filter by date range
- [ ] Filter by amount range
- [ ] Pagination
- [ ] Configurable sorting

---

### TASK-4.28: Create SearchBar component for payment orders

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Search bar with filters.

**Acceptance Criteria**:
- [ ] Text input for search
- [ ] 300ms debounce
- [ ] Advanced filters dropdown
- [ ] Active filters chips
- [ ] Clear filters button
- [ ] Persists filters in URL (query params)

---

## Phase 5: Email Notifications

**Objective**: Implement transactional notification system via Resend.

**Priority**: 🟡 High

**Total estimate**: 8-10 hours

---

### TASK-5.1: Create Resend client

**Priority**: 🔴 Critical

**Estimate**: 20 minutes

**Description**: Configure Resend client for email sending.

**Acceptance Criteria**:
- [ ] Resend client initialized
- [ ] Uses API key from environment variables
- [ ] Helper function to send emails
- [ ] API error handling
- [ ] Send logging

---

### TASK-5.2: Create base email template (HTML)

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: Responsive base HTML template for all emails.

**Acceptance Criteria**:
- [ ] Professional and minimalist design
- [ ] Responsive (works on mobile)
- [ ] Header with logo/name
- [ ] Footer with legal links
- [ ] Compatible with popular email clients
- [ ] Variables for dynamic content
- [ ] Colors consistent with app

---

### TASK-5.3: Create Convex HTTP function: sendEmail

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: HTTP endpoint in Convex to send emails via Resend.

**Acceptance Criteria**:
- [ ] HTTP action created in `convex/http.ts`
- [ ] Receives: to, subject, templateId, data
- [ ] Renders template with data
- [ ] Sends via Resend
- [ ] Returns send status
- [ ] Send logging

---

### TASK-5.4: Create template: New payment order created

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Notification email when a new payment order is created.

**Acceptance Criteria**:
- [ ] Recipient: profile owner
- [ ] Subject: "New payment order: {title}"
- [ ] Content: Creator name, title, amount, reason, link to detail
- [ ] CTA Button: "View payment order"

---

### TASK-5.5: Create template: Payment order needs supporting docs

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Email when additional supporting documents are requested.

**Acceptance Criteria**:
- [ ] Recipient: payment order creator
- [ ] Subject: "Supporting docs required: {title}"
- [ ] Content: Title, reviewer comment, link to payment order
- [ ] CTA Button: "Add supporting docs"

---

### TASK-5.6: Create template: Payment order approved

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Approved payment order notification email.

**Acceptance Criteria**:
- [ ] Recipient: payment order creator
- [ ] Subject: "Payment order approved: {title}"
- [ ] Content: Title, approved amount, comment, link to payment order
- [ ] Positive design (green)

---

### TASK-5.7: Create template: Payment order rejected

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Rejected payment order notification email.

**Acceptance Criteria**:
- [ ] Recipient: payment order creator
- [ ] Subject: "Payment order rejected: {title}"
- [ ] Content: Title, rejection reason, link to payment order
- [ ] Clear design (not alarming)

---

### TASK-5.8: Create template: Payment order cancelled

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Email when a payment order is cancelled.

**Acceptance Criteria**:
- [ ] Recipient: profile owner
- [ ] Subject: "Payment order cancelled: {title}"
- [ ] Content: Title, creator name, link to history

---

### TASK-5.9: Create template: Supporting document added

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Email when a new document is added.

**Acceptance Criteria**:
- [ ] Recipient: profile owner
- [ ] Subject: "New supporting doc: {title}"
- [ ] Content: Payment order title, file name, who uploaded, link
- [ ] CTA Button: "Review"

---

### TASK-5.10: Create Convex function: notifications.send

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Orchestrator function to send notifications.

**Acceptance Criteria**:
- [ ] Function `notifications.send` created
- [ ] Determines template per event type
- [ ] Determines recipients
- [ ] Gets necessary data
- [ ] Calls sendEmail
- [ ] Handles errors without failing main operation
- [ ] Sent notifications logging

---

### TASK-5.11: Integrate notifications in paymentOrders.create

**Priority**: 🔴 Critical

**Estimate**: 15 minutes

**Description**: Send notification when creating payment order.

**Acceptance Criteria**:
- [ ] Calls `notifications.send` after create
- [ ] Event type: `PAYMENT_ORDER_CREATED`
- [ ] Doesn't block creation if email fails

---

### TASK-5.12: Integrate notifications in paymentOrders.updateStatus

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Send notifications per status change.

**Acceptance Criteria**:
- [ ] Detects status change type
- [ ] Sends appropriate notification per status
- [ ] Includes comment when exists

---

### TASK-5.13: Integrate notifications in paymentOrderDocuments.create

**Priority**: 🟡 High

**Estimate**: 15 minutes

**Description**: Notify when document is added.

**Acceptance Criteria**:
- [ ] Notifies profile owner
- [ ] Only if status is IN_REVIEW or NEEDS_SUPPORT
- [ ] Includes file name

---

### TASK-5.14: Create notification preferences page

**Priority**: 🟢 Medium

**Estimate**: 45 minutes

**Description**: Page to configure email preferences.

**Acceptance Criteria**:
- [ ] `/settings/notifications` route created
- [ ] Checkboxes for each notification type
- [ ] Option to disable all
- [ ] Auto-save (optimistic)
- [ ] Visual feedback on save

---

### TASK-5.15: Create notification preferences table

**Priority**: 🟢 Medium

**Estimate**: 30 minutes

**Description**: Convex table for user preferences.

**Acceptance Criteria**:
- [ ] `notificationPreferences` table created
- [ ] Fields for each notification type (boolean)
- [ ] Defaults: all enabled
- [ ] Query and mutation for CRUD

---

## Phase 6: Search, Tags and Reports

**Objective**: Implement tagging system, advanced search and report export.

**Priority**: 🟡 High

**Total estimate**: 10-12 hours

---

### TASK-6.1: Create Convex function: tags.create

**Priority**: 🔴 Critical

**Estimate**: 15 minutes

**Description**: Mutation to create a tag.

**Acceptance Criteria**:
- [ ] Mutation `tags.create` created
- [ ] Validates user is authenticated
- [ ] Validates unique name per user
- [ ] Validates color in hex format
- [ ] Returns created tag

---

### TASK-6.2: Create Convex function: tags.getByUser

**Priority**: 🔴 Critical

**Estimate**: 15 minutes

**Description**: Query to list user's tags.

**Acceptance Criteria**:
- [ ] Query `tags.getByUser` created
- [ ] Uses `by_user` index
- [ ] Ordered alphabetically

---

### TASK-6.3: Create Convex function: tags.update

**Priority**: 🟡 High

**Estimate**: 15 minutes

**Description**: Mutation to update a tag.

**Acceptance Criteria**:
- [ ] Mutation `tags.update` created
- [ ] Only owner can update
- [ ] Allows changing name and color
- [ ] Validates name uniqueness

---

### TASK-6.4: Create Convex function: tags.delete

**Priority**: 🟡 High

**Estimate**: 20 minutes

**Description**: Mutation to delete a tag.

**Acceptance Criteria**:
- [ ] Mutation `tags.delete` created
- [ ] Only owner can delete
- [ ] Removes tag from payment orders that use it
- [ ] Confirmation required in UI

---

### TASK-6.5: Create /settings/tags page

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: Page to manage tag library.

**Acceptance Criteria**:
- [ ] `/settings/tags` route created
- [ ] Lists all user's tags
- [ ] Form to create new tag
- [ ] Color picker for each tag
- [ ] Inline editing
- [ ] Deletion with confirmation
- [ ] Usage counter per tag
- [ ] Tag search/filter

---

### TASK-6.6: Create TagInput component

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: Component to select/create tags in forms.

**Acceptance Criteria**:
- [ ] Multi-select of existing tags
- [ ] Autocomplete while typing
- [ ] Option to create new tag on-the-fly
- [ ] Shows tag color
- [ ] Removable chips for selected tags
- [ ] Maximum tag limit (e.g.: 10)
- [ ] Keyboard accessible

---

### TASK-6.7: Create TagBadge component

**Priority**: 🟡 High

**Estimate**: 15 minutes

**Description**: Visual badge to display a tag.

**Acceptance Criteria**:
- [ ] Shows tag name
- [ ] Background with tag color
- [ ] Readable contrast text
- [ ] Sizes: sm, md
- [ ] Variant with X to remove

---

### TASK-6.8: Create full-text search index

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Configure search index in Convex.

**Acceptance Criteria**:
- [ ] Search index configured in schema
- [ ] Indexes: title, description, reason
- [ ] Works with partial search
- [ ] Acceptable performance (<500ms)

---

### TASK-6.9: Create FilterPanel component

**Priority**: 🟡 High

**Estimate**: 45 minutes

**Description**: Advanced filters panel for payment orders.

**Acceptance Criteria**:
- [ ] Status filter (multi-select)
- [ ] Tags filter (multi-select)
- [ ] Date range filter
- [ ] Amount range filter
- [ ] Profile filter (for owners)
- [ ] Apply/Clear filters
- [ ] Results counter
- [ ] Collapsible on mobile

---

### TASK-6.10: Persist filters in URL

**Priority**: 🟢 Medium

**Estimate**: 30 minutes

**Description**: Sync filters with URL query params.

**Acceptance Criteria**:
- [ ] Filters reflected in URL
- [ ] Shareable URL keeps filters
- [ ] Browser back/forward works
- [ ] Debounce to avoid multiple updates

---

### TASK-6.11: Create Convex function: reports.getPaymentOrdersSummary

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: Query to get aggregated payment orders summary.

**Acceptance Criteria**:
- [ ] Query `reports.getPaymentOrdersSummary` created
- [ ] Parameters: profileId, dateRange
- [ ] Returns: Total by status, sum by status, sum by tag, sum by month
- [ ] Acceptable performance with many payment orders

---

### TASK-6.12: Create /dashboard/reports page

**Priority**: 🔴 Critical

**Estimate**: 1.5 hours

**Description**: Reports and analysis page.

**Acceptance Criteria**:
- [ ] `/dashboard/reports` route created
- [ ] Date range selector
- [ ] Profile selector
- [ ] Main KPIs: Total, Total amount, Average, Pending
- [ ] Payment orders by month chart
- [ ] Distribution by tag chart
- [ ] Summary table by status
- [ ] Responsive

---

### TASK-6.13: Create chart components

**Priority**: 🟡 High

**Estimate**: 1 hour

**Description**: Visualization components with Recharts.

**Acceptance Criteria**:
- [ ] Bar chart for amounts by month
- [ ] Pie chart for distribution
- [ ] Line chart for trend
- [ ] Informative tooltips
- [ ] Colors consistent with theme
- [ ] Responsive
- [ ] Loading state

---

### TASK-6.14: Implement Excel export

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: Functionality to export payment orders to Excel.

**Acceptance Criteria**:
- [ ] "Export to Excel" button in reports
- [ ] Uses xlsx library
- [ ] Includes all payment order fields
- [ ] Applies active filters
- [ ] Correct currency format
- [ ] Dates in readable format
- [ ] Descriptive file name
- [ ] Works on client (no server required)

---

### TASK-6.15: Implement CSV export

**Priority**: 🟢 Medium

**Estimate**: 30 minutes

**Description**: Alternative CSV export option.

**Acceptance Criteria**:
- [ ] "Export to CSV" button
- [ ] Comma-separated fields
- [ ] UTF-8 encoding with BOM
- [ ] Works in all browsers

---

### TASK-6.16: Create DateRangePicker component

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Date range selector.

**Acceptance Criteria**:
- [ ] Start and end date selection
- [ ] Presets: Today, This week, This month, This year
- [ ] Visual calendar
- [ ] Valid range validation
- [ ] Localized date format

---

### TASK-6.17: Create usePaymentOrderFilters hook

**Priority**: 🟢 Medium

**Estimate**: 30 minutes

**Description**: Hook to manage filters state.

**Acceptance Criteria**:
- [ ] State for all filters
- [ ] Functions to modify each filter
- [ ] Function to clear all
- [ ] URL synchronization
- [ ] Memoization of active filters

---

## Phase 7: GDPR and Compliance

**Objective**: Implement functionalities required for GDPR compliance.

**Priority**: 🟡 High

**Total estimate**: 8-10 hours

---

### TASK-7.1: Create /legal/privacy page

**Priority**: 🔴 Critical

**Estimate**: 1.5 hours

**Description**: Privacy policy page.

**Acceptance Criteria**:
- [ ] `/legal/privacy` route created
- [ ] Complete legal content
- [ ] Sections: Data collected, Use, Sharing, Rights, Retention, Contact
- [ ] Last updated date
- [ ] Readable design
- [ ] Accessible without login

---

### TASK-7.2: Create /legal/terms page

**Priority**: 🔴 Critical

**Estimate**: 1.5 hours

**Description**: Terms and conditions page.

**Acceptance Criteria**:
- [ ] `/legal/terms` route created
- [ ] Complete legal content
- [ ] Main terms of use sections
- [ ] Last updated date

---

### TASK-7.3: Create Convex function: users.exportData

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: Function to export all user data.

**Acceptance Criteria**:
- [ ] Mutation `users.exportData` created
- [ ] Only user can export their data
- [ ] Includes: Profile, Organizations, Profiles, Payment Orders, Documents (metadata), Tags, History
- [ ] Structured JSON format
- [ ] Downloads as .json file
- [ ] Completion notification

---

### TASK-7.4: Create Convex function: users.deleteAccount

**Priority**: 🔴 Critical

**Estimate**: 1.5 hours

**Description**: Function to delete account and all data.

**Acceptance Criteria**:
- [ ] Mutation `users.deleteAccount` created
- [ ] Requires confirmation (password or code)
- [ ] Cascading delete: User, Organizations, Profiles, Tags, Preferences
- [ ] Anonymizes payment orders (doesn't delete, keeps history)
- [ ] Deletes files from UploadThing (async)
- [ ] Invalidates session
- [ ] Sends confirmation email

---

### TASK-7.5: Create /settings/privacy page

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Privacy settings page.

**Acceptance Criteria**:
- [ ] `/settings/privacy` route created
- [ ] Section: Export my data
- [ ] Section: Delete my account
- [ ] Links to legal policies
- [ ] Clear information about what gets exported/deleted

---

### TASK-7.6: Create ExportDataButton component

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Button to request data export.

**Acceptance Criteria**:
- [ ] Initiates export process
- [ ] Loading state while processing
- [ ] Automatic download on complete
- [ ] Error handling
- [ ] Success feedback

---

### TASK-7.7: Create DeleteAccountButton component

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Button with confirmation to delete account.

**Acceptance Criteria**:
- [ ] Opens confirmation modal
- [ ] Requires typing "DELETE" to confirm
- [ ] Shows summary of what will be deleted
- [ ] Checkbox "I understand this is irreversible"
- [ ] Destructive button (red)
- [ ] Redirects to landing after delete

---

### TASK-7.8: Implement data anonymization

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Anonymize historical data when deleting account.

**Acceptance Criteria**:
- [ ] Payment orders keep data but without user reference
- [ ] History keeps actions but without personal data
- [ ] Documents are deleted
- [ ] `deletedAt` field is set
- [ ] Name replaced with "Deleted user"

---

### TASK-7.9: Create consent registry

**Priority**: 🟡 High

**Estimate**: 45 minutes

**Description**: System to record user consents.

**Acceptance Criteria**:
- [ ] `consents` table created
- [ ] Records: user, type, date, version
- [ ] Types: terms, privacy, marketing
- [ ] Query to verify current consent
- [ ] UI to accept terms on registration

---

### TASK-7.10: Create cookie consent banner

**Priority**: 🟢 Medium

**Estimate**: 45 minutes

**Description**: Banner to accept cookies (if applicable).

**Acceptance Criteria**:
- [ ] Banner in footer on first access
- [ ] Options: Accept, Reject, Configure
- [ ] Persists preference in localStorage
- [ ] Doesn't block app usage
- [ ] Link to cookie policy

---

### TASK-7.11: Implement right to be forgotten in searches

**Priority**: 🟢 Medium

**Estimate**: 30 minutes

**Description**: Ensure deleted data doesn't appear in searches.

**Acceptance Criteria**:
- [ ] Users with `deletedAt` excluded from queries
- [ ] Payment orders from deleted users anonymized
- [ ] Search doesn't return deleted users' data

---

### TASK-7.12: Create compliance documentation

**Priority**: 🟢 Medium

**Estimate**: 1 hour

**Description**: Internal documentation of GDPR measures.

**Acceptance Criteria**:
- [ ] Document with implemented measures
- [ ] Request response procedure
- [ ] Personal data map
- [ ] Retention policy
- [ ] Processing registry

---

## Phase 8: Testing and Deploy

**Objective**: Ensure code quality and prepare for production.

**Priority**: 🟡 High

**Total estimate**: 10-12 hours

---

### TASK-8.1: Configure Vitest

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Configure Vitest for unit tests.

**Acceptance Criteria**:
- [x] Vitest installed and configured
- [ ] Scripts in package.json: `test`, `test:watch`, `test:coverage`
- [ ] Coverage configuration
- [ ] Setup file for global mocks
- [x] TypeScript integration

---

### TASK-8.2: Write tests for Convex functions

**Priority**: 🔴 Critical

**Estimate**: 2.5 hours

**Description**: Unit tests for critical Convex functions.

**Acceptance Criteria**:
- [ ] Tests for `users.getOrCreate`
- [ ] Tests for `organizations.create`
- [ ] Tests for `paymentOrderProfiles.create`
- [ ] Tests for `paymentOrders.create`
- [ ] Tests for `paymentOrders.updateStatus`
- [ ] Tests for permission validations
- [ ] Tests for state transitions
- [ ] Minimum 15 tests
- [ ] Coverage > 70% in Convex functions

---

### TASK-8.3: Write tests for utilities

**Priority**: 🟡 High

**Estimate**: 1 hour

**Description**: Tests for utility functions.

**Acceptance Criteria**:
- [ ] Tests for `generateSlug`
- [ ] Tests for Zod validators
- [ ] Tests for currency/date formatters
- [ ] Tests for auth helpers
- [ ] Edge cases covered

---

### TASK-8.4: Configure Playwright

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Configure Playwright for E2E tests.

**Acceptance Criteria**:
- [ ] Playwright installed
- [ ] Configuration for multiple browsers
- [ ] Scripts: `test:e2e`, `test:e2e:ui`
- [ ] E2E tests folder created
- [ ] CI configuration

---

### TASK-8.5: Write E2E tests for authentication flow

**Priority**: 🔴 Critical

**Estimate**: 1 hour

**Description**: E2E tests for login flow.

**Acceptance Criteria**:
- [ ] Test: access login
- [ ] Test: submit invalid email
- [ ] Test: complete OTP flow (mock)
- [ ] Test: access authenticated dashboard
- [ ] Test: logout

---

### TASK-8.6: Write E2E tests for payment order flow

**Priority**: 🔴 Critical

**Estimate**: 1.5 hours

**Description**: E2E tests for main payment order flow.

**Acceptance Criteria**:
- [ ] Test: create organization
- [ ] Test: create payment order profile
- [ ] Test: upload payment order from public view
- [ ] Test: approve payment order
- [ ] Test: reject payment order
- [ ] Fixtures for test data

---

### TASK-8.7: Configure CI/CD with GitHub Actions

**Priority**: 🔴 Critical

**Estimate**: 45 minutes

**Description**: Automated CI/CD pipeline.

**Acceptance Criteria**:
- [ ] CI workflow: lint, typecheck, tests
- [ ] Runs on PRs to main and develop
- [ ] Unit tests in CI
- [ ] E2E tests in CI (optional)
- [ ] Automatic deploy to staging on merge to develop
- [ ] Manual production deploy or on merge to main

---

### TASK-8.8: Perform manual testing of complete flow

**Priority**: 🔴 Critical

**Estimate**: 1.5 hours

**Description**: Exhaustive manual testing of all flows.

**Acceptance Criteria**:
- [ ] Documented test checklist
- [ ] Registration/login flow
- [ ] Org/profile creation flow
- [ ] Payment order upload flow
- [ ] Approval/rejection flow
- [ ] Data export flow
- [ ] Mobile testing
- [ ] Different browsers testing
- [ ] Found bugs documented

---

### TASK-8.9: Optimize bundle size

**Priority**: 🟡 High

**Estimate**: 30 minutes

**Description**: Analyze and optimize bundle size.

**Acceptance Criteria**:
- [ ] Analyze bundle with `vite-bundle-visualizer`
- [ ] Route lazy loading implemented
- [ ] Code splitting of heavy components
- [ ] Tree shaking working
- [ ] Total bundle < 300KB gzipped

---

### TASK-8.10: Configure environment variables in Vercel

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Configure environment variables for production.

**Acceptance Criteria**:
- [ ] Production variables configured
- [ ] Staging variables configured
- [ ] Secrets protected
- [ ] Verify no API key leaks

---

### TASK-8.11: Configure custom domain

**Priority**: 🟢 Medium

**Estimate**: 30 minutes

**Description**: Configure custom domain in Vercel.

**Acceptance Criteria**:
- [ ] Domain purchased (if applicable)
- [ ] DNS configured
- [ ] Vercel automatic SSL
- [ ] Redirect from www to non-www
- [ ] Domain verified

---

### TASK-8.12: Configure Convex for production

**Priority**: 🔴 Critical

**Estimate**: 20 minutes

**Description**: Production Convex deployment.

**Acceptance Criteria**:
- [ ] Production project created
- [ ] Schema deployed
- [ ] Environment variables updated
- [ ] Automatic backup enabled (if available)

---

### TASK-8.13: Deploy to staging and test

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Deploy to staging environment for final tests.

**Acceptance Criteria**:
- [ ] Successful deploy to staging
- [ ] All functionalities tested
- [ ] Acceptable performance
- [ ] No console errors
- [ ] Monitoring configured

---

### TASK-8.14: Deploy to production and monitoring

**Priority**: 🔴 Critical

**Estimate**: 30 minutes

**Description**: Final production deploy.

**Acceptance Criteria**:
- [ ] Successful production deploy
- [ ] Smoke tests passing
- [ ] Error monitoring active
- [ ] Alerts configured
- [ ] Rollback plan documented

---

## 8. Future Phases (Post-MVP)

### Phase 9: Bank Reconciliation

**Objective**: Automate payment order reconciliation with bank transactions.

**Main tasks**:
- Bank transaction download bot
- Bank statement parser (CSV/Excel)
- Automatic matching algorithm by amount
- Manual reconciliation interface
- Additional statuses: RECONCILED, RECONCILIATION_FAILED
- Result notifications

**Estimate**: 30-40 hours

---

### Phase 10: Mobile Application

**Objective**: Mobile app for quick approval and push notifications.

**Main tasks**:
- React Native setup
- Logic reuse with web
- Main screens: Login, Dashboard, Detail
- Push notifications
- Camera for document capture
- Basic offline support

**Estimate**: 60-80 hours

---

## 9. Technical Considerations

### 9.1 Security

- [ ] All dashboard routes require authentication
- [ ] Permission validation in each Convex function
- [ ] Rate limiting on public endpoints
- [ ] Input sanitization (XSS prevention)
- [ ] CORS properly configured
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] UploadThing files with restricted access
- [ ] Dependency auditing (`pnpm audit`)

### 9.2 Performance

- [ ] Pagination in all lists (cursor-based)
- [ ] Convex indexes for frequent queries
- [ ] Route and component lazy loading
- [ ] Image optimization (thumbnails)
- [ ] Search debounce
- [ ] Heavy component memoization
- [ ] TanStack Query cache configured

### 9.3 UX

- [ ] Loading states in all operations
- [ ] Error handling with clear messages
- [ ] Success/error visual feedback (toasts)
- [ ] Confirmations for destructive actions
- [ ] Empty states with call-to-action
- [ ] Responsive design (mobile-first)
- [ ] Basic accessibility (ARIA, keyboard nav)
- [ ] Smooth state transitions

### 9.4 Monitoring

- [ ] Production error logging
- [ ] Basic analytics (optional)
- [ ] Critical error alerts
- [ ] Convex metrics dashboard
- [ ] Uptime monitoring

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **Payment Order** | Payment or expense request that requires approval |
| **Payment Order Profile** | Configuration that allows a user to receive payment orders from others |
| **Supporting Document** | Attached document that justifies a payment order (invoice, receipt, etc.) |
| **Reconciliation** | Process of matching a payment order with a bank transaction |
| **OTP** | One Time Password - verification code sent by email |
| **Slug** | URL-friendly identifier (e.g.: my-organization) |
| **Owner** | User who owns an organization or profile |
| **Creator** | User who creates/uploads a payment order |

---

## 11. References

- [TanStack Start Docs](https://tanstack.com/start)
- [TanStack Query Docs](https://tanstack.com/query)
- [TanStack Form Docs](https://tanstack.com/form)
- [Convex Docs](https://docs.convex.dev)
- [WorkOS AuthKit](https://workos.com/docs/authkit)
- [AuthKit TanStack Start](https://github.com/workos/authkit-tanstack-start)
- [UploadThing Docs](https://docs.uploadthing.com)
- [Resend Docs](https://resend.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [next-themes](https://github.com/pacocoursey/next-themes)
- [Zustand](https://zustand-demo.pmnd.rs)
- [Zod](https://zod.dev)
- [@t3-oss/env](https://env.t3.gg)

---

*Document generated on January 21, 2026*