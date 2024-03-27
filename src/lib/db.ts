import Dexie from "dexie"
import { } from "./locale"
import { api } from "./api"
import { app } from "./app"

export class DB extends Dexie {
  services!: Dexie.Table<Service, number>
  providers!: Dexie.Table<Provider, number>

  constructor() {
    super("db")
    this.version(1).stores({
      services: 'id, date_created, date_updated',
      providers: 'id',
    })
    this.services = this.table("services")
    this.providers = this.table("providers")
  }

  async loadLocalServices(): Promise<number> {
    const dbs = (await this.services.toArray()) || []
    if (dbs.length > 0) {
      const r = dbs.reduce((a, b) => { a[b.id] = b; return a }, {})
      app.data.services = r as any
    }
    console.log("Local Services Found: ", dbs.length)
    return dbs.length
  }

  async loadLocalProviders(): Promise<number> {
    const dbs = (await this.providers.toArray()) || []
    if (dbs.length > 0) {
      const r = dbs.reduce((a, b) => { a[b.id] = b; return a }, {})
      app.data.categories.providers = r as any
    }
    console.log("Local Providers Found: ", dbs.length)
    return dbs.length
  }

  async updateServices() {
    console.log("Updating Database...")

    const dbs = (await this.services.toArray()) || []

    let lastUpdate = 0
    for (const s of dbs) {
      if (s.date_updated > lastUpdate) lastUpdate = s.date_updated
      if (s.date_created > lastUpdate) lastUpdate = s.date_created
    }
    console.log("Last Update: ", lastUpdate)
    const services = await api.getServices(app.country, lastUpdate)

    if (services) {
      console.log(`Saving ${services.length} Services`)
      for (const service of services) {
        await this.services.put(service, service.id)
      }
    }
    console.log("Database Updated!")
  }

  async updateProviders() {
    console.log("Updating Providers Database...")
    const providers = await api.getProviders(app.country)
    if (providers) {
      console.log(`Saving ${providers.length} Providers`)
      for (const provider of providers) {
        await this.providers.put(provider, provider.id)
      }
    }
    console.log("Providers Database Updated!")
  }

}

