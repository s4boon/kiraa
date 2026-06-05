import { Link } from 'react-router'

type Props = {}

export default function about({}: Props) {
  return (
    <div>
      about
      <Link to="/">Home</Link>
    </div>
  )
}
