import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron'
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
  'test:test': async (event) => {
    console.log('testing ipc')
    return { success: true }
  },
  'purchase:creates': async (event, data) => {
    console.log('creating purchase')
    console.log(data)
    return { ...data, success: true }
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
