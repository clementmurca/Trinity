'use client'

import ComponentBarChart from './ComponentBarChart'
import ComponentLineChart from './ComponentLineChart'
import ComponentPieChart from './ComponentPieChart'

const AllChart = () => {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4">
      <div className="flex-1">
        <ComponentBarChart />
      </div>

      <div className="flex-1">
        <ComponentLineChart />
      </div>

      <div className="flex-1">
        <ComponentPieChart />
      </div>
    </div>
  )
}

export default AllChart
