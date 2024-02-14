import { Link } from "react-router-dom"
import { app, translate } from "../app"


export function ServicesList() {

  const services = Object.values(app.services)

  return <div>
    {services.map(s => {
      return <Link key={s.id} to={`/service/${s.id}`} >
        <div>{translate(s.name)}</div>
      </Link>
    })}
  </div>
}