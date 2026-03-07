import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import MarketPrices from './pages/MarketPrices'
import NewsFeed from './pages/NewsFeed'
import AdminPanel from './pages/AdminPanel'
import EditorReports from './pages/EditorReports'
import Login from './pages/Login'

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" replace />
  return children
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/market" element={<AppLayout><MarketPrices /></AppLayout>} />
        <Route path="/news" element={<AppLayout><NewsFeed /></AppLayout>} />

        {/* Editor route — editors manage their own reports */}
        <Route path="/my-reports" element={
          <ProtectedRoute>
            <AppLayout><EditorReports /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Admin route — approve/reject reports, full oversight */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AppLayout><AdminPanel /></AppLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
