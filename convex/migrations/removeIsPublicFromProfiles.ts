import { internalMutation } from '../_generated/server'

/**
 * Migration: Remove `isPublic` field from paymentOrderProfiles
 *
 * Run via Convex dashboard or CLI:
 *   npx convex run migrations/removeIsPublicFromProfiles:run
 *
 * This is a one-time migration to clean up legacy data after
 * the isPublic field was removed from the schema.
 */
export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query('paymentOrderProfiles').collect()

    let updated = 0
    for (const profile of profiles) {
      // Check if document has the legacy isPublic field

      const rawProfile = profile as any
      if ('isPublic' in rawProfile) {
        // Replace document without the isPublic field
        const {
          _id,
          _creationTime,
          isPublic: _removed,
          ...cleanProfile
        } = rawProfile
        await ctx.db.replace('paymentOrderProfiles', profile._id, cleanProfile)
        updated++
      }
    }

    return { totalProfiles: profiles.length, updated }
  },
})
