import React from 'react'
import Aurora from '../components/Aurora'
import { GradientButton } from '@/components/ui/gradient-button'

type Stop = { stop: string; lat: number; lng: number }

export default function TripPlanner() {
  const [stops, setStops] = React.useState<Stop[]>([
    { stop: 'Start - Bangalore', lat: 12.9716, lng: 77.5946 },
    { stop: 'Mysore Palace', lat: 12.3051, lng: 76.6552 },
    { stop: 'Brindavan Gardens', lat: 12.421, lng: 76.575 },
  ])

  const addStop = () => setStops([...stops, { stop: 'New Stop', lat: 12.9, lng: 77.5 }])
  const removeStop = (i: number) => setStops(stops.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= stops.length) return
    const next = stops.slice()
    const [item] = next.splice(i, 1)
    next.splice(j, 0, item)
    setStops(next)
  }
  const simulateOptimize = () => {
    // Emulate optimization by reordering with a gentle animation
    const shuffled = [...stops].sort(() => Math.random() - 0.5)
    setStops(shuffled)
  }

  return (
    <div className="relative min-h-screen p-4 space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 text-white">
        <Aurora />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,.5), transparent 30%), radial-gradient(circle at 80% 60%, rgba(255,255,255,.3), transparent 30%)'
        }} />
        <div className="relative z-10 px-6 py-10 md:px-10 md:py-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Trip Planner</h2>
          <p className="mt-1 text-white/80">Build your perfect day trip with multiple stops.</p>
        </div>
      </section>

      {/* Editor */}
      <section className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Stops</h3>
            <div className="flex gap-2">
              <GradientButton className="h-9 px-3 text-sm" onClick={addStop}>Add Stop</GradientButton>
              <GradientButton className="h-9 px-3 text-sm" onClick={simulateOptimize}>Optimize (Mock)</GradientButton>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {stops.map((s, i) => (
              <div key={i} className="rounded-xl border bg-white/70 p-3 flex flex-col gap-2 md:flex-row md:items-center md:gap-2 transition">
                <div className="flex items-center gap-2">
                  <GradientButton className="h-8 w-8 p-0 text-xs" onClick={() => move(i, -1)}>▲</GradientButton>
                  <GradientButton className="h-8 w-8 p-0 text-xs" onClick={() => move(i, 1)}>▼</GradientButton>
                </div>
                <input className="border rounded p-2 flex-1" value={s.stop} onChange={(e) => {
                  const ns = [...stops]; ns[i] = { ...s, stop: e.target.value }; setStops(ns)
                }} />
                <input type="number" step="0.0001" className="border rounded p-2 w-32" value={s.lat} onChange={(e) => {
                  const ns = [...stops]; ns[i] = { ...s, lat: parseFloat(e.target.value) }; setStops(ns)
                }} />
                <input type="number" step="0.0001" className="border rounded p-2 w-32" value={s.lng} onChange={(e) => {
                  const ns = [...stops]; ns[i] = { ...s, lng: parseFloat(e.target.value) }; setStops(ns)
                }} />
                <GradientButton className="text-xs px-2 py-1" onClick={() => removeStop(i)}>Remove</GradientButton>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm">
          <h3 className="font-semibold">Route Preview</h3>
          <div className="mt-3 h-80 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border p-4 overflow-auto text-sm">
            {stops.map((s, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <span className="h-7 w-7 rounded-full bg-indigo-600 text-white grid place-items-center text-xs font-semibold">{i + 1}</span>
                <div className="flex-1">
                  <div className="font-medium">{s.stop}</div>
                  <div className="text-slate-600">{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
