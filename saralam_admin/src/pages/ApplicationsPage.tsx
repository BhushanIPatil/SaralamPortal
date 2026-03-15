import { useQuery } from '@tanstack/react-query'
import { adminApplicationsApi } from '@/lib/api/endpoints/applications'
import { DataTable } from '@/components/ui/DataTable'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

interface ApplicationRow {
  id: string
  job_title: string
  seeker_name: string
  provider_name: string
  status: string
  created_at: string
}

export function ApplicationsPage() {
  const { data: listData, isLoading } = useQuery({
    queryKey: ['admin', 'applications'],
    queryFn: async () => {
      const res = await adminApplicationsApi.list()
      return (res.data as { data?: ApplicationRow[] })?.data ?? []
    },
  })

  const columns: ColumnDef<ApplicationRow>[] = [
    { accessorKey: 'job_title', header: 'Job' },
    { accessorKey: 'seeker_name', header: 'Seeker' },
    { accessorKey: 'provider_name', header: 'Provider' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'created_at', header: 'Date', cell: ({ getValue }) => format(new Date(String(getValue())), 'dd MMM yyyy') },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => <Button variant="ghost" size="sm">View</Button>,
    },
  ]

  const applications = (listData ?? []) as ApplicationRow[]

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : (
        <DataTable data={applications} columns={columns} searchPlaceholder="Search applications..." />
      )}
    </div>
  )
}
