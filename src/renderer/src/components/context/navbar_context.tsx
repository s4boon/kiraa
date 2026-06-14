import { createContext, ReactNode, useContext, useState } from 'react'

type NavbarContextType = {
  crumbs: string
  setCrumbs: (text: string) => void
}

const NavContext = createContext<NavbarContextType | null>(null)

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [crumbs, setCrumbs] = useState<string>('')

  return <NavContext.Provider value={{ crumbs, setCrumbs }}>{children}</NavContext.Provider>
}

export function useNavbar() {
  const ctx = useContext(NavContext)
  if (!ctx) throw new Error('useNavbar must be used inside NavbarProvider')
  return ctx
}
