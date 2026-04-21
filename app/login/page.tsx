'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

function Wing({ flip = false }: { flip?: boolean }) {
  return (
    <svg width="28" height="24" viewBox="0 0 28 24" fill="none"
      style={{ transform: flip ? 'scaleX(-1)' : 'none', flexShrink: 0 }}>
      <path d="M4,12 Q6,4 14,7 Q9,9 11,14 Q6,17 4,12Z"
        stroke="#a8d8ea" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M11,14 Q13,19 18,17 Q15,14 13,12"
        stroke="#a8d8ea" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14,7 Q20,3 22,8 Q18,8 16,11"
        stroke="#a8d8ea" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CatSVG() {
  return (
    <svg width="110" height="90" viewBox="0 0 110 90" fill="none"
      stroke="#E8705A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="44" cy="46" r="22"/>
      <path d="M28,28 L32,18 L38,28"/>
      <path d="M50,28 L54,18 L60,28"/>
      <circle cx="36" cy="42" r="7"/>
      <circle cx="52" cy="42" r="7"/>
      <path d="M44,52 L44,54"/>
      <path d="M65,38 Q72,30 78,24"/>
      <path d="M78,24 Q83,19 87,21 Q85,26 80,28 Q75,30 72,27"/>
      <path d="M34,66 L32,76"/>
      <path d="M54,66 L56,76"/>
    </svg>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [active, setActive] = useState<'input' | 'button' | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push('/')
    })
  }, [])

  async function handleLogin() {
    if (!email.trim()) return
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    setSent(true)
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: "'VT323', monospace",
    fontSize: '17px',
    letterSpacing: '1px',
    padding: '10px 22px',
    border: '2px solid #a8d8ea',
    borderRadius: '999px',
    background: active === 'input' ? '#e4f4fb' : '#d6eef9',
    outline: 'none',
    width: '280px',
    color: '#5ab0d0',
    transition: 'background 0.15s',
  }

  const buttonStyle: React.CSSProperties = {
    fontFamily: "'VT323', monospace",
    fontSize: '17px',
    letterSpacing: '1px',
    padding: '10px 36px',
    border: 'none',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #d8a8f0 0%, #f06fcd 100%)',
    color: 'white',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: white; }
      `}</style>

      <main style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: '14px'
      }}>
        <h1 style={{
          fontFamily: "'IM Fell English', serif",
          fontSize: '52px',
          color: '#222',
          letterSpacing: '2px',
          marginBottom: '6px'
        }}>
          pocus
        </h1>

        {sent ? (
          <>
            <p style={{ fontFamily: "'VT323', monospace", fontSize: '18px', color: '#aaa', letterSpacing: '1px' }}>
              nice
            </p>
            <CatSVG />
            <p style={{ fontFamily: "'VT323', monospace", fontSize: '17px', color: '#aaa', letterSpacing: '1px' }}>
              check ur email now
            </p>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {active === 'input' && <Wing />}
              <input
                type="email"
                value={email}
                placeholder="enter email for link"
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setActive('input')}
                onBlur={() => setActive(null)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={inputStyle}
              />
              {active === 'input' && <Wing flip />}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {active === 'button' && <Wing />}
              <button
                onClick={handleLogin}
                onMouseEnter={() => setActive('button')}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive('button')}
                onBlur={() => setActive(null)}
                style={buttonStyle}
              >
                send
              </button>
              {active === 'button' && <Wing flip />}
            </div>
          </>
        )}
      </main>
    </>
  )
}