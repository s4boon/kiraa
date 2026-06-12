import { type QueryKeyName, queryKeys } from '@shared/query_keys'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000
    }
  }
})

export function setupCacheInvalidation() {
  return window.ipcAPI.on('cache:invalidate', ({ key }: { key: QueryKeyName }) => {
    const k = queryKeys[key]

    if (!k) return

    queryClient.invalidateQueries({
      queryKey: k
    })
  })
}
