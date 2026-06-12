import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import { ChannelName, EventChannelName, InvokeFn, OnFn } from 'src/main/ipc/contract'

const ALLOWED_CHANNELS: ChannelName[] = [
  'group:create',
  'group:list',
  'group:delete',
  'room:bookings',
  'room:create',
  'booking:create',
  'window:newchild'
]
const ALLOWED_EVENTS: EventChannelName[] = ['notification:new', 'cache:invalidate']

const invoke: InvokeFn = (channel, data?) => {
  if (!ALLOWED_CHANNELS.includes(channel)) {
    throw new Error(`Channel ${channel} not allowed`)
  }

  return ipcRenderer.invoke(channel, data)
}

const on: OnFn = (channel, callback) => {
  if (!ALLOWED_EVENTS.includes(channel)) {
    throw new Error(`Event ${channel} not allowed`)
  }

  const handler = (_: any, data: any) => {
    callback(data)
  }

  ipcRenderer.on(channel, handler)

  return () => {
    ipcRenderer.removeListener(channel, handler)
  }
}

// Custom APIs for renderer
const api = {
  invoke,
  on
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('ipcAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
