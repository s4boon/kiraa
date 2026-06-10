import type { QueryKeyName } from '@shared/query_keys'
import { BookingModelType, GroupModelType, RoomModelType, TenantModelType } from '@shared/types'
export interface APIChannels {
  'group:create': {
    input: { name: string }
    output: { group: GroupModelType }
  }

  'group:list': {
    input: void
    output: {
      groups: {
        data: GroupModelType
        rooms: GroupModelType[]
      }[]
    }
  }

  'group:delete': {
    input: { name: string }
    output: { affected: number }
  }

  'room:create': {
    input: { group_name: string; name: string; capacity?: string }
    output: { room: RoomModelType }
  }

  'room:bookings': {
    input: { roomId: number }
    output: {
      room: RoomModelType
      bookings: { data: BookingModelType; tenant: TenantModelType }[]
    }
  }
  'window:newchild': {
    input: { route: string }
    output: void
  }
}

export interface EventChannels {
  'notification:new': {
    title: string
    message: string
    type: string
  }
  'cache:invalidate': {
    model: QueryKeyName
  }
}

export type ChannelName = keyof APIChannels
export type EventChannelName = keyof EventChannels

export type InvokeFn = <K extends ChannelName>(
  channel: K,
  ...args: APIChannels[K]['input'] extends void ? [] : [data: APIChannels[K]['input']]
) => Promise<APIChannels[K]['output']>

export type OnFn = <K extends EventChannelName>(
  channel: K,
  callback: (data: EventChannels[K]) => void
) => () => void

export type SendFn = <K extends EventChannelName>(channel: K, data: EventChannels[K]) => void
