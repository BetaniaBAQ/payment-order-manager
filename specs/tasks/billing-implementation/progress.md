# Billing Implementation Progress

## Schema & Foundation

- [x] 0001 - Subscriptions table schema
- [x] 0002 - Payment events table schema
- [x] 0003 - Register tables in schema index + codegen
- [ ] 0004 - Tier limits & prices constants
- [ ] 0005 - Limit checking helpers

## Limit Enforcement

- [ ] 0006 - Enforce order limit in paymentOrders.create
- [ ] 0007 - Enforce profile limit in paymentOrderProfiles.create
- [ ] 0008 - Enforce member limit in organizationMemberships.addMember

## Subscription Query

- [ ] 0009 - getByOrganization query

## Provider Clients

- [ ] 0010 - Wompi client setup
- [ ] 0011 - Stripe client setup
- [ ] 0012 - Provider router server function

## Webhook Routes

- [ ] 0013 - Wompi webhook API route
- [ ] 0014 - Stripe webhook API route

## Webhook Mutations

- [ ] 0015 - handleWompiEvent mutation
- [ ] 0016 - handleStripeCheckout mutation
- [ ] 0017 - handleStripeSubscriptionUpdate mutation
- [ ] 0018 - handleStripeSubscriptionDeleted mutation
- [ ] 0019 - handlePaymentFailed mutation

## Cron Jobs

- [ ] 0020 - Cron: reset monthly usage
- [ ] 0021 - Cron: charge Wompi recurring (tokenized cards)
- [ ] 0022 - Cron: send payment reminders (PSE/Nequi)

## Email Templates

- [ ] 0023 - Payment reminder + failed email templates

## UI Components

- [ ] 0024 - Pricing page route
- [ ] 0025 - Pricing cards component
- [ ] 0026 - Pricing toggle component
- [ ] 0027 - Wompi checkout component
- [ ] 0028 - Upgrade modal
- [ ] 0029 - Billing settings component
- [ ] 0030 - Usage meters component
- [ ] 0031 - Limit warning banner

## Integration

- [ ] 0032 - Add billing tab to org settings
