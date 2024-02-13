import { Container } from "./container"

export function BlockServices(props: { block: BlockServices }) {

  const { block } = props

  return <Container block={block}>
    <div>Services Map and List</div>
  </Container>

}