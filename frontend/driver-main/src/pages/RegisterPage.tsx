import React from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function RegisterPage() {
  const nav = useNavigate()
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [role, setRole] = React.useState<'DRIVER' | 'ADMIN' | 'PASSENGER'>('DRIVER')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [ok, setOk] = React.useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOk(false)
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, phone }),
      })
      if (res.ok) {
        setOk(true)
        setTimeout(() => nav('/login'), 800)
      } else {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || 'Registration failed')
      }
    } catch (err: any) {
      setError(err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center text-white ab-page">
      <div className={`cs-container active`}>
        {/* Login mock (UI only) */}
        <div className="cs-form-box cs-login" aria-hidden>
          <form onSubmit={(e)=>e.preventDefault()}>
            <h1>Login</h1>
            <div className="cs-input-box">
              <input className="cs-input" placeholder="Email" />
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
            <Link to="/login" className="cs-btn cs-outline">Go to Login</Link>
            <p className="cs-helper">or login with social platforms</p>
            <div className="cs-social"><a href="#">G</a><a href="#">f</a><a href="#">GH</a><a href="#">in</a></div>
          </form>
        </div>

        {/* Register form (real API) */}
        <div className="cs-form-box cs-register">
          <form onSubmit={onSubmit}>
            <h1>Registration</h1>
            <div className="cs-input-box">
              <input
                className="cs-input"
                placeholder="Username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <span className="cs-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"/></svg>
              </span>
            </div>
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
            <div className="cs-input-box">
              <input
                className="cs-input"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                pattern="[0-9]{10,}"
                required
              />
              <span className="cs-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.36 11.36 0 0 0 3.56.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 7a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .57 3.56 1 1 0 0 1-.24 1.01l-2.21 2.22z"/></svg>
              </span>
            </div>
            <div className="cs-input-box">
              <input
                className="cs-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <span className="cs-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7 11V7a5 5 0 0 1 10 0v4"/><rect x="3" y="11" width="18" height="10" rx="2"/></svg>
              </span>
            </div>
            <div className="cs-input-box">
              <select
                className="cs-input"
                value={role}
                onChange={(e) => setRole(e.target.value as 'DRIVER' | 'ADMIN' | 'PASSENGER')}
              >
                <option value="DRIVER">Driver</option>
                <option value="ADMIN">Admin</option>
                <option value="PASSENGER">Passenger</option>
              </select>
              <span className="cs-icon" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12l-8-6h16l-8 6zm0 2l8-6v10H4V8l8 6z"/></svg>
              </span>
            </div>

            {error && <div className="cs-error" style={{color:'#e11d48'}}>{error}</div>}
            {ok && <div className="cs-error" style={{color:'#10b981'}}>Registered! Redirecting to login…</div>}

            <button type="submit" className="cs-btn" disabled={loading}>
              {loading ? 'Registering…' : 'Register'}
            </button>
          </form>
        </div>

        {/* Toggle panels */}
        <div className="cs-toggle-box">
          <div className="cs-toggle-panel cs-left">
            <h1>Hello, Welcome!</h1>
            <p>Already have an account?</p>
            <Link to="/login" className="cs-btn cs-outline">Login</Link>
          </div>
          <div className="cs-toggle-panel cs-right">
            <h1>Welcome Back!</h1>
            <p>Don’t have an account?</p>
            <Link to="/login" className="cs-btn cs-outline">Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

