import { translate } from "../app"
import { Container } from "./container"

export function BlockRichText(props: { block: BlockRichText }) {

  const { block } = props

  return <Container block={block}>
    <div dangerouslySetInnerHTML={{ __html: translate(props.block.text) }}></div>
  </Container>

}