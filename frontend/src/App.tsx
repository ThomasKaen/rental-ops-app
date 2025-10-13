import { Link, Outlet } from "react-router-dom";

export default function App() {
  return (
    <div>
      <nav style={{ display: "flex", gap: 12, padding: 8, borderBottom: "1px solid #eee" }}>
        <Link to="/tasks">Tasks</Link>
        <Link to="/sites">Sites</Link>
        <Link to="/inventory">Inventory</Link>
        <Link to="/units">Units</Link>
      </nav>

      <div style={{ padding: 12 }}>
        {/* Nested routes render here */}
        <Outlet />
      </div>
    </div>
  );
}
