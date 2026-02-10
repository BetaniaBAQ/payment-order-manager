/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as emails from "../emails.js";
import type * as emails_base from "../emails/base.js";
import type * as emails_devAlert from "../emails/devAlert.js";
import type * as emails_documentAdded from "../emails/documentAdded.js";
import type * as emails_orderApproved from "../emails/orderApproved.js";
import type * as emails_orderCancelled from "../emails/orderCancelled.js";
import type * as emails_orderCreated from "../emails/orderCreated.js";
import type * as emails_orderNeedsSupport from "../emails/orderNeedsSupport.js";
import type * as emails_orderRejected from "../emails/orderRejected.js";
import type * as emails_organizationInvite from "../emails/organizationInvite.js";
import type * as emails_organizationWelcome from "../emails/organizationWelcome.js";
import type * as emailsInternal from "../emailsInternal.js";
import type * as http from "../http.js";
import type * as lib_checkLimits from "../lib/checkLimits.js";
import type * as lib_slug from "../lib/slug.js";
import type * as lib_tierLimits from "../lib/tierLimits.js";
import type * as migrations_removeIsPublicFromProfiles from "../migrations/removeIsPublicFromProfiles.js";
import type * as organizationInvites from "../organizationInvites.js";
import type * as organizationInvitesInternal from "../organizationInvitesInternal.js";
import type * as organizationMemberships from "../organizationMemberships.js";
import type * as organizations from "../organizations.js";
import type * as paymentOrderDocuments from "../paymentOrderDocuments.js";
import type * as paymentOrderHistory from "../paymentOrderHistory.js";
import type * as paymentOrderProfiles from "../paymentOrderProfiles.js";
import type * as paymentOrders from "../paymentOrders.js";
import type * as schema_documents from "../schema/documents.js";
import type * as schema_history from "../schema/history.js";
import type * as schema_notifications from "../schema/notifications.js";
import type * as schema_orders from "../schema/orders.js";
import type * as schema_organizationInvites from "../schema/organizationInvites.js";
import type * as schema_organizationMemberships from "../schema/organizationMemberships.js";
import type * as schema_organizations from "../schema/organizations.js";
import type * as schema_paymentEvents from "../schema/paymentEvents.js";
import type * as schema_profiles from "../schema/profiles.js";
import type * as schema_status from "../schema/status.js";
import type * as schema_subscriptions from "../schema/subscriptions.js";
import type * as schema_tags from "../schema/tags.js";
import type * as schema_users from "../schema/users.js";
import type * as subscriptions from "../subscriptions.js";
import type * as tags from "../tags.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  emails: typeof emails;
  "emails/base": typeof emails_base;
  "emails/devAlert": typeof emails_devAlert;
  "emails/documentAdded": typeof emails_documentAdded;
  "emails/orderApproved": typeof emails_orderApproved;
  "emails/orderCancelled": typeof emails_orderCancelled;
  "emails/orderCreated": typeof emails_orderCreated;
  "emails/orderNeedsSupport": typeof emails_orderNeedsSupport;
  "emails/orderRejected": typeof emails_orderRejected;
  "emails/organizationInvite": typeof emails_organizationInvite;
  "emails/organizationWelcome": typeof emails_organizationWelcome;
  emailsInternal: typeof emailsInternal;
  http: typeof http;
  "lib/checkLimits": typeof lib_checkLimits;
  "lib/slug": typeof lib_slug;
  "lib/tierLimits": typeof lib_tierLimits;
  "migrations/removeIsPublicFromProfiles": typeof migrations_removeIsPublicFromProfiles;
  organizationInvites: typeof organizationInvites;
  organizationInvitesInternal: typeof organizationInvitesInternal;
  organizationMemberships: typeof organizationMemberships;
  organizations: typeof organizations;
  paymentOrderDocuments: typeof paymentOrderDocuments;
  paymentOrderHistory: typeof paymentOrderHistory;
  paymentOrderProfiles: typeof paymentOrderProfiles;
  paymentOrders: typeof paymentOrders;
  "schema/documents": typeof schema_documents;
  "schema/history": typeof schema_history;
  "schema/notifications": typeof schema_notifications;
  "schema/orders": typeof schema_orders;
  "schema/organizationInvites": typeof schema_organizationInvites;
  "schema/organizationMemberships": typeof schema_organizationMemberships;
  "schema/organizations": typeof schema_organizations;
  "schema/paymentEvents": typeof schema_paymentEvents;
  "schema/profiles": typeof schema_profiles;
  "schema/status": typeof schema_status;
  "schema/subscriptions": typeof schema_subscriptions;
  "schema/tags": typeof schema_tags;
  "schema/users": typeof schema_users;
  subscriptions: typeof subscriptions;
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

export declare const components: {
  resend: {
    lib: {
      cancelEmail: FunctionReference<
        "mutation",
        "internal",
        { emailId: string },
        null
      >;
      cleanupAbandonedEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      cleanupOldEmails: FunctionReference<
        "mutation",
        "internal",
        { olderThan?: number },
        null
      >;
      createManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          from: string;
          headers?: Array<{ name: string; value: string }>;
          replyTo?: Array<string>;
          subject: string;
          to: Array<string> | string;
        },
        string
      >;
      get: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          bcc?: Array<string>;
          bounced?: boolean;
          cc?: Array<string>;
          clicked?: boolean;
          complained: boolean;
          createdAt: number;
          deliveryDelayed?: boolean;
          errorMessage?: string;
          failed?: boolean;
          finalizedAt: number;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          opened: boolean;
          replyTo: Array<string>;
          resendId?: string;
          segment: number;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
          subject?: string;
          template?: {
            id: string;
            variables?: Record<string, string | number>;
          };
          text?: string;
          to: Array<string>;
        } | null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { emailId: string },
        {
          bounced: boolean;
          clicked: boolean;
          complained: boolean;
          deliveryDelayed: boolean;
          errorMessage: string | null;
          failed: boolean;
          opened: boolean;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        } | null
      >;
      handleEmailEvent: FunctionReference<
        "mutation",
        "internal",
        { event: any },
        null
      >;
      sendEmail: FunctionReference<
        "mutation",
        "internal",
        {
          bcc?: Array<string>;
          cc?: Array<string>;
          from: string;
          headers?: Array<{ name: string; value: string }>;
          html?: string;
          options: {
            apiKey: string;
            initialBackoffMs: number;
            onEmailEvent?: { fnHandle: string };
            retryAttempts: number;
            testMode: boolean;
          };
          replyTo?: Array<string>;
          subject?: string;
          template?: {
            id: string;
            variables?: Record<string, string | number>;
          };
          text?: string;
          to: Array<string>;
        },
        string
      >;
      updateManualEmail: FunctionReference<
        "mutation",
        "internal",
        {
          emailId: string;
          errorMessage?: string;
          resendId?: string;
          status:
            | "waiting"
            | "queued"
            | "cancelled"
            | "sent"
            | "delivered"
            | "delivery_delayed"
            | "bounced"
            | "failed";
        },
        null
      >;
    };
  };
};
