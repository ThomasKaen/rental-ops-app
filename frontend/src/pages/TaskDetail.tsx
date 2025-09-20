import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'


type Task = { id:number; title:string; description:string; priority:string; status:string }


export default function TaskDetail(){
    const { id } = useParams()
    const [task, setTask] = useState<Task | null>(null)
    useEffect(()=>{ api.get(`/tasks/${id}`).then(r=>setTask(r.data)) },[id])
    if(!task) return <div>Loading...</div>
    return (
        <div style={{ paddingBottom:60 }}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: <strong>{task.status}</strong></p>
            <div style={{ position:'fixed', bottom:56, left:0, right:0, display:'flex', gap:8, padding:8, background:'#fff', borderTop:'1px solid #eee' }}>
                <button onClick={()=>update('in_progress')}>Start</button>
                <button onClick={()=>update('awaiting_parts')}>Awaiting parts</button>
                <button onClick={()=>update('done')}>Done</button>
            </div>
        </div>
    )
    function update(status:string){
        api.patch(`/tasks/${id}`, { status }).then(r=>setTask(r.data))
    }
}