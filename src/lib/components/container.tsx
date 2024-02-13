import { CSSProperties } from "react"


export function Container(props: { children: React.ReactNode, block?: Block }) {

  const { block } = props

  const styles: CSSProperties = {
    // fontSize: block && block.textsize ? `${block.textsize}%` : "100%",
    // color: block && block.textcolor ? block.textcolor : "inherit",
    // backgroundColor: block && block.bgcolor ? block.bgcolor : "inherit",
    // fontWeight: block && block.fontweight ? `${block.fontweight}` : "inherit",
  }

  if (block) {
    if (block.textsize) styles.fontSize = `${block.textsize}%`
    if (block.textcolor) styles.color = block.textcolor
    if (block.bgcolor) styles.backgroundColor = block.bgcolor
    if (block.fontweight) styles.fontWeight = block.fontweight
  }


  return <div className="py-16 w-full flex items-center justify-center" style={styles}>
    <div className="sm:w-full px-4 md:w-2/3">
      {props.children}
    </div>
  </div>

}