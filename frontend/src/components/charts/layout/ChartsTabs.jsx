import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import AllChart from '../AllChart'
import ComponentPieChart from '../ComponentPieChart'
import ComponentLineChart from '../ComponentLineChart'
import ComponentBarChart from '../ComponentBarChart'

const ChartsTabs = () => {
  return (
    <Card className="m-16">
      <CardContent className="pt-6">
        <Tabs defaultValue="all-chart" className="w-full">
          <TabsList>
            <TabsTrigger value="all-chart">All</TabsTrigger>
            <TabsTrigger value="bar-chart">Bar</TabsTrigger>
            <TabsTrigger value="pie-chart">Pie</TabsTrigger>
            <TabsTrigger value="line-chart">Line</TabsTrigger>
          </TabsList>
          <TabsContent value="all-chart">
            <AllChart />
          </TabsContent>
          <TabsContent value="bar-chart">
            <ComponentBarChart />
          </TabsContent>
          <TabsContent value="line-chart">
            <ComponentLineChart />
          </TabsContent>
          <TabsContent value="pie-chart">
            <ComponentPieChart />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default ChartsTabs
