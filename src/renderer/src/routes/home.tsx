import { Link } from 'react-router'
import { ROUTES } from './ROUTES'

type Props = {}

export default function App({}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 w-full gap-x-4 gap-y-6 [&>div]:rounded-sm">
      {ROUTES.map((route) => {
        if (route.path !== '/') {
          return (
            <Link
              to={route.path}
              key={route.path}
              className="relative bg-accent text-primary min-h-36 p-4 text-2xl font-semibold"
            >
              {route.label}
              <div className="absolute left-4 bottom-4 [&>svg]:size-20 text-background">
                {route.icon}
              </div>
            </Link>
          )
        }
      })}
    </div>
  )
}
