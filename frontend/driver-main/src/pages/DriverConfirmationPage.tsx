import React from 'react'
import { Link } from 'react-router-dom'
import { GradientButton } from '@/components/ui/gradient-button'

export default function DriverConfirmationPage() {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [ids, setIds] = React.useState<string[]>([])
  const [queryId, setQueryId] = React.useState('')
  const [driverLoading, setDriverLoading] = React.useState(false)
  const [driverError, setDriverError] = React.useState<string | null>(null)
  const [driverId, setDriverId] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('http://localhost:5003/api/confirmations')
        if (!res.ok) {
          const j = await res.json().catch(() => null)
          throw new Error(j?.message || 'Failed to fetch confirmations')
        }
        const j = await res.json()
        const list: string[] = Array.isArray(j?.confirmation_ids)
          ? j.confirmation_ids
          : Array.isArray(j)
            ? j.map((x: any) => (x?.confirmation_id || x?.id || x?._id)).filter(Boolean)
            : Array.isArray(j?.data)
              ? j.data.map((x: any) => (x?.confirmation_id || x?.id || x?._id)).filter(Boolean)
              : []
        if (active) setIds(list)
      } catch (e: any) {
        if (active) setError(e?.message || 'Failed to fetch confirmations')
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [])

  return (
    <div className={"relative min-h-screen p-4 flex items-stretch justify-center"}>
      <div className="w-full max-w-5xl space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Driver Confirmations</h1>
            <Link to="/driver/dashboard" className="rounded-md bg-slate-600 hover:bg-slate-700 px-3 py-2 text-sm">Back to Dashboard</Link>
          </div>

          {/* Driver ID lookup */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              className="md:col-span-2 rounded-md bg-white/20 border border-white/30 px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-white"
              placeholder="Enter confirmation ID"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
            />
            <GradientButton
              type="button"
              disabled={!queryId.trim() || driverLoading}
              onClick={async () => {
                const id = queryId.trim()
                if (!id) return
                setDriverError(null)
                setDriverId(null)
                setDriverLoading(true)
                try {
                  const res = await fetch(`http://localhost:5003/api/assignments/confirmation/${encodeURIComponent(id)}`)
                  if (!res.ok) {
                    const j = await res.json().catch(() => null)
                    throw new Error(j?.message || `Failed (HTTP ${res.status})`)
                  }
                  const j = await res.json()
                  // Try common shapes to extract driver_id
                  const did = j?.driver_id ?? j?.driverId ?? j?.data?.driver_id ?? j?.assignment?.driver_id ?? null
                  setDriverId(did ? String(did) : '—')
                } catch (e: any) {
                  setDriverError(e?.message || 'Failed to fetch driver id')
                } finally {
                  setDriverLoading(false)
                }
              }}
              className="px-3 py-2 text-sm disabled:opacity-60"
            >
              {driverLoading ? 'Fetching…' : 'Driver ID'}
            </GradientButton>
          </div>
          {driverError && <div className="mt-2 text-sm text-red-200">{driverError}</div>}
          {driverId !== null && !driverError && (
            <div className="mt-2 text-sm">
              <span className="text-white/70">Driver ID:</span> <span className="font-mono">{driverId}</span>
            </div>
          )}

          {loading && (
            <div className="mt-6 flex items-center gap-3 text-white/90">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <div>Loading confirmations…</div>
            </div>
          )}

          {error && <div className="mt-4 text-red-200 text-sm">{error}</div>}

          {!loading && !error && (
            ids.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ids.map((id) => (
                  <div key={id} className="rounded-xl border border-white/20 bg-white/10 p-4 space-y-2">
                    <div className="text-lg font-semibold">Confirmation</div>
                    <div className="text-xs opacity-80 font-mono break-all">{id}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-white/90">No confirmations found.</div>
            )
          )}
        </div>
      </div>
    </div>
  )
}
