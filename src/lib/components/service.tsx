import { useParams } from "react-router-dom"
import { app, translate } from "../app"


export function Service() {

  let { id } = useParams()

  const s = app.services[id]

  return <div>
    <div>Service {id}</div>
    {s && <h2>{translate(s.name)}</h2>}
  </div>

}