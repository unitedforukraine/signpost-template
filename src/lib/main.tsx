import React, { useEffect } from "react"
import { Page, Splash, useForceUpdate } from "./components"
import { app } from "./app"

export function App() {

  app.reactUpdate = useForceUpdate()

  app.initialize().then(() => {
    console.log("Initialized")
  })

  return <React.StrictMode>
    <div className="w-full h-full">
      <Splash />
      <Page />
    </div>
  </React.StrictMode>
}

