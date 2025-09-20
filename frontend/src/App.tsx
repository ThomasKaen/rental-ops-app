import { Outlet, Link, useLocation } from 'react-router-dom'


export default function App(){
    const { pathname } = useLocation()
    return (
        <div style={{ fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #eee' }}>
                <strong>Airbnb Ops</strong>
            </div>
            <div style={{ padding: 12 }}>
                <Outlet />
            </div>
            <nav style={{ position:'fixed', bottom:0, left:0, right:0, display:'flex', gap:8, borderTop:'1px solid #eee', padding:8, background:'#fff' }}>
                <Tab to="/" label="Home" active={pathname === '/'} />
                <Tab to="/tasks" label="Tasks" active={pathname.startsWith('/tasks')} />
                <Tab to="/inventory" label="Inventory" active={pathname.startsWith('/inventory')} />
                <Tab to="/sites" label="Sites" active={pathname.startsWith('/sites')} />
            </nav>
        </div>
    )
}


function Tab({ to, label, active }:{to:string; label:string; active:boolean}){
    return <Link to={to} style={{ flex:1, textAlign:'center', padding:8, borderRadius:8, background: active? '#efefef':'transparent', textDecoration:'none', color:'#111' }}>{label}</Link>
}