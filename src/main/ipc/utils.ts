import { RoomModel } from '@shared/types'

type RoomSearchResult = {
  room: RoomModel
  score: number
  earliestAvailableStart: Date
}

const DAY = 1000 * 60 * 60 * 24

function toDay(date: Date) {
  return Math.floor(date.getTime() / DAY)
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * DAY)
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return toDay(aStart) < toDay(bEnd) && toDay(aEnd) > toDay(bStart)
}

function evaluateRoom(room: RoomModel, freeDays: number): RoomSearchResult {
  const sorted = [...(room.Bookings ?? [])].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  )

  let cursor = new Date()

  while (true) {
    const start = new Date(cursor)
    const end = addDays(start, freeDays)

    const conflict = sorted.some((b) => overlaps(start, end, b.startDate, b.endDate))

    if (!conflict) {
      const daysFromNow = (start.getTime() - Date.now()) / DAY

      const score = Math.max(0, 1000 - daysFromNow * 10)

      return {
        room,
        score,
        earliestAvailableStart: start
      }
    }

    cursor = addDays(cursor, 1)
  }
}

export function searchRooms(rooms: RoomModel[], freeDays: number) {
  return rooms.map((room) => evaluateRoom(room, freeDays)).sort((a, b) => b.score - a.score)
}
