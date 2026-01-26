/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as lib_slug from "../lib/slug.js";
import type * as organizationInvites from "../organizationInvites.js";
import type * as organizationMemberships from "../organizationMemberships.js";
import type * as organizations from "../organizations.js";
import type * as paymentOrderProfiles from "../paymentOrderProfiles.js";
import type * as schema_documents from "../schema/documents.js";
import type * as schema_history from "../schema/history.js";
import type * as schema_orders from "../schema/orders.js";
import type * as schema_organizationInvites from "../schema/organizationInvites.js";
import type * as schema_organizationMemberships from "../schema/organizationMemberships.js";
import type * as schema_organizations from "../schema/organizations.js";
import type * as schema_profiles from "../schema/profiles.js";
import type * as schema_status from "../schema/status.js";
import type * as schema_tags from "../schema/tags.js";
import type * as schema_users from "../schema/users.js";
import type * as tags from "../tags.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "lib/slug": typeof lib_slug;
  organizationInvites: typeof organizationInvites;
  organizationMemberships: typeof organizationMemberships;
  organizations: typeof organizations;
  paymentOrderProfiles: typeof paymentOrderProfiles;
  "schema/documents": typeof schema_documents;
  "schema/history": typeof schema_history;
  "schema/orders": typeof schema_orders;
  "schema/organizationInvites": typeof schema_organizationInvites;
  "schema/organizationMemberships": typeof schema_organizationMemberships;
  "schema/organizations": typeof schema_organizations;
  "schema/profiles": typeof schema_profiles;
  "schema/status": typeof schema_status;
  "schema/tags": typeof schema_tags;
  "schema/users": typeof schema_users;
  tags: typeof tags;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
