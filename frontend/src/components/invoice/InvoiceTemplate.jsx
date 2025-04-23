'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const InvoiceTemplate = () => {
  const { invoiceId } = useParams()
  const [invoiceData, setInvoiceData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const token = localStorage.getItem('token')
        const { data } = await axios.get(`${API_URL}/invoices/${invoiceId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        })
        setInvoiceData(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchInvoice()
  }, [invoiceId])

  // function for generate a pdf
  const generatePDF = async () => {
    const element = document.getElementById('invoice-content')
    try {
      const canvas = await html2canvas(element, { scale: 2 })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Facture-${invoiceId}.pdf`)
    } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!invoiceData) return <div>None data send</div>

  return (
    <Card className="shadow-lg border border-gray-200 rounded-lg">
      <div id="invoice-content">
        <CardHeader className="bg-gray-100 p-6 rounded-t-lg">
          <h1 className="text-2xl font-bold text-gray-800">Facture {invoiceData.invoiceNumber}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Date d'émission : {new Date(invoiceData.issuedAt).toLocaleDateString()}
          </p>
          <p
            className={`text-sm mt-1 font-semibold ${invoiceData.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}
          >
            Statut : {invoiceData.paymentStatus}
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <section className="">
            <h2 className="text-lg font-semibold text-gray-800">Détails du client</h2>
            <div className="mt-2 text-sm text-gray-700">
              <p>
                <strong>Nom :</strong> {invoiceData.customerDetails.firstName} {invoiceData.customerDetails.lastName}
              </p>
              <p>
                <strong>Email :</strong> {invoiceData.customerDetails.email}
              </p>
              <p>
                <strong>Adresse :</strong> {invoiceData.customerDetails.address}
              </p>
            </div>
          </section>
          <Separator className="my-6" />
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Détails de la commande</h2>
            <Table className="mt-4 border border-gray-300">
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Prix unitaire</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceData.order.products.map((product, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell>{product.product.name}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell>{product.product.price.toFixed(2)} €</TableCell>
                    <TableCell>{(product.quantity * product.product.price).toFixed(2)} €</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
          <TableBody>
            <section className="mt-6">
              <h3 className="text-xl font-bold text-gray-800 text-left">
                Total : {invoiceData.totalAmount.toFixed(2)} €
              </h3>
            </section>
          </TableBody>
        </CardContent>
      </div>
      <div className="px-6 my-4 flex justify-start">
        <Button onClick={generatePDF}>Download PDF</Button>
      </div>
    </Card>
  )
}

export default InvoiceTemplate
