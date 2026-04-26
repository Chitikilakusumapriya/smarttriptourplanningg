import React from 'react'

export default function TripMapView() {
  const [pos, setPos] = React.useState({ lat: 12.9716, lng: 77.5946 })
  React.useEffect(() => {
    const id = setInterval(() => setPos(p => ({ lat: p.lat + 0.0005, lng: p.lng + 0.0005 })), 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Trip Map (Mock)</h2>
      <div className="h-96 bg-gray-100 rounded grid place-items-center">
        Driver at {pos.lat.toFixed(4)}, {pos.lng.toFixed(4)} (simulated)
      </div>
    </div>
  )
}
