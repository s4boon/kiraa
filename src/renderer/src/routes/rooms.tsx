type Props = {}

export default function rooms({}: Props) {
  return (
    <div className="grid gap-3 grid-cols-16 min-h-full bg-red-500">
      <div className="col-span-3 bg-green-400">rooms</div>
      <div className="col-span-9 bg-blue-500">calendar</div>
      <div className="col-span-4 bg-yellow-50">customer info</div>
    </div>
  )
}
