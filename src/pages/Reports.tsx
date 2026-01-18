import { useApp } from '@/contexts/AppContext';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Key, ClipboardList, CheckCircle, AlertCircle } from 'lucide-react';

export default function Reports() {
  const { staffAccounts, keys, tasks } = useApp();

  const availableKeys = keys.filter((k) => k.status === 'Available').length;
  const assignedKeys = keys.filter((k) => k.status === 'Assigned').length;

  const stats = [
    {
      label: 'Total Staff',
      value: staffAccounts.length,
      description: 'Registered staff members',
      icon: <Users className="h-6 w-6" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Total Keys',
      value: keys.length,
      description: 'Keys in the system',
      icon: <Key className="h-6 w-6" />,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Total Tasks',
      value: tasks.length,
      description: 'Active tasks',
      icon: <ClipboardList className="h-6 w-6" />,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  const keyBreakdown = [
    {
      label: 'Available Keys',
      value: availableKeys,
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-success',
    },
    {
      label: 'Assigned Keys',
      value: assignedKeys,
      icon: <AlertCircle className="h-5 w-5" />,
      color: 'text-warning',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="mt-1 text-muted-foreground">View system summary and statistics</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="animate-slide-in">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-semibold">{stat.label}</CardTitle>
                  <CardDescription>{stat.description}</CardDescription>
                </div>
                <div className={`rounded-xl p-3 ${stat.bgColor}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Keys Breakdown</CardTitle>
            <CardDescription>Status distribution of registered keys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {keyBreakdown.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 rounded-lg bg-muted/50 p-4"
                >
                  <span className={item.color}>{item.icon}</span>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Directory</CardTitle>
            <CardDescription>Quick overview of registered staff</CardDescription>
          </CardHeader>
          <CardContent>
            {staffAccounts.length === 0 ? (
              <p className="text-muted-foreground">No staff registered yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {staffAccounts.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {staff.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">{staff.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
