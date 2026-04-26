import React from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { GradientButton } from '@/components/ui/gradient-button'

export default function TripConfirmationStatusPage() {
  const { id: tripId } = useParams<{ id: string }>()
  const location = useLocation()
  const nav = useNavigate()
  const confirmationIdFromState: string | undefined = (location.state as any)?.confirmationId

  const [confirmationId, setConfirmationId] = React.useState<string | null>(confirmationIdFromState || null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<any>(null)

  React.useEffect(() => {
    if (confirmationIdFromState) setConfirmationId(confirmationIdFromState)
    if (!confirmationIdFromState) {
      const fromStorage = sessionStorage.getItem('last_confirmation_id')
      if (fromStorage) setConfirmationId(fromStorage)
    }
  }, [confirmationIdFromState])

  React.useEffect(() => {
    if (!confirmationId) return
    let active = true
    let timer: any

    const poll = async () => {
      if (!active) return
      try {
        const res = await fetch(`http://localhost:5003/api/assignments/confirmation/${confirmationId}`)
        if (res.ok) {
          const j = await res.json().catch(() => null)
          if (!active) return
          if (j) {
            setData(j)
            setLoading(false)
            return // stop polling on first successful payload
          }
        }
        // transient: keep waiting and try again
        if (!active) return
        setLoading(true)
        timer = setTimeout(poll, 2000)
      } catch (_) {
        // ignore transient errors, keep spinner
        if (!active) return
        setLoading(true)
        timer = setTimeout(poll, 2000)
      }
    }

    setLoading(true)
    setError(null)
    poll()

    return () => {
      active = false
      if (timer) clearTimeout(timer)
    }
  }, [confirmationId])

  const formatValue = (val: any): string => {
    if (val === null || val === undefined) return '—'
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return String(val)
    if (Array.isArray(val)) return val.join(', ')
    return JSON.stringify(val)
  }

  return (
    <div className="min-h-screen tcs-page w-full px-4 py-6">
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Trip Confirmation</h1>
            <div className="text-sm opacity-80">Trip ID: <span className="font-mono">{tripId}</span></div>
          </div>

          {!confirmationId && (
            <div className="mt-4 text-amber-200 text-sm">No confirmation ID provided.</div>
          )}

          {confirmationId && (
            <div className="mt-2 text-sm opacity-90">Confirmation ID: <span className="font-mono">{confirmationId}</span></div>
          )}

          {loading && (
            <div className="mt-6 flex items-center gap-4 text-white/90">
              <div className="tl-loader">
                <div className="tl-truckWrapper">
                  <div className="tl-truckBody">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 198 93" className="trucksvg">
                      <path strokeWidth={3} stroke="#282828" fill="#F83D3D" d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z" />
                      <path strokeWidth={3} stroke="#282828" fill="#7D7C7C" d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z" />
                      <path strokeWidth={2} stroke="#282828" fill="#282828" d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z" />
                      <rect strokeWidth={2} stroke="#282828" fill="#FFFCAB" rx={1} height={7} width={5} y={63} x={187} />
                      <rect strokeWidth={2} stroke="#282828" fill="#282828" rx={1} height={11} width={4} y={81} x={193} />
                      <rect strokeWidth={3} stroke="#282828" fill="#DFDFDF" rx="2.5" height={90} width={121} y="1.5" x="6.5" />
                      <rect strokeWidth={2} stroke="#282828" fill="#DFDFDF" rx={2} height={4} width={6} y={84} x={1} />
                    </svg>
                  </div>
                  <div className="tl-truckTires">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" className="tiresvg">
                      <circle strokeWidth={3} stroke="#282828" fill="#282828" r="13.5" cy={15} cx={15} />
                      <circle fill="#DFDFDF" r={7} cy={15} cx={15} />
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30" className="tiresvg">
                      <circle strokeWidth={3} stroke="#282828" fill="#282828" r="13.5" cy={15} cx={15} />
                      <circle fill="#DFDFDF" r={7} cy={15} cx={15} />
                    </svg>
                  </div>
                  <div className="tl-road" />
                  <svg xmlSpace="preserve" viewBox="0 0 453.459 453.459" xmlnsXlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" version="1.1" fill="#000000" className="tl-lampPost">
                    <path d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993
      c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514
      c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16
      c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914
      h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75
      v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795
      V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z
      M232.77,111.694c0,23.442-19.071,42.514-42.514,42.514c-23.442,0-42.514-19.072-42.514-42.514c0-5.531,1.078-10.957,3.141-16.017
      h78.747C231.693,100.736,232.77,106.162,232.77,111.694z" />
                  </svg>
                </div>
              </div>
              <div>Waiting for assignment…</div>
            </div>
          )}

          {error && <div className="mt-4 text-red-200 text-sm">{error}</div>}

          {!loading && !error && data && (
            <div className="mt-4">
              <div className="text-white/95 font-medium mb-2">Response</div>
              <div className="uc-card">
                <div className="uc-inner uc-content">
                  <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm w-full">
                    {Object.keys(data).map((k) => (
                      <React.Fragment key={k}>
                        <dt className="col-span-1 text-white/70">{k}</dt>
                        <dd className="col-span-2 text-white/95 break-words">{formatValue((data as any)[k])}</dd>
                      </React.Fragment>
                    ))}
                  </dl>
                </div>
                <div className="uc-glow" />
              </div>

              {/* New action visible only after success */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    const did = (data as any)?.driver_id
                    if (did) nav(`/driver/assignments/${encodeURIComponent(String(did))}`)
                  }}
                  disabled={!((data as any)?.driver_id)}
                  className="uv-outline-btn"
                  data-text="diver confirmation"
                >
                  <span className="actual-text">&nbsp;diver confirmation&nbsp;</span>
                  <span className="hover-text" aria-hidden="true">&nbsp;diver confirmation&nbsp;</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-5 text-white flex items-center justify-between">
          <div className="space-x-2">
            <Link to={`/passenger/trip/${tripId}/summary`} className="rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-2 text-sm">Back to Summary</Link>
            <Link to={`/passenger/trip/${tripId}`} className="rounded-md bg-slate-600 hover:bg-slate-700 px-3 py-2 text-sm">Back to Details</Link>
          </div>
          <div className="text-sm text-white/80">Status is refreshed automatically</div>
        </div>
      </div>
    </div>
  )
}
