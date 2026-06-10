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
  return window.ipcAPI.on('cache:invalidate', ({ model }: { model: QueryKeyName }) => {
    const key = queryKeys[model]

    if (!key) return

    queryClient.invalidateQueries({
      queryKey: key
    })
  })
}
