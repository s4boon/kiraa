export interface APIChannels {
  'test:test': {
    input: void
    output: { success: boolean }
  }
  'purchase:creates': {
    input: { name: string; items: string[] }
    output: { success: boolean; name: string; items: string[] }
  }
}

export interface EventChannels {
  'notification:new': {
    title: string
    message: string
    type: string
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
