import React from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts'
import Aurora from '../components/Aurora'

export default function AdminDashboard() {
  const [counters, setCounters] = React.useState({ trips: 12, activeDrivers: 5, alerts: 3 })
  const [spark, setSpark] = React.useState(
    Array.from({ length: 12 }, (_, i) => ({ h: `${i + 8}:00`, v: Math.round(10 + Math.random() * 30) }))
  )
  const [alertsPerHour, setAlertsPerHour] = React.useState(
    Array.from({ length: 8 }, (_, i) => ({ h: `${i + 9}`, count: Math.round(Math.random() * 5) + (i > 4 ? 2 : 0) }))
  )

  React.useEffect(() => {
    const id = setInterval(() => {
      setCounters((c) => ({ ...c, alerts: Math.max(0, c.alerts + (Math.random() > 0.6 ? 1 : 0)) }))
      setSpark((arr) => arr.slice(1).concat({ h: `${new Date().getHours()}:00`, v: Math.round(10 + Math.random() * 30) }))
      setAlertsPerHour((arr) => arr.map((a, i) => (i === arr.length - 1 ? { ...a, count: Math.max(0, a.count + (Math.random() > 0.5 ? 1 : 0)) } : a)))
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-600 text-white">
        <Aurora />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,.5), transparent 30%), radial-gradient(circle at 85% 60%, rgba(255,255,255,.3), transparent 30%)'
        }} />
        {/* Floating Profile icon */}
        <Link
          to="/profile"
          className="absolute left-4 top-4 z-30 h-11 w-11 grid place-items-center rounded-full text-white
                     bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur shadow-md transition"
          aria-label="Open profile"
          title="Profile"
        >
          👤
        </Link>
        <div className="relative z-10 px-6 py-10 md:px-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Operations Overview</h2>
          <p className="mt-1 text-white/80">Monitor trips, drivers and safety in real-time.</p>

          {/* KPI cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Kpi label="Total Trips Today" value={counters.trips} />
            <Kpi label="Active Drivers" value={counters.activeDrivers} />
            <Kpi label="Alerts Triggered" value={counters.alerts} warn />
          </div>

          {/* Stunning CTA to Monitoring */}
          <div className="mt-6">
            <Link
              to="/monitoring"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-white
                         bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 shadow-lg shadow-cyan-500/30
                         hover:from-emerald-300 hover:via-teal-400 hover:to-cyan-400 transition transform hover:-translate-y-0.5"
            >
              📊 Open Monitoring
            </Link>
            <Link
              to="/admin/vehicles/add"
              className="ml-3 inline-flex items-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-white
                         bg-gradient-to-r from-indigo-400 via-fuchsia-500 to-pink-500 shadow-lg shadow-pink-500/30
                         hover:from-indigo-300 hover:via-fuchsia-400 hover:to-pink-400 transition transform hover:-translate-y-0.5"
            >
              🚗 Add Vehicle
            </Link>
            <Link
              to="/admin/trips"
              className="ml-3 inline-flex items-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-white
                         bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 shadow-lg shadow-indigo-600/30
                         hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 transition transform hover:-translate-y-0.5"
            >
              📜 All Trips
            </Link>
            <Link
              to="/admin/confirmed-trips"
              className="ml-3 inline-flex items-center gap-2 rounded-full px-5 py-3 text-base font-semibold text-white
                         bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 shadow-lg shadow-emerald-600/30
                         hover:from-emerald-400 hover:via-green-500 hover:to-teal-500 transition transform hover:-translate-y-0.5"
            >
              ✅ Confirmed Trips
            </Link>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="grid xl:grid-cols-3 gap-6">
        {/* Map + Spark line */}
        <div className="xl:col-span-2 rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live Map (Mock)</h3>
            <span className="text-sm text-slate-600">Drivers: {counters.activeDrivers}</span>
          </div>
          <div className="mt-3 h-80 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border grid place-items-center">
            <div className="text-slate-500">Map placeholder with driver markers</div>
          </div>
          <div className="mt-4 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spark} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="h" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <Tooltip cursor={{ stroke: '#cbd5e1' }} contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="v" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts + Bar chart */}
        <div className="space-y-6">
          <div className="rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm">
            <h4 className="font-semibold">Recent Alerts</h4>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
                <div>
                  <div className="font-medium">Over Speed · Ravi</div>
                  <div className="text-slate-600">10:45 AM · BLR Mysore Hwy</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                <div>
                  <div className="font-medium">Harsh Brake · Amit</div>
                  <div className="text-slate-600">10:48 AM · NICE Rd</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm h-64">
            <h4 className="font-semibold mb-2">Alerts per Hour</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertsPerHour} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="h" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  )
}

function Kpi({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  const [display, setDisplay] = React.useState(0)
  React.useEffect(() => {
    let s = 0
    const step = () => {
      s += Math.max(1, Math.round((value - s) / 5))
      setDisplay(Math.min(value, s))
      if (s < value) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])
  return (
    <div className={`rounded-xl bg-white/10 border border-white/20 p-4 shadow-sm ${warn ? 'ring-1 ring-rose-300/40' : ''}`}>
      <div className="text-sm opacity-90">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{display}</div>
    </div>
  )
}
