import React from 'react'
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import { GradientButton } from '@/components/ui/gradient-button'
// static background only

export default function TripVehicleSummaryPage() {
  const { id: tripId } = useParams<{ id: string }>()
  const location = useLocation()
  const [trip, setTrip] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  // vehicle object is passed via navigation state
  const vehicleFromState = (location.state as any)?.vehicle

  // Persist vehicle in sessionStorage in case of refresh/navigation
  React.useEffect(() => {
    if (vehicleFromState) {
      sessionStorage.setItem('selected_vehicle', JSON.stringify(vehicleFromState))
    }
  }, [vehicleFromState])

  const vehicle = React.useMemo(() => {
    try {
      return vehicleFromState || JSON.parse(sessionStorage.getItem('selected_vehicle') || 'null')
    } catch {
      return vehicleFromState || null
    }
  }, [vehicleFromState])

  React.useEffect(() => {
    let active = true
    async function run() {
      if (!tripId) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`http://localhost:5001/api/trips/${tripId}`)
        if (!res.ok) {
          const j = await res.json().catch(() => null)
          throw new Error(j?.message || 'Failed to fetch trip')
        }
        const j = await res.json()
        if (active) setTrip(j)
      } catch (err: any) {
        if (active) setError(err?.message || 'Failed to fetch trip')
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [tripId])

  const gradientBg = 'bg-gradient-to-br from-indigo-700 via-purple-700 to-emerald-600'

  const extractTripPrice = (t: any): number | null => {
    if (!t) return null
    const p = t.price ?? t.fare ?? t.total ?? t.amount
    return typeof p === 'number' ? p : (typeof p === 'string' ? parseFloat(p) : null)
  }

  const extractDistanceKm = (t: any): number | null => {
    if (!t) return null
    if (typeof t.distanceText === 'string') {
      const m = parseFloat(t.distanceText)
      return isNaN(m) ? null : m
    }
    if (typeof t.distance === 'number') {
      // assume meters if large
      return t.distance > 1000 ? t.distance / 1000 : t.distance
    }
    return null
  }

  const tripPrice = extractTripPrice(trip)
  const distKm = extractDistanceKm(trip)
  const estPrice = React.useMemo(() => {
    if (!vehicle || distKm == null) return null
    const base = typeof vehicle.baseFare === 'number' ? vehicle.baseFare : 0
    const perKm = typeof vehicle.pricePerKm === 'number' ? vehicle.pricePerKm : 0
    if (base === 0 && perKm === 0) return null
    return Math.round((base + perKm * distKm) * 100) / 100
  }, [vehicle, distKm])

  // Persist a compact summary for the driver send page
  React.useEffect(() => {
    try {
      if (!trip) return
      const payload = {
        pickup: trip?.pickup ?? '',
        destination: trip?.destination ?? '',
        stops: Array.isArray(trip?.stops) ? trip.stops : (trip?.stops ? [trip.stops] : []),
        persons: typeof trip?.persons === 'number' ? trip.persons : 1,
        trip_price: (tripPrice != null ? tripPrice : (estPrice != null ? estPrice : 0)) ?? 0,
        trip_type: (vehicle?.type || 'One-way') as string,
      }
      sessionStorage.setItem('trip_send_defaults', JSON.stringify(payload))
      try { localStorage.setItem('trip_send_defaults', JSON.stringify(payload)) } catch {}
    } catch {}
  }, [trip, vehicle, tripPrice, estPrice])

  const field = (label: string, value: any) => (
    <div className="flex justify-between text-sm"><span className="text-white/80">{label}</span><span className="text-white/95 ml-2">{value ?? '—'}</span></div>
  )

  const prettyArray = (arr: any[]) => Array.isArray(arr) && arr.length ? arr.join(' → ') : 'None'

  const onProceed = async () => {
    setSubmitError(null)
    if (!tripId || !trip) {
      setSubmitError('Missing trip data')
      return
    }
    const body = {
      pickup: trip.pickup,
      destination: trip.destination,
      stops: Array.isArray(trip.stops) ? trip.stops : [],
      persons: typeof trip.persons === 'number' ? trip.persons : 1,
      trip_price: (tripPrice != null ? tripPrice : (estPrice != null ? estPrice : 0)),
      type: vehicle?.type || 'VEHICLE'
    }
    setSubmitting(true)
    try {
      const res = await fetch('http://localhost:5003/api/confirmations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.message || 'Failed to create confirmation')
      }
      const j = await res.json().catch(() => ({})) as any
      const confirmationId = j.confirmation_id || j.id || j._id || j.confirmationId
      if (!confirmationId) throw new Error('Missing confirmation id in response')
      // Navigate to status page to wait for assignment
      window.location.assign(`/passenger/trip/${tripId}/confirmation`)
      // Prefer react-router navigate with state, but window.location ensures hard load
      // nav(`/passenger/trip/${tripId}/confirmation`, { state: { confirmationId } })
      sessionStorage.setItem('last_confirmation_id', confirmationId)
    } catch (e: any) {
      setSubmitError(e?.message || 'Failed to create confirmation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen tvs-page w-full px-4 py-6">
      <div className="w-full max-w-6xl mx-auto space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Trip & Vehicle Summary</h1>
            <div className="text-sm opacity-80">Trip ID: <span className="font-mono">{tripId}</span></div>
          </div>

          {loading && <div className="mt-4">Loading…</div>}
          {error && <div className="mt-4 text-red-200 text-sm">{error}</div>}

          {!loading && !error && (
            <div className="mt-4">
              <div className="fc-card" style={{height: 380}}>
                <div className="fc-content">
                  {/* BACK: Selected Vehicle */}
                  <div className="fc-back">
                    <div className="fc-back-content">
                      <div className="text-lg font-semibold">Selected Vehicle</div>
                      <div className="fc-panel" style={{width: '92%'}}>
                        {vehicle ? (
                          <div className="space-y-1 text-sm">
                            {field('Name/Model', vehicle.name || vehicle.model || vehicle.type || 'Vehicle')}
                            {field('Type', vehicle.type)}
                            {field('Seats', vehicle.seats ?? vehicle.capacity)}
                            {field('Base Fare', vehicle.baseFare != null ? `₹${vehicle.baseFare}` : '—')}
                            {field('Price/Km', vehicle.pricePerKm != null ? `₹${vehicle.pricePerKm}` : '—')}
                            {field('Vehicle ID', vehicle.vehicle_id || vehicle.id || vehicle._id)}
                            {field('Estimated Price', estPrice != null ? `₹${estPrice}` : '—')}
                          </div>
                        ) : (
                          <div className="text-sm">No vehicle selected. Go back and choose one.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FRONT: Trip Details */}
                  <div className="fc-front">
                    <div className="fc-circles">
                      <div className="fc-circle" />
                      <div className="fc-circle" id="fc-right" />
                      <div className="fc-circle" id="fc-bottom" />
                    </div>
                    <div className="fc-front-body">
                      <small className="fc-badge">Trip Details</small>
                      <div className="fc-panel">
                        <div className="space-y-1 text-sm">
                          {field('Pickup', trip?.pickup)}
                          {field('Destination', trip?.destination)}
                          {field('Stops', prettyArray(trip?.stops || []))}
                          {field('Persons', trip?.persons)}
                          {field('Distance', trip?.distanceText || trip?.distance)}
                          {field('ETA', trip?.durationText || trip?.eta)}
                          {field('Trip Price', tripPrice != null ? `₹${tripPrice}` : '—')}
                          {field('Status', trip?.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white flex items-center justify-between">
          <div className="space-x-2">
            <Link to={`/passenger/trip/${tripId}/vehicles`} className="rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-2 text-sm">Back to Vehicles</Link>
            <Link to={`/passenger/trip/${tripId}`} className="rounded-md bg-slate-600 hover:bg-slate-700 px-3 py-2 text-sm">Back to Details</Link>
          </div>
          <div className="flex items-center gap-3">
            {submitError && <div className="text-red-200 text-sm">{submitError}</div>}
            <div className="voltage-button">
              <button type="button" disabled={submitting} onClick={onProceed}>
                {submitting ? 'Submitting…' : 'Proceed'}
              </button>
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 234.6 61.3" preserveAspectRatio="none">
                <filter id="glow">
                  <feGaussianBlur className="blur" result="coloredBlur" stdDeviation={2} />
                  <feTurbulence type="fractalNoise" baseFrequency="0.075" numOctaves="0.3" result="turbulence" />
                  <feDisplacementMap in="SourceGraphic" in2="turbulence" scale={30} xChannelSelector="R" yChannelSelector="G" result="displace" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="displace" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <path className="voltage line-1" d="m216.3 51.2c-3.7 0-3.7-1.1-7.3-1.1-3.7 0-3.7 6.8-7.3 6.8-3.7 0-3.7-4.6-7.3-4.6-3.7 0-3.7 3.6-7.3 3.6-3.7 0-3.7-0.9-7.3-0.9-3.7 0-3.7-2.7-7.3-2.7-3.7 0-3.7 7.8-7.3 7.8-3.7 0-3.7-4.9-7.3-4.9-3.7 0-3.7-7.8-7.3-7.8-3.7 0-3.7-1.1-7.3-1.1-3.7 0-3.7 3.1-7.3 3.1-3.7 0-3.7 10.9-7.3 10.9-3.7 0-3.7-12.5-7.3-12.5-3.7 0-3.7 4.6-7.3 4.6-3.7 0-3.7 4.5-7.3 4.5-3.7 0-3.7 3.6-7.3 3.6-3.7 0-3.7-10-7.3-10-3.7 0-3.7-0.4-7.3-0.4-3.7 0-3.7 2.3-7.3 2.3-3.7 0-3.7 7.1-7.3 7.1-3.7 0-3.7-11.2-7.3-11.2-3.7 0-3.7 3.5-7.3 3.5-3.7 0-3.7 3.6-7.3 3.6-3.7 0-3.7-2.9-7.3-2.9-3.7 0-3.7 8.4-7.3 8.4-3.7 0-3.7-14.6-7.3-14.6-3.7 0-3.7 5.8-7.3 5.8-2.2 0-3.8-0.4-5.5-1.5-1.8-1.1-1.8-2.9-2.9-4.8-1-1.8 1.9-2.7 1.9-4.8 0-3.4-2.1-3.4-2.1-6.8s-9.9-3.4-9.9-6.8 8-3.4 8-6.8c0-2.2 2.1-2.4 3.1-4.2 1.1-1.8 0.2-3.9 2-5 1.8-1 3.1-7.9 5.3-7.9 3.7 0 3.7 0.9 7.3 0.9 3.7 0 3.7 6.7 7.3 6.7 3.7 0 3.7-1.8 7.3-1.8 3.7 0 3.7-0.6 7.3-0.6 3.7 0 3.7-7.8 7.3-7.8h7.3c3.7 0 3.7 4.7 7.3 4.7 3.7 0 3.7-1.1 7.3-1.1 3.7 0 3.7 11.6 7.3 11.6 3.7 0 3.7-2.6 7.3-2.6 3.7 0 3.7-12.9 7.3-12.9 3.7 0 3.7 10.9 7.3 10.9 3.7 0 3.7 1.3 7.3 1.3 3.7 0 3.7-8.7 7.3-8.7 3.7 0 3.7 11.5 7.3 11.5 3.7 0 3.7-1.4 7.3-1.4 3.7 0 3.7-2.6 7.3-2.6 3.7 0 3.7-5.8 7.3-5.8 3.7 0 3.7-1.3 7.3-1.3 3.7 0 3.7 6.6 7.3 6.6s3.7-9.3 7.3-9.3c3.7 0 3.7 0.2 7.3 0.2 3.7 0 3.7 8.5 7.3 8.5 3.7 0 3.7 0.2 7.3 0.2 3.7 0 3.7-1.5 7.3-1.5 3.7 0 3.7 1.6 7.3 1.6s3.7-5.1 7.3-5.1c2.2 0 0.6 9.6 2.4 10.7s4.1-2 5.1-0.1c1 1.8 10.3 2.2 10.3 4.3 0 3.4-10.7 3.4-10.7 6.8s1.2 3.4 1.2 6.8 1.9 3.4 1.9 6.8c0 2.2 7.2 7.7 6.2 9.5-1.1 1.8-12.3-6.5-14.1-5.5-1.7 0.9-0.1 6.2-2.2 6.2z" fill="transparent" stroke="#fff" />
                <path className="voltage line-2" d="m216.3 52.1c-3 0-3-0.5-6-0.5s-3 3-6 3-3-2-6-2-3 1.6-6 1.6-3-0.4-6-0.4-3-1.2-6-1.2-3 3.4-6 3.4-3-2.2-6-2.2-3-3.4-6-3.4-3-0.5-6-0.5-3 1.4-6 1.4-3 4.8-6 4.8-3-5.5-6-5.5-3 2-6 2-3 2-6 2-3 1.6-6 1.6-3-4.4-6-4.4-3-0.2-6-0.2-3 1-6 1-3 3.1-6 3.1-3-4.9-6-4.9-3 1.5-6 1.5-3 1.6-6 1.6-3-1.3-6-1.3-3 3.7-6 3.7-3-6.4-6-6.4-3 2.5-6 2.5h-6c-3 0-3-0.6-6-0.6s-3-1.4-6-1.4-3 0.9-6 0.9-3 4.3-6 4.3-3-3.5-6-3.5c-2.2 0-3.4-1.3-5.2-2.3-1.8-1.1-3.6-1.5-4.6-3.3s-4.4-3.5-4.4-5.7c0-3.4 0.4-3.4 0.4-6.8s2.9-3.4 2.9-6.8-0.8-3.4-0.8-6.8c0-2.2 0.3-4.2 1.3-5.9 1.1-1.8 0.8-6.2 2.6-7.3 1.8-1 5.5-2 7.7-2 3 0 3 2 6 2s3-0.5 6-0.5 3 5.1 6 5.1 3-1.1 6-1.1 3-5.6 6-5.6 3 4.8 6 4.8 3 0.6 6 0.6 3-3.8 6-3.8 3 5.1 6 5.1 3-0.6 6-0.6 3-1.2 6-1.2 3-2.6 6-2.6 3-0.6 6-0.6 3 2.9 6 2.9 3-4.1 6-4.1 3 0.1 6 0.1 3 3.7 6 3.7 3 0.1 6 0.1 3-0.6 6-0.6 3 0.7 6 0.7 3-2.2 6-2.2 3 4.4 6 4.4 3-1.7 6-1.7 3-4 6-4 3 4.7 6 4.7 3-0.5 6-0.5 3-0.8 6-0.8 3-3.8 6-3.8 3 6.3 6 6.3 3-4.8 6-4.8 3 1.9 6 1.9 3-1.9 6-1.9 3 1.3 6 1.3c2.2 0 5-0.5 6.7 0.5 1.8 1.1 2.4 4 3.5 5.8 1 1.8 0.3 3.7 0.3 5.9 0 3.4 3.4 3.4 3.4 6.8s-3.3 3.4-3.3 6.8 4 3.4 4 6.8c0 2.2-6 2.7-7 4.4-1.1 1.8 1.1 6.7-0.7 7.7-1.6 0.8-4.7-1.1-6.8-1.1z" fill="transparent" stroke="#fff" />
              </svg>
              <div className="dots">
                <div className="dot dot-1" />
                <div className="dot dot-2" />
                <div className="dot dot-3" />
                <div className="dot dot-4" />
                <div className="dot dot-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
