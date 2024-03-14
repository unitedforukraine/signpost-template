import { useParams } from "react-router-dom"
import { app, translate } from "../app"


export function Service() {

  let { id } = useParams()

  //ToDo: update the content in useEffect
  const s: Service = app.services[id]

  if (!s) {
    return <div>Service {id} not found</div>
  }


  const title = translate(s.name)
  const description = translate(s.description)

  return <div className={`py-16 w-full flex justify-center text-black bg-white h-full overflow-y-auto`}>
    <div className="sm:w-full px-4 md:w-2/3">
      <h1>{title}</h1>
      {s && <div className="service mt-10" dangerouslySetInnerHTML={{ __html: description }} />}
    </div>
  </div>

}