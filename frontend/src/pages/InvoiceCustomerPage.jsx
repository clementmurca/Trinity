import InvoiceCustomer from '../components/invoice/InvoiceCustomer'

const InvoiceCustomerPage = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>
      <InvoiceCustomer />
    </main>
  )
}

export default InvoiceCustomerPage
