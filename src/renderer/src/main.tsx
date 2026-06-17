import './assets/main.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
import { CalendarProvider } from './components/context/calendar_context'
import { NavbarProvider } from './components/context/navbar_context'
import { Toaster } from './components/ui/sonner'
import ErrorBoundary from './error_boundary'
import ErrorFallback from './error_fallback'
import { queryClient } from './lib/ts_query'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster dir="rtl" position="bottom-left" />
      <NavbarProvider>
        <CalendarProvider>
          <ErrorBoundary fallback={<ErrorFallback />}>
            <App />
          </ErrorBoundary>
        </CalendarProvider>
      </NavbarProvider>
    </QueryClientProvider>
  </StrictMode>
)
