'use client'

import { TrendingUp } from 'lucide-react'
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartData = [
  { month: 'January', positiveReviews: 300, negativeReviews: 50 },
  { month: 'February', positiveReviews: 350, negativeReviews: 40 },
  { month: 'March', positiveReviews: 400, negativeReviews: 60 },
  { month: 'April', positiveReviews: 450, negativeReviews: 70 },
  { month: 'May', positiveReviews: 500, negativeReviews: 80 },
  { month: 'June', positiveReviews: 550, negativeReviews: 90 },
]

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Mobile',
    color: 'hsl(var(--chart-2))',
  },
}
const ComponentLineChart = () => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Line Chart - Customer reviews</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[500px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={value => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Line
              dataKey="positiveReviews"
              type="negativeReviews"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={{
                fill: 'var(--color-desktop)',
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <TrendingUp className="text-muted-foreground" />
        <span className="text-muted-foreground text-sm pl-2">Positive reviews increased by +10% this month.</span>
      </CardFooter>
    </Card>
  )
}

export default ComponentLineChart
