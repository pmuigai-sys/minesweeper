import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ roles = [], redirectTo = '/login' }) => {
  const { user, loading, hasRole } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-16 h-16 border-4 border-kabarak-light border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  if (roles.length > 0 && !hasRole(roles)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
