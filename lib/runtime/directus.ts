import { Auth, Directus, TypeMap } from '@directus/sdk'

import { directusWithRetry } from './fetch'


console.log(" 🚀 ~ file: directus.ts ~ line 10 ~ directusWithRetry", directusWithRetry)


export interface Language {
  code: string
  direction: string
  name: string
}

export interface Hours {
  Day: string
  close: string
  open: string
}

export interface ContactInfo {
  channel: string
  contact_details: string
}

export interface Location {
  type: string
  coordinates: number[]
}

export interface Country {
  date_created: string
  date_updated: string
  id: number
  instance: number
  language: string
  name: string
  oldid: number
  providers_n: []
  transifex_project: string
  translations: {
    id: number
    countries_n_id: number
    languages_code: Language
    name: string
  }[]
}

export interface DirectusAccessibility {
  id: number
  Accessibility_Name: string
  Definition: string
  translations: {
    id: number
    accesibility_id: number
    languages_code: Language
    Accessibility_Name: string
    Definition: string
  }[]
}

export interface DirectusArticle {
  Accessibility: {
    accessibility_id: number
  }[]
  Files: string
  Physical_Location: boolean
  Populations: {
    populations_id: number
  }[]
  addHours: Hours[]
  address: string
  categories: {
    service_categories_id: DirectusServiceCategory
  }[]
  city: number
  contactEmail: string
  contactInfo: ContactInfo[]
  contactLastName: string
  contactName: string
  contactPhone: string
  contactTitle: string
  country: number
  date_created: string
  date_updated: string
  description: string
  form: []
  headerimage: string
  id: number
  location: Location
  name: string
  oldid: number
  provider: DirectusProvider
  region: number
  secondaryEmail: string
  secondaryLastName: string
  secondaryName: string
  secondaryPhone: string
  secondaryTitle: string
  source: string
  status: string
  subcategories: {
    services_subcategories_id: number
  }[]
  translations: {
    id: number
    articles_id: DirectusArticle
    languages_id: Language
    name: string
    description: string
  }[]
  user_created: string
  user_updated: string
}

export interface DirectusPopulations {
  id: number
  Population_Served: string
  Visible: boolean
  Definition: string
  translations: {
    id: number
    populations_id: number
    languages_code: Language
    Populations_Served: string
    Definition: string
  }[]
}

export interface DirectusServiceSubcategory {
  id: number
  name: string
  description: string
  translations: {
    id: number
    service_subcategories_id: number
    languages_code: string
    name: string
    Description: string
  }[]
  categories: {
    id: number
    service_categories_id: DirectusServiceCategory
    services_subcategories_id: DirectusServiceSubcategory
  }[]
}

export interface DirectusServiceCategory {
  id: number
  Name: string
  Description: string
  Translations: {
    id: number
    service_categories_id: number
    languages_code: Language
    Name: string
    Description: string
  }[]
  Icon: string
  status: string
  date_created: string
  date_updated: string
  oldid: number
  Color: string
  services_subcategories: {
    id: number
    service_categories_id: DirectusServiceCategory
    services_subcategories_id: DirectusServiceSubcategory
  }[]
}

export interface DirectusProvider {
  id: number
  status: string
  country?: Country
  category: number
  name: string
  description: string
  address: string
  translations: {
    id: number
    providers_n_id: number
    languages_code: Language
    name: string
    description: string
  }[]
  date_created: string
  date_updated: string
  oldid: number
}

interface ArticleFilters {
  country: number
  status: string
  translations?: {
    languages_id: {
      code: string
    }
  }
}

export async function getDirectusArticles(
  country: number,
  connection: Directus<TypeMap, Auth>,
  locale?: string
): Promise<DirectusArticle[]> {
  try {
    return directusWithRetry(async () => {
      const filters: ArticleFilters = {
        country: country,
        status: 'published',
      }

      if (locale) {
        filters.translations = {
          languages_id: {
            code: locale,
          },
        }
      }
      const response = await connection.items('articles').readByQuery({
        limit: -1,
        fields: [
          'provider.id',
          'Accessibility.accessibility_id',
          'Populations.populations_id',
          'categories.service_categories_id.id',
          'categories.service_categories_id.Icon',
          'categories.service_categories_id.Color',
          'categories.service_categories_id.date_created',
          'subcategories.services_subcategories_id',
          'translations.*',
          'translations.languages_id.code',
          'country',
          'address',
          'contactInfo.*',
          'description',
          'name',
          '*',
        ],
        filter: filters,
      })

      return response.data as DirectusArticle[]
    })
  } catch (error) {
    console.error('Error fetching Directus articles: ', error)
    throw error
  }
}

export async function getDirectusArticle(
  id: number,
  connection: Directus<TypeMap, Auth>
): Promise<DirectusArticle> {
  try {
    return directusWithRetry(async () => {
      const response = await connection.items('articles').readOne(id, {
        fields: [
          '*',
          'provider.*',
          'translations.*',
          'translations.languages_id.code',
        ],
      })

      return response as DirectusArticle
    })
  } catch (error) {
    console.error('Error fetching Directus articles: ', error)
    throw error
  }
}

export async function getDirectusPopulationsServed(
  connection: Directus<TypeMap, Auth>
): Promise<DirectusPopulations[]> {
  try {
    return directusWithRetry(async () => {
      const response = await connection.items('populations').readByQuery({
        limit: -1,
        fields: ['*', 'translations.*', 'translations.languages_code.code'],
        filter: { Visible: true },
      })

      return response.data as DirectusPopulations[]
    })
  } catch (error) {
    console.error('Error fetching Directus populations served: ', error)
    throw error
  }
}

export async function getDirectusServiceCategories(
  connection: Directus<TypeMap, Auth>
): Promise<DirectusServiceCategory[]> {
  try {
    return directusWithRetry(async () => {
      const response = await connection
        .items('service_categories')
        .readByQuery({
          limit: -1,
          fields: [
            'Color',
            'Description',
            'Icon',
            'Name',
            'Translations.*',
            'Translations.languages_code.code',
            'services_subcategories.services_subcategories_id.*',
            'services_subcategories.services_subcategories_id.translations.*',
            'id',
          ],
        })

      return response.data as DirectusServiceCategory[]
    })
  } catch (error) {
    console.error('Error fetching Directus service categories: ', error)
    throw error
  }
}

export async function getDirectusServiceSubcategories(
  connection: Directus<TypeMap, Auth>
): Promise<DirectusServiceSubcategory[]> {
  try {
    return directusWithRetry(async () => {
      const response = await connection
        .items('services_subcategories')
        .readByQuery({
          limit: -1,
          fields: ['*', 'categories.*.*', 'translations.*.*'],
        })

      return response.data as DirectusServiceSubcategory[]
    })
  } catch (error) {
    console.error('Error fetching Directus service subcategories: ', error)
    throw error
  }
}

export async function getDirectusProviders(
  connection: Directus<TypeMap, Auth>,
  country: number
): Promise<DirectusProvider[]> {
  try {
    return directusWithRetry(async () => {
      const response = await connection.items('providers_n').readByQuery({
        limit: -1,
        fields: [
          'id',
          'address',
          'name',
          'description',
          'category',
          'translations.*',
          'translations.languages_code.code',
        ],
        filter: {
          country: country,
        },
      })

      return response.data as DirectusProvider[]
    })
  } catch (error) {
    console.error('Error fetching Directus providers: ', error)
    throw error
  }
}

export async function getDirectusAccessibility(
  connection: Directus<TypeMap, Auth>
): Promise<DirectusAccessibility[]> {
  try {
    return directusWithRetry(async () => {
      const response = await connection.items('accessibility').readByQuery({
        limit: -1,
        fields: [
          'Accessibility_Name',
          'Definition',
          'id',
          'translations.*',
          'translations.languages_code.code',
        ],
      })

      return response.data as DirectusAccessibility[]
    })
  } catch (error) {
    console.error('Error fetching Directus accessibility: ', error)
    throw error
  }
}

export function getAllServicesTypeOption(
  Name: string
): DirectusServiceCategory {
  return {
    id: -1,
    Name,
    Description: '',
    Translations: [],
    Icon: '',
    status: '',
    date_created: '',
    date_updated: '',
    oldid: 0,
    Color: '',
    services_subcategories: [],
  }
}

export function getAllProvidersOption(name: string): DirectusProvider {
  return {
    id: -1,
    status: '',
    category: 0,
    name,
    description: '',
    address: '',
    translations: [],
    date_created: '',
    date_updated: '',
    oldid: -1,
  }
}

export function getAllPopulationsOption(name: string): DirectusPopulations {
  return {
    id: -1,
    Population_Served: name,
    Visible: true,
    Definition: '',
    translations: [],
  }
}

export function getAllAccessibilitiesOption(
  name: string
): DirectusAccessibility {
  return {
    id: -1,
    Accessibility_Name: name,
    Definition: '',
    translations: [],
  }
}
