import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'

export interface AreaChartProps {
  data: Record<string, unknown>[]
  dataKey: string
  xKey: string
  title?: string
  height?: number
  color?: string
}

export function AreaChart({
  data,
  dataKey,
  xKey,
  title,
  height = 280,
  color = '#2563eb',
}: AreaChartProps) {
  return (
    <Card>
      {title && <h3 className="mb-4 text-sm font-semibold text-[var(--color-admin-text)]">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="#64748b" />
          <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
          <Area type="monotone" dataKey={dataKey} stroke={color} fill="url(#areaGrad)" strokeWidth={2} />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
