import { Link } from "react-router-dom"
import { app, translate } from "../app"
import { Pagination } from 'antd'
import { useState } from "react"

const count = 10

const html2text = document.createElement('div')
html2text.hidden = true


export function ServicesList() {

  const services = Object.values(app.services) || []
  const [page, setPage] = useState(1)
  const visibleServices = services.slice((page - 1) * count, (page * count))

  const onPageChange = (page: number) => {
    setPage(page)
  }

  return <div>
    {visibleServices.map(s => <Service service={s} />)}
    <Pagination
      className="mt-8"
      defaultCurrent={1}
      total={services.length}
      onChange={onPageChange}
      hideOnSinglePage
      showSizeChanger={false}
      pageSize={count}
    />
  </div>
}


function Service(props: { service: Service }) {

  const { service: s } = props

  html2text.innerHTML = translate(s.description)
  const description = `${html2text.textContent.substring(0, 200)}...`


  return <Link key={s.id} to={`/service/${s.id}`} >
    <div className="text-black mb-6 hover:text-blue-500 transition-all" >
      <h2>{translate(s.name)}</h2>
      <div className="-mt-4 opacity-60">{description}</div>
      <div className="w-full border border-solid border-gray-300 mt-2"></div>
    </div>
  </Link>


}