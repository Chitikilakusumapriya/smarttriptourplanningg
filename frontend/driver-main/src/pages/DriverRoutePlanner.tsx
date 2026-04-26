import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

function useLeaflet() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const w: any = window as any
    if (w.L) { setReady(true); return }
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(css)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => setReady(true)
    document.body.appendChild(script)
  }, [])
  return ready
}

export default function DriverRoutePlanner() {
  const leafletReady = useLeaflet()
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapObj = useRef<any>(null)
  const routeLayer = useRef<any>(null)
  const pickupMarker = useRef<any>(null)
  const destMarker = useRef<any>(null)

  const [pickup, setPickup] = useState('')
  const [destination, setDestination] = useState('')
  const [stops, setStops] = useState<string[]>([])
  const [newStop, setNewStop] = useState('')
  const [routeInfo, setRouteInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!leafletReady || mapObj.current || !mapRef.current) return
    const L = (window as any).L
    mapObj.current = L.map(mapRef.current).setView([28.6139, 77.2090], 12)
    L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=DUTVLGevXSz7Y9iUmy3P', {
      maxZoom: 20,
      attribution: '&copy; MapTiler & OpenStreetMap contributors'
    }).addTo(mapObj.current)
    routeLayer.current = L.geoJSON(null, { style: { color: '#3b82f6', weight: 5 } }).addTo(mapObj.current)
  }, [leafletReady])

  const addStop = () => {
    if (!newStop.trim()) return
    setStops([...stops, newStop.trim()])
    setNewStop('')
  }

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index))
  }

  const geocodeAddress = async (query: string): Promise<[number, number]> => {
    const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { format: 'json', q: query, limit: 1 },
      headers: { 'Accept-Language': 'en' }
    })
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Location not found: ${query}`)
    }
    const { lon, lat } = data[0]
    return [parseFloat(lon), parseFloat(lat)]
  }

  const handleCreateTrip = async () => {
    if (!pickup || !destination) { alert('Enter pickup and destination'); return }
    setLoading(true)
    setRouteInfo(null)

    try {
      // Get real coordinates for all addresses
      const pickupCoord = await geocodeAddress(pickup)
      const destinationCoord = await geocodeAddress(destination)
      const stopsCoords = await Promise.all(stops.map(geocodeAddress))

      // Send to backend
      const res = await axios.post('http://localhost:5005/api/trips', {
        pickup,
        destination,
        stops,
        pickup_coord: pickupCoord,
        destination_coord: destinationCoord,
        stops_coords: stopsCoords,
        persons: 1,
        type: 'SUV',
        price: 200
      })

      const tripId = res.data.trip_id
      const route = await axios.get(`http://localhost:5005/api/trips/${tripId}/route`)
      setRouteInfo(route.data)

      routeLayer.current.clearLayers()
      routeLayer.current.addData(route.data.geometry)
      const L = (window as any).L
      if (pickupMarker.current) {
        mapObj.current.removeLayer(pickupMarker.current)
      }
      if (destMarker.current) {
        mapObj.current.removeLayer(destMarker.current)
      }
      pickupMarker.current = L.circleMarker([pickupCoord[1], pickupCoord[0]], {
        radius: 8,
        color: '#16a34a',
        weight: 2,
        fillColor: '#22c55e',
        fillOpacity: 0.9,
      }).addTo(mapObj.current).bindPopup('Pickup')
      destMarker.current = L.circleMarker([destinationCoord[1], destinationCoord[0]], {
        radius: 8,
        color: '#dc2626',
        weight: 2,
        fillColor: '#ef4444',
        fillOpacity: 0.9,
      }).addTo(mapObj.current).bindPopup('Destination')
      const bounds = routeLayer.current.getBounds()
      bounds.extend([pickupCoord[1], pickupCoord[0]])
      bounds.extend([destinationCoord[1], destinationCoord[0]])
      mapObj.current.fitBounds(bounds, { padding: [30, 30] })
    } catch (err) {
      console.error(err)
      alert('Error creating trip or fetching route.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadMap = async () => {
    if (!mapObj.current) return
    setDownloading(true)

    try {
      const bounds = mapObj.current.getBounds()
      const zoom = mapObj.current.getZoom()
      const minLat = bounds.getSouth(), maxLat = bounds.getNorth()
      const minLng = bounds.getWest(), maxLng = bounds.getEast()

      const z = zoom
      const toTile = (lat: number, lon: number, z: number) => {
        const x = Math.floor((lon + 180) / 360 * Math.pow(2, z))
        const y = Math.floor(
          (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z)
        )
        return { x, y }
      }

      const start = toTile(minLat, minLng, z)
      const end = toTile(maxLat, maxLng, z)
      const total = (end.x - start.x + 1) * (end.y - start.y + 1)
      let count = 0

      for (let x = start.x; x <= end.x; x++) {
        for (let y = start.y; y <= end.y; y++) {
          await axios.get(`http://localhost:5005/api/map/tiles/${z}/${x}/${y}.png`, { responseType: 'arraybuffer' })
          count++
        }
      }

      alert(`✅ Downloaded ${count}/${total} tiles for offline use.`)
    } catch (err) {
      console.error(err)
      alert('Error downloading map tiles.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/3 bg-gray-100 p-6 space-y-4">
        <h1 className="text-2xl font-bold text-blue-700">Driver Route Planner 🚗</h1>

        <div>
          <label className="block font-medium">Pickup</label>
          <input
            value={pickup}
            onChange={e => setPickup(e.target.value)}
            placeholder="Enter pickup location"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Destination</label>
          <input
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder="Enter destination"
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Add Stop</label>
          <div className="flex gap-2">
            <input
              value={newStop}
              onChange={e => setNewStop(e.target.value)}
              placeholder="Optional stop"
              className="flex-1 border rounded px-3 py-2"
            />
            <button onClick={addStop} className="bg-blue-600 text-white px-3 py-2 rounded">Add</button>
          </div>

          <ul className="mt-2 space-y-1">
            {stops.map((stop, i) => (
              <li key={i} className="flex justify-between bg-gray-200 p-2 rounded">
                <span>{stop}</span>
                <button onClick={() => removeStop(i)} className="text-red-500">×</button>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleCreateTrip}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded mt-4 font-semibold hover:bg-green-700"
        >
          {loading ? 'Planning route...' : 'Plan Route'}
        </button>

        <button
          onClick={handleDownloadMap}
          disabled={downloading}
          className="w-full bg-yellow-600 text-white py-2 rounded mt-2 font-semibold hover:bg-yellow-700"
        >
          {downloading ? 'Downloading...' : 'Download Map for Offline Use'}
        </button>

        {routeInfo && (
          <div className="mt-4 text-gray-700">
            <p><strong>Distance:</strong> {routeInfo.distance_km.toFixed(2)} km</p>
            <p><strong>ETA:</strong> {routeInfo.duration_min.toFixed(1)} min</p>
          </div>
        )}
      </div>

      <div className="flex-1" ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
    </div>
  )
}
