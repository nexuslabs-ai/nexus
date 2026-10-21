'use client';

import { Badge } from '@/components/nxds/components/badge/badge';
import { Button } from '@/components/nxds/components/button/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/nxds/components/card/card';
import { Input } from '@/components/nxds/components/input/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/nxds/components/select/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/nxds/components/table/table';
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
        <CardDescription>Search and filter invoices.</CardDescription>
      </CardHeader>
      <CardContent className="nx:space-y-4">
        <div className="nx:flex nx:flex-wrap nx:items-center nx:gap-3">
          <div className="nx:relative nx:min-w-56 nx:flex-1">
            <IconSearch className="nx:pointer-events-none nx:absolute nx:top-1/2 nx:left-2.5 nx:z-10 nx:size-4 nx:-translate-y-1/2 nx:text-muted-foreground" />
            <Input
              className="nx:pl-8"
              placeholder="Search customer…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="nx:w-40">
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
              <TableHead className="nx:text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="nx:typography-label-default">{i.id}</TableCell>
                <TableCell>{i.customer}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[i.status]}>{i.status}</Badge>
                </TableCell>
                <TableCell className="nx:text-right">{i.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="nx:flex nx:items-center nx:justify-between nx:pt-2">
          <span className="nx:typography-body-small nx:text-muted-foreground">{rows.length} of {INVOICES.length} invoices</span>
          <div className="nx:flex nx:gap-2">
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
