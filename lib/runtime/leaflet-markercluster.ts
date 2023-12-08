import { createPathComponent } from '@react-leaflet/core'
import type {
  LeafletContextInterface,
  LeafletElement,
} from '@react-leaflet/core'
import type { FeatureGroup, LeafletEventHandlerFn } from 'leaflet'
import 'leaflet'
import L from 'leaflet'
import 'leaflet.markercluster'

/**
 * React wrapper for 'leaflet.markercluster'.
 * This code is copied from https://www.npmjs.com/package/react-leaflet-markercluster
 * It removes dependencies on modules that are not compatible with Next.js.
 */
function createMarkerCluster(
  { ...props },
  context: LeafletContextInterface
): LeafletElement<FeatureGroup> {
  const clusterProps: Record<string, unknown> = {}
  const clusterEvents: Record<string, LeafletEventHandlerFn> = {}
  // Splitting props and events to different objects
  Object.entries(props)?.forEach(([propName, prop]) =>
    propName.startsWith('on')
      ? (clusterEvents[propName] = prop)
      : (clusterProps[propName] = prop)
  )
  const instance = new (L as any).MarkerClusterGroup(props)

  // Initializing event listeners
  Object.entries(clusterEvents)?.forEach(([eventAsProp, callback]) => {
    const clusterEvent = `cluster${eventAsProp.substring(2).toLowerCase()}`
    instance.on(clusterEvent, callback)
  })
  return {
    instance,
    context: {
      ...context,
      layerContainer: instance,
    },
  }
}

const MarkerClusterGroup = createPathComponent(createMarkerCluster)

export default MarkerClusterGroup
