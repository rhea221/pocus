'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [focused, setFocused] = useState<'input' | null>(null)
  const [hovered, setHovered] = useState<'button' | null>(null)
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

  const Wing = ({ src }: { src: string }) => (
    <Image src={src} width={30} height={30} alt=""
      style={{ objectFit: 'contain', flexShrink: 0, width: 'auto', height: '30px' }} />
  )
  const Placeholder = () => <div style={{ width: 30, height: 30, flexShrink: 0 }} />

  const showBlue = focused === 'input'
  const showPink = hovered === 'button'

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: white; }
        .email-input {
          width: 100%; height: 100%;
          background: transparent; border: none; outline: none;
          font-family: 'VCR', monospace; font-size: 20px;
          color: #00BDFC; padding: 0 20px; text-align: center;
        }
        .email-input::placeholder { color: #00BDFC; opacity: 0.7; transition: opacity 0.1s; }
        .email-input:focus::placeholder { opacity: 0; }
        .send-btn { transition: transform 0.15s ease; }
        .send-btn:hover { transform: scale(1.07); }
        .send-btn:active { transform: scale(0.97); }
      `}</style>

      <main style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: '16px'
      }}>

        <h1 style={{
          fontFamily: "'Miraero', serif",
          fontSize: '64px', fontWeight: 500, color: '#1E1E1E',
          marginBottom: '4px'
        }}>pocus</h1>

        {sent ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <p style={{ fontFamily: "'VCR', monospace", fontSize: '18px', color: '#aaa', letterSpacing: '1px' }}>
              nice
            </p>
            <Image src="/cat.png" width={90} height={90} alt="pocus cat" />
            <p style={{ fontFamily: "'VCR', monospace", fontSize: '17px', color: '#aaa', letterSpacing: '1px' }}>
              check ur email now
            </p>
          </div>
        ) : (
          <>
            {/* input row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {showBlue ? <Wing src="/blueangelL.png" /> : <Placeholder />}
              <div style={{
                width: 289, height: 52, borderRadius: 80,
                border: '1.5px solid #00BDFC', background: '#E0F7FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{
                  width: 279, height: 44, borderRadius: 80,
                  border: '1.5px solid #fff',
                  background: 'linear-gradient(180deg, #9BE6FF 0%, #DEF7FF 100%)',
                  display: 'flex', alignItems: 'center',
                }}>
                  <input
                    className="email-input"
                    type="email"
                    value={email}
                    placeholder="enter email for link"
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('input')}
                    onBlur={() => setFocused(null)}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>
              {showBlue ? <Wing src="/blueangelR.png" /> : <Placeholder />}
            </div>

            {/* button row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {showPink ? <Wing src="/pinkangelL.png" /> : <Placeholder />}
              <div style={{ width: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  className="send-btn"
                  onClick={handleLogin}
                  onMouseEnter={() => setHovered('button')}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    width: 116, height: 52, borderRadius: 80,
                    border: '1.5px solid #FF39EF', background: '#F9D6FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                  <div style={{
                    width: 106, height: 44, borderRadius: 80,
                    border: '1.5px solid #fff',
                    background: 'linear-gradient(180deg, #D500FC 0%, #F9D6FF 100%)',
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <div style={{
                      position: 'absolute', top: 5, left: 11,
                      width: 82, height: 12, borderRadius: 80,
                      background: '#EB79FF', opacity: 0.6
                    }} />
                    <div style={{
                      position: 'absolute', top: 32, left: 18,
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'white', opacity: 0.5
                    }} />
                    <div style={{
                      position: 'absolute', top: 30, left: 12,
                      width: 3, height: 3, borderRadius: '50%',
                      background: 'white', opacity: 0.5
                    }} />
                    <span style={{
                      fontFamily: "'VCR', monospace", fontSize: 20,
                      color: 'white', position: 'relative', zIndex: 1
                    }}>send</span>
                  </div>
                </div>
              </div>
              {showPink ? <Wing src="/pinkangelR.png" /> : <Placeholder />}
            </div>
          </>
        )}
      </main>
    </>
  )
}