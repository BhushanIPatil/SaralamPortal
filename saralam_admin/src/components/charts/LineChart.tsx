import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'

export interface LineChartSeries {
  name: string
  dataKey: string
  color?: string
}

export interface LineChartProps {
  data: Record<string, unknown>[]
  series: LineChartSeries[]
  xKey: string
  title?: string
  height?: number
}

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626']

export function LineChart({ data, series, xKey, title, height = 280 }: LineChartProps) {
  return (
    <Card>
      {title && <h3 className="mb-4 text-sm font-semibold text-[var(--color-admin-text)]">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="#64748b" />
          <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 6 }}
            labelStyle={{ color: '#64748b' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((s, i) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color ?? COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </Card>
  )
}
