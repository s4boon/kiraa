import { useNavbar } from './context/navbar_context'
type Props = {}

export default function crumbs({}: Props) {
  const { crumbs } = useNavbar()

  return <div>{crumbs}</div>
}
