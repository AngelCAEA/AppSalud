import { User } from '@/types/user';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { COLUMNS } from '@/pages/Admin/TableColumns';
import { Skeleton } from '@/components/ui/skeleton';
import { TableProps } from '@/types/dashboard'
import { useToken } from '@/hooks/use-csrf';

export default function UserTable({ data, isLoading, error, roles }: TableProps) {

  const csrfToken = useToken();
  const skeletonCount = data.length;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {COLUMNS.map((col)=>(
            <TableHead className="bg-secondary" key={col.label}>{col.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      {/* Carga inicial con skeleton */}
      <TableBody>
          {isLoading ? (
            Array.from({length: skeletonCount}).map(( _, rowIndex)=> (
              <TableRow key={`skeleton-row-${rowIndex}`}>
                <TableCell>
                  <Skeleton className='text-left'/>
                </TableCell>
                <TableCell>
                  <Skeleton className='text-left'/>
                </TableCell>
                <TableCell>
                  <Skeleton className='text-left'/>
                </TableCell>
              </TableRow>
            ))
          ): data.length > 0 ? (
            data.map((item: User) => (
            <TableRow key={item.id}>{COLUMNS.map((col) => (
              <TableCell key={col.label}>
                {col.renderCell(item, csrfToken, roles)}
              </TableCell>))}
            </TableRow>
            ))
          ):(
            <TableRow>
              <TableCell
              colSpan={COLUMNS.length}
              className='h-24 text-center text-[#64748b]'>
                {error || 'Sin resultados'}
              </TableCell>
            </TableRow>
          )}
      </TableBody>
    </Table>
  );
}
