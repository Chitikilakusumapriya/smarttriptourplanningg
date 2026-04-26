import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { GradientButton } from '@/components/ui/gradient-button'
// static background only

export default function TripDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const nav = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<any>(null)

  React.useEffect(() => {
    let active = true
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`http://localhost:5001/api/trips/${id}`)
        if (!res.ok) {
          const j = await res.json().catch(() => null)
          throw new Error(j?.message || 'Failed to fetch trip')
        }
        const j = await res.json()
        if (active) setData(j)
      } catch (err: any) {
        if (active) setError(err?.message || 'Failed to fetch trip')
      } finally {
        if (active) setLoading(false)
      }
    }
    if (id) run()
    return () => { active = false }
  }, [id])

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '—'
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val)
    if (Array.isArray(val)) {
      if (val.length === 0) return '[]'
      // join simple arrays, otherwise compact JSON
      const simple = val.every(v => ['string','number','boolean'].includes(typeof v))
      return simple ? val.join(', ') : JSON.stringify(val)
    }
    // object
    const keys = Object.keys(val)
    if (keys.length === 0) return '{}'
    // compact single-level objects
    return JSON.stringify(val)
  }

  const gradientBg = 'bg-gradient-to-br from-indigo-700 via-purple-700 to-emerald-600'

  return (
    <div className="min-h-screen td-page w-full px-4 py-6">
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Trip Details</h1>
            <div className="text-sm opacity-80">Trip ID: <span className="font-mono">{id}</span></div>
          </div>

          {loading && <div className="mt-4">Loading…</div>}
          {error && <div className="mt-4 text-red-200 text-sm">{error}</div>}

          {!loading && !error && (
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Pickup:</span> {data?.pickup ?? '—'}</div>
                <div><span className="font-medium">Destination:</span> {data?.destination ?? '—'}</div>
                <div><span className="font-medium">Stops:</span> {Array.isArray(data?.stops) && data.stops.length ? data.stops.join(' → ') : 'None'}</div>
                <div><span className="font-medium">Persons:</span> {data?.persons ?? '—'}</div>
                <div><span className="font-medium">Distance:</span> {data?.distanceText || data?.distance || '—'}</div>
                <div><span className="font-medium">ETA:</span> {data?.durationText || data?.eta || '—'}</div>
                <div><span className="font-medium">Price:</span> {(() => {
                  const p = (data && (data.price ?? data.fare ?? data.total ?? data.amount))
                  return p != null ? `₹${p}` : '—'
                })()}</div>
                <div><span className="font-medium">Status:</span> {data?.status ?? '—'}</div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="font-medium">Response</div>
                <div className="ht-container">
                  <div className="ht-canvas">
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                    <div className="ht-tracker" />
                  </div>
                  <div className="ht-card">
                    <div className="ht-content">
                      {data && (
                        <dl className="grid grid-cols-3 gap-x-3 gap-y-2">
                          {Object.keys(data).map((k) => (
                            <React.Fragment key={k}>
                              <dt className="col-span-1 key">{k}</dt>
                              <dd className="col-span-2 val break-words">{formatValue((data as any)[k])}</dd>
                            </React.Fragment>
                          ))}
                        </dl>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="text-white/90">Next actions</div>
            <div className="space-x-2">
              <GradientButton
                type="button"
                onClick={() => id && nav(`/passenger/trip/${id}/vehicles`)}
                className="px-3 py-2 text-sm"
              >
                Confirm Trip
              </GradientButton>
              <Link to="/passenger/plan" className="rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-2 text-sm">Back to Planner</Link>
              <Link to="/passenger/trip/create" className="rounded-md bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-sm">Plan Another Trip</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
