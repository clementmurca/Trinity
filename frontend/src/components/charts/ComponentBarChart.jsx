'use client'
import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const chartData = [
  { month: 'January', bio: 120, classic: 200 },
  { month: 'February', bio: 150, classic: 250 },
  { month: 'March', bio: 180, classic: 220 },
  { month: 'April', bio: 130, classic: 210 },
  { month: 'May', bio: 170, classic: 240 },
  { month: 'June', bio: 190, classic: 260 },
]

const chartConfig = {
  desktop: {
    label: 'desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'mobile',
    color: 'hsl(var(--chart-2))',
  },
}

const ComponentBarChart = () => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Bar Chart - Sales by category</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="max-h-[500px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={value => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="bio" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="classic" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <TrendingUp className="text-muted-foreground" />
        <span className="text-muted-foreground text-sm pl-2">Sales of organic products rose by 6% this month.</span>
      </CardFooter>
    </Card>
  )
}

export default ComponentBarChart
