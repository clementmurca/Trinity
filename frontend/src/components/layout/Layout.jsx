// Layout.jsx
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Footer from './Footer'

const Layout = () => {
  const location = useLocation()
  const publicPaths = ['/', '/login', '/signup']
  const showSidebar = !publicPaths.includes(location.pathname)
  const isPublicPage = publicPaths.includes(location.pathname)

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar is always visible */}
      <Navbar />

      <div className={`flex flex-1 ${isPublicPage ? 'p-0' : ''}`}>
        {/* Sidebar only shows on protected routes */}
        {showSidebar && (
          <div className="w-64 flex-shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Main content area - removed default padding for public routes */}
        <main
          className={`
            flex-1 
            ${!showSidebar ? 'w-full' : ''} 
            ${isPublicPage ? '' : 'bg-gray-100 p-6'} 
            overflow-auto
          `}
        >
          <Outlet />
        </main>
      </div>

      {/* Footer is always visible */}
      <Footer />
    </div>
  )
}

export default Layout
