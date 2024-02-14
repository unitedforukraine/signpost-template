import { translate } from "../app"
import { Container } from "./container"

export function BlockChannels(props: { block: BlockChannels }) {
  const { block } = props

  return <Container block={block}>
    <div className="text-2xl">{translate(props.block.title)} </div>
    <div className="mt-4">{translate(props.block.subtitle)} </div>

  </Container>


}