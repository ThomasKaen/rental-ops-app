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

  return (
    <div style={{ marginTop:16 }}>
      <h4>Activity</h4>
      {error && <div style={{ color:'#b91c1c', marginBottom:8 }}>{String(error)}</div>}

      <div style={{ display:'grid', gap:8 }}>
        {comments.map(c => (
          <div key={c.id} style={{ padding:8, border:'1px solid #eee', borderRadius:8 }}>
            <div style={{ fontSize:12, color:'#666' }}>{c.author || 'anon'} · {new Date(c.created_at).toLocaleString()}</div>
            <div>{c.body}</div>
          </div>
        ))}
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
