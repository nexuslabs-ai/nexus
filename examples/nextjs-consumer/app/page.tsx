'use client';

import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@acme/react';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';

const STATS = [
  { label: 'Revenue', value: '$48,120', delta: '+12.4%', up: true },
  { label: 'Active users', value: '3,842', delta: '+4.1%', up: true },
  { label: 'Churn', value: '1.8%', delta: '-0.3%', up: false },
];

const ROWS = [
  { name: 'Ada Lovelace', role: 'Owner', status: 'Active' },
  { name: 'Alan Turing', role: 'Admin', status: 'Active' },
  { name: 'Grace Hopper', role: 'Editor', status: 'Invited' },
  { name: 'Katherine Johnson', role: 'Viewer', status: 'Active' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        {STATS.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-2xl">{s.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={s.up ? 'success' : 'error'}>
                {s.up ? <IconArrowUpRight /> : <IconArrowDownRight />}
                {s.delta}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>Rendered with the design system&apos;s Table.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ROWS.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>
                          {r.name
                            .split(' ')
                            .map((p) => p[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      {r.name}
                    </TableCell>
                    <TableCell>{r.role}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'Active' ? 'success' : 'secondary'}>
                        {r.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Onboarding</CardTitle>
            <CardDescription>Quarterly setup progress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Profile</span>
                <span>80%</span>
              </div>
              <Progress value={80} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Integrations</span>
                <span>45%</span>
              </div>
              <Progress value={45} />
            </div>
            <Button className="w-full">Continue setup</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
