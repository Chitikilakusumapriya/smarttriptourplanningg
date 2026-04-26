import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
// Background removed for a pure black login screen

export default function LoginPage() {
  const nav = useNavigate()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [role, setRole] = React.useState<'DRIVER' | 'ADMIN' | 'PASSENGER'>('DRIVER')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [active, setActive] = React.useState(false) // UI-only: mirrors the demo toggle

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || 'Login failed')
      }
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; role?: string }
      const roleFromServer = (data?.role ?? role).toString().toLowerCase()
      localStorage.setItem('role', roleFromServer)
      if (roleFromServer === 'admin') nav('/admin/dashboard')
      else if (roleFromServer === 'passenger') nav('/passenger/plan')
      else nav('/driver/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center text-white ab-page">
      <div className={`cs-container ${active ? 'active' : ''}`}>
        {/* Login form */}
        <div className="cs-form-box cs-login">
          <form onSubmit={onSubmit}>
            <h1>Login</h1>

            {/* Role */}
            <div className="cs-input-box">
              <select
                className="cs-input"
                value={role}
                onChange={(e) => setRole(e.target.value as 'DRIVER' | 'ADMIN' | 'PASSENGER')}
              >
                <option value="DRIVER">DRIVER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="PASSENGER">PASSENGER</option>
              </select>
              <span className="cs-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12l-8-6h16l-8 6zm0 2l8-6v10H4V8l8 6z"/></svg>
              </span>
            </div>

            {/* Email */}
            <div className="cs-input-box">
              <input
                className="cs-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="cs-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v16H4z"/><path d="M22 6L12 13 2 6"/></svg>
              </span>
            </div>

            {/* Password */}
            <div className="cs-input-box">
              <input
                className="cs-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="cs-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7 11V7a5 5 0 0 1 10 0v4"/><rect x="3" y="11" width="18" height="10" rx="2"/></svg>
              </span>
            </div>

            {error && <div className="cs-error">{error}</div>}

            <div className="cs-forgot">
              <button type="button">Forgot Password?</button>
            </div>

            <button type="submit" className="cs-btn" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
            </button>
            <p className="cs-helper">or login with social platforms</p>
            <div className="cs-social">
              <a href="#" aria-label="Google">G</a>
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="GitHub">GH</a>
              <a href="#" aria-label="LinkedIn">in</a>
            </div>
          </form>
        </div>

        {/* Register mock (UI only) */}
        <div className="cs-form-box cs-register" aria-hidden>
          <form onSubmit={(e)=> e.preventDefault()}>
            <h1>Registration</h1>
            <div className="cs-input-box">
              <input className="cs-input" placeholder="Username" />
              <span className="cs-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"/></svg>
              </span>
            </div>
            <div className="cs-input-box">
              <input className="cs-input" type="email" placeholder="Email" />
              <span className="cs-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h16v16H4z"/><path d="M22 6L12 13 2 6"/></svg>
              </span>
            </div>
            <div className="cs-input-box">
              <input className="cs-input" type="password" placeholder="Password" />
              <span className="cs-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7 11V7a5 5 0 0 1 10 0v4"/><rect x="3" y="11" width="18" height="10" rx="2"/></svg>
              </span>
            </div>
            <button className="cs-btn" type="button" onClick={()=>setActive(false)}>Back to Login</button>
            <p className="cs-helper">or register with social platforms</p>
            <div className="cs-social">
              <a href="#" aria-label="Google">G</a>
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="GitHub">GH</a>
              <a href="#" aria-label="LinkedIn">in</a>
            </div>
          </form>
        </div>

        {/* Toggle panels */}
        <div className="cs-toggle-box">
          <div className="cs-toggle-panel cs-left">
            <h1>Hello, Welcome!</h1>
            <p>Don't have an account?</p>
            <Link to="/register" className="cs-btn cs-outline">Register</Link>
          </div>
          <div className="cs-toggle-panel cs-right">
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button type="button" className="cs-btn cs-outline" onClick={()=>setActive(false)}>Login</button>
          </div>
        </div>
      </div>
    </div>
  )
}

