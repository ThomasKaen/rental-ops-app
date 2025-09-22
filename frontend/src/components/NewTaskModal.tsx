import { useState } from 'react'
import api from '../lib/api'

export default function NewTaskModal({
  open, onClose, onCreated,
}: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [siteId, setSiteId] = useState<number | ''>('')
  const [unitId, setUnitId] = useState<number | ''>('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'red' | 'amber' | 'green'>('green')
  const [submitting, setSubmitting] = useState(false)
  const canSubmit = title.trim().length > 0 && description.trim().length > 0

  if (!open) return null

  async function createTask() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      await api.post('/tasks', {
        site_id: siteId,
        unit_id: unitId === '' ? undefined : unitId,
        title,
        description,
        priority,
      })
      onCreated()
      onClose()
      setTitle(''); setDescription(''); setUnitId('')
      setPriority('green')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', padding: 16, zIndex: 50 }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 16, width: '100%', maxWidth: 480 }}>
        <h3 style={{ marginTop: 0 }}>New Task</h3>
        <div style={{ display: 'grid', gap: 10 }}>
          <label>Site ID
            <input value={siteId} onChange={e => setSiteId(Number(e.target.value || 1))} style={{ width: '100%' }} />
          </label>
          <label>Unit ID (optional)
            <input
              value={unitId}
              onChange={e => setUnitId(e.target.value === '' ? '' : Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </label>
          <label>Title
            <input value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label>Description
            <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%' }} />
          </label>
          <label>Priority
            <select value={priority} onChange={e => setPriority(e.target.value as any)} style={{ width: '100%' }}>
              <option value="red">Red</option>
              <option value="amber">Amber</option>
              <option value="green">Green</option>
            </select>
          </label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <button onClick={onClose} disabled={submitting}>Cancel</button>
            <button onClick={createTask} disabled={!canSubmit || submitting}>
              {submitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
