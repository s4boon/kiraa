import { is } from '@electron-toolkit/utils'
import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
import path from 'path'
import { Booking, Group, Room } from '../db/models'
import { sequelize } from '../db/sequelize'
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
      include: {
        model: Room,
        separate: true,
        order: [['id', 'ASC']]
      }
    })
    return {
      groups: groups.map((g) => ({
        data: g.get({ plain: true }),
        rooms: (g.Rooms ?? []).map((r) => r.get({ plain: true }))
      }))
    }
  },

  'group:update': async (_, data) => {
    const [affected] = await Group.update(
      {
        name: data.new_name
      },
      { where: { name: data.target } }
    )
    return { affected }
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
    const room = await Room.findOne({
      where: {
        name: data.name
      },
      include: {
        model: Booking
      }
    })

    if (!room) throw new Error(`couldn't find room "${data.name}"`)

    return {
      room: room.get({ plain: true }),
      bookings: (room.Bookings ?? []).map((b) => b.get({ plain: true }))
    }
  },

  'booking:create': async (_, data) => {
    const { booking, room_name } = data

    const room = await Room.findOne({ where: { name: room_name } })
    if (!room) throw new Error('could not find room')
    const b = await Booking.create({
      ...booking,
      roomId: room.get({ plain: true }).id
    })
    return { booking: b }
  },

  'booking:update': async (_, data) => {
    const { booking } = data

    const b = await Booking.findByPk(booking.id)
    if (!b) throw new Error('could not find the booking or the associated tenant')
    const updated_booking = await b.update({ ...booking })
    return { booking: updated_booking }
  },

  'booking:delete': async (_, data) => {
    const affected = await Booking.destroy({ where: { id: data.id } })
    return { affected }
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
