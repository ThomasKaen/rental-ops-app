import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import NewTaskModal from '../components/NewTaskModal'

type Task = {
  id:number; title:string; priority:'red'|'amber'|'green';
  status:'new'|'in_progress'|'awaiting_parts'|'blocked'|'done'|'cancelled';
  assignee?: string; due_at?: string | null
}

export default function Tasks(){
  const [tasks, setTasks] = useState<Task[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // filters
  const [priority, setPriority] = useState<string>('')     // '', 'red', 'amber', 'green'
  const [status, setStatus] = useState<string>('')         // '', 'new', ...
  const [assignee, setAssignee] = useState<string>('')     // exact match
  const [siteId, setSiteId]   = useState<string>('')       // optional number
  const [overdue, setOverdue] = useState<boolean>(false)
  const [q, setQ] = useState<string>('')

  const qs = useMemo(() => {
    const p = new URLSearchParams()
    if (priority) p.set('priority', priority)
    if (status) p.set('status', status)
    if (assignee) p.set('assignee', assignee)
    if (siteId) p.set('site_id', siteId)
    if (overdue) p.set('overdue', 'true')
    if (q) p.set('q', q)
    const s = p.toString()
    return s ? `?${s}` : ''
  }, [priority, status, assignee, siteId, overdue, q])

  const load = async () => {
    setLoading(true); setErr(null)
    try {
      const r = await api.get('/tasks' + qs)
      setTasks(r.data)
    } catch (e:any) { setErr(e?.message || 'Failed to load tasks') }
    finally { setLoading(false) }
  }

  useEffect(()=>{ load() }, [qs])

  return (
    <div>
      {/* Filters */}
      <div style={{ display:'grid', gap:8, marginBottom:12 }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <select value={priority} onChange={e=>setPriority(e.target.value)}>
            <option value="">Priority (all)</option>
            <option value="red">Red</option>
            <option value="amber">Amber</option>
            <option value="green">Green</option>
          </select>
          <select value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="">Status (all)</option>
            <option value="new">New</option>
            <option value="in_progress">In progress</option>
            <option value="awaiting_parts">Awaiting parts</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input placeholder="Assignee" value={assignee} onChange={e=>setAssignee(e.target.value)} />
          <input placeholder="Site ID" value={siteId} onChange={e=>setSiteId(e.target.value)} style={{ width:100 }} />
          <label style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
            <input type="checkbox" checked={overdue} onChange={e=>setOverdue(e.target.checked)} />
            Overdue
          </label>
          <input placeholder="Search title/desc" value={q} onChange={e=>setQ(e.target.value)} style={{ flex:1, minWidth:160 }} />
          <div style={{ marginLeft:'auto' }}>
            <button onClick={()=>setOpen(true)}>+ New Task</button>
          </div>
        </div>
        {(priority||status||assignee||siteId||overdue||q) && (
          <div>
            <button onClick={() => { setPriority(''); setStatus(''); setAssignee(''); setSiteId(''); setOverdue(false); setQ('') }}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {loading && <div>Loading…</div>}
      {err && <div style={{ color:'#b91c1c' }}>{err}</div>}
      {!loading && tasks.length === 0 && <div>No tasks match.</div>}

      {tasks.map(t=> (
        <Link key={t.id} to={`/tasks/${t.id}`} style={{ display:'block', padding:12, border:'1px solid #eee', borderRadius:8, marginBottom:8, textDecoration:'none', color:'#111' }}>
          <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
            <div style={{ fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              <span style={{
                display:'inline-block', width:8, height:8, borderRadius:999,
                background: t.priority==='red' ? '#dc2626' : t.priority==='amber' ? '#f59e0b' : '#16a34a',
                marginRight:8
              }} />
              {t.title}
            </div>
            <small style={{ color:'#555' }}>
              {t.assignee ? `@${t.assignee}` : ''}
            </small>
          </div>
          <div style={{ fontSize:12, color:'#555', display:'flex', justifyContent:'space-between' }}>
            <span>{t.status}</span>
            {t.due_at ? new Date(t.due_at).toLocaleString() : 'No due'}
            {isOverdue(t) && <span style={{ color:'#dc2626' }}>Overdue</span>}
          </div>
        </Link>
      ))}

      <NewTaskModal open={open} onClose={()=>setOpen(false)} onCreated={()=>load()} />
    </div>
  )
}

function isOverdue(t: Task){
  if (!t.due_at) return false
  if (t.status === 'done' || t.status === 'cancelled') return false
  return new Date(t.due_at).getTime() < Date.now()
}
