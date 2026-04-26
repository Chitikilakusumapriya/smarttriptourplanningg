import React from 'react'
import Aurora from '../components/Aurora'
import { GradientButton } from '@/components/ui/gradient-button'

export default function NotificationsPage() {
  const [filter, setFilter] = React.useState<'all'|'info'|'warning'>('all')
  const data = [
    { id: 'n1', t: 'Now', type: 'info', text: 'Trip started successfully' },
    { id: 'n2', t: '5 min', type: 'info', text: 'You are approaching next stop' },
    { id: 'n3', t: '10 min', type: 'warning', text: 'Speed exceeded for 30s' },
  ]
  const list = data.filter(d => filter === 'all' || d.type === filter)

  return (
    <div className="relative min-h-screen p-4 space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-orange-600 text-white">
        <Aurora />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,.5), transparent 30%), radial-gradient(circle at 80% 60%, rgba(255,255,255,.3), transparent 30%)'
        }} />
        <div className="relative z-10 px-6 py-10 md:px-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="mt-1 text-white/80">Trip updates, reminders, and safety messages.</p>
        </div>
      </section>

      <section className="rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Filter:</span>
          <GradientButton className="h-9 px-3 text-sm" onClick={() => setFilter('all')}>All</GradientButton>
          <GradientButton className="h-9 px-3 text-sm" onClick={() => setFilter('info')}>Info</GradientButton>
          <GradientButton className="h-9 px-3 text-sm" onClick={() => setFilter('warning')}>Warning</GradientButton>
        </div>

        <div className="mt-5 relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200" />
          <ul className="space-y-4">
            {list.map((n, idx) => (
              <li key={n.id} className="relative pl-10">
                <span className={`absolute left-2 top-2 h-4 w-4 rounded-full ring-4 ring-white ${n.type==='warning'?'bg-amber-500':'bg-blue-600'}`} />
                <div className="rounded-xl bg-white/80 border p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{n.t}</span>
                    <span className="uppercase tracking-wide">{n.type}</span>
                  </div>
                  <div className="mt-1 text-slate-800">{n.text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
