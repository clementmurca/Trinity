'use client'

import { TrendingUp } from 'lucide-react'
import { Pie, PieChart } from 'recharts'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartData = [
  { deliveryMode: 'Standard', orders: 400, fill: '#4CAF50' },
  { deliveryMode: 'Express', orders: 250, fill: '#FFC107' },
  { deliveryMode: 'Relais Colis', orders: 150, fill: '#2196F3' },
]

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  chrome: {
    label: 'Chrome',
    color: 'hsl(var(--chart-1))',
  },
  safari: {
    label: 'Safari',
    color: 'hsl(var(--chart-2))',
  },
  firefox: {
    label: 'Firefox',
    color: 'hsl(var(--chart-3))',
  },
  edge: {
    label: 'Edge',
    color: 'hsl(var(--chart-4))',
  },
  other: {
    label: 'Other',
    color: 'hsl(var(--chart-5))',
  },
}

const ComponentPieChart = () => {
  return (
    <Card className="mt-8">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Delivery methods</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey="orders" nameKey="deliveryMode" innerRadius={60} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <TrendingUp className="text-muted-foreground" />
        <span className="text-muted-foreground text-sm pl-2">
          Express delivery has gained in popularity, with an increase of +8% this month.
        </span>
      </CardFooter>
    </Card>
  )
}

export default ComponentPieChart
