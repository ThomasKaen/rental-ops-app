import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import NewTaskModal from '../components/NewTaskModal'

type Task = { id:number; title:string; priority:'red'|'amber'|'green'; status:string }

export default function Tasks(){
  const [tasks, setTasks] = useState<Task[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const load = async (qs = '') => {
    setLoading(true); setErr(null)
    try {
      const r = await api.get('/tasks' + qs)
      setTasks(r.data)
    } catch (e:any) {
      setErr(e?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ load() },[])

  return (
    <div>
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <button onClick={()=>load('?priority=red')}>Red</button>
        <button onClick={()=>load('?priority=amber')}>Amber</button>
        <button onClick={()=>load('?priority=green')}>Green</button>
        <button onClick={()=>load('')}>All</button>
        <div style={{ marginLeft:'auto' }}>
          <button onClick={()=>setOpen(true)}>+ New Task</button>
        </div>
      </div>

      {loading && <div>Loading…</div>}
      {err && <div style={{ color:'#b91c1c' }}>{err}</div>}
      {!loading && tasks.length === 0 && <div>No tasks yet.</div>}

      {tasks.map(t=> (
        <Link key={t.id} to={`/tasks/${t.id}`} style={{ display:'block', padding:12, border:'1px solid #eee', borderRadius:8, marginBottom:8, textDecoration:'none', color:'#111' }}>
          <div style={{ fontWeight:600 }}>
            <span style={{
              display:'inline-block', width:8, height:8, borderRadius:999,
              background: t.priority==='red' ? '#dc2626' : t.priority==='amber' ? '#f59e0b' : '#16a34a',
              marginRight:8
            }} />
            {t.title}
          </div>
          <div style={{ fontSize:12, color:'#555' }}>{t.status}</div>
        </Link>
      ))}

      <NewTaskModal open={open} onClose={()=>setOpen(false)} onCreated={()=>load()} />
    </div>
  )
}
