import React from 'react'
import { Link } from 'react-router-dom'
import { GradientButton } from '@/components/ui/gradient-button'
// static background only

export default function TripConfirmationPage() {
  const [form, setForm] = React.useState({
    confirmation_id: '',
    driver_id: '',
    vehicle_no: 'DL1AB1234',
    type: 'SUV',
    driver_name: 'Rahul Kumar',
    ph_no: '9876543210',
  })
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<any>(null)

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const canSubmit = !!form.confirmation_id && !!form.driver_id && !!form.vehicle_no && !!form.type && !!form.driver_name && !!form.ph_no

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || submitting) return
    setSubmitting(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('http://localhost:5003/api/assignments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.message || `Failed (HTTP ${res.status})`)
      }
      const j = await res.json().catch(() => ({}))
      setResult(j)
    } catch (e: any) {
      setError(e?.message || 'Failed to confirm trip')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen ab-page w-full px-4 py-6">
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Confirm Trip</h1>
            <Link to="/driver/dashboard" className="rounded-md bg-slate-600 hover:bg-slate-700 px-3 py-2 text-sm">Back</Link>
          </div>

          <form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/80">Confirmation ID</label>
                <input name="confirmation_id" value={form.confirmation_id} onChange={onChange}
                  className="mt-1 w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="e.g. 99d3e9f7-..." />
              </div>
              <div>
                <label className="block text-xs text-white/80">Driver ID</label>
                <input name="driver_id" value={form.driver_id} onChange={onChange}
                  className="mt-1 w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="e.g. D123" />
              </div>
              <div>
                <label className="block text-xs text-white/80">Vehicle No</label>
                <input name="vehicle_no" value={form.vehicle_no} onChange={onChange}
                  className="mt-1 w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
              <div>
                <label className="block text-xs text-white/80">Type</label>
                <input name="type" value={form.type} onChange={onChange}
                  className="mt-1 w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
              <div>
                <label className="block text-xs text-white/80">Driver Name</label>
                <input name="driver_name" value={form.driver_name} onChange={onChange}
                  className="mt-1 w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
              <div>
                <label className="block text-xs text-white/80">Phone No</label>
                <input name="ph_no" value={form.ph_no} onChange={onChange}
                  className="mt-1 w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300" />
              </div>
            </div>

            <GradientButton type="submit" disabled={!canSubmit || submitting} className="mt-2 px-4 py-2 text-sm disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Confirm Trip'}
            </GradientButton>
          </form>

          {error && <div className="mt-3 text-sm text-red-200">{error}</div>}
          {result && (
            <div className="mt-4">
              <div className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 text-emerald-200">
                  <span className="text-lg">✅</span>
                  <span className="font-semibold">Trip Confirmed</span>
                </div>
                {(() => {
                  const resp: any = (result as any)?.data ?? result
                  const rows: Array<{ label: string; value: any }> = [
                    { label: 'Confirmation ID', value: resp?.confirmation_id },
                    { label: 'Driver ID', value: resp?.driver_id },
                    { label: 'Vehicle No', value: resp?.vehicle_no },
                    { label: 'Type', value: resp?.type },
                    { label: 'Driver Name', value: resp?.driver_name },
                    { label: 'Phone No', value: resp?.ph_no },
                  ]
                  return (
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white">
                      {rows.map((r) => (
                        <div key={r.label} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                          <div className="text-xs text-white/70">{r.label}</div>
                          <div className="font-mono break-words">{r.value ?? '—'}</div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>

              <details className="mt-3 rounded-lg bg-white/5 border border-white/10">
                <summary className="cursor-pointer select-none px-3 py-2 text-sm text-white/80">Raw JSON response</summary>
                <pre className="m-0 p-3 whitespace-pre-wrap break-words text-xs bg-black/30 rounded-b">
{JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
