import { EventEmitter } from 'events'
import { Group, Room } from './models'

export const hookEvents = new EventEmitter()

//chatgpt said sequelize shouldn't depend on the main process, so we make an event emitter and make the main process depend on sequelize
//i think i get it (maybe)
function createInvalidateHook(model: string) {
  return () => {
    hookEvents.emit('invalidate', { model })
  }
}

export function registerHooks() {
  Group.afterCreate(createInvalidateHook('group'))
  Group.afterUpdate(createInvalidateHook('group'))
  Group.afterDestroy(createInvalidateHook('group'))
  Group.afterBulkDestroy(createInvalidateHook('group'))

  Room.afterCreate(createInvalidateHook('room'))
  Room.afterUpdate(createInvalidateHook('room'))
  Room.afterDestroy(createInvalidateHook('room'))
}
