import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'


type Task = { id:number; title:string; priority:string; status:string; site_id:number; unit_id?:number; }


export default function Tasks(){
    const [tasks, setTasks] = useState<Task[]>([])
    useEffect(()=>{ api.get('/tasks').then(r=>setTasks(r.data)) },[])
    return (
        <div>
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                <button onClick={()=>api.get('/tasks?priority=red').then(r=>setTasks(r.data))}>Red</button>
                <button onClick={()=>api.get('/tasks?priority=amber').then(r=>setTasks(r.data))}>Amber</button>
                <button onClick={()=>api.get('/tasks?priority=green').then(r=>setTasks(r.data))}>Green</button>
                <button onClick={()=>api.get('/tasks').then(r=>setTasks(r.data))}>All</button>
            </div>
            {tasks.map(t=> (
                <Link key={t.id} to={`/tasks/${t.id}`} style={{ display:'block', padding:12, border:'1px solid #eee', borderRadius:8, marginBottom:8, textDecoration:'none', color:'#111' }}>
                    <div style={{ fontWeight:600 }}>
                        <span style={{ display:'inline-block', width:8, height:8, borderRadius:999, background: t.priority==='red'?'#e11':'amber'===t.priority?'#f7b500':'#16a34a', marginRight:8 }} />
                        {t.title}
                    </div>
                    <div style={{ fontSize:12, color:'#555' }}>{t.status}</div>
                </Link>
            ))}
        </div>
    )
}