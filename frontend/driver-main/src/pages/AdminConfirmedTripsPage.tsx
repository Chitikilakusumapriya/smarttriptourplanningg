import React from 'react'
import { Link } from 'react-router-dom'

export default function AdminConfirmedTripsPage() {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<any[]>([])

  React.useEffect(() => {
    let active = true
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('http://localhost:5005/api/trips', { cache: 'no-store' })
        if (!res.ok) {
          const j = await res.json().catch(() => null)
          throw new Error(j?.message || `Failed to load trips (HTTP ${res.status})`)
        }
        const j = await res.json()
        if (!active) return
        const arr = Array.isArray(j?.data) ? j.data : (Array.isArray(j) ? j : (Array.isArray(j?.trips) ? j.trips : []))
        setData(arr)
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to load trips')
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [])

  return (
    <div className="min-h-screen ab-page p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Confirmed Trips</h1>
        <Link to="/admin/dashboard" className="rounded-md bg-slate-700 text-white px-3 py-2 text-sm hover:bg-slate-800">Back to Dashboard</Link>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-slate-700">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          <div>Loading trips…</div>
        </div>
      )}

      {error && (
        <div className="rounded border border-rose-300/60 bg-rose-50 text-rose-700 px-3 py-2 text-sm">{error}</div>
      )}

      {!loading && !error && (
        data.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((t: any, idx: number) => {
              const id = t?.id || t?._id || t?.confirmation_id || `#${idx+1}`
              const pickup = t?.pickup || t?.from || '-'
              const destination = t?.destination || t?.to || '-'
              const persons = t?.persons ?? t?.people ?? '-'
              const price = t?.trip_price ?? t?.price ?? t?.amount
              const type = t?.trip_type || t?.type || 'Trip'
              const created = t?.created_at || t?.createdAt || t?.timestamp
              return (
                <div key={id} className="rounded-xl border bg-white/60 backdrop-blur p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-slate-900 font-semibold">{pickup} → {destination}</div>
                      <div className="text-xs text-slate-500">{type}{created ? ` · ${String(created)}` : ''}</div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-600/10 border border-emerald-600/30 text-emerald-700">Confirmed</span>
                  </div>
                  <div className="mt-3 text-sm space-y-1">
                    <div className="flex justify-between"><span className="text-slate-600">Persons</span><span className="font-mono text-slate-900">{persons}</span></div>
                    <div className="flex justify-between"><span className="text-slate-600">Trip Price</span><span className="font-mono text-slate-900">{price != null ? `₹${price}` : '-'}</span></div>
                    {t?.user_email && (
                      <div className="flex justify-between"><span className="text-slate-600">User Email</span><span className="font-mono text-slate-900 break-all">{t.user_email}</span></div>
                    )}
                    {t?.family_email && (
                      <div className="flex justify-between"><span className="text-slate-600">Family Email</span><span className="font-mono text-slate-900 break-all">{t.family_email}</span></div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-slate-700">No confirmed trips found.</div>
        )
      )}
    </div>
  )
}
