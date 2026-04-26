'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const PETS = [
  { id: 'A', label: 'egg A' },
  { id: 'B', label: 'egg B' },
  { id: 'C', label: 'egg C' },
]

export default function SelectPet() {
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function confirm() {
    if (!selected) return
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    await supabase.from('user_settings').upsert({
      user_id: session.user.id,
      pet_type: selected,
      current_energy: 2
    })
    router.push('/')
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #C8EDFF; }
      `}</style>
      <main style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          background: '#E8F8FF',
          border: '1.5px solid #00BDFC',
          borderRadius: 32, padding: '32px 40px',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 24
        }}>
          <div style={{
            background: 'linear-gradient(180deg, #9BE6FF 0%, #DEF7FF 100%)',
            border: '1.5px solid #fff',
            borderRadius: 24, padding: '8px 28px'
          }}>
            <span style={{ fontFamily: "'VCR', monospace", fontSize: 18, color: '#00BDFC' }}>
              choose ur egg
            </span>
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            {PETS.map(pet => (
              <div key={pet.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div
                  onClick={() => setSelected(pet.id)}
                  style={{
                    width: 90, height: 90,
                    borderRadius: 20,
                    border: selected === pet.id ? '2px solid #FF39EF' : '2px solid #00BDFC',
                    background: selected === pet.id ? '#F9D6FF' : '#DEF7FF',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                />
                <div style={{
                  padding: '6px 18px',
                  borderRadius: 999,
                  border: `1.5px solid ${selected === pet.id ? '#FF39EF' : '#00BDFC'}`,
                  background: selected === pet.id ? '#F9D6FF' : '#E8F8FF',
                }}>
                  <span style={{
                    fontFamily: "'VCR', monospace", fontSize: 14,
                    color: selected === pet.id ? '#FF39EF' : '#00BDFC'
                  }}>{pet.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div
            onClick={confirm}
            style={{
              opacity: selected && !loading ? 1 : 0.4,
              cursor: selected && !loading ? 'pointer' : 'default',
              width: 116, height: 52, borderRadius: 80,
              border: '1.5px solid #FF39EF', background: '#F9D6FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => { if (selected) (e.currentTarget as HTMLElement).style.transform = 'scale(1.07)' }}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}
          >
            <div style={{
              width: 106, height: 44, borderRadius: 80,
              border: '1.5px solid #fff',
              background: 'linear-gradient(180deg, #D500FC 0%, #F9D6FF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: 5, left: 11,
                width: 82, height: 12, borderRadius: 80,
                background: '#EB79FF', opacity: 0.6
              }} />
              <span style={{ fontFamily: "'VCR', monospace", fontSize: 20, color: 'white', position: 'relative', zIndex: 1 }}>
                {loading ? '...' : 'pick'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}