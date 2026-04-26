import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { GradientButton } from '@/components/ui/gradient-button'

export default function DriverAssignmentsPage() {
  const { driverId: paramDriverId } = useParams<{ driverId: string }>()
  const [driverId, setDriverId] = React.useState<string>(paramDriverId || '')
  const [loading, setLoading] = React.useState<boolean>(!!driverId)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<any>(null)
  const [lastRefreshed, setLastRefreshed] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    const run = async () => {
      if (!driverId) return
      setLoading(true)
      setError(null)
      setData(null)
      try {
        const res = await fetch(`http://localhost:5003/api/assignments/driver/${encodeURIComponent(driverId)}`, { cache: 'no-store' })
        if (!res.ok) {
          const j = await res.json().catch(() => null)
          throw new Error(j?.message || `Failed to fetch assignments (HTTP ${res.status})`)
        }
        const j = await res.json()
        if (active) {
          setData(j)
          setLastRefreshed(new Date().toISOString())
        }
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to fetch assignments')
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [driverId])

  return (
    <div className={"relative min-h-screen p-4 flex items-stretch justify-center"}>
      <div className="w-full space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Driver Assignments</h1>
            <div className="flex items-center gap-2">
              {driverId && (
                <span className="text-xs text-white/80">Driver: <span className="font-mono">{driverId}</span></span>
              )}
              <Link to="/driver/dashboard" className="rounded-md bg-slate-600 hover:bg-slate-700 px-3 py-2 text-sm">Dashboard</Link>
            </div>
          </div>

          {driverId && (
            <div className="mt-2 text-xs text-white/70">
              Fetching from: <span className="font-mono">/api/assignments/driver/{driverId}</span>
              {lastRefreshed && (
                <span className="ml-2">• Last refreshed: <span className="font-mono">{new Date(lastRefreshed).toLocaleString()}</span></span>
              )}
              <GradientButton
                type="button"
                onClick={() => setDriverId((id) => id)}
                className="ml-2 px-2 py-1 text-xs"
              >
                Refresh
              </GradientButton>
            </div>
          )}

          {!paramDriverId && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                className="md:col-span-2 rounded-md bg-white/20 border border-white/30 px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-white"
                placeholder="Enter driver ID"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
              />
              <GradientButton
                type="button"
                onClick={() => setDriverId(driverId.trim())}
                disabled={!driverId.trim()}
                className="px-3 py-2 text-sm disabled:opacity-60"
              >
                Load
              </GradientButton>
            </div>
          )}

          {driverId && loading && (
            <div className="mt-6 flex items-center gap-3 text-white/90">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <div>Loading assignments…</div>
            </div>
          )}

          {error && <div className="mt-4 text-red-200 text-sm">{error}</div>}

          {driverId && !loading && !error && (
            data ? (
              <div className="mt-4 space-y-3">
                {(() => {
                  // Unwrap common envelope shapes
                  const payload: any = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : (Array.isArray(data?.assignments) ? data.assignments : data))
                  if (Array.isArray(payload)) {
                    if (!payload.length) return <div className="text-white/90">No assignments found for driver {driverId}.</div>
                    const pick = (obj: any, keys: string[]) => keys.reduce((acc: any, k) => { if (obj && obj[k] !== undefined) acc[k] = obj[k]; return acc }, {})
                    const keyOrder = ['confirmation_id','driver_id','vehicle_no','type','driver_name','ph_no','status','created_at','updated_at']
                    return (
                      <>
                        <div className="text-sm text-white/80">Total: {payload.length}</div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {payload.map((a: any, idx: number) => {
                            const header = a?.confirmation_id || a?.id || a?._id || `#${idx+1}`
                            const primary = pick(a, keyOrder)
                            const extraKeys = Object.keys(a || {}).filter(k => !(k in primary))
                            return (
                              <div key={header} className="rounded-xl border border-white/20 bg-white/10 p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="text-white font-semibold">{header}</div>
                                    {a?.status && <div className="text-xs text-white/70">Status: {String(a.status)}</div>}
                                  </div>
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-600/20 border border-emerald-400/30 text-emerald-200">Assignment</span>
                                </div>
                                <div className="mt-3 space-y-1 text-sm">
                                  {Object.keys(primary).map((k) => (
                                    <div key={k} className="flex justify-between gap-3">
                                      <span className="text-white/70">{k}</span>
                                      <span className="text-white/95 break-all font-mono">{typeof (primary as any)[k] === 'object' ? JSON.stringify((primary as any)[k]) : String((primary as any)[k])}</span>
                                    </div>
                                  ))}
                                </div>
                                {extraKeys.length > 0 && (
                                  <details className="mt-2 text-xs">
                                    <summary className="cursor-pointer text-white/80">More</summary>
                                    <div className="mt-1 space-y-1">
                                      {extraKeys.map((ek) => (
                                        <div key={ek} className="flex justify-between gap-3">
                                          <span className="text-white/70">{ek}</span>
                                          <span className="text-white/95 break-all">{typeof a[ek] === 'object' ? JSON.stringify(a[ek]) : String(a[ek])}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </details>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )
                  }
                  // Non-array payload fallback
                  return (
                    <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                      <div className="font-medium mb-2">Response</div>
                      <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
                        {Object.keys(payload || {}).map((k) => (
                          <React.Fragment key={k}>
                            <dt className="col-span-1 text-white/70">{k}</dt>
                            <dd className="col-span-2 text-white/95 break-words">{typeof payload[k] === 'object' ? JSON.stringify(payload[k]) : String(payload[k])}</dd>
                          </React.Fragment>
                        ))}
                      </dl>
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div className="mt-4 text-white/90">No data.</div>
            )
          )}
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white flex items-center justify-end">
          <Link
            to="/driver/trip/send"
            className="rounded-md bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm"
          >
            OK
          </Link>
        </div>
      </div>
    </div>
  )
}
