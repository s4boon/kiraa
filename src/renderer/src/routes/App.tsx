type Props = {}

export default function App({}: Props) {
  return (
    <div className="flex w-full items-center justify-evenly pt-10 [&>div]:rounded-xs">
      <div
        onClick={async () => {
          const { success } = await window.ipcAPI.invoke('test:test')
          console.log('testing ipc impl: ', success)
        }}
        className="bg-accent text-primary-foreground w-64 h-40 border border-purple-600"
      ></div>
      <div className="bg-background text-primary-foreground w-64 h-40 border border-accent-foreground"></div>
      <div className="bg-background text-primary-foreground w-64 h-40 border border-accent-foreground"></div>
    </div>
  )
}
