import { useApp } from '@/contexts/AppContext';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Key, ClipboardList, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user, userAccounts, keys, tasks } = useApp();
  const staffCount = userAccounts.filter(a => a.role === 'staff').length;

  const stats = [
    {
      label: 'Total Staff',
      value: staffCount,
      icon: <Users className="h-5 w-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Total Keys',
      value: keys.length,
      icon: <Key className="h-5 w-5" />,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Active Tasks',
      value: tasks.length,
      icon: <ClipboardList className="h-5 w-5" />,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Available Keys',
      value: keys.filter(k => k.status === 'Available').length,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {user?.username}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            {user?.role === 'supervisor' 
              ? 'Manage your team, keys, and tasks from here.'
              : 'View your assigned keys and tasks.'}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="animate-slide-in">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Keys</CardTitle>
            </CardHeader>
            <CardContent>
              {keys.length === 0 ? (
                <p className="text-muted-foreground">No keys registered yet.</p>
              ) : (
                <div className="space-y-3">
                  {keys.slice(0, 5).map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">{key.keyNumber}</p>
                        <p className="text-sm text-muted-foreground">{key.description}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          key.status === 'Available'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {key.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-muted-foreground">No tasks assigned yet.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">{task.taskName}</p>
                        <p className="text-sm text-muted-foreground">
                          Assigned to: {task.assignedTo}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Due: {task.dueDate}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
