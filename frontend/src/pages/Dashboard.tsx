import api from '../lib/api'
import { useEffect, useState } from 'react'


export default function Dashboard(){
    const [summary, setSummary] = useState<any>({})
    useEffect(()=>{ setSummary({ ok:true }) },[])
    return (
        <div>
            <h3>Welcome</h3>
            <p>Quick links:</p>
            <ul>
                <li>See <a href="/tasks">Tasks</a></li>
                <li>Check <a href="/inventory">Inventory</a></li>
            </ul>
        </div>
    )
}