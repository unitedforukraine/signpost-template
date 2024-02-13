import { Children } from "react"
import { app } from "../app"
import { BlockChannels, BlockImage, BlockInfo, BlockRichText, BlockServices, BlockText } from "."

export function Blocks() {

  const blocks = app.content || []

  const blockview = blocks.map((b, i) => {
    if (b.type === "text") return <BlockText key={b.sort} block={b as BlockText} />
    if (b.type === "richtext") return <BlockRichText key={b.sort} block={b as BlockRichText} />
    if (b.type === "services") return <BlockServices key={b.sort} block={b as BlockServices} />
    if (b.type === "channels") return <BlockChannels key={b.sort} block={b as BlockChannels} />
    if (b.type === "image") return <BlockImage key={b.sort} block={b as BlockImage} />
    if (b.type === "info") return <BlockInfo key={b.sort} block={b as BlockInfo} />
    return null
  })

  return <div className=" overflow-y-auto h-full w-full flex justify-center">
    <div>
      {blockview}
    </div>
  </div>


}