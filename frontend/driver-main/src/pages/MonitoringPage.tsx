import React from 'react'
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

export default function MonitoringPage() {
  const [alerts, setAlerts] = React.useState([
    { id: 'a1', type: 'Off Route', driver: 'Ravi', time: '10:42 AM' },
    { id: 'a2', type: 'Over Speed', driver: 'Ravi', time: '10:48 AM' },
  ])
  const [speedTrend, setSpeedTrend] = React.useState(
    Array.from({ length: 12 }, (_, i) => ({ t: `${i + 9}:00`, v: 30 + Math.round(Math.random() * 40) }))
  )
  const [alertsHour, setAlertsHour] = React.useState(
    Array.from({ length: 8 }, (_, i) => ({ h: `${i + 9}`, count: Math.round(Math.random() * 4) + (i > 4 ? 2 : 0) }))
  )

  React.useEffect(() => {
    const id = setInterval(() => {
      setSpeedTrend((arr) => arr.slice(1).concat({ t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), v: 30 + Math.round(Math.random() * 40) }))
      setAlertsHour((arr) => arr.map((a, i) => (i === arr.length - 1 ? { ...a, count: a.count + (Math.random() > 0.6 ? 1 : 0) } : a)))
      if (Math.random() > 0.7) {
        setAlerts((list) => [{ id: crypto.randomUUID(), type: Math.random() > 0.5 ? 'Over Speed' : 'Off Route', driver: 'Ravi', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...list].slice(0, 8))
      }
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
        <Aurora />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 25% 20%, rgba(255,255,255,.5), transparent 30%), radial-gradient(circle at 85% 60%, rgba(255,255,255,.3), transparent 30%)'
        }} />
        <div className="relative z-10 px-6 py-10 md:px-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Monitoring & Safety</h2>
          <p className="mt-1 text-white/80">Live telematics, trends, and alerts feed.</p>
        </div>
      </section>

      <section className="grid xl:grid-cols-3 gap-6">
        {/* Alerts stream */}
        <div className="rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm space-y-3">
          <h3 className="font-semibold">Recent Alerts</h3>
          <ul className="space-y-3 text-sm">
            {alerts.map((a) => (
              <li key={a.id} className="flex items-start gap-3">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${a.type === 'Over Speed' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                <div>
                  <div className="font-medium">{a.type} · {a.driver}</div>
                  <div className="text-slate-600">{a.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Speed trend */}
        <div className="rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm h-80">
          <h3 className="font-semibold mb-2">Average Speed Trend (km/h)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={speedTrend} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="t" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="v" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts per hour */}
        <div className="rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm h-80">
          <h3 className="font-semibold mb-2">Alerts per Hour</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={alertsHour} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="h" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
