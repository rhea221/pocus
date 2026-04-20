'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push('/login')
      else setUser(data.session.user)
    })
  }, [])

  if (!user) return null

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Pocus</h1>
      <p>Logged in as {user.email}</p>
    </main>
  )
}