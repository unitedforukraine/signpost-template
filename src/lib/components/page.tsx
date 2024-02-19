import { CSSProperties } from "react"
import { AIBot, Blocks, Footer, Header, app } from ".."
import { BrowserRouter, createBrowserRouter, Link, Route, RouterProvider, Routes } from "react-router-dom"
import { Service } from "./service"


export function Page() {

  if (app.status != "ready") return null
  const styles: CSSProperties = {
    gridTemplateRows: "auto 1fr",
  }

  if (app.color) styles.color = app.color
  if (app.bgcolor) styles.backgroundColor = app.bgcolor

  return <div className="grid" style={styles}>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Blocks />} />
        <Route path="/service/:id?" element={<Service />} />
        <Route path="/signpostbot" element={<AIBot />} />
      </Routes>
    </BrowserRouter>
  </div>

  // return <div className="h-full" style={styles}>
  //   <BrowserRouter>
  //     <Header />
  //     <Routes>
  //       <Route path="/" element={<Blocks />} />
  //       <Route path="/service/:id?" element={<Service />} />
  //       <Route path="/signpostbot" element={<AIBot />} />
  //     </Routes>
  //   </BrowserRouter>
  // </div>

}

