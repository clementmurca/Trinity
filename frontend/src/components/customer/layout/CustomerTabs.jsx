import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import AddCustomer from '../AddCustomer'
import AllCustomers from '../AllCustomer'
import PurchaseHistory from '../PurchaseHistoryCustomer'

const CustomerTabs = () => {
  return (
    <Card className="m-16">
      <CardContent className="pt-6">
        <Tabs defaultValue="all-customer" className="w-full">
          <TabsList>
            <TabsTrigger value="all-customer">All customer</TabsTrigger>
            <TabsTrigger value="add-customer">Add customer</TabsTrigger>
            <TabsTrigger value="purchase-history">Purchase history</TabsTrigger>
          </TabsList>

          <TabsContent value="all-customer">
            <AllCustomers />
          </TabsContent>
          <TabsContent value="add-customer">
            <AddCustomer />
          </TabsContent>
          <TabsContent value="purchase-history">
            <PurchaseHistory />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default CustomerTabs
