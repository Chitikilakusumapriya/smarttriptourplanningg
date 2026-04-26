import React from 'react'

export default function Aurora({ className = '' }: { className?: string }) {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}>
      <svg viewBox="0 0 1200 800" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="auroraGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <filter id="auroraNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.002" numOctaves="2" seed="2">
              <animate attributeName="baseFrequency" values="0.002;0.004;0.002" dur="20s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="120" />
          </filter>
        </defs>
        <rect width="1200" height="800" fill="url(#auroraGradient)" filter="url(#auroraNoise)" />
      </svg>
      {/* soft glow overlay */}
      <div className="absolute inset-0 mix-blend-screen blur-3xl opacity-40" style={{
        background: 'radial-gradient(600px 300px at 20% 20%, rgba(255,255,255,.35), transparent), radial-gradient(600px 300px at 80% 60%, rgba(255,255,255,.25), transparent)'
      }} />
    </div>
  )
}
