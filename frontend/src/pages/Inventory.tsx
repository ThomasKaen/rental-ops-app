import { useEffect, useState } from 'react'
import api from '../lib/api'


type Stock = { id:number; item_id:number; quantity:number; min_level_override?:number }


export default function Inventory(){
    const [siteId, setSiteId] = useState(1)
    const [stocks, setStocks] = useState<Stock[]>([])
    useEffect(()=>{ api.get(`/inventory/stock?site_id=${siteId}`).then(r=>setStocks(r.data)) },[siteId])
    return (
        <div>
            <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                <label>Site ID</label>
                <input value={siteId} onChange={e=>setSiteId(Number(e.target.value||1))} style={{ width:80 }} />
            </div>
            {stocks.map(s=> (
            <div key={s.id} style={{ padding:12, border:'1px solid #eee', borderRadius:8, marginBottom:8 }}>
                <div>Stock #{s.id} · Item {s.item_id}</div>
                <div>Qty: <strong>{s.quantity}</strong></div>
            </div>
            ))}
        </div>
    )
}