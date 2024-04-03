import { translate } from "../app"
import { Container } from "./container"
import { FaFacebook, FaTelegram } from "react-icons/fa"

export function BlockChannels(props: { block: BlockChannels }) {
  const { block } = props

  return <Container block={block}>
    <div className="text-2xl">{translate(props.block.title)} </div>
    <div className="mt-4 mb-5">{translate(props.block.subtitle)} </div>
    <a
        href={translate(props.block.fb_link)}
        className="mt-10 mb-2 pr-8 pt-10"
        target="_blank"
      ><FaFacebook className="inline mr-2"/>{translate(props.block.fb)}</a>
         <a
        href={translate(props.block.telegram_link)}
        className="pt-20"
        target="_blank"
      ><FaTelegram className="inline mr-2"/>{translate(props.block.telegram)}</a>

  </Container>


}