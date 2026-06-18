import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useVerdantStore } from '../../lib/store'
import { CATEGORY_COLORS } from '../../lib/carbon'

interface DataPoint {
  day: string
  transport: number
  food: number
  energy: number
  shopping: number
  travel: number
  waste: number
}

function buildWeekData(logs: { date: string; co2Kg: number; category: string }[]): DataPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay() + 1)

  return days.map((day, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const dayLogs = logs.filter(l => l.date === dateStr)
    const point: DataPoint = { day, transport: 0, food: 0, energy: 0, shopping: 0, travel: 0, waste: 0 }
    dayLogs.forEach(l => {
      const cat = l.category as keyof Omit<DataPoint, 'day'>
      if (cat in point) point[cat] += l.co2Kg
    })
    return point
  })
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { name: string; value: number; fill: string }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + p.value, 0)
  return (
    <div className="glass-card-strong px-3 py-2 text-xs space-y-1">
      <p className="text-[rgba(245,240,232,0.6)] mb-1">{label}</p>
      {payload.filter(p => p.value > 0).map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span style={{ color: p.fill }}>{p.name}</span>
          <span className="text-[#F5F0E8]">{p.value.toFixed(1)}kg</span>
        </div>
      ))}
      <div className="border-t border-[rgba(46,204,122,0.1)] pt-1 flex justify-between">
        <span className="text-[rgba(245,240,232,0.5)]">Total</span>
        <span className="font-semibold text-[#F5F0E8]">{total.toFixed(1)}kg</span>
      </div>
    </div>
  )
}

export function WeeklyBarChart() {
  const logs = useVerdantStore(s => s.logs)
  const data = buildWeekData(logs)

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(46,204,122,0.06)" />
        <XAxis
          dataKey="day"
          tick={{ fill: 'rgba(245,240,232,0.5)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(245,240,232,0.4)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <Bar key={cat} dataKey={cat} stackId="a" fill={color} name={cat} radius={cat === 'waste' ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
