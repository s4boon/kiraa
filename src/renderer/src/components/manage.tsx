import { HousePlus } from 'lucide-react'
import { Button } from './ui/button'

type Props = {}

export default function manage({}: Props) {
  return (
    <Button
      className="rounded-sm cursor-pointer"
      variant={'secondary'}
      onClick={() => {
        window.ipcAPI.invoke('window:newchild', { route: '/manage' })
      }}
    >
      <HousePlus className="size-5" />
    </Button>
  )
}
