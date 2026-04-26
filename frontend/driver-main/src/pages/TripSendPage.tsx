import React from 'react'
import { Link } from 'react-router-dom'
import { GradientButton } from '@/components/ui/gradient-button'
// static background only

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export default function TripSendPage() {
  const [userEmail, setUserEmail] = React.useState('')
  const [familyEmail, setFamilyEmail] = React.useState('')
  const [defaults, setDefaults] = React.useState<null | {
    pickup: string
    destination: string
    stops: string[]
    persons: number
    trip_price: number
    trip_type: string
  }>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const gradientBg = 'bg-gradient-to-br from-indigo-700 via-purple-700 to-emerald-600'
  const validUser = !userEmail || isValidEmail(userEmail)
  const validFamily = !familyEmail || isValidEmail(familyEmail)
  const canConfirm = !!defaults && isValidEmail(userEmail) && isValidEmail(familyEmail) && !submitting

  React.useEffect(() => {
    setLoading(true)
    setError(null)
    try {
      let raw = sessionStorage.getItem('trip_send_defaults')
      if (!raw) raw = localStorage.getItem('trip_send_defaults')
      if (raw) {
        const j = JSON.parse(raw)
        setDefaults({
          pickup: j?.pickup ?? '',
          destination: j?.destination ?? '',
          stops: Array.isArray(j?.stops) ? j.stops : (j?.stops ? [String(j.stops)] : []),
          persons: typeof j?.persons === 'number' ? j.persons : 1,
          trip_price: typeof j?.trip_price === 'number' ? j.trip_price : 0,
          trip_type: j?.trip_type ?? 'One-way',
        })
      } else {
        setError('Trip summary not found. Please confirm from the summary page first.')
      }
    } catch (e) {
      setError('Failed to read trip summary')
    } finally {
      setLoading(false)
    }
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!defaults) return
    if (!canConfirm) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const body = {
        pickup: defaults.pickup,
        destination: defaults.destination,
        stops: defaults.stops?.length ? defaults.stops.join(', ') : '',
        persons: defaults.persons,
        trip_price: defaults.trip_price,
        trip_type: defaults.trip_type,
        user_email: userEmail,
        family_email: familyEmail,
      }
      const res = await fetch('http://localhost:5005/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.message || `Failed (HTTP ${res.status})`)
      }
      setSuccess(true)
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to send trip details')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen ab-page w-full px-4 py-6">
      <div className="w-full max-w-3xl mx-auto space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Send Trip Details</h1>
            <Link to="/driver/dashboard" className="rounded-md bg-slate-600 hover:bg-slate-700 px-3 py-2 text-sm">Back</Link>
          </div>

          {loading && <div className="mt-4">Loading…</div>}
          {error && <div className="mt-4 text-red-200 text-sm">{error}</div>}

          {!loading && !error && !success && (
            <form className="mt-4 space-y-4" onSubmit={onSubmit}>
              {defaults && (
                <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                  <div className="text-lg font-semibold mb-2">Trip Preview</div>
                  <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
                    <dt className="col-span-1 text-white/70">Pickup</dt>
                    <dd className="col-span-2 text-white/95">{defaults.pickup || '—'}</dd>
                    <dt className="col-span-1 text-white/70">Destination</dt>
                    <dd className="col-span-2 text-white/95">{defaults.destination || '—'}</dd>
                    <dt className="col-span-1 text-white/70">Stops</dt>
                    <dd className="col-span-2 text-white/95">{defaults.stops?.length ? defaults.stops.join(' → ') : 'None'}</dd>
                    <dt className="col-span-1 text-white/70">Persons</dt>
                    <dd className="col-span-2 text-white/95">{defaults.persons}</dd>
                    <dt className="col-span-1 text-white/70">Trip Price</dt>
                    <dd className="col-span-2 text-white/95">₹{defaults.trip_price}</dd>
                    <dt className="col-span-1 text-white/70">Trip Type</dt>
                    <dd className="col-span-2 text-white/95">{defaults.trip_type}</dd>
                  </dl>
                </div>
              )}

              <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                <div className="text-lg font-semibold mb-2">Recipient Emails</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/80">User Email</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className={`mt-1 w-full rounded-md bg-white/20 border px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 ${validUser ? 'border-white/30 focus:ring-emerald-300' : 'border-rose-400 focus:ring-rose-300'}`}
                      placeholder="user@example.com"
                      required
                    />
                    {!validUser && (
                      <div className="mt-1 text-xs text-rose-200">Please enter a valid email</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-white/80">Family Email</label>
                    <input
                      type="email"
                      value={familyEmail}
                      onChange={(e) => setFamilyEmail(e.target.value)}
                      className={`mt-1 w-full rounded-md bg-white/20 border px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:ring-2 ${validFamily ? 'border-white/30 focus:ring-emerald-300' : 'border-rose-400 focus:ring-rose-300'}`}
                      placeholder="family@example.com"
                      required
                    />
                    {!validFamily && (
                      <div className="mt-1 text-xs text-rose-200">Please enter a valid email</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {submitError && <div className="text-red-200 text-sm">{submitError}</div>}
                <GradientButton type="submit" disabled={!canConfirm} className="px-4 py-2 text-sm disabled:opacity-60">
                  {submitting ? 'Sending…' : 'Confirm'}
                </GradientButton>
              </div>
            </form>
          )}

          {!loading && !error && success && (
            <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-6">
              <div className="flex items-center gap-3 text-emerald-200">
                <span className="text-2xl">✅</span>
                <div className="text-lg font-semibold">Your trip is confirmed and sent to your mail</div>
              </div>
              <div className="mt-3 text-sm text-white/90">
                Sent to <span className="font-mono">{userEmail}</span>{familyEmail ? (<><span> and </span><span className="font-mono">{familyEmail}</span></>) : null}.
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Link to="/driver/dashboard" className="rounded-md bg-slate-600 hover:bg-slate-700 px-3 py-2 text-sm">Back to Dashboard</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
