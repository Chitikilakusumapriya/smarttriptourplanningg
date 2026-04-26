import React from 'react'
import { useNavigate } from 'react-router-dom'
import { GradientButton } from '@/components/ui/gradient-button'
// Load Leaflet (JS + CSS) from CDN so no npm dependency is required
declare global {
  interface Window { L?: any }
}

function ensureLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve()
    // CSS
    const existingCss = document.querySelector('link[data-leaflet-css="1"]') as HTMLLinkElement | null
    if (!existingCss) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      link.dataset.leafletCss = '1'
      document.head.appendChild(link)
    }
    // JS
    const existing = document.querySelector('script[data-leaflet-js="1"]') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Leaflet')))
      return
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    script.crossOrigin = ''
    script.async = true
    script.defer = true
    script.dataset.leafletJs = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Leaflet'))
    document.head.appendChild(script)
  })
}

// Geocode a free-form address using Nominatim (OpenStreetMap)
async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=0`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) return null
  const data = (await res.json()) as Array<{ lat: string; lon: string }>
  if (!data?.length) return null
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
}

// Request a route from OSRM public demo server
async function routeViaOSRM(coords: Array<{ lat: number; lon: number }>): Promise<{ geometry: any; distance: number; duration: number } | null> {
  if (coords.length < 2) return null
  const coordStr = coords.map(c => `${c.lon},${c.lat}`).join(';')
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  if (!data?.routes?.length) return null
  return { geometry: data.routes[0].geometry, distance: data.routes[0].distance, duration: data.routes[0].duration }
}

export default function PassengerPlanner() {
  const nav = useNavigate()
  const mapRef = React.useRef<HTMLDivElement | null>(null)
  const map = React.useRef<any>(null)
  const routeLayer = React.useRef<any>(null)
  const markerLayer = React.useRef<any>(null)

  const [leafletReady, setLeafletReady] = React.useState(false)

  const [pickup, setPickup] = React.useState('')
  const [destination, setDestination] = React.useState('')
  const [stops, setStops] = React.useState<string[]>([])
  const [newStop, setNewStop] = React.useState('')
  const [distanceText, setDistanceText] = React.useState<string>('')
  const [durationText, setDurationText] = React.useState<string>('')
  const [loadingRoute, setLoadingRoute] = React.useState(false)

  React.useEffect(() => {
    ensureLeaflet().then(() => setLeafletReady(true)).catch(() => setLeafletReady(false))
  }, [])

  React.useEffect(() => {
    if (!leafletReady || !mapRef.current || map.current) return
    const L = window.L
    map.current = L.map(mapRef.current).setView([28.6139, 77.2090], 12) // New Delhi center
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.current)
    markerLayer.current = L.layerGroup().addTo(map.current)
    routeLayer.current = L.geoJSON(null, { style: { color: '#22d3ee', weight: 5 } }).addTo(map.current)
  }, [leafletReady])

  const addStop = () => {
    if (!newStop.trim()) return
    setStops((prev) => [...prev, newStop.trim()])
    setNewStop('')
  }

  const removeStop = (idx: number) => {
    setStops((prev) => prev.filter((_, i) => i !== idx))
  }

  const computeRoute = async () => {
    if (!pickup.trim() || !destination.trim() || !leafletReady) return
    setLoadingRoute(true)
    setDistanceText('')
    setDurationText('')
    const L = window.L
    try {
      // Geocode all points: pickup, stops..., destination
      const pointsText = [pickup, ...stops, destination]
      const coords: Array<{ lat: number; lon: number } | null> = await Promise.all(pointsText.map(geocodeAddress))
      if (coords.some(c => !c)) throw new Error('Could not locate one or more addresses')
      const valid = coords as Array<{ lat: number; lon: number }>

      // Request OSRM route
      const route = await routeViaOSRM(valid)
      if (!route) throw new Error('No route found')

      // Clear existing layers
      markerLayer.current.clearLayers()
      routeLayer.current.clearLayers()

      // Add markers: pickup (green), stops (orange), destination (red)
      const [first, ...rest] = valid
      const last = rest.pop()!
      const stopMiddle = rest
      L.marker([first.lat, first.lon], { title: 'Pickup' }).addTo(markerLayer.current)
      stopMiddle.forEach((s, i) => {
        L.marker([s.lat, s.lon], { title: `Stop ${i + 1}` }).addTo(markerLayer.current)
      })
      L.marker([last.lat, last.lon], { title: 'Destination' }).addTo(markerLayer.current)

      // Draw route
      routeLayer.current.addData(route.geometry)

      // Fit bounds to route
      const bounds = L.geoJSON(route.geometry).getBounds()
      map.current.fitBounds(bounds, { padding: [24, 24] })

      // Distance in meters -> km
      const km = route.distance / 1000
      setDistanceText(`${km.toFixed(2)} km`)
      // Duration in seconds -> h m (rounded to minutes)
      const minutesTotal = Math.round(route.duration / 60)
      const hours = Math.floor(minutesTotal / 60)
      const minutes = minutesTotal % 60
      const parts: string[] = []
      if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`)
      parts.push(`${minutes} min`)
      setDurationText(parts.join(' '))
    } catch (err: any) {
      setDistanceText(err?.message || 'Could not compute route. Check addresses.')
      setDurationText('')
    } finally {
      setLoadingRoute(false)
    }
  }

  const goToCreateTrip = () => {
    nav('/passenger/trip/create', {
      state: {
        pickup,
        destination,
        stops,
      },
    })
  }

  return (
    <div className={"relative min-h-screen p-4 flex items-stretch justify-center"}> 
      <div className="w-full grid md:grid-cols-5 gap-4">
        {/* Sidebar form */}
        <div className="md:col-span-2 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-4 text-white space-y-4">
          <h1 className="text-2xl font-semibold">Passenger Trip Planner</h1>
          <p className="text-white/80 text-sm">Enter pickup, destination and optional stops. Then view the route and distance on the map.</p>

          {!leafletReady && (
            <div className="text-amber-200 text-sm">Loading map libraries…</div>
          )}

          <div>
            <label className="block text-sm mb-1">Pickup</label>
            <input
              className="w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Pickup address"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Destination</label>
            <input
              className="w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="Destination address"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Add stop</label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-md bg-white/20 border border-white/30 px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="Stop address"
                value={newStop}
                onChange={(e) => setNewStop(e.target.value)}
              />
              <GradientButton
                type="button"
                onClick={addStop}
                className="px-3 py-2 text-white font-medium"
              >
                Add
              </GradientButton>
            </div>

            {stops.length > 0 && (
              <ul className="mt-3 space-y-2">
                {stops.map((s, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-white/10 rounded-md px-3 py-2">
                    <span className="truncate">{s}</span>
                    <GradientButton
                      type="button"
                      className="text-sm px-2 py-1"
                      onClick={() => removeStop(idx)}
                    >
                      Remove
                    </GradientButton>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <GradientButton
            type="button"
            onClick={computeRoute}
            disabled={!leafletReady || !pickup || !destination || loadingRoute}
            className="w-full"
          >
            {loadingRoute ? 'Calculating…' : 'Show Route'}
          </GradientButton>

          <GradientButton
            type="button"
            onClick={goToCreateTrip}
            className="mt-2 w-full"
          >
            Plan a Trip
          </GradientButton>

          <GradientButton
            type="button"
            onClick={() => nav('/passenger/track')}
            className="mt-2 w-full"
          >
            Track
          </GradientButton>

          <div className="text-sm text-white/90">
            <span className="font-medium">Total distance:</span> {distanceText || '—'}
          </div>
          <div className="text-sm text-white/90">
            <span className="font-medium">Estimated time:</span> {durationText || '—'}
          </div>
        </div>

        {/* Map container */}
        <div className="md:col-span-3 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md overflow-hidden">
          <div ref={mapRef} className="w-full h-[60vh] md:h-full" />
        </div>
      </div>
    </div>
  )
}
