import { CSSProperties } from "react"
import { app } from "../app"
import { Link } from "react-router-dom"


export function Header() {

  const styles: CSSProperties = {}

  if (app.header.color) styles.color = app.header.color
  if (app.header.bgcolor) styles.backgroundColor = app.header.bgcolor

  return <div className="h-10 flex p-4 uppercase text-sm tracking-wide" style={styles}>
    <div className="">
      <Link to={"/"}>
        <img src={app.logo} height={40} />
      </Link>
    </div>
    <div className="flex-grow"></div>
    <div className="flex gap-4">
      <div className="">Home</div>
      <div className="">Services</div>
      <div className="">Information <span className="text-[0.60rem]">▼</span></div>
      <div className="">About <span className="text-[0.60rem]">▼</span></div>
      <div className="">English <span className="text-[0.60rem]">▼</span></div>
    </div>
  </div>
}

