import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router'
import Layout from './layout'
import { setupCacheInvalidation } from './lib/ts_query'
import Manage from './routes/manage'
import { ROUTES } from './routes/ROUTES'

export default function App() {
  useEffect(() => {
    const unsub = setupCacheInvalidation()
    return unsub
  }, [])

  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          {ROUTES.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>

        <Route path="/manage" element={<Manage />} />
      </Routes>
    </HashRouter>
  )
}
