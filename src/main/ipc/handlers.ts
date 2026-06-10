import { is } from '@electron-toolkit/utils'
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import path from 'path'
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

    return {
      group: group.get({ plain: true })
    }
  },

  'group:list': async () => {
    const groups = await Group.findAll({
      include: [Room]
    })

    return {
      groups: groups.map((g) => ({
        data: g.get({ plain: true }),
        rooms: (g.Rooms ?? []).map((r) => r.get({ plain: true }))
      }))
    }
  },

  'group:delete': async (_, data) => {
    const rows = await Group.destroy({
      where: {
        name: data.name
      }
    })
    return { affected: rows }
  },

  'room:create': async (_, data) => {
    const [group] = await Group.findOrCreate({
      where: { name: data.group_name }
    })

    const room = await Room.create({
      groupId: group.id,
      name: data.name,
      capacity: data.capacity
    })

    return {
      room: room.get({ plain: true })
    }
  },

  'room:bookings': async (_, data) => {
    const room = await Room.findByPk(data.roomId)

    if (!room) {
      throw new Error(`couldn't find room #${data.roomId}`)
    }

    const bookings = await Booking.findAll({
      where: { roomId: data.roomId },
      include: [Tenant]
    })

    return {
      room: room.get({ plain: true }),

      bookings: bookings.map((b) => ({
        data: b.get({ plain: true }),
        tenant: b.Tenant!.get({ plain: true })
      }))
    }
  },
  'window:newchild': (_, data) => {
    const child = new BrowserWindow({
      width: 800,
      height: 600,
      parent: BrowserWindow.getFocusedWindow() ?? undefined,
      modal: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      child.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#${data.route}`)
    } else {
      child.loadFile(path.join(__dirname, '../renderer/index.html'), {
        hash: data.route
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
