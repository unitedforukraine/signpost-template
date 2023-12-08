import React, { useCallback, useEffect, useState } from 'react'
import { Tabs, Typography } from 'antd'
import { getDistance } from 'geolib'
import { LatLngExpression } from 'leaflet'
import { DirectusAccessibility, DirectusArticle, DirectusPopulations, DirectusProvider, DirectusServiceCategory, DirectusServiceSubcategory, getAllAccessibilitiesOption, getAllPopulationsOption, getAllProvidersOption, getAllServicesTypeOption, } from './directus'
import { DistanceAwayStrings } from './distance-away'
import { Locale } from './locale'
import { PopupStrings } from './map'
import { Map as CustomMap } from './map'
import SearchInput, { MapCoordinates, SearchInputStrings, } from './search-input'
import ServiceList from './service-list'
import ShareButton, { ShareButtonStrings } from './share-button'
import TreeSelect, { MenuItem as CascaderItem } from './tree-select'

const { Title, Text } = Typography

export interface ServiceMapStrings {
  title: string
  description: string
  listTab: string
  mapTab: string
  serviceListStringOf: string
  serviceListStringServices: string
  allServicesTypeOption: string
  allProvidersOption: string
  allPopulationsOption: string
  allAccessibilitiesOption: string
  distanceAwayStrings: DistanceAwayStrings
  popupStrings: PopupStrings
  labelSearchInput: SearchInputStrings
  labelServicesTypes?: string
  labelProvider?: string
  labelPopulations?: string
  labelAccessibility?: string
  noCityString?: string
}

export interface ServiceMapProps {
  services: DirectusArticle[]
  // Service map string translations.
  strings: ServiceMapStrings
  defaultCoords: LatLngExpression
  shareButton: ShareButtonStrings
  serviceTypes?: DirectusServiceCategory[]
  providers?: DirectusProvider[]
  accessibility?: DirectusAccessibility[]
  populations?: DirectusPopulations[]
  currentLocale: Locale
  showMap?: boolean
}

enum filterType {
  serviceTypes = 'serviceTypes',
  provider = 'provider',
  populations = 'populations',
  accessibility = 'accessibility',
}

export default function ServiceMap({
  services,
  strings,
  defaultCoords,
  shareButton,
  serviceTypes,
  providers,
  accessibility,
  populations,
  currentLocale,
  showMap = true,
}: ServiceMapProps) {
  const [selectedFilterValues, setSelectedFilterValues] = useState({
    serviceTypes: [[-1]],
    provider: [[-1]],
    populations: [[-1]],
    accessibility: [[-1]],
  })
  const [filteredServices, setFilteredServices] =
    useState<DirectusArticle[]>(services)
  const [mapCoordinates, setMapCoordinates] = useState<MapCoordinates | null>(
    null
  )
  const [activeFilters, setActiveFilters] = useState<
    { type: filterType; value: number[][] }[]
  >([])
  const [userCoords, setUserCoords] = useState<LatLngExpression>()
  const [mapRadius, setMapRadius] = useState<number>()

  const handleCoordinatesUpdate = (coordinates: MapCoordinates | null) => {
    setMapCoordinates(coordinates)
  }

  const mapServiceDataCascader = <T extends DirectusServiceCategory | DirectusServiceSubcategory>(category: T): CascaderItem => {

    const cascaderItem: CascaderItem = {
      value: category.id,
      label: '',
    }

    if ('services_subcategories' in category) {
      const translation = category.Translations?.filter((x) => x.languages_code?.code === currentLocale.directus) || []
      cascaderItem.label = translation.length ? translation[0]?.Name : category?.Name
      if (category?.services_subcategories?.length > 0) {
        const children = category.services_subcategories.filter((x) => !!x.services_subcategories_id)
        cascaderItem.children = children.map((x) => mapServiceDataCascader(x.services_subcategories_id))
      }
    } else {
      const translation = category.translations?.filter((x) => x.languages_code === currentLocale.directus) || []
      cascaderItem.label = translation.length ? translation[0]?.name : category?.name
    }

    return cascaderItem
  }

  const mapProviderDataCascader = (provider: DirectusProvider[] = []): CascaderItem[] => {

    const filteredProviders: number[] = []

    if (services.length) {
      services.forEach((x) => {
        if (!filteredProviders.includes(x.provider?.id))
          filteredProviders.push(x.provider?.id)
      })
    }

    const tmpprovider = provider
      .filter((x) => filteredProviders.includes(x.id) || x.id === -1)
      .sort((a, b) => a.name?.normalize().localeCompare(b.name?.normalize()))

    tmpprovider.unshift(getAllProvidersOption(strings.allProvidersOption))

    return tmpprovider.map((x) => {
      const translation = x.translations.filter(
        (y) => y.languages_code?.code === currentLocale.directus
      )
      return {
        value: x.id,
        label: translation.length ? translation[0]?.name : x.name,
      }
    })
  }

  const mapAccessibilityCascader = (
    items: DirectusAccessibility[] = []
  ): CascaderItem[] => {
    return items.map((x) => {
      const translation = x.translations.filter(
        (y) => y.languages_code?.code === currentLocale.directus
      )
      return {
        value: x.id,
        label: translation.length
          ? translation[0].Accessibility_Name
          : x.Accessibility_Name,
      }
    })
  }

  const mapPopulationsCascader = (
    items: DirectusPopulations[] = []
  ): CascaderItem[] => {
    return items.map((x) => {
      const translation = x.translations.filter(
        (y) => y.languages_code?.code === currentLocale.directus
      )
      return {
        value: x.id,
        label: translation.length
          ? translation[0]?.Populations_Served
          : x.Population_Served,
      }
    })
  }

  const handleDistanceAwayChange = (value: number) => {
    if (!userCoords) return
    if (value === 0) {
      setFilteredServices(services)
    } else {
      let filteredData = [...services] as DirectusArticle[]

      filteredData = filteredData
        .filter((x) => x?.location?.coordinates?.length)
        .filter((service) => {
          const serviceDistance = getDistance(userCoords, {
            latitude: service.location.coordinates[0],
            longitude: service.location.coordinates[1],
          })
          return serviceDistance <= value * 1000
        })

      setFilteredServices(filteredData)
      setMapRadius(value * 1000)
    }
  }

  const handleCascaderChange = (value: number[][], type: filterType) => {
    updateActiveFilters(type, value)
  }

  const handleProviderChange = useCallback(
    (value: number[][], services: DirectusArticle[]) => {
      if (!value.length || value.flat()[value.flat().length - 1] === -1)
        return services

      const providerIDs = new Set(value.flat())
      services = services.filter((x) => providerIDs.has(x?.provider?.id))
      return services
    },
    []
  )

  const handleAccessibilityChange = useCallback(
    (value: number[][], services: DirectusArticle[]) => {
      if (!value.length || value.flat()[value.flat().length - 1] === -1)
        return services

      const accessibilityIDs = new Set(value.flat())
      services = services.filter((x) => {
        return x.Accessibility.some((a) =>
          accessibilityIDs.has(a.accessibility_id)
        )
      })
      return services
    },
    []
  )

  const handlePopulationsChange = useCallback(
    (value: number[][], services: DirectusArticle[]) => {
      if (!value.length || value.flat()[value.flat().length - 1] === -1)
        return services

      const populationsId = new Set(value.flat())
      services = services.filter((x) => {
        return x.Populations.some((a) => populationsId.has(a.populations_id))
      })
      return services
    },
    []
  )

  const handleServiceTypeChange = useCallback(
    (value: number[][], services: DirectusArticle[]) => {
      const categoryMap = new Map<number, boolean>()
      const subcategoryMap = new Map<number, boolean>()

      if (!value.length || value.flat()[value.flat().length - 1] === -1)
        return services

      for (const criteria of value) {
        const [categoryId, ...subcategoryIds] = criteria
        categoryMap.set(categoryId, true)
        for (const subcategoryId of subcategoryIds) {
          subcategoryMap.set(subcategoryId, true)
        }
      }

      services = services.filter((data) => {
        return (
          data.categories.some((category) =>
            categoryMap.has(category.service_categories_id.id)
          ) ||
          data.subcategories.some((subcategory) =>
            subcategoryMap.has(subcategory.services_subcategories_id)
          )
        )
      })

      return services
    },
    []
  )

  const updateActiveFilters = (type: filterType, filterValue: number[][]) => {
    if (!filterValue.length) {
      setActiveFilters((prevFilters) =>
        prevFilters.filter((filter) => filter.type !== type)
      )
    } else {
      setActiveFilters((prevFilters) => {
        const filterIndex = prevFilters.findIndex(
          (filter) => filter.type === type
        )
        const updatedFilters = [...prevFilters]

        if (filterIndex !== -1) {
          // Filter already exists, update its value
          updatedFilters[filterIndex].value = filterValue
        } else {
          // Filter doesn't exist, add it
          updatedFilters.push({ type: type, value: filterValue })
        }

        return updatedFilters
      })
    }
  }

  // Function to check if the first sub-array contains -1 and remove it
  const filterFirstSubArray = (arrayOfArrays: number[][]): number[][] => {
    const firstSubArray = arrayOfArrays[0]

    // Check if the first sub-array contains -1 and remove it using filter
    const filteredFirstSubArray = firstSubArray.filter((num) => num !== -1)

    return [filteredFirstSubArray, ...arrayOfArrays.slice(1)]
  }

  const handleSelectedFilters = (value: number[][], filter: filterType) => {
    if (!value.length || value.flat()[value.flat().length - 1] === -1) {
      setSelectedFilterValues((prevValues) => ({
        ...prevValues,
        [filter]: [[-1]],
      }))
    } else {
      setSelectedFilterValues((prevValues) => ({
        ...prevValues,
        [filter]: filterFirstSubArray(value),
      }))
    }
  }

  const success = (pos: GeolocationPosition) => {
    const crd = pos.coords
    setUserCoords([crd.latitude, crd.longitude])
  }

  useEffect(() => {
    const setUserLocation = async () => {
      if (navigator.geolocation) {
        navigator.permissions
          .query({ name: 'geolocation' })
          .then(function (result) {
            if (result.state === 'granted') {
              navigator.geolocation.getCurrentPosition(success)
            } else if (result.state === 'prompt') {
              navigator.geolocation.getCurrentPosition(success)
            }
          })
      }
    }

    if (!serviceTypes?.length || serviceTypes[0].id !== -1) {
      serviceTypes?.unshift(
        getAllServicesTypeOption(strings.allServicesTypeOption)
      )
    }
    if (!populations?.length || populations[0].id !== -1) {
      populations?.unshift(
        getAllPopulationsOption(strings.allPopulationsOption)
      )
    }
    if (!accessibility?.length || accessibility[0].id !== -1) {
      accessibility?.unshift(
        getAllAccessibilitiesOption(strings.allAccessibilitiesOption)
      )
    }
    setUserLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let filteredData = [...services].filter((service) => {
      const translation = service.translations.find(
        (x) => x.languages_id?.code === currentLocale.directus
      )
      return translation // Only keep services with a translation in the current locale
    })

    for (const filter of activeFilters) {
      if (filter.type === filterType.provider) {
        filteredData = handleProviderChange(filter.value, filteredData)
      } else if (filter.type === filterType.accessibility) {
        filteredData = handleAccessibilityChange(filter.value, filteredData)
      } else if (filter.type === filterType.populations) {
        filteredData = handlePopulationsChange(filter.value, filteredData)
      } else if (filter.type === filterType.serviceTypes) {
        filteredData = handleServiceTypeChange(filter.value, filteredData)
      }
    }

    setFilteredServices(filteredData)
  }, [
    activeFilters,
    handleAccessibilityChange,
    handlePopulationsChange,
    handleProviderChange,
    handleServiceTypeChange,
    services,
    currentLocale,
  ])

  return (
    <div className="service-map-wrapper">
      <div className="title-row">
        <Title level={3} className="service-map-title">
          {strings.title}
        </Title>
        <Text type="secondary" className="service-map-description">
          {strings.description}
        </Text>
      </div>

      <div className="flex items-center justify-center mt-4 w-full">
        <SearchInput
          strings={strings.labelSearchInput}
          onCoordinatesUpdate={handleCoordinatesUpdate}
          size="large"
          defaultCoords={defaultCoords}
        />
      </div>

      <div className="tree-select-row items-center  justify-between">
        <div className="flex flex-wrap overflow-hidden -mx-2 w-full">
          <TreeSelect
            label={strings.labelServicesTypes || 'Services Types'}
            items={serviceTypes?.map((x) => mapServiceDataCascader(x)) ?? []}
            className="w-full overflow-hidden px-2 sm:w-1/2 mt-4"
            onChange={(value) => {
              handleSelectedFilters(value, filterType.serviceTypes)
              handleCascaderChange(value, filterType.serviceTypes)
            }}
            value={selectedFilterValues.serviceTypes}
            defaultValue={[[-1]]}
          />
          <TreeSelect
            label={strings.labelProvider || 'Provider'}
            items={mapProviderDataCascader(providers)}
            className="w-full overflow-hidden px-2 sm:w-1/2 mt-4"
            onChange={(value) => {
              handleSelectedFilters(value, filterType.provider)
              handleCascaderChange(value, filterType.provider)
            }}
            value={selectedFilterValues.provider}
            defaultValue={[[-1]]}
          />

          <TreeSelect
            label={strings.labelPopulations || 'Populations'}
            items={mapPopulationsCascader(populations)}
            className="w-full overflow-hidden px-2 sm:w-1/2 mt-4"
            onChange={(value) => {
              handleSelectedFilters(value, filterType.populations)
              handleCascaderChange(value, filterType.populations)
            }}
            value={selectedFilterValues.populations}
            defaultValue={[[-1]]}
          />
          <TreeSelect
            label={strings.labelAccessibility || 'Accessibility'}
            items={mapAccessibilityCascader(accessibility)}
            className="w-full overflow-hidden px-2 sm:w-1/2 mt-4"
            onChange={(value) => {
              handleSelectedFilters(value, filterType.accessibility)
              handleCascaderChange(value, filterType.accessibility)
            }}
            value={selectedFilterValues.accessibility}
            defaultValue={[[-1]]}
          />
        </div>
      </div>
      {showMap && (
        <Tabs
          defaultActiveKey="1"
          className="service-map-tabs"
          items={[
            {
              label: strings.mapTab,
              key: '1',
              children: (
                <CustomMap
                  services={filteredServices}
                  defaultCoords={defaultCoords}
                  searchLocation={mapCoordinates}
                  userLocation={userCoords}
                  mapRadius={mapRadius}
                  strings={strings.popupStrings}
                  currentLocale={currentLocale}
                />
              ),
            },
            {
              label: strings.listTab,
              key: '2',
              children: (
                <ServiceList
                  services={filteredServices}
                  currentLocale={currentLocale}
                  strings={{
                    resultSummaryStringTemplate: (
                      firstOnPage: number,
                      lastOnPage: number,
                      totalCount: number
                    ) => {
                      return `${firstOnPage} - ${lastOnPage} ${strings.serviceListStringOf} ${totalCount} ${strings.serviceListStringServices}`
                    },
                  }}
                />
              ),
            },
          ]}
        />
      )}
      {!showMap && (
        <ServiceList
          services={filteredServices}
          currentLocale={currentLocale}
          strings={{
            resultSummaryStringTemplate: (
              firstOnPage: number,
              lastOnPage: number,
              totalCount: number
            ) => {
              return `${firstOnPage} - ${lastOnPage} ${strings.serviceListStringOf} ${totalCount} ${strings.serviceListStringServices}`
            },
          }}
        />
      )}
      <div className="buttons-container">
        <ShareButton {...shareButton} />
      </div>
    </div>
  )
}
