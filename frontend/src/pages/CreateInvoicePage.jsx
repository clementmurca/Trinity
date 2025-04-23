import InvoiceCreate from '../components/invoice/InvoiceCreate'

const CreateInvoicePage = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex justify-center">Create Invoice</h1>
      <InvoiceCreate />
    </main>
  )
}

export default CreateInvoicePage
