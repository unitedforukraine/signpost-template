import { blocks } from "./blocks"
import { DB } from "./db"
import isEqual from "lodash/isEqual"


const serverurl = "http://localhost:3000"
type Statuses = "initializing" | "ready"
let status: Statuses = "initializing"

export const app = {

  country: 0,
  logo: null as any,
  locale: "en-US", //current locale
  name: "Country Name",
  defaultLocale: "en-US", //default lang of the country
  db: new DB(),
  boot: false,

  statusText: "Initalizing",

  get status() {
    return status
  },
  set status(v: Statuses) {
    if (status === v) return
    console.log(`Status Changed to ${v}`)
    status = v
    app.update()
  },

  content: blocks,

  footer: {
    type: "footer",
    text: { "en-US": "Footer" },
    footerlinks: []
  } as BlockFooter,


  categories: {
    providers: {},
    categories: {},
    subCategories: {},
    populations: {},
    accesibility: {},
  } as Categories,

  update() {
    console.log("Update App: ", app)
    if (app.reactUpdate) app.reactUpdate()
  },

  reactUpdate: null as Function,

  async initialize() {
    if (app.boot) return
    app.boot = true

    const storageCountry = localStorage.getItem("country")
    const storageCategories = localStorage.getItem("categories")

    let c: Country = null
    let cats: Categories = null

    try { c = JSON.parse(storageCountry) } catch (error) { }
    try { cats = JSON.parse(storageCategories) } catch (error) { }

    if (!c) {

      console.log("Country not Saved. Loading...")

      c = await fetch(`${serverurl}/country/${app.country}`).then(r => r.json())
      localStorage.setItem("country", JSON.stringify(c))
      loadCountry(c)

      app.statusText = "Loading Categories"
      app.update()

      cats = await fetch(`${serverurl}/categories`).then(r => r.json())
      app.categories = cats
      localStorage.setItem("categories", JSON.stringify(cats))

      app.statusText = ""

      app.status = "ready"


    } else {

      loadCountry(c)
      app.status = "ready"

      //Background Update
      setTimeout(async () => {
        console.log("Updating Country and Categories...")
        const serverCountry = await fetch(`${serverurl}/country/${app.country}`).then(r => r.json())

        if (!isEqual(c, serverCountry)) {
          localStorage.setItem("country", JSON.stringify(serverCountry))
          loadCountry(serverCountry)
          app.update()
          console.log("Country Updated.")
        } else {
          console.log("Country Unchanged")
        }

        cats = await fetch(`${serverurl}/categories`).then(r => r.json())

        if (!isEqual(cats, app.categories)) {
          localStorage.setItem("categories", JSON.stringify(cats))
          app.categories = cats
          app.update()
          console.log("Categories Updated.")
        } else {
          console.log("Categories Unchanged")
        }

      }, 1)

    }

    //ToDo:
    // app.db.updateData()

  },

  async getService(id: number) {

  },


}

function loadCountry(c: Country) {
  if (!c) return
  app.country = c.id
  app.name = c.name
  app.locale ||= c.locale
  app.content = c.content || []
  app.defaultLocale = c.locale
  const footer = c.content.find(b => b.type === "footer")
  if (footer) app.footer = footer as BlockFooter
}

export function translate(t: LocalizableContent): string {
  if (!t) return ""
  if (typeof t === "string") return t
  if (typeof t === "object") return t[app.locale] || t["en-US"] || ""
  return ""
}

export async function sleep(ms = 1000) {
  return new Promise(a => setTimeout(a, ms))
}


interface Country {
  id?: number
  name?: string
  locale?: string
  content: Blocks[]
}