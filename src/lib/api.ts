// const serverurl = "http://localhost:3000"
const serverurl = "https://directus-qa-support.azurewebsites.net"

interface Doc {
  pageContent?: string
  metadata: {
    source?: string
    title?: string
    id?: number
    loc?: {
      lines?: {
        from?: number
        to?: number
      }
    }
  }
}

declare global {
  interface ChatMessage {
    type: "human" | "bot"
    message?: string
    docs?: Doc[]
    error?: string
  }
}


export const api = {

  async getCountry(id: number) {

    let c: Country = null

    try {
      c = await fetch(`${serverurl}/country/${id}`).then(r => r.json())
    } catch (error) {
      console.log("Error Loading Country", error)
    }

    return c
  },

  async getServices(id: number, since?: number, page?: number): Promise<Service[]> {

    let c: Service[] = null

    //ToDo: add page and since!

    try {
      c = await fetch(`${serverurl}/services/${id}`).then(r => r.json())
    } catch (error) {
      console.log("Error Loading Services", error)
    }

    return c
  },

  async getCategories() {

    let cats: Categories = null

    try {
      cats = await fetch(`${serverurl}/categories`).then(r => r.json())
    } catch (error) {
      console.log("Error Loading Categories", error)
    }

    return cats
  },

  async askbot(id: number, message: string) {

    let a: ChatMessage = null

    let options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    }


    try {
      a = await fetch(`${serverurl}/ai/${message}`, options).then(r => r.json())
    } catch (error) {
      console.log("Error Contacting Bot", error)
    }

    return a
  },


}