'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { scoreTask, autoUrgency } from '@/lib/scoring'
import { ensureMetrics } from '@/lib/metrics'
import { Task, UserMetric, TaskMetricValue } from '@/types/task'
import { useRouter } from 'next/navigation'

function PinkButton({ label, onClick }: { label: string, onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ cursor: 'pointer', transition: 'transform 0.15s' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'scale(1)'}>
      <div style={{
        height: 36, borderRadius: 80, border: '1.5px solid #FF39EF',
        background: '#F9D6FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 16px'
      }}>
        <div style={{
          height: 28, borderRadius: 80, border: '1.5px solid #fff',
          background: 'linear-gradient(180deg, #D500FC 0%, #F9D6FF 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 14px', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 3, left: 8, width: 50, height: 7,
            borderRadius: 80, background: '#EB79FF', opacity: 0.6
          }} />
          <span style={{ fontFamily: "'VCR', monospace", fontSize: 14, color: 'white', position: 'relative', zIndex: 1 }}>
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}

function BlueContainer({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
  return (
    <div style={{
      background: '#E8F8FF', border: '1.5px solid #00BDFC',
      borderRadius: 24, padding: 20, ...style
    }}>
      {children}
    </div>
  )
}

function BlueInner({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #9BE6FF 0%, #DEF7FF 100%)',
      border: '1.5px solid #fff', borderRadius: 16, padding: '8px 14px', ...style
    }}>
      {children}
    </div>
  )
}

function DotInput({ value, onChange }: { value: number, onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3].map(v => (
        <div key={v} onClick={() => onChange(v)} style={{
          width: 10, height: 10, borderRadius: '50%', cursor: 'pointer',
          background: v <= value ? '#FF39EF' : 'transparent',
          border: '1.5px solid #FF39EF', flexShrink: 0
        }} />
      ))}
    </div>
  )
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [metricValues, setMetricValues] = useState<TaskMetricValue[]>([])
  const [metrics, setMetrics] = useState<UserMetric[]>([])
  const [energy, setEnergyState] = useState(2)
  const [petType, setPetType] = useState<string | null>(null)
  const [time, setTime] = useState(new Date())

  // new task state — keyed by metric id
  const [title, setTitle] = useState('')
  const [newValues, setNewValues] = useState<Record<string, number>>({})
  const [blocking, setBlocking] = useState(false)
  const [dueDate, setDueDate] = useState('')

  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push('/login'); return }
      const uid = data.session.user.id
      setUser(data.session.user)
      await loadSettings(uid)
      const userMetrics = await ensureMetrics(uid)
      setMetrics(userMetrics)
      // init new task values to 2 for each metric
      const defaults: Record<string, number> = {}
      userMetrics.forEach(m => { defaults[m.id] = 2 })
      setNewValues(defaults)
      await loadTasks(uid)
    })
  }, [])

  async function loadSettings(uid: string) {
    const { data } = await supabase
      .from('user_settings').select('*').eq('user_id', uid).single()
    if (!data || !data.pet_type) { router.push('/select-pet'); return }
    setPetType(data.pet_type)
    setEnergyState(data.current_energy ?? 2)
  }

  async function loadTasks(uid: string) {
    const { data: taskData } = await supabase
      .from('tasks').select('*').eq('user_id', uid).eq('completed', false)
    if (!taskData) return

    const taskIds = taskData.map(t => t.id)
    let values: TaskMetricValue[] = []
    if (taskIds.length > 0) {
      const { data: valData } = await supabase
        .from('task_metric_values').select('*').in('task_id', taskIds)
      values = valData ?? []
    }

    setTasks(taskData)
    setMetricValues(values)
  }

  async function setEnergy(level: number) {
    setEnergyState(level)
    await supabase.from('user_settings')
      .upsert({ user_id: user.id, current_energy: level })
  }

  async function addTask() {
    if (!title.trim()) return

    const { data: newTask } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: title.trim(),
      blocking_others: blocking,
      due_date: dueDate || null,
      // keep old columns for ESP32 compatibility later
      importance: newValues[metrics.find(m => m.name === 'importance')?.id ?? ''] ?? 2,
      energy_required: newValues[metrics.find(m => m.name === 'energy_required')?.id ?? ''] ?? 2,
      start_friction: newValues[metrics.find(m => m.name === 'start_friction')?.id ?? ''] ?? 2,
    }).select().single()

    if (!newTask) return

    // insert metric values
    const valuesToInsert = Object.entries(newValues).map(([metric_id, value]) => ({
      task_id: newTask.id, metric_id, value
    }))
    const { data: insertedValues } = await supabase
      .from('task_metric_values').insert(valuesToInsert).select()

    setTasks(prev => [...prev, newTask])
    setMetricValues(prev => [...prev, ...(insertedValues ?? [])])

    // reset
    setTitle('')
    setBlocking(false)
    setDueDate('')
    const defaults: Record<string, number> = {}
    metrics.forEach(m => { defaults[m.id] = 2 })
    setNewValues(defaults)
  }

  async function completeTask(id: string) {
    await supabase.from('tasks').update({
      completed: true, completed_at: new Date().toISOString()
    }).eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
    setMetricValues(prev => prev.filter(v => v.task_id !== id))
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
    setMetricValues(prev => prev.filter(v => v.task_id !== id))
  }

  function getTaskValues(taskId: string): TaskMetricValue[] {
    return metricValues.filter(v => v.task_id === taskId)
  }

  function getMetricValue(taskId: string, metricId: string): number {
    return metricValues.find(v => v.task_id === taskId && v.metric_id === metricId)?.value ?? 2
  }

  async function updateMetricValue(taskId: string, metricId: string, value: number) {
    await supabase.from('task_metric_values')
      .upsert({ task_id: taskId, metric_id: metricId, value })
    setMetricValues(prev => {
      const existing = prev.find(v => v.task_id === taskId && v.metric_id === metricId)
      if (existing) return prev.map(v => v.task_id === taskId && v.metric_id === metricId ? { ...v, value } : v)
      return [...prev, { task_id: taskId, metric_id: metricId, value }]
    })
  }

  const activeMetrics = metrics.filter(m => m.active)

  const sorted = [...tasks].sort((a, b) =>
    scoreTask(b, energy, metrics, getTaskValues(b.id)) -
    scoreTask(a, energy, metrics, getTaskValues(a.id))
  )

  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })

  if (!user || !petType) return null

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #C8EDFF; }
        .task-input {
          background: transparent; border: none; outline: none;
          font-family: 'VCR', monospace; font-size: 14px;
          color: #00BDFC; width: 100%;
        }
        .task-input::placeholder { color: #00BDFC; opacity: 0.6; }
        .task-input:focus::placeholder { opacity: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #00BDFC; border-radius: 4px; }
      `}</style>

      <main style={{
        minHeight: '100vh', padding: 32,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'auto auto auto',
        gap: 16, alignItems: 'start'
      }}>

        {/* TOP LEFT — pet window */}
        <BlueContainer>
          <BlueInner style={{ marginBottom: 12 }}>
            <span style={{ fontFamily: "'VCR', monospace", fontSize: 14, color: '#00BDFC' }}>
              pocusegg · {petType}
            </span>
          </BlueInner>

          <div style={{
            background: '#DEF7FF', border: '1.5px solid #9BE6FF',
            borderRadius: 16, height: 160,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: 16,
              background: 'linear-gradient(180deg, #F9D6FF 0%, #FF39EF22 100%)',
              border: '1.5px solid #FF39EF'
            }} />
            <span style={{ fontFamily: "'VCR', monospace", fontSize: 12, color: '#00BDFC', opacity: 0.7 }}>
              egg {petType}
            </span>
          </div>

          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'VCR', monospace", fontSize: 12, color: '#00BDFC', opacity: 0.7 }}>
              {dateStr}
            </span>
            <span style={{ fontFamily: "'VCR', monospace", fontSize: 12, color: '#00BDFC' }}>
              {timeStr}
            </span>
          </div>

          <div style={{ marginTop: 12 }}>
            <span style={{ fontFamily: "'VCR', monospace", fontSize: 11, color: '#00BDFC', opacity: 0.6, display: 'block', marginBottom: 6 }}>
              energy
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['low', 1], ['mid', 2], ['hi', 3]].map(([label, val]) => (
                <div key={val} onClick={() => setEnergy(val as number)} style={{
                  flex: 1, padding: '5px 0', borderRadius: 999, cursor: 'pointer',
                  border: `1.5px solid ${energy === val ? '#FF39EF' : '#00BDFC'}`,
                  background: energy === val ? '#F9D6FF' : 'transparent',
                  textAlign: 'center', transition: 'all 0.15s'
                }}>
                  <span style={{
                    fontFamily: "'VCR', monospace", fontSize: 12,
                    color: energy === val ? '#FF39EF' : '#00BDFC'
                  }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </BlueContainer>

        {/* TOP RIGHT — task window */}
        <BlueContainer style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <BlueInner>
            <span style={{ fontFamily: "'VCR', monospace", fontSize: 14, color: '#00BDFC' }}>
              tasks · {sorted.length}
            </span>
          </BlueInner>

          {/* add task */}
          <div style={{
            border: '1.5px solid #00BDFC', borderRadius: 16,
            background: '#DEF7FF', padding: '10px 14px'
          }}>
            <input
              className="task-input"
              placeholder="new task..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
            />
            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {activeMetrics.map(metric => (
                <div key={metric.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontFamily: "'VCR', monospace", fontSize: 11, color: '#00BDFC', opacity: 0.7 }}>
                    {metric.display_name}
                  </span>
                  <DotInput
                    value={newValues[metric.id] ?? 2}
                    onChange={v => setNewValues(prev => ({ ...prev, [metric.id]: v }))}
                  />
                </div>
              ))}
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  fontFamily: "'VCR', monospace", fontSize: 11, color: '#00BDFC', cursor: 'pointer'
                }} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input type="checkbox" checked={blocking} onChange={e => setBlocking(e.target.checked)}
                  style={{ accentColor: '#FF39EF' }} />
                <span style={{ fontFamily: "'VCR', monospace", fontSize: 11, color: '#00BDFC', opacity: 0.7 }}>
                  blocking
                </span>
              </label>
              <div style={{ marginLeft: 'auto' }}>
                <PinkButton label="add" onClick={addTask} />
              </div>
            </div>
          </div>

          {/* task list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
            {sorted.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <span style={{ fontFamily: "'VCR', monospace", fontSize: 13, color: '#00BDFC', opacity: 0.5 }}>
                  no tasks yet
                </span>
              </div>
            )}
            {sorted.map(task => {
              const taskVals = getTaskValues(task.id)
              const energyMetric = metrics.find(m => m.name === 'energy_required')
              const frictionMetric = metrics.find(m => m.name === 'start_friction')
              const energyVal = energyMetric ? getMetricValue(task.id, energyMetric.id) : 0
              const frictionVal = frictionMetric ? getMetricValue(task.id, frictionMetric.id) : 0
              const mismatch = energyVal > energy || frictionVal > energy
              const overdue = task.due_date && new Date(task.due_date) < new Date()

              return (
                <div key={task.id} style={{
                  borderRadius: 14, padding: '10px 12px',
                  border: `1.5px ${mismatch ? 'dashed' : 'solid'} #00BDFC`,
                  background: mismatch ? '#DEF7FF88' : '#DEF7FF',
                  opacity: mismatch ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: 10
                }}>
                  <div onClick={() => completeTask(task.id)} style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: '1.5px solid #FF39EF', cursor: 'pointer',
                    flexShrink: 0, background: 'transparent', transition: 'background 0.1s'
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9D6FF'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontFamily: "'VCR', monospace", fontSize: 13, color: '#1E1E1E',
                      marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>{task.title}</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {activeMetrics.map(metric => (
                        <div key={metric.id} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <span style={{ fontFamily: "'VCR', monospace", fontSize: 10, color: '#00BDFC', opacity: 0.5 }}>
                            {metric.display_name}
                          </span>
                          <DotInput
                            value={getMetricValue(task.id, metric.id)}
                            onChange={v => updateMetricValue(task.id, metric.id, v)}
                          />
                        </div>
                      ))}
                      <span style={{ fontFamily: "'VCR', monospace", fontSize: 10, color: '#00BDFC', opacity: 0.5, marginLeft: 'auto' }}>
                        {scoreTask(task, energy, metrics, taskVals).toFixed(1)}
                      </span>
                      {task.blocking_others && (
                        <span style={{ fontFamily: "'VCR', monospace", fontSize: 10, color: '#FF39EF' }}>blocking</span>
                      )}
                      {overdue && (
                        <span style={{ fontFamily: "'VCR', monospace", fontSize: 10, color: '#FF39EF' }}>overdue</span>
                      )}
                      {task.due_date && !overdue && (
                        <span style={{ fontFamily: "'VCR', monospace", fontSize: 10, color: '#00BDFC', opacity: 0.5 }}>
                          {new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => deleteTask(task.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: "'VCR', monospace", fontSize: 12,
                    color: '#00BDFC', opacity: 0.4, flexShrink: 0
                  }}>✕</button>
                </div>
              )
            })}
          </div>
        </BlueContainer>

        {/* remaining tiles — empty for now */}
        {[...Array(4)].map((_, i) => <div key={i} />)}
      </main>
    </>
  )
}