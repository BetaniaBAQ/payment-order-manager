import type { api } from 'convex/_generated/api'
import type { FunctionReturnType } from 'convex/server'

export type Organization = NonNullable<
  FunctionReturnType<typeof api.organizations.getBySlug>
>

export type Member = {
  _id: string
  role: 'owner' | 'admin' | 'member'
  user: {
    _id: string
    name: string
    email: string
    avatarUrl?: string
  } | null
}

export type Invite = {
  _id: string
  email: string
  role: 'admin' | 'member'
  inviter: {
    _id: string
    name: string
    email: string
  } | null
}
