import './assets/main.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
import { CalendarProvider } from './components/context/calendar_context'
import { Toaster } from './components/ui/sonner'
import { queryClient } from './lib/ts_query'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster dir="rtl" />
      <CalendarProvider>
        <App />
      </CalendarProvider>
    </QueryClientProvider>
  </StrictMode>
)
