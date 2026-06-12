import { useLocation } from 'react-router'
import { ROUTES } from '../routes/home'
type Props = {}

export default function crumbs({}: Props) {
  const location = useLocation()

  return (
    <div>
      {ROUTES.find((route) => route.path === location.pathname)?.label || location.pathname}
    </div>
  )
}
