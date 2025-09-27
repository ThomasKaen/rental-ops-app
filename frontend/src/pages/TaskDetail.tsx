import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import Comments from '../components/Comments'
import { isoToLocal, localToISO, prettyDate } from '../lib/datetime'

type Task = {
  id:number; title:string; description:string; priority:'red'|'amber'|'green';
  status:'new'|'in_progress'|'awaiting_parts'|'blocked'|'done'|'cancelled';
  assignee?: string; due_at?: string | null
}

export default function TaskDetail(){
  const { id } = useParams()
  const [task, setTask] = useState<Task | null>(null)
  const [assignee, setAssignee] = useState<string>('')
  const [dueLocal, setDueLocal] = useState<string>('')

  const load = () =>
    api.get(`/tasks/${id}`).then(r => {
      setTask(r.data)
      setAssignee(r.data.assignee || '')
      setDueLocal(isoToLocal(r.data.due_at))
    })

  useEffect(()=>{ load() },[id])
  if(!task) return <div>Loading...</div>

  async function update(status:string){
    await api.patch(`/tasks/${id}`, { status })
    await load()
  }
  async function saveAssignee(){
    await api.patch(`/tasks/${id}`, { assignee: assignee || null })
    await load()
  }
  async function deleteTask() {
  if (!confirm("Delete this task?")) return
  await api.delete(`/tasks/${id}`)
  window.location.href = "/tasks"   // go back to list
  }

  return (
    <div style={{ paddingBottom:80 }}>
      <h3>{task.title}</h3>
      <p>{task.description}</p>

      <div style={{ display:'flex', gap:8, alignItems:'center', margin:'8px 0' }}>
        <input
          placeholder="Assignee (e.g. tamas)"
          value={assignee}
          onChange={e=>setAssignee(e.target.value)}
        />
        <button onClick={saveAssignee}>{assignee ? 'Assign' : 'Unassign'}</button>
      </div>

      <div style={{ display:'grid', gap:8, margin:'8px 0' }}>
        <div>
          <strong>Due:</strong> {prettyDate(task.due_at)}
          {isOverdue(task) && <span style={{ color:'#dc2626' }}> · Overdue</span>}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <input
            type="datetime-local"
            value={dueLocal}
            onChange={e=>setDueLocal(e.target.value)}
          />
          <button onClick={async ()=>{
            await api.patch(`/tasks/${id}`, { due_at: localToISO(dueLocal) })
            await load()
          }}>Save due date</button>
          {task.due_at && (
            <button onClick={async ()=>{
              await api.patch(`/tasks/${id}`, { due_at: null })
              await load()
            }}>Clear due</button>
          )}
        </div>
      </div>

      <p>Status: <strong>{task.status}</strong></p>
      <div style={{ position:'fixed', bottom:56, left:0, right:0, display:'flex', gap:8, padding:8, background:'#fff', borderTop:'1px solid #eee' }}>
        <button onClick={()=>update('in_progress')}>Start</button>
        <button onClick={()=>update('awaiting_parts')}>Awaiting parts</button>
        <button onClick={()=>update('done')}>Done</button>
      </div>
        <button onClick={deleteTask} style={{ color: "#b91c1c" }}>
            Delete Task
        </button>
      <Comments taskId={Number(id)} />
    </div>
  )
}

function isOverdue(t: { due_at?: string | null; status: string }) {
  if (!t.due_at) return false
  if (t.status === 'done' || t.status === 'cancelled') return false
  return new Date(t.due_at).getTime() < Date.now()
}
