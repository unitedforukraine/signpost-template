import { Container } from "./container"

export function BlockChannels(props: { block: BlockChannels }) {
  const { block } = props

  return <Container block={block}>
    <div>Channels</div>
  </Container>


}