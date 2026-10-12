import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';

import { Avatar, AvatarFallback } from '@/components/avatar';
import { Badge } from '@/components/badge';
import { Button } from '@/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Progress } from '@/components/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table';

const STATS = [
  { label: 'Revenue', value: '$48,120', delta: '+12.4%', up: true },
  { label: 'Active users', value: '3,842', delta: '+4.1%', up: true },
  { label: 'Churn', value: '1.8%', delta: '-0.3%', up: false },
];

const MEMBERS = [
  { name: 'Ada Lovelace', role: 'Owner', status: 'Active' },
  { name: 'Alan Turing', role: 'Admin', status: 'Active' },
  { name: 'Grace Hopper', role: 'Editor', status: 'Invited' },
  { name: 'Katherine Johnson', role: 'Viewer', status: 'Active' },
];

const ONBOARDING = [
  { step: 'Profile', percent: 80 },
  { step: 'Integrations', percent: 45 },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('');
}

export default function DashboardPage() {
  return (
    <div className="nx:space-y-6">
      <section className="nx:grid nx:gap-4 nx:sm:grid-cols-3">
        {STATS.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="nx:typography-heading-medium">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant={stat.up ? 'success' : 'error'}>
                {stat.up ? <IconArrowUpRight /> : <IconArrowDownRight />}
                {stat.delta}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="nx:grid nx:gap-6 nx:lg:grid-cols-3">
        <Card className="nx:lg:col-span-2">
          <CardHeader>
            <CardTitle>Team</CardTitle>
            <CardDescription>Everyone with access to this workspace.</CardDescription>
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
                {MEMBERS.map((member) => (
                  <TableRow key={member.name}>
                    <TableCell>
                      <div className="nx:flex nx:items-center nx:gap-2">
                        <Avatar size="sm">
                          <AvatarFallback>{initials(member.name)}</AvatarFallback>
                        </Avatar>
                        {member.name}
                      </div>
                    </TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'Active' ? 'success' : 'secondary'} fill="light">
                        {member.status}
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
          <CardContent className="nx:space-y-5">
            {ONBOARDING.map(({ step, percent }) => (
              <div key={step} className="nx:space-y-2">
                <div className="nx:flex nx:justify-between nx:typography-body-small nx:text-muted-foreground">
                  <span>{step}</span>
                  <span>{percent}%</span>
                </div>
                <Progress value={percent} />
              </div>
            ))}
            <Button className="nx:w-full">Continue setup</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
