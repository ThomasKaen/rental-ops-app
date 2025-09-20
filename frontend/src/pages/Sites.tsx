import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'


type Site = { id:number; name:string }


export default function Sites(){
    const [sites, setSites] = useState<Site[]>([])
    useEffect(()=>{ api.get('/sites').then(r=>setSites(r.data)) },[])
    return (
        <div>
            {sites.map(s=> (
                <Link key={s.id} to={`/sites/${s.id}`} style={{ display:'block', padding:12, border:'1px solid #eee', borderRadius:8, marginBottom:8, textDecoration:'none', color:'#111' }}>{s.name}</Link>
        ))}
        </div>
    )
}