import { useMemo, useState } from 'react'

type CalendarCell = {
  date: Date
  isCurrentMonth: boolean
}

const WEEKDAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function buildCalendar(year: number, month: number): CalendarCell[] {
  const first = new Date(year, month, 1)

  // Monday = 0
  const offset = (first.getDay() + 6) % 7

  const cells: CalendarCell[] = []

  for (let i = 0; i < 42; i++) {
    const date = new Date(year, month, 1 - offset + i)

    cells.push({
      date,
      isCurrentMonth: date.getMonth() === month
    })
  }

  return cells
}

export default function Calendar() {
  const [current, setCurrent] = useState(() => new Date())

  const cells = useMemo(() => {
    return buildCalendar(current.getFullYear(), current.getMonth())
  }, [current])

  return (
    <div dir="ltr" className="flex h-full w-full flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between p-3 border-b">
        <button
          onClick={() => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          className="px-3 py-1 border rounded"
        >
          ←
        </button>

        <div className="font-semibold">
          {current.toLocaleString('fr-FR', {
            month: 'long',
            year: 'numeric'
          })}
        </div>

        <button
          onClick={() => setCurrent((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          className="px-3 py-1 border rounded"
        >
          →
        </button>
      </div>

      {/* WEEKDAYS */}
      <div className="grid grid-cols-7 border-b text-sm font-medium">
        {WEEKDAYS_FR.map((d) => (
          <div key={d} className="text-center py-2 border-r last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="grid flex-1 grid-cols-7 grid-rows-6">
        {cells.map((cell) => (
          <div
            key={cell.date.toISOString()}
            className={[
              'border p-2 text-sm relative',
              cell.isCurrentMonth ? 'bg-background' : 'bg-muted/40 text-muted-foreground'
            ].join(' ')}
          >
            <span>{cell.date.getDate()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
