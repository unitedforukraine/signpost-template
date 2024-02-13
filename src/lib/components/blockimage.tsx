import { translate } from "../app"
import { Container } from "./container"

export function BlockImage(props: { block: BlockImage }) {
  const { block } = props

  return <Container block={block}>
    <div>Image: {translate(props.block.image)} </div>
  </Container>

}