import { useEffect, useState } from 'react'
import api from '../lib/api'

type Comment = { id:number; author?:string; body:string; created_at:string }
type Attachment = { id:number; filename:string; url:string; uploaded_at:string }

export default function Comments({ taskId }:{ taskId:number }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [body, setBody] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [editId, setEditId] = useState<number | null>(null)
  const [editBody, setEditBody] = useState('')

  const load = async () => {
    setError(null)
    try {
      const [c, a] = await Promise.all([
        api.get(`/tasks/${taskId}/comments`),
        api.get(`/tasks/${taskId}/attachments`),
      ])
      setComments(c.data); setAttachments(a.data)
    } catch (e:any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load activity')
    }
  }
  useEffect(()=>{ load() }, [taskId])

  // create new comment / upload
  const submit = async () => {
    if (!body.trim() && !file) return
    setBusy(true); setError(null)
    try {
      if (body.trim()) {
        const fd = new FormData()
        fd.append('body', body)
        fd.append('author', 'web')
        await api.post(`/tasks/${taskId}/comments`, fd)
        setBody('')
      }
      if (file) {
        const fd2 = new FormData()
        fd2.append('file', file)
        await api.post(`/tasks/${taskId}/attachments`, fd2, { headers:{ 'Content-Type':'multipart/form-data' } })
        setFile(null)
      }
      await load()
    } catch (e:any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to post')
    } finally { setBusy(false) }
  }

  // edit
  const startEdit = (c: Comment) => { setEditId(c.id); setEditBody(c.body) }
  const saveEdit = async (id: number) => {
    if (!editBody.trim()) return
    await api.patch(`/tasks/${taskId}/comments/${id}`, { body: editBody, author: 'web' })
    setEditId(null); setEditBody(''); await load()
  }
  const cancelEdit = () => { setEditId(null); setEditBody('') }

  // delete
  const del = async (id: number) => {
    if (!confirm('Delete this comment?')) return
    await api.delete(`/tasks/${taskId}/comments/${id}`)
    await load()
  }

  return (
    <div style={{ marginTop:16 }}>
      <h4>Activity</h4>
      {error && <div style={{ color:'#b91c1c', marginBottom:8 }}>{String(error)}</div>}

      <div style={{ display:'grid', gap:8 }}>
        {comments.map(c => {
          const isEditing = editId === c.id
          return (
            <div key={c.id} style={{ position:'relative', padding:8, border:'1px solid #eee', borderRadius:8 }}>
              <div style={{ fontSize:12, color:'#666', marginBottom:6 }}>
                {c.author || 'anon'} · {new Date(c.created_at).toLocaleString()}
              </div>

              {!isEditing ? (
                <div>{c.body}</div>
              ) : (
                <div style={{ display:'grid', gap:6 }}>
                  <textarea value={editBody} onChange={e=>setEditBody(e.target.value)} />
                  <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                    <button onClick={cancelEdit}>Cancel</button>
                    <button onClick={()=>saveEdit(c.id)} disabled={!editBody.trim()}>Save</button>
                  </div>
                </div>
              )}

              {!isEditing && (
                <div style={{ position:'absolute', right:8, bottom:8, display:'flex', gap:8 }}>
                  <button title="Edit" onClick={()=>startEdit(c)}
                          style={{ border:'1px solid #ddd', background:'#fafafa', borderRadius:6, padding:'2px 6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                  <button title="Delete" onClick={()=>del(c.id)}
                          style={{ border:'1px solid #ddd', background:'#fafafa', borderRadius:6, padding:'2px 6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-1 0v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6h10z"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {attachments.length > 0 && (
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:4 }}>
            {attachments.map(a => {
              const apiBase = (api.defaults.baseURL as string).replace(/\/+$/, '')
              const href = a.url.startsWith('http') ? a.url : `${apiBase}${a.url}`
              return (
                <a key={a.id} href={href} target="_blank" rel="noreferrer"
                   style={{ border:'1px solid #eee', padding:4, borderRadius:6 }}>
                  {a.filename}
                </a>
              )
            })}
          </div>
        )}

        {comments.length===0 && attachments.length===0 && !error && <div>No activity yet.</div>}
      </div>

      <div style={{ marginTop:12, display:'grid', gap:8 }}>
        <textarea placeholder="Add a comment" value={body} onChange={e=>setBody(e.target.value)} />
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input type="file" onChange={e=>setFile(e.target.files?.[0] || null)} />
          <button onClick={submit} disabled={busy || (!body.trim() && !file)}>
            {busy ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  )
}
