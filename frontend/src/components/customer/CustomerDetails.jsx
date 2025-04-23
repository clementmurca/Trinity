'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'

const CustomerSearch = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [customer, setCustomer] = useState(null)

  const handleSearch = e => {
    e.preventDefault()
    setCustomer({
      firstName: 'John',
      lastName: 'Doe',
      email: 'johnDoe@gmail.com',
      phone: '0606060606',
      address: '1 boulevard martin',
      city: 'Paris',
      zipCode: '75013',
      country: 'France',
    })
  }

  return (
    <div className="space-y-6 mt-8">
      <div className="flex gap-4">
        <Input
          type="search"
          placeholder="Search customer"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSearch}>research</Button>
      </div>

      <Separator className="my-4" />

      <div className="space-y-8">
        <h2 className="text-2xl font-medium">Customer {customer?.firstName}</h2>

        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label>First name</Label>
            <Input value={customer?.firstName || ''} readOnly />
          </div>

          <div className="grid gap-2">
            <Label>Last name</Label>
            <Input value={customer?.lastName || ''} readOnly />
          </div>

          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={customer?.email || ''} readOnly />
          </div>

          <div className="grid gap-2">
            <Label>Phone</Label>
            <Input value={customer?.phone || ''} readOnly />
          </div>

          <div className="grid gap-2">
            <Label>Adress</Label>
            <Input value={customer?.address || ''} readOnly />
          </div>

          <div className="grid grid-cols-10 gap-4">
            <div className="col-span-9 grid gap-2">
              <Label>City</Label>
              <Input value={customer?.city || ''} readOnly />
            </div>

            <div className="col-span-1 grid gap-2">
              <Label>Zip code</Label>
              <Input value={customer?.zipCode || ''} readOnly />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Country</Label>
            <Input value={customer?.country || ''} readOnly />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerSearch
