import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { useVerdantStore } from '../../lib/store'
import { formatDateShort } from '../../lib/formatters'

interface DataPoint {
  date: string
  co2Kg: number
}

function buildWeeklyData(logs: { date: string; co2Kg: number }[]): DataPoint[] {
  const days: Record<string, number> = {}
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    days[key] = 0
  }
  logs.forEach(l => {
    if (days[l.date] !== undefined) {
      days[l.date] += l.co2Kg
    }
  })
  return Object.entries(days).map(([date, co2Kg]) => ({
    date: formatDateShort(date + 'T00:00:00'),
    co2Kg: Number(co2Kg.toFixed(2)),
  }))
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card-strong px-3 py-2 text-sm">
      <p className="text-[rgba(245,240,232,0.6)] text-xs mb-1">{label}</p>
      <p className="font-semibold text-[#2ECC7A]">{payload[0].value.toFixed(1)} kg CO₂</p>
    </div>
  )
}

export function EmissionsAreaChart() {
  const logs = useVerdantStore(s => s.logs)
  const data = buildWeeklyData(logs)

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="co2Gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2ECC7A" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#2ECC7A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,204,122,0.08)" />
        <XAxis
          dataKey="date"
          tick={{ fill: 'rgba(245,240,232,0.4)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={6}
        />
        <YAxis
          tick={{ fill: 'rgba(245,240,232,0.4)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="co2Kg"
          stroke="#2ECC7A"
          strokeWidth={2}
          fill="url(#co2Gradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#2ECC7A', stroke: '#0D1F17', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
