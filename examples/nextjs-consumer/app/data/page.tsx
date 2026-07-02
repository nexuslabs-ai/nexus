'use client';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@acme/react';
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';

type Invoice = {
  id: string;
  customer: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
};

const INVOICES: Invoice[] = [
  { id: 'INV-1024', customer: 'Globex', amount: '$2,400', status: 'Paid' },
  { id: 'INV-1025', customer: 'Initech', amount: '$1,180', status: 'Pending' },
  { id: 'INV-1026', customer: 'Umbrella', amount: '$3,900', status: 'Overdue' },
  { id: 'INV-1027', customer: 'Soylent', amount: '$640', status: 'Paid' },
  { id: 'INV-1028', customer: 'Hooli', amount: '$5,220', status: 'Pending' },
];

const STATUS_VARIANT = {
  Paid: 'success',
  Pending: 'warning',
  Overdue: 'error',
} as const;

export default function DataPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const rows = INVOICES.filter(
    (i) =>
      i.customer.toLowerCase().includes(query.toLowerCase()) &&
      (status === 'all' || i.status === status)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>Filterable data view built from the design system.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-56">
            <IconSearch className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-8"
              placeholder="Search customer…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.id}</TableCell>
                <TableCell>{i.customer}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[i.status]}>{i.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{i.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-slate-500">{rows.length} of {INVOICES.length} invoices</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
