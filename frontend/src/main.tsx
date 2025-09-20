import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
import Inventory from './pages/Inventory'
import Sites from './pages/Sites'
import SiteDetail from './pages/SiteDetail'


const router = createBrowserRouter([
    { path: '/', element: <App />, children: [
        { index: true, element: <Dashboard /> },
        { path: 'tasks', element: <Tasks /> },
        { path: 'tasks/:id', element: <TaskDetail /> },
        { path: 'inventory', element: <Inventory /> },
        { path: 'sites', element: <Sites /> },
        { path: 'sites/:id', element: <SiteDetail /> },
    ]}
])


ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)