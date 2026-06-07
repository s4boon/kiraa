import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import { Booking, Group, Room, Tenant } from '../db/models'
import type { APIChannels, ChannelName, EventChannelName, EventChannels } from './contract'

type Handler<K extends ChannelName> = (
  event: IpcMainInvokeEvent,
  data: APIChannels[K]['input']
) => Promise<APIChannels[K]['output']> | APIChannels[K]['output']

function sendToRenderer<K extends EventChannelName>(
  window: BrowserWindow,
  channel: K,
  data: EventChannels[K]
) {
  window.webContents.send(channel, data)
}

const handlers: {
  [K in ChannelName]: Handler<K>
} = {
  'group:create': async (_, data) => {
    const group = await Group.create({ name: data.name })
    return { group: group.dataValues }
  },

  'group:list': async () => {
    const groups = await Group.findAll()
    return { groups: groups.map((g) => g.dataValues) }
  },

  'room:create': async (_, data) => {
    const group = await Group.findOrCreate({ where: { name: data.group_name } }).then(
      (res) => res[0]
    )
    const room = await Room.create({
      groupId: group.dataValues.id,
      name: data.name,
      capacity: data.capacity
    })
    return { room: room.dataValues }
  },

  'room:bookings': async (_, data) => {
    const room = await Room.findByPk(data.roomId)
    if (!room) {
      throw new Error("couldn't find room #" + data.roomId)
    }
    const bookings = await Booking.findAll({
      where: {
        roomId: data.roomId
      },
      include: [Tenant]
    })
    return {
      room: room.dataValues,
      bookings: bookings.map((b) => {
        return { data: b.dataValues, tenant: b.Tenant!.dataValues }
      })
    }
  }
}

export function registerHandlers() {
  Object.entries(handlers).forEach(([channel, handler]) => {
    ipcMain.handle(channel, handler as any)
  })
}

export function notifyAllWindows<K extends EventChannelName>(channel: K, data: EventChannels[K]) {
  BrowserWindow.getAllWindows().forEach((win) => {
    sendToRenderer(win, channel, data)
  })
}
