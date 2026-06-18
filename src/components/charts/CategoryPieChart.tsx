import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../lib/carbon'

interface CategoryPieChartProps {
  data: Record<string, number>
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { name: string; value: number; payload: { fill: string } }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card-strong px-3 py-2 text-sm">
      <p className="font-semibold" style={{ color: payload[0].payload.fill }}>
        {payload[0].name}
      </p>
      <p className="text-[rgba(245,240,232,0.7)]">{payload[0].value.toFixed(1)} kg CO₂</p>
    </div>
  )
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] ?? key,
      value: Number(value.toFixed(2)),
      fill: CATEGORY_COLORS[key as keyof typeof CATEGORY_COLORS] ?? '#95A5A6',
    }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-[rgba(245,240,232,0.4)] text-sm">
        No data yet — start logging!
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius="40%"
          outerRadius="65%"
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.fill} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: 'rgba(245,240,232,0.7)', fontSize: 11 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
