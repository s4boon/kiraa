type Factory<T> = () => Promise<T>

const cache = new Map<string, Promise<any>>()

export function query<T>(key: string, factory: Factory<T>): Promise<T> {
  const existing = cache.get(key)

  if (existing) {
    return existing as Promise<T>
  }

  const promise = factory()
  cache.set(key, promise)

  return promise
}
