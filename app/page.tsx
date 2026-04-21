'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { scoreTask } from '@/lib/scoring'
import { Task } from '@/types/task'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [energy, setEnergyState] = useState(2)
  const [title, setTitle] = useState('')
  const [importance, setImportance] = useState(2)
  const [energyReq, setEnergyReq] = useState(2)
  const [friction, setFriction] = useState(2)
  const [blocking, setBlocking] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { router.push('/login'); return }
      setUser(data.session.user)
      loadTasks(data.session.user.id)
      loadEnergy(data.session.user.id)
    })
  }, [])

  async function loadTasks(userId: string) {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
    if (data) setTasks(data)
  }

  async function loadEnergy(userId: string) {
    const { data } = await supabase
      .from('user_settings')
      .select('current_energy')
      .eq('user_id', userId)
      .single()
    if (data) setEnergyState(data.current_energy)
  }

  async function setEnergy(level: number) {
    setEnergyState(level)
    await supabase.from('user_settings').upsert({
      user_id: user.id,
      current_energy: level
    })
  }

  async function addTask() {
    if (!title.trim()) return
    const { data } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: title.trim(),
      importance,
      energy_required: energyReq,
      start_friction: friction,
      blocking_others: blocking,
      due_date: dueDate || null
    }).select().single()
    if (data) {
      setTasks(prev => [...prev, data])
      setTitle('')
      setImportance(2)
      setEnergyReq(2)
      setFriction(2)
      setBlocking(false)
      setDueDate('')
    }
  }

  async function completeTask(id: string) {
    await supabase.from('tasks').update({
      completed: true,
      completed_at: new Date().toISOString()
    }).eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const sorted = [...tasks].sort((a, b) => scoreTask(b, energy) - scoreTask(a, energy))

  if (!user) return null

  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h1>pocus</h1>

      <div style={{ margin: '1rem 0' }}>
        <p style={{ fontSize: '12px', marginBottom: '6px' }}>CURRENT ENERGY</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['low', 'medium', 'high'].map((label, i) => (
            <button key={label} onClick={() => setEnergy(i + 1)}
              style={{ flex: 1, padding: '8px', fontWeight: energy === i + 1 ? 'bold' : 'normal',
                border: '1px solid #ccc', borderRadius: '6px',
                background: energy === i + 1 ? '#000' : '#fff',
                color: energy === i + 1 ? '#fff' : '#000', cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
        <input value={title} onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="new task..." style={{ width: '100%', padding: '8px', marginBottom: '10px',
            border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }} />

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {[
            { label: 'Importance', val: importance, set: setImportance },
            { label: 'Energy needed', val: energyReq, set: setEnergyReq },
            { label: 'Start friction', val: friction, set: setFriction }
          ].map(({ label, val, set }) => (
            <div key={label}>
              <p style={{ fontSize: '11px', marginBottom: '4px' }}>{label}</p>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3].map(v => (
                  <button key={v} onClick={() => set(v)}
                    style={{ width: '28px', height: '28px', borderRadius: '50%',
                      border: '1px solid #ccc', cursor: 'pointer',
                      background: val === v ? '#000' : '#fff',
                      color: val === v ? '#fff' : '#000' }}>{v}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input type="checkbox" checked={blocking} onChange={e => setBlocking(e.target.checked)} />
            blocking others
          </label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            style={{ padding: '6px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px' }} />
          <button onClick={addTask}
            style={{ marginLeft: 'auto', padding: '8px 16px', background: '#000', color: '#fff',
              border: 'none', borderRadius: '6px', cursor: 'pointer' }}>add</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sorted.length === 0 && <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>no tasks yet</p>}
        {sorted.map(task => {
          const mismatch = task.energy_required > energy || task.start_friction > energy
          return (
            <div key={task.id} style={{ background: '#fff', border: `1px ${mismatch ? 'dashed' : 'solid'} #ddd`,
              borderRadius: '8px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px',
              opacity: mismatch ? 0.6 : 1 }}>
              <button onClick={() => completeTask(task.id)}
                style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid #ccc',
                  background: 'none', cursor: 'pointer', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', marginBottom: '4px' }}>{task.title}</p>
                <p style={{ fontSize: '11px', color: '#999' }}>
                  score: {scoreTask(task, energy).toFixed(1)}
                  {task.blocking_others && ' · 🔴 blocking'}
                  {task.due_date && ` · due ${new Date(task.due_date).toLocaleDateString()}`}
                </p>
              </div>
              <button onClick={() => deleteTask(task.id)}
                style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>✕</button>
            </div>
          )
        })}
      </div>
    </main>
  )
}