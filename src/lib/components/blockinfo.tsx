
import { translate } from "../app"
import { Container } from "./container"

export function BlockInfo(props: { block: BlockInfo }) {
  const { block } = props

  return <Container block={block}>
    <div>Info: {translate(props.block.title)} </div>
  </Container>

}