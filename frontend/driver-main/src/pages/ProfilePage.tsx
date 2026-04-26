import React from 'react'
import Aurora from '../components/Aurora'
import { GradientButton } from '@/components/ui/gradient-button'
// static background only

export default function ProfilePage() {
  const [name, setName] = React.useState('Ravi Kumar')
  const [role, setRole] = React.useState('Driver')
  const [vehicle, setVehicle] = React.useState('KA09 AB 1234')
  const rating = 4.7

  const onSave = (e: React.FormEvent) => {
    e.preventDefault()
    // no persistence in Phase-1; just a toast-like alert
    alert('Profile updated (mock)')
  }

  return (
    <div className="min-h-screen ab-page w-full px-4 py-6 space-y-8">
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <Aurora />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 15% 20%, rgba(255,255,255,.5), transparent 30%), radial-gradient(circle at 85% 60%, rgba(255,255,255,.3), transparent 30%)'
        }} />
        <div className="relative z-10 px-6 py-10 md:px-10 md:py-14">
          <div className="flex items-center gap-4">
            <img alt="avatar" className="h-16 w-16 rounded-full ring-4 ring-white/20 object-cover" src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=256&auto=format&fit=crop" />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{name}</h2>
              <p className="text-white/80">{role}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Stat label="Rating" value={`${rating.toFixed(1)} ⭐`} />
            <Stat label="Trips Completed" value="248" />
            <Stat label="Safe Miles" value="12,430 km" />
          </div>
        </div>
      </section>

      {/* Details & Edit */}
      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm">
          <h3 className="font-semibold">Profile Details</h3>
          <form onSubmit={onSave} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">Full Name</label>
              <input className="w-full rounded-md border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Role</label>
              <select className="w-full rounded-md border px-3 py-2" value={role} onChange={(e) => setRole(e.target.value)}>
                <option>Driver</option>
                <option>Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Vehicle</label>
              <input className="w-full rounded-md border px-3 py-2" value={vehicle} onChange={(e) => setVehicle(e.target.value)} />
            </div>

            <div className="sm:col-span-2 flex gap-3">
              <GradientButton className="h-10 px-4" type="submit">Save Changes</GradientButton>
              <GradientButton className="h-10 px-4" type="button" onClick={() => { setName('Ravi Kumar'); setRole('Driver'); setVehicle('KA09 AB 1234') }}>Reset</GradientButton>
            </div>
          </form>
        </div>

        {/* Badge / meta */}
        <div className="rounded-2xl border bg-white/60 backdrop-blur p-5 shadow-sm space-y-4">
          <h3 className="font-semibold">Badges</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Safe Driver</span>
            <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">Punctual</span>
            <span className="px-2 py-1 rounded-full bg-rose-100 text-rose-700">Customer Star</span>
          </div>
          <h3 className="font-semibold">Documents</h3>
          <ul className="text-sm space-y-1">
            <li>License: Verified ✅</li>
            <li>Permit: Valid till 2026</li>
            <li>Insurance: Comprehensive</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 border border-white/20 p-4 shadow-sm">
      <div className="text-sm opacity-90">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
    </div>
  )
}
