import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'

export interface PieChartProps {
  data: { name: string; value: number }[]
  title?: string
  height?: number
}

const COLORS = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#ec4899', '#0ea5e9']

export function PieChart({ data, title, height = 280 }: PieChartProps) {
  return (
    <Card>
      {title && <h3 className="mb-4 text-sm font-semibold text-[var(--color-admin-text)]">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value, 'Count']}
            contentStyle={{ fontSize: 12, borderRadius: 6 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </Card>
  )
}
