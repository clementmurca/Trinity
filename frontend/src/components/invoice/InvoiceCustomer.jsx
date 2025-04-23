'use client'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const InvoiceCustomer = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const columns = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => row.getValue('id'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => row.getValue('status'),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <span>Email</span>,
      cell: ({ row }) => row.getValue('email'),
    },
    {
      accessorKey: 'amount',
      header: () => 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'))
        const formatted = new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
        }).format(amount)
        return <span>{formatted}</span>
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const invoiceId = row.original.id
        return <Button onClick={() => handleViewInvoice(invoiceId)}>View invoice</Button>
      },
    },
  ]

  const handleViewInvoice = invoiceId => {
    navigate(`/invoice-customer/${invoiceId}`)
  }

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_URL}/invoices`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
          },
        })
        const invoices = response.data.map(invoice => ({
          id: invoice._id,
          amount: invoice.totalAmount,
          status: invoice.paymentStatus,
          email: invoice.customerDetails?.email || 'Non spécifié',
        }))
        setData(invoices)
      } catch (err) {
        console.error('Erreur lors de la récupération des factures :', err)
        setError('Impossible de récupérer les factures.')
      } finally {
        setLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {},
  })

  if (loading) return <div>Chargement des factures...</div>
  if (error) return <div>{error}</div>

  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

export default InvoiceCustomer
