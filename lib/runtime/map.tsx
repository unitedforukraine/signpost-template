// This component renders a Leaflet map with Mapbox tiles to show the services. Each pin on the map corresponds to a service and when clicked on the title it redirects to a zendesk article
// It has functionality added to recenter automatically after each filtering, to render custom icons for the popups and to show the user position on the map.
import { Button } from 'antd'
import { LatLngExpression, Point, divIcon, latLngBounds } from 'leaflet'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'

import MarkerClusterGroup from './leaflet-markercluster'
import { ContactDropdown } from './contact-dropdown'
import { DirectusArticle, DirectusServiceCategory } from './directus'
import { Locale } from './locale'
import { MapCoordinates } from './search-input'

const LEAFLET_ATTRIBUTION =
  'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'

const MAPBOX_URL = `https://api.mapbox.com/styles/v1/signpostglobal/cl5vfirrc004l14qf16x17zzo/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`

// Values for the offset of the popup position (https://leafletjs.com/reference.html#point)
const POPUP_X_POSITION = 14
const POPUP_Y_POSITION = 2

export const stripHtmlTags = (html: string): string => {
  const regex =
    /<[^>]*>|&[^;]+;|<img\s+.*?>|<span\s+style="[^"]*">.*?<\/span>|&[A-Za-z]+;/g
  return html.replace(regex, '')
}

export interface PopupStrings {
  contactButtonLabel: string
  viewServiceLabel: string
}

export interface MapProps {
  services: DirectusArticle[]
  defaultCoords: LatLngExpression
  searchLocation: MapCoordinates | null
  userLocation?: LatLngExpression
  mapRadius?: number
  strings: PopupStrings
  currentLocale: Locale
}

interface CustomProps {
  coords: LatLngExpression
  markers: DirectusArticle[]
  searchLocation: MapCoordinates | null
}

const getServiceTranslation = (
  service: DirectusArticle,
  currentLocale: Locale
) => {
  const translation = service.translations
    .filter((x) => x.languages_id?.code === currentLocale.directus)
    ?.map((x) => {
      return {
        name: x.name,
        description: x.description,
      }
    })
  return translation.length ? translation[0] : service
}

export const getServiceName = (
  service: DirectusArticle,
  currentLocale: Locale
) => {
  const translation = getServiceTranslation(service, currentLocale)

  return translation.name
}

export const getServiceDesctiption = (
  service: DirectusArticle,
  currentLocale: Locale
) => {
  const translation = getServiceTranslation(service, currentLocale)

  return translation.description
}

export const Map = ({
  services = [],
  defaultCoords,
  searchLocation,
  userLocation,
  mapRadius,
  strings,
  currentLocale,
}: MapProps) => {
  const customMarkerIcon = (category?: DirectusServiceCategory) => {
    if (!category) {
      const iconMarkup = renderToStaticMarkup(
        <i className={`map-icon`} style={{ color: '#FFFFFF' }} />
      )
      return divIcon({
        html: iconMarkup,
        className: '',
      })
    } else {
      const iconMarkup = renderToStaticMarkup(
        <span
          className={`material-icons map-icon`}
          style={{ color: category?.Color }}
        >
          {category?.Icon}
        </span>
      )
      return divIcon({
        html: iconMarkup,
        className: '',
      })
    }
  }

  /* Component to use the hook useMap, witch can be used only on a descendant of <MapContainer>,
  to recenter the map automatically (https://react-leaflet.js.org/docs/api-map/#usemap) */
  const RecenterAutomatically = ({
    coords,
    markers,
    searchLocation,
  }: CustomProps) => {
    const map = useMap()
    useEffect(() => {
      // we set up the new coordinates for the center of the map and 6 as the value for the zoom
      if (searchLocation) {
        map.setView([searchLocation.lat, searchLocation.lon])
        if (searchLocation.bounds?.length) {
          const markerBounds = latLngBounds([
            { lat: searchLocation.bounds[1], lng: searchLocation.bounds[0] },
            { lat: searchLocation.bounds[3], lng: searchLocation.bounds[2] },
          ])
          markerBounds.isValid() && map.fitBounds(markerBounds)
        }
      } else {
        map.setView(coords, 6)
        const markerBounds = latLngBounds([])
        markers.forEach((marker) => {
          markerBounds.extend([
            marker.location.coordinates[1],
            marker.location.coordinates[0],
          ])
        })
        markerBounds.isValid() && map.fitBounds(markerBounds)
      }
    }, [coords, map, markers, searchLocation])
    return null
  }

  return (
    <>
      <MapContainer
        center={defaultCoords}
        scrollWheelZoom={false}
        style={{ height: 650, width: '100%', zIndex: 0 }}
      >
        <TileLayer attribution={LEAFLET_ATTRIBUTION} url={MAPBOX_URL} />
        <MarkerClusterGroup>
          {services
            ?.filter((x) => x?.location?.coordinates?.length > 1)
            .map((x) => (
              <Marker
                position={[
                  +x.location.coordinates[1],
                  +x.location.coordinates[0],
                ]}
                key={x.id}
                icon={customMarkerIcon(
                  x.categories.length
                    ? x.categories[0]?.service_categories_id
                    : undefined
                )}
              >
                <Popup offset={new Point(POPUP_X_POSITION, POPUP_Y_POSITION)}>
                  <div className="popup-content">
                    <div className="service-name">
                      <strong> {getServiceName(x, currentLocale)}</strong>
                    </div>
                    <div className="description">
                      {stripHtmlTags(
                        getServiceDesctiption(x, currentLocale) || ''
                      )?.slice(0, 100)}
                      ...
                    </div>
                    <div className="address">{x.address}</div>
                    <div className="popup-buttons">
                      <Link href={`/services/${x.id}`}>
                        <Button
                          className="view-button"
                          size="small"
                          shape="round"
                        >
                          {strings.viewServiceLabel}
                        </Button>
                      </Link>

                      <ContactDropdown
                        serviceId={x.id}
                        contactInfo={x.contactInfo}
                        strings={strings}
                      />
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>
        {userLocation && (
          <>
            <Circle
              center={userLocation}
              radius={10}
              className="custom-transparent-circle"
            />
            <CircleMarker
              center={userLocation}
              className="custom-circle-marker"
            >
              <Popup offset={[0, -10]}>My location</Popup>
            </CircleMarker>
          </>
        )}
        {mapRadius && userLocation && (
          <Circle
            center={userLocation}
            radius={mapRadius}
            color="blue"
            fillOpacity={0.2}
          />
        )}
        <RecenterAutomatically
          coords={defaultCoords}
          markers={services?.filter(
            (x) => x?.location?.coordinates?.length > 1
          )}
          searchLocation={searchLocation}
        />
      </MapContainer>
    </>
  )
}
