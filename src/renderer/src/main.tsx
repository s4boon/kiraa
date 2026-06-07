import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router'
import { CalendarProvider } from './components/context/calendar_context'
import { Toaster } from './components/ui/sonner'
import Layout from './layout'
import { ROUTES } from './routes/ROUTES'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster dir="rtl" />
    <CalendarProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            {ROUTES.map((route) => {
              return <Route key={route.path} path={route.path} element={route.element} />
            })}
          </Route>
        </Routes>
      </HashRouter>
    </CalendarProvider>
  </StrictMode>
)
