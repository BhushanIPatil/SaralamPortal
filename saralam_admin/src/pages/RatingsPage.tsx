import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminRatingsApi } from '@/lib/api/endpoints/ratings'
import { DataTable } from '@/components/ui/DataTable'
import { LineChart } from '@/components/charts/LineChart'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface RatingRow {
  id: string
  reviewer_name: string
  reviewee_name: string
  job_title?: string
  rating: number
  review_text?: string
  created_at: string
  flagged: boolean
}

export function RatingsPage() {
  const queryClient = useQueryClient()

  const { data: listData, isLoading } = useQuery({
    queryKey: ['admin', 'ratings'],
    queryFn: async () => {
      const res = await adminRatingsApi.list()
      return (res.data as { data?: RatingRow[] })?.data ?? []
    },
  })

  const { data: trendData } = useQuery({
    queryKey: ['admin', 'ratings', 'trend'],
    queryFn: async () => {
      const res = await adminRatingsApi.getTrend()
      return (res.data as { data?: { date: string; avg_rating: number }[] })?.data ?? []
    },
  })

  const flagRating = useMutation({
    mutationFn: (id: string) => adminRatingsApi.flag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ratings'] })
      toast.success('Flagged for moderation')
    },
  })

  const deleteRating = useMutation({
    mutationFn: (id: string) => adminRatingsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ratings'] })
      toast.success('Review deleted')
    },
  })

  const columns: ColumnDef<RatingRow>[] = [
    { accessorKey: 'reviewer_name', header: 'Reviewer' },
    { accessorKey: 'reviewee_name', header: 'Reviewee' },
    { accessorKey: 'job_title', header: 'Job' },
    { accessorKey: 'rating', header: 'Rating' },
    { accessorKey: 'review_text', header: 'Review', cell: ({ getValue }) => (getValue() ? String(getValue()).slice(0, 50) + '…' : '—') },
    { accessorKey: 'created_at', header: 'Date', cell: ({ getValue }) => format(new Date(String(getValue())), 'dd MMM yyyy') },
    {
      accessorKey: 'flagged',
      header: 'Flagged',
      cell: ({ getValue }) => (getValue() ? 'Yes' : 'No'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => flagRating.mutate(row.original.id)}>Flag</Button>
          <Button variant="danger" size="sm" onClick={() => window.confirm('Delete this review?') && deleteRating.mutate(row.original.id)}>Delete</Button>
        </div>
      ),
    },
  ]

  const ratings = (listData ?? []) as RatingRow[]

  return (
    <div className="space-y-6">
      {trendData && trendData.length > 0 && (
        <LineChart
          title="Platform avg rating trend"
          data={trendData}
          xKey="date"
          series={[{ name: 'Avg rating', dataKey: 'avg_rating' }]}
          height={220}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <DataTable data={ratings} columns={columns} searchPlaceholder="Search reviews..." />
      )}
    </div>
  )
}
