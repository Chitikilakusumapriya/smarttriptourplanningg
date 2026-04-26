import React from 'react'

declare global {
  interface Window { L?: any }
}

function ensureLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve()
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

export default function PassengerTrackPage() {
  const [driverId, setDriverId] = React.useState('')
  const [tracking, setTracking] = React.useState(false)
  const [location, setLocation] = React.useState<null | { driver_id: string; latitude: number | string; longitude: number | string; updated_at?: string }>(null)
  const [leafletReady, setLeafletReady] = React.useState(false)

  const mapRef = React.useRef<HTMLDivElement | null>(null)
  const map = React.useRef<any>(null)
  const markerRef = React.useRef<any>(null)
  const pollRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    ensureLeaflet().then(() => setLeafletReady(true)).catch(() => setLeafletReady(false))
  }, [])

  React.useEffect(() => {
    if (!leafletReady || !mapRef.current || map.current) return
    const L = window.L
    map.current = L.map(mapRef.current).setView([28.6139, 77.2090], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map.current)
  }, [leafletReady])

  const fetchLocation = React.useCallback(async () => {
    if (!driverId) return
    try {
      const res = await fetch(`http://localhost:5004/api/location/${encodeURIComponent(driverId)}`)
      if (!res.ok) throw new Error('Failed to fetch location')
      const data = await res.json()
      setLocation(data)
      const lat = parseFloat(String(data.latitude))
      const lon = parseFloat(String(data.longitude))
      const L = window.L
      if (Number.isFinite(lat) && Number.isFinite(lon) && map.current) {
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lon])
        } else {
          markerRef.current = L.marker([lat, lon], { title: `Driver ${driverId}` }).addTo(map.current)
        }
        map.current.setView([lat, lon], 15)
      }
    } catch (err) {
      console.error('Error fetching location:', err)
    }
  }, [driverId])

  const toggleTracking = () => {
    if (!driverId) return
    const next = !tracking
    setTracking(next)
    if (next) {
      // start polling
      fetchLocation()
      pollRef.current = window.setInterval(fetchLocation, 5000)
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }

  React.useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = null
      try {
        if (map.current) map.current.remove()
      } catch {}
      map.current = null
      markerRef.current = null
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Passenger Live Tracking</h1>

      <div className="flex gap-3 mb-4 w-full max-w-3xl">
        <input
          type="text"
          placeholder="Enter Driver ID (e.g., driver_101)"
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          className="px-3 py-2 rounded-md w-72 bg-white/20 border border-white/30 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
        <button
          className={`px-4 py-2 rounded-md font-semibold ${tracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-60`}
          onClick={toggleTracking}
          disabled={!leafletReady || !driverId}
        >
          {tracking ? 'Stop Tracking' : 'Start Tracking'}
        </button>
      </div>

      <div ref={mapRef} className="w-full max-w-5xl h-[70vh] rounded-lg border border-gray-700 shadow-lg bg-gray-800" />

      {location && (
        <div className="mt-4 text-center text-sm">
          <p><strong>Driver ID:</strong> {String((location as any).driver_id ?? driverId)}</p>
          <p><strong>Latitude:</strong> {String((location as any).latitude)}</p>
          <p><strong>Longitude:</strong> {String((location as any).longitude)}</p>
          {(location as any).updated_at && (
            <p><strong>Last Updated:</strong> {new Date(String((location as any).updated_at)).toLocaleTimeString()}</p>
          )}
        </div>
      )}
    </div>
  )
}
