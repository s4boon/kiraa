import React, { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router'
import ErrorBoundary from './error_boundary'
import ErrorFallback from './error_fallback'
import Layout from './layout'
import { setupCacheInvalidation } from './lib/ts_query'
import HomePage from './routes/home'
import Manage from './routes/manage'
import RoomsPage from './routes/rooms'
import RoomsRedirect from './routes/rooms_redirect'
import Search from './routes/search'
import Tenants from './routes/tenants'

export default function App() {
  useEffect(() => {
    const unsub = setupCacheInvalidation()
    return unsub
  }, [])

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path={'/'}
            element={
              <EB>
                <HomePage />
              </EB>
            }
          />
          <Route
            path="/rooms"
            element={
              <EB>
                <RoomsRedirect />
              </EB>
            }
          />
          <Route
            path="/rooms/:name?"
            element={
              <EB>
                <RoomsPage />
              </EB>
            }
          />
          <Route
            path="/search"
            element={
              <EB>
                <Search />
              </EB>
            }
          />
          <Route
            path="/tenants"
            element={
              <EB>
                <Tenants />
              </EB>
            }
          />
        </Route>

        <Route
          path="/manage"
          element={
            <EB>
              <Manage />
            </EB>
          }
        />
      </Routes>
    </HashRouter>
  )
}

function EB({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary fallback={<ErrorFallback />}>{children}</ErrorBoundary>
}
