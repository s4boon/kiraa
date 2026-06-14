import { useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router'
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
          <Route path={'/'} element={<HomePage />} />
          <Route path="/rooms" element={<RoomsRedirect />} />
          <Route path="/rooms/:name?" element={<RoomsPage />} />
          <Route path="/search" element={<Search />} />
          <Route path="/tenants" element={<Tenants />} />
        </Route>

        <Route path="/manage" element={<Manage />} />
      </Routes>
    </HashRouter>
  )
}
