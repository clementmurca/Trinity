import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'

const ProtectedRoute = ({ children, requiredRole, redirectTo = '/' }) => {
  const { user, isLoading } = useSelector(state => state.auth)
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading, please wait...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check for role
  if (requiredRole && (!user.role || user.role !== requiredRole)) {
    toast.error('Access denied: User role is missing or does not match', {
      requiredRole,
      userRole: user.role,
    })
    return <Navigate to={redirectTo} replace />
  }

  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.oneOf(['user', 'admin']), // Acceptable roles
  redirectTo: PropTypes.string, // Optional custom redirect path
}

export default ProtectedRoute
