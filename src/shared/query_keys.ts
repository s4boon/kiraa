export const queryKeys = {
  group: ['group'] as const,
  room: ['room'] as const,
  booking: ['booking'] as const,
  tenant: ['tenant'] as const
} as const

export type QueryKeyName = keyof typeof queryKeys

export const InvalidationMap: Record<QueryKeyName, QueryKeyName[]> = {
  group: ['group'],
  room: ['room', 'group'],
  tenant: ['tenant'],
  booking: ['booking', 'room', 'tenant'] //logically i don't see how i'll use this, but for consistency's sake...
  // every 'model' should affect it's parent, (eg, a room is edited, we should consider it's parent group edited and invalidate the cache accordingly)
}
