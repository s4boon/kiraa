import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from './ui/button'

type Props = {}

export default function theme({}: Props) {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const body = window.document.body
    const theme = body.className
    if (theme === 'dark') {
      window.localStorage.setItem('theme', 'dark')
      return theme
    } else {
      window.localStorage.setItem('theme', 'light')
      return 'light'
    }
  })
  useEffect(() => {
    const body = window.document.body
    body.setAttribute('class', theme)
    window.localStorage.setItem('theme', theme)
  }, [theme])
  return (
    <Button
      className="rounded-sm cursor-pointer"
      variant={'secondary'}
      onClick={() => {
        setTheme((prev) => {
          if (prev === 'dark') {
            return 'light'
          } else return 'dark'
        })
      }}
    >
      {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  )
}
