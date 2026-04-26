import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GradientButton } from '@/components/ui/gradient-button'

export default function AddVehiclePage() {
  const nav = useNavigate()
  const [type, setType] = React.useState('')
  const [quantity, setQuantity] = React.useState<number>(1)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const canSubmit = type.trim().length > 0 && quantity > 0

  const onSubmit = async () => {
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5002/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: type.trim(), quantity })
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.message || 'Failed to add vehicles')
      }
      const j = await res.json().catch(() => ({}))
      setSuccess('Vehicles added successfully')
      // optional: navigate back after a short delay
      setTimeout(() => nav('/admin/dashboard'), 800)
    } catch (err: any) {
      setError(err?.message || 'Failed to add vehicles')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={"relative min-h-screen p-4 flex items-stretch justify-center"}>
      <div className="w-full max-w-3xl space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 text-white">
          <h1 className="text-2xl font-semibold">Add Vehicle</h1>
          <p className="text-sm text-white/80 mt-1">Create vehicles by specifying a type and quantity.</p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm mb-1">Type</label>
              <input
                className="w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="e.g., XUV"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                className="w-full rounded-md bg-white/20 border border-white/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))}
              />
            </div>
          </div>

          {error && <div className="mt-3 text-sm text-red-200">{error}</div>}
          {success && <div className="mt-3 text-sm text-emerald-200">{success}</div>}

          <div className="mt-4 flex items-center gap-2">
            <GradientButton
              type="button"
              disabled={!canSubmit || loading}
              onClick={onSubmit}
              className="px-4 py-2 font-medium disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Save'}
            </GradientButton>
            <Link to="/admin/dashboard" className="rounded-md bg-slate-600 hover:bg-slate-700 px-4 py-2 font-medium">Cancel</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
