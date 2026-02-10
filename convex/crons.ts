import { cronJobs } from 'convex/server'

import { internal } from './_generated/api'

const crons = cronJobs()

// Reset monthly usage counters on the 1st at 00:00 COT (05:00 UTC)
crons.monthly(
  'reset usage counters',
  { day: 1, hourUTC: 5, minuteUTC: 0 },
  internal.subscriptions.resetMonthlyUsage,
)

// Charge Wompi recurring subscriptions (tokenized cards) on 1st at 07:00 COT (12:00 UTC)
crons.monthly(
  'wompi recurring charges',
  { day: 1, hourUTC: 12, minuteUTC: 0 },
  internal.subscriptions.chargeWompiRecurring,
)

// Send PSE/Nequi payment reminders daily at 09:00 COT (14:00 UTC)
crons.daily(
  'payment reminders',
  { hourUTC: 14, minuteUTC: 0 },
  internal.subscriptions.sendPaymentReminders,
)

export default crons
