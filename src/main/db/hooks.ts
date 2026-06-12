import { type QueryKeyName } from '@shared/query_keys'
import { EventEmitter } from 'events'
import { Booking, Group, Room } from './models'

//simple warpper cus i dont like any in my code
type Events = {
  invalidate: { key: QueryKeyName }
}

type EventKeys = keyof Events

export const hookEvents = new EventEmitter()

export function emit<K extends EventKeys>(event: K, payload: Events[K]) {
  hookEvents.emit(event, payload)
}

export function on<K extends EventKeys>(event: K, cb: (payload: Events[K]) => void) {
  hookEvents.on(event, cb)
}

//chatgpt said sequelize shouldn't depend on the main process, so we make an event emitter and make the main process depend on sequelize
//i think i get it (maybe)
function createInvalidateHook(key: QueryKeyName) {
  return () => {
    emit('invalidate', { key })
  }
}
const invalidateGroup = createInvalidateHook('group')
const invalidateRoom = createInvalidateHook('room')
const invalidateBooking = createInvalidateHook('booking')

export function registerHooks() {
  Group.afterCreate(invalidateGroup)
  Group.afterUpdate(invalidateGroup)
  Group.afterDestroy(invalidateGroup)
  Group.afterBulkDestroy(invalidateGroup)

  Room.afterCreate(invalidateRoom)
  Room.afterUpdate(invalidateRoom)
  Room.afterDestroy(invalidateRoom)
  Room.afterBulkDestroy(invalidateRoom)

  Booking.afterCreate(invalidateRoom)
  Booking.afterUpdate(invalidateRoom)
  Booking.afterDestroy(invalidateRoom)
  Booking.afterBulkDestroy(invalidateRoom)
}
