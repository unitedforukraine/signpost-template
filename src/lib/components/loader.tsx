
interface Props {
  size?: number
  width?: number
  className?: string
}

export function Loader(props: Props) {
  const size = props.size || 32
  const cn = props.className || 'bg-white'
  return <div style={{ width: size, height: size, padding: props.width || (size / 4) }} className={`loader ${cn}`}></div>
}