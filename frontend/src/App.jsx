// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import CustomerManagementPage from './pages/CustomerManagementPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailsView from './pages/ProductDetailsView'
import UserManagement from './pages/UserManagement'
import ProductManagementPage from './pages/ProductManagementPage'
import InvoicePage from './pages/InvoicePage'
import CreateInvoicePage from './pages/CreateInvoicePage'
import InvoiceCustomerPage from './pages/InvoiceCustomerPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import InvoiceTemplatePage from './pages/InvoiceTemplatePage'
import InvoiceTemplateAdminPage from './pages/InvoiceTemplateAdminPage'
import ReportsPage from './pages/ReportsPage'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes (With Navbar and Footer, but no Sidebar) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<HomePage />} />

          {/* Protected Routes (With Navbar, Sidebar, and Footer) */}
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:code" element={<ProductDetailsView />} />
          <Route path="/admin/product-management" element={<ProductManagementPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/Customer-Management" element={<CustomerManagementPage />} />
          <Route path="/invoice-Customer" element={<InvoiceCustomerPage />} />
          <Route path="/invoice-customer/:invoiceId" element={<InvoiceTemplatePage />} />
          <Route path="/invoice" element={<InvoicePage />} />
          <Route path="/invoice-Create" element={<CreateInvoicePage />} />
          <Route path="/admin/invoice-customer/:invoiceId" element={<InvoiceTemplateAdminPage />} />
          <Route path="/reports" element={<ReportsPage />} />

          {/* Protected Route for Admin */}
          <Route
            path="/admin/user-management"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
