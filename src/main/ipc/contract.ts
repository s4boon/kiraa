import type { QueryKeyName } from '@shared/query_keys'
import { BookingModel, BookingModelType, GroupModelType, RoomModelType } from '@shared/types'
import { CreationAttributes } from 'sequelize'
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
        rooms: RoomModelType[]
      }[]
    }
  }

  'group:update': {
    input: { target: string; new_name: string }
    output: { affected: number }
  }

  'group:delete': {
    input: { name: string }
    output: { affected: number }
  }

  'room:create': {
    input: { group_name: string; name: string; capacity?: string }
    output: { room: RoomModelType }
  }

  'room:search': {
    input: { free_days: number }
    output: {
      rooms: {
        data: RoomModelType
        earliest: Date
        bookings: BookingModelType[]
      }[]
    }
  }

  'room:bookings': {
    input: { name: string }
    output: {
      room: RoomModelType
      bookings: BookingModelType[]
    }
  }
  'booking:create': {
    input: {
      booking: Omit<CreationAttributes<BookingModel>, 'roomId'>
      room_name: string
    }
    output: { booking: BookingModelType }
  }
  'booking:update': {
    input: {
      booking: Omit<CreationAttributes<BookingModel>, 'roomId'>
    }
    output: { booking: BookingModelType }
  }
  'booking:delete': {
    input: { id: number }
    output: { affected: number }
  }
  'booking:search': {
    input: { tenant?: string; contact?: string; room?: string; page?: number; per_page?: number }
    output: { bookings: BookingModelType[]; total: number }
  }
  'data:list': {
    input: void
    output: {
      recent_bookings: BookingModelType[]
      booking_count: number
      rooms: RoomModelType[]
      todays_bookings: number
    }
  }
  'window:togglefullscreen': {
    input: void
    output: void
  }
  'window:newchild': {
    input: { route: string }
    output: void
  }
  'db:import': {
    input: void
    output: { filepath: string | null }
  }
  'db:export': {
    input: void
    output: { filepath: string | null }
  }
}

export interface EventChannels {
  'notification:new': {
    title: string
    message: string
  }
  'cache:invalidate': {
    key: QueryKeyName
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
