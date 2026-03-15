import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'

export interface BarChartSeries {
  name: string
  dataKey: string
  color?: string
}

export interface BarChartProps {
  data: Record<string, unknown>[]
  series: BarChartSeries[]
  xKey: string
  title?: string
  height?: number
}

const COLORS = ['#2563eb', '#059669']

export function BarChart({ data, series, xKey, title, height = 280 }: BarChartProps) {
  return (
    <Card>
      {title && <h3 className="mb-4 text-sm font-semibold text-[var(--color-admin-text)]">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="#64748b" />
          <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 6 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {series.map((s, i) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color ?? COLORS[i % COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </Card>
  )
}
