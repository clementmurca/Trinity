import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

const HomePage = () => {
  const { user } = useSelector(state => state.auth)

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Welcome to Our Platform</h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Discover amazing features and services that will help you optimize products management.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {!user ? (
                <>
                  <Link
                    to="/signup"
                    className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Get started
                  </Link>
                  <Link to="/login" className="text-sm font-semibold leading-6 text-gray-900">
                    Log in <span aria-hidden="true">→</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/products"
                  className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
