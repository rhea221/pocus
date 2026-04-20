'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function handleLogin() {
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    setSent(true)
  }

  if (sent) return (
    <main style={{ padding: '2rem' }}>
      <p>Check your email for a magic link!</p>
    </main>
  )

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Pocus</h1>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleLogin()}
      />
      <button onClick={handleLogin}>Send magic link</button>
    </main>
  )
}