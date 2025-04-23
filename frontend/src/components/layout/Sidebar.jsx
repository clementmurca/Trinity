// Sidebar.jsx
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaHome, FaUserCog, FaBox, FaFileInvoice, FaUser } from 'react-icons/fa'

const Sidebar = () => {
  const user = useSelector(state => state.auth.user)

  if (!user) return null

  const isAdmin = user.role === 'admin' && user.status === 'seller'
  const isSeller = user.role === 'user' && user.status === 'seller'

  const links = isAdmin
    ? [
        { name: 'Dashboard', path: '/reports', icon: <FaHome /> },
        {
          name: 'User Management',
          path: '/Customer-Management',
          icon: <FaUserCog />,
        },
        {
          name: 'Products',
          path: '/admin/product-management',
          icon: <FaBox />,
        },
        { name: 'Invoice', path: '/invoice', icon: <FaFileInvoice /> },
        { name: 'Profile', path: '/profile', icon: <FaUser /> },
      ]
    : isSeller
      ? [
          { name: 'Dashboard', path: '/', icon: <FaHome /> },
          { name: 'Products', path: '/products', icon: <FaBox /> },
          {
            name: 'Invoice',
            path: '/Invoice-Customer',
            icon: <FaFileInvoice />,
          },
          { name: 'Profile', path: '/profile', icon: <FaUser /> },
        ]
      : []

  return (
    <div className="h-full bg-white shadow-md p-4 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Dashboard</h2>
      <nav className="flex flex-col space-y-2">
        {links.map(link => (
          <Link
            key={link.name}
            to={link.path}
            className="flex items-center space-x-2 p-3 text-gray-700 hover:bg-gray-200 rounded"
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
