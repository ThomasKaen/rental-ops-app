import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../lib/api'
import NewTaskModal from '../components/NewTaskModal'

type Task = {
  id:number; title:string; site?: {id:number; name:string}; unit?: {id:number; name:string}; priority:'red'|'amber'|'green';
  status:'new'|'in_progress'|'awaiting_parts'|'blocked'|'done'|'cancelled';
  assignee?: string; due_at?: string | null
}

const STATUS_OPTIONS = ["new","in_progress","awaiting_parts","blocked","done","cancelled"] as const;
type StatusVal = (typeof STATUS_OPTIONS)[number];

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid",
    borderColor: active ? "#2563eb" : "#e5e7eb",
    background: active ? "#eff6ff" : "#fff",
    color: active ? "#1d4ed8" : "#111",
    cursor: "pointer",
    fontSize: 13,
  };
}

export default function Tasks(){
  const [tasks, setTasks] = useState<Task[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  // filters (simple)
  const [priority, setPriority] = useState<string>('')     // '', 'red', 'amber', 'green'
  const [status, setStatus] = useState<string>('')         // '', 'new', ...
  const [assignee, setAssignee] = useState<string>('')     // exact match
  const [overdue, setOverdue] = useState<boolean>(false)
  const [q, setQ] = useState<string>('')

  // site/unit filters
  const [sites, setSites] = useState<{id:number;name:string}[]>([])
  const [units, setUnits] = useState<{id:number;site_id:number;name:string}[]>([])
  const [siteId, setSiteId] = useState<number | ''>('')   // <-- single source of truth
  const [unitId, setUnitId] = useState<number | ''>('')

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of STATUS_OPTIONS) counts[s] = 0;
    for (const t of tasks) counts[t.status] = (counts[t.status] ?? 0) + 1;
    return counts;
  }, [tasks]);

  const location = useLocation();

  // build query string
  const qs = useMemo(() => {
    const p = new URLSearchParams()
    if (priority) p.set('priority', priority)
    if (status) p.set('status', status)
    if (assignee) p.set('assignee', assignee)
    if (siteId !== '') p.set('site_id', String(siteId))
    if (unitId !== '') p.set('unit_id', String(unitId))
    if (overdue) p.set('overdue', 'true')
    if (q) p.set('q', q)
    const s = p.toString()
    return s ? `?${s}` : ''
  }, [priority, status, assignee, siteId, unitId, overdue, q])

  const load = async () => {
    setLoading(true); setErr(null)
    try {
      const r = await api.get('/api/tasks' + qs)
      setTasks(r.data)
    } catch (e:any) {
      setErr(e?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ load() }, [qs])

  // load sites once (use trailing slash to avoid 307)
  useEffect(() => {
    (async () => {
      const r = await api.get("/api/sites/")
      setSites(r.data)
    })()
  }, [])

  // when site changes, load units (and clear unit filter if site cleared)
  useEffect(() => {
    (async () => {
      if (siteId !== '') {
        const r = await api.get(`/api/sites/${siteId}/units/`) // trailing slash
        setUnits(r.data)
      } else {
        setUnits([])
        setUnitId('')
      }
    })()
  }, [siteId])

  return (
    <div>
      {/* Filters */}
      <div style={{ display:'grid', gap:8, marginBottom:12 }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <select value={priority} onChange={e=>setPriority(e.target.value)}>
            <option value="">Priority (all)</option>
            <option value="red">Red</option>
            <option value="amber">Amber</option>
            <option value="green">Green</option>
          </select>

          {/* Status chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" onClick={() => setStatus('')} style={chipStyle(status === '')} title="Show all statuses">All</button>
            {STATUS_OPTIONS.map(s => (
              <button key={s} type="button" onClick={() => setStatus(s)} style={chipStyle(status === s)} title={s.replace('_', ' ')}>
                {s.replace('_',' ')} ({statusCounts[s]})
              </button>
            ))}
          </div>

          <input placeholder="Assignee" value={assignee} onChange={e=>setAssignee(e.target.value)} />

          {/* Site + Unit selectors */}
          <select value={String(siteId)} onChange={e => setSiteId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">All sites</option>
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select value={String(unitId)} onChange={e => setUnitId(e.target.value ? Number(e.target.value) : '')} disabled={siteId === ''}>
            <option value="">{siteId === '' ? "Select site first" : "All units"}</option>
            {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>

          <label style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
            <input type="checkbox" checked={overdue} onChange={e=>setOverdue(e.target.checked)} />
            Overdue
          </label>

          <input placeholder="Search title/desc" value={q} onChange={e=>setQ(e.target.value)} style={{ flex:1, minWidth:160 }} />

          <div style={{ marginLeft:'auto' }}>
            <button onClick={()=>setOpen(true)}>+ New Task</button>
          </div>
        </div>

        {(priority||status||assignee||(siteId!=='')||(unitId!=='')||overdue||q) && (
          <div>
            <button onClick={() => {
              setPriority(''); setStatus(''); setAssignee('');
              setSiteId(''); setUnitId('');
              setOverdue(false); setQ('');
            }}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      {loading && <div>Loading…</div>}
      {err && <div style={{ color:'#b91c1c' }}>{err}</div>}
      {!loading && tasks.length === 0 && <div>No tasks match.</div>}

      {tasks.map(t=> (
        <Link key={t.id} to={`/tasks/${t.id}`} state={{ from: location.pathname + location.search }} style={{ display:'block', padding:12, border:'1px solid #eee', borderRadius:8, marginBottom:8, textDecoration:'none', color:'#111' }}>
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
