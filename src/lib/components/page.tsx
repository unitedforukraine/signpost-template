import { Blocks, Footer, Header, app } from ".."

export function Page() {

  if (app.status != "ready") return null

  return <div className="h-full">
    <Header />
    <Blocks />
    <Footer />
  </div>

}

