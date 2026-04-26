import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Aurora from '../components/Aurora'
import { GradientButton } from '@/components/ui/gradient-button'

export default function DriverDashboard() {
  const nav = useNavigate()
  // Animated counters
  const [stats, setStats] = React.useState({ tripsToday: 3, distance: 128, onTime: 97 })
  const [progress, setProgress] = React.useState(42) // %
  const [speed, setSpeed] = React.useState(36) // km/h
  const [pos, setPos] = React.useState({ x: 10, y: 80 }) // for mini-map

  React.useEffect(() => {
    const tick = setInterval(() => {
      setSpeed((s) => Math.max(0, Math.min(80, Math.round(s + (Math.random() * 10 - 5)))))
      setProgress((p) => (p >= 98 ? 15 : Math.min(98, p + Math.random() * 2)))
      setPos((p) => ({ x: (p.x + 2) % 180, y: 80 + Math.sin((p.x + 2) / 20) * 20 }))
    }, 2000)
    return () => clearInterval(tick)
  }, [])

  return (
    <div className="relative min-h-screen p-4 space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <Aurora />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 10%, rgba(255,255,255,.5), transparent 30%), radial-gradient(circle at 80% 50%, rgba(255,255,255,.3), transparent 30%)'
        }} />
        {/* Floating Profile & Notifications icons */}
        <Link
          to="/profile"
          onClick={(e) => { e.preventDefault(); nav('/profile') }}
          className="absolute left-4 top-4 z-30 pointer-events-auto h-11 w-11 grid place-items-center rounded-full text-white
                     bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur shadow-md transition"
          aria-label="Open profile"
          title="Profile"
        >
          👤
        </Link>
        <Link
          to="/notifications"
          onClick={(e) => { e.preventDefault(); nav('/notifications') }}
          className="absolute right-4 top-4 z-30 pointer-events-auto h-11 w-11 grid place-items-center rounded-full text-white
                     bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur shadow-md transition"
          aria-label="Open notifications"
          title="Notifications"
        >
          🔔
        </Link>
        <div className="relative z-10 px-6 py-10 md:px-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome, Driver</h2>
          <p className="mt-1 text-white/80">Here’s your day at a glance. Drive safe and on time.</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* KPI cards */}
            <StatCard label="Trips Today" value={stats.tripsToday} suffix="" accent="bg-white/10" />
            <StatCard label="Distance" value={stats.distance} suffix=" km" accent="bg-white/10" />
            <StatCard label="On‑time Rate" value={stats.onTime} suffix="%" accent="bg-white/10" />
          </div>
          {/* CTA removed as per request */}
        </div>
      </section>

      {/* Body grid */}
      <section className="grid xl:grid-cols-3 gap-6">
        {/* Active trip */}
        <div className="xl:col-span-2 rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Trip · T001</h3>
            <span className="inline-flex items-center gap-2 text-sm text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> En‑route
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">Bangalore → Mysore · 2 stops</p>

          {/* Progress */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress</span>
              <span className="font-medium">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <InfoPill label="ETA" value="01h 25m" />
              <InfoPill label="Speed" value={`${speed} km/h`} />
              <InfoPill label="Next Stop" value="Mysore Palace" />
            </div>
          </div>

          {/* Mini live map (SVG) */}
          <div className="mt-6">
            <div className="h-56 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border grid place-items-center">
              <svg viewBox="0 0 200 120" className="w-[95%] h-[85%]">
                <defs>
                  <linearGradient id="route" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <polyline points="10,100 60,80 110,60 160,40 190,30" fill="none" stroke="url(#route)" strokeWidth="4" strokeLinecap="round" />
                {/* moving dot */}
                <circle cx={pos.x} cy={pos.y} r="4" fill="#ef4444">
                  <animate attributeName="r" values="4;5;4" dur="1.2s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          {/* Next actions */}
          <div className="rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm">
            <h4 className="font-semibold">Quick Actions</h4>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <ActionBtn label="Start Trip" color="indigo" />
              <ActionBtn label="Check‑in Stop" color="emerald" />
              <ActionBtn label="Call Operator" color="sky" />
              <ActionBtn label="End Trip" color="rose" />
              <Link
                to="/driver/confirmations"
                className="col-span-2 h-10 rounded-lg text-white font-medium transition bg-indigo-600 hover:bg-indigo-700 grid place-items-center"
              >
                Create New Trip
              </Link>
              <Link
                to="/driver/trip/confirmation"
                className="col-span-2 h-10 rounded-lg text-white font-medium transition bg-emerald-600 hover:bg-emerald-700 grid place-items-center"
              >
                Confirm Trip
              </Link>
              <Link
                to="/driver/share"
                className="col-span-2 h-10 rounded-lg text-white font-medium transition bg-sky-600 hover:bg-sky-700 grid place-items-center"
              >
                Share Live Tracking
              </Link>
              <Link
                to="/driver/routing"
                className="col-span-2 h-10 rounded-lg text-white font-medium transition bg-violet-600 hover:bg-violet-700 grid place-items-center"
              >
                Routing
              </Link>
            </div>
          </div>

          {/* Alerts */}
          <div className="rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm">
            <h4 className="font-semibold">Recent Alerts</h4>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                <div>
                  <div className="font-medium">Harsh Brake</div>
                  <div className="text-slate-600">09:42 AM · Near NICE Road</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
                <div>
                  <div className="font-medium">Over Speed</div>
                  <div className="text-slate-600">10:03 AM · Mysore Rd</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, suffix, accent }: { label: string; value: number; suffix: string; accent: string }) {
  const [display, setDisplay] = React.useState(0)
  React.useEffect(() => {
    let start = 0
    const step = () => {
      start += Math.max(1, Math.round((value - start) / 5))
      setDisplay(Math.min(value, start))
      if (start < value) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])
  return (
    <div className={`rounded-xl ${accent} border border-white/20 p-4 shadow-sm`}> 
      <div className="text-sm opacity-90">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{display}{suffix}</div>
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 border px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium text-slate-800">{value}</div>
    </div>
  )
}

function ActionBtn({ label, color }: { label: string; color: 'indigo'|'emerald'|'sky'|'rose' }) {
  const colorMap: Record<string, string> = {
    indigo: '',
    emerald: '',
    sky: '',
    rose: '',
  }
  return (
    <GradientButton className="h-10 rounded-lg text-white font-medium transition">{label}</GradientButton>
  )
}
