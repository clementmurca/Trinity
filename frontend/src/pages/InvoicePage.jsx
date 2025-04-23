import InvoiceList from '@/components/invoice/InvoiceList'

const InvoicePage = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Invoices</h1>
      <InvoiceList />
    </main>
  )
}

export default InvoicePage
