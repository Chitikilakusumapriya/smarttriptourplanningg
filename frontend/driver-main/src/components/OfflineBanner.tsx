import React from 'react'

export default function OfflineBanner() {
  const [online, setOnline] = React.useState(navigator.onLine)
  React.useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  if (online) return null
  return (
    <div className="w-full bg-yellow-500 text-black text-sm px-3 py-2 text-center">
      You are offline. Actions will be queued.
    </div>
  )
}
