import { is } from '@electron-toolkit/utils'
import { RoomModel } from '@shared/types'
import { app, BrowserWindow, dialog, ipcMain, IpcMainInvokeEvent } from 'electron'
import fs from 'fs'
import path from 'path'
import { Op } from 'sequelize'
import { Booking, Group, Room } from '../db/models'
import { dbPath } from '../db/sequelize'
import type { APIChannels, ChannelName, EventChannelName, EventChannels } from './contract'
import { searchRooms } from './utils'

const tipestamp = new Date().getTime()
const BACKUP_PATH = path.join(app.getPath('userData'), `kiraa.backup-${tipestamp}.db`)

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

  'room:search': async (_, data) => {
    const rooms = await Room.findAll({
      include: [Booking]
    })

    const sorted = searchRooms(rooms, data.free_days)

    const final = sorted.map((e) => {
      return {
        data: e.room.get({ plain: true }),
        earliest: e.earliestAvailableStart,
        bookings: (e.room.Bookings ?? []).map((b) => b.get({ plain: true }))
      }
    })

    return {
      rooms: final
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
    return { booking: b.get({ plain: true }) }
  },

  'booking:update': async (_, data) => {
    const { booking } = data

    const b = await Booking.findByPk(booking.id)
    if (!b) throw new Error('could not find the booking or the associated tenant')
    const updated_booking = await b.update({ ...booking })
    return { booking: updated_booking.get({ plain: true }) }
  },

  'booking:delete': async (_, data) => {
    const affected = await Booking.destroy({ where: { id: data.id } })
    return { affected }
  },

  'booking:search': async (_, data) => {
    const limit = data.per_page ?? 0
    const offset = data.page ?? 0
    let room: RoomModel | null = null
    if (data.room?.trim() != '' && data.room != '*') {
      room = await Room.findOne({
        where: {
          name: data.room
        }
      })
    }
    const { count, rows } = await Booking.findAndCountAll({
      where: {
        ...(data.tenant && {
          tenant: {
            [Op.like]: `%${data.tenant}%`
          }
        }),

        ...(data.contact && {
          contact: {
            [Op.like]: `%${data.contact}%`
          }
        }),

        ...(room?.dataValues?.id && {
          roomId: room.dataValues.id
        })
      },
      limit,
      offset: offset * limit
    })
    return { bookings: rows.map((b) => b.get({ plain: true })), total: count }
  },

  'data:list': async () => {
    const recent_bookings = await Booking.findAll({ limit: 3, order: [['id', 'DESC']] })
    const booking_count = await Booking.count()
    const rooms = await Room.findAll()
    const now = new Date()
    const active_bookings = await Booking.findAll({
      where: {
        startDate: {
          [Op.lte]: now
        },
        endDate: {
          [Op.gte]: now
        }
      }
    })

    return {
      booking_count,
      recent_bookings: recent_bookings.map((b) => b.get({ plain: true })),
      rooms: rooms.map((r) => r.get({ plain: true })),
      todays_bookings: active_bookings.length
    }
  },

  'window:togglefullscreen': async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return

    win.setFullScreen(!win.fullScreen)
  },

  'window:newchild': (event, data) => {
    const child = new BrowserWindow({
      width: 800,
      height: 600,
      parent: BrowserWindow.fromWebContents(event.sender) ?? undefined,
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
  },

  'db:import': async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return { filepath: null }
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      title: 'Import database',
      filters: [{ name: 'SQLite DB', extensions: ['db'] }],
      properties: ['openFile']
    })

    if (canceled || !filePaths.length) return { filepath: null }

    return { filepath: filePaths[0] }
  },

  'db:export': async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return { filepath: null }
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: 'Export Database',
      defaultPath: BACKUP_PATH,
      filters: [{ name: 'SQLite DB', extensions: ['db'] }]
    })

    if (canceled || !filePath) return { filepath: null }

    fs.copyFileSync(dbPath, filePath)

    return { filepath: filePath }
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
