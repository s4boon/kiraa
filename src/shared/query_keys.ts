export const queryKeys = {
  group: ['group'] as const,
  room: ['room'] as const,
  booking: ['booking'] as const
} as const

export type QueryKeyName = keyof typeof queryKeys
