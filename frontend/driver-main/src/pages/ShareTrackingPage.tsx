import { useState } from 'react'
import axios from 'axios'

export default function ShareTrackingPage() {
  const [driverId] = useState('driver_101') // normally from login session
  const [isSharing, setIsSharing] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  const shareTracking = async () => {
    setStatusMsg('')
    setIsSharing(true)

    if (!navigator.geolocation) {
      setStatusMsg('❌ Geolocation not supported by your browser.')
      setIsSharing(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await axios.post('http://localhost:5004/api/location', {
            driver_id: driverId,
            latitude,
            longitude,
          })

          if (res.status === 200 || res.status === 201) {
            setStatusMsg('✅ Location shared successfully!')
          } else {
            setStatusMsg('⚠️ Something went wrong while sharing location.')
          }
        } catch (err) {
          console.error('Error sending data:', err)
          setStatusMsg('❌ Could not reach backend. Check Flask server.')
        } finally {
          setIsSharing(false)
        }
      },
      (error) => {
        setStatusMsg('❌ Failed to get GPS location.')
        console.error(error)
        setIsSharing(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-semibold mb-6">🚗 Share Live Tracking</h1>

      <div className="bg-gray-800 p-6 rounded-xl w-full max-w-sm text-center border border-white/10">
        <p className="text-lg mb-4">
          Driver ID: <strong>{driverId}</strong>
        </p>

        <button
          onClick={shareTracking}
          disabled={isSharing}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-70 px-4 py-2 rounded-md font-medium w-full transition"
        >
          {isSharing ? '📡 Sharing...' : 'Share Tracking Now'}
        </button>

        {statusMsg && <p className="mt-4 text-sm text-gray-200">{statusMsg}</p>}
      </div>
    </div>
  )
}
