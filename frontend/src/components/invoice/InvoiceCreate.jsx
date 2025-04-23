import { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const InvoiceCreate = () => {
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleGenerateInvoice = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/invoices`,
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const invoiceId = response.data.invoice._id
      setMessage(`Facture créée avec succès : ${response.data.invoice.invoiceNumber}`)

      navigate(`/admin/invoice-customer/${invoiceId}`)
    } catch (error) {
      setMessage(error.response?.data?.message || 'Erreur lors de la création de la facture')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <h2>Enter your order id below</h2>
        </CardHeader>
        <CardContent>
          <Label htmlFor="orderId">ID de Commande</Label>
          <Input
            id="orderId"
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
            placeholder="Entrez l'ID de commande"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateInvoice} disabled={loading} className="mr-4">
            {loading ? 'Pending create...' : 'Create invoice'}
          </Button>
          {message && <p>{message}</p>}
        </CardFooter>
      </Card>
    </>
  )
}

export default InvoiceCreate
