import { ElectronAPI } from '@electron-toolkit/preload'
import { InvokeFn, OnFn } from 'src/main/ipc/contract'

declare global {
  interface Window {
    electron: ElectronAPI
    ipcAPI: {
      invoke: InvokeFn
      on: OnFn
    }
  }
}
