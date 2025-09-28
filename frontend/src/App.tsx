import { Routes, Route, Link } from "react-router-dom";
import Sites from "./pages/Sites";
import Inventory from "./pages/Inventory";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";

export default function App() {
  return (
    <div>
      <nav style={{ display: "flex", gap: 12, padding: 8, borderBottom: "1px solid #eee" }}>
        <Link to="/tasks">Tasks</Link>
        <Link to="/sites">Sites</Link>
        <Link to="/inventory">Inventory</Link>
      </nav>
      <div style={{ padding: 12 }}>
        <Routes>
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/sites" element={<Sites />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="*" element={<Tasks />} />
        </Routes>
      </div>
    </div>
  );
}
