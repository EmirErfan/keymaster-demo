import { useApp } from '@/contexts/AppContext';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Key, ClipboardList, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { user, userAccounts, keys, tasks } = useApp();
  const isSupervisor = user?.role === 'supervisor';
  const staffCount = userAccounts.filter(a => a.role === 'staff').length;

  // Filter tasks for staff - only show their assigned tasks
  const visibleTasks = isSupervisor 
    ? tasks 
    : tasks.filter(t => t.assignedToId === user?.id);

  const supervisorStats = [
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

  const staffStats = [
    {
      label: 'My Tasks',
      value: visibleTasks.length,
      icon: <ClipboardList className="h-5 w-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Keys Assigned',
      value: visibleTasks.length,
      icon: <Key className="h-5 w-5" />,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  const stats = isSupervisor ? supervisorStats : staffStats;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome, {user?.name || user?.username}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isSupervisor 
              ? 'Manage your team, keys, and tasks from here.'
              : 'View your assigned tasks below.'}
          </p>
        </div>

        <div className={`grid gap-6 sm:grid-cols-2 ${isSupervisor ? 'lg:grid-cols-4' : 'lg:grid-cols-2'}`}>
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

        {isSupervisor ? (
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>My Assigned Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {visibleTasks.length === 0 ? (
                <p className="text-muted-foreground">No tasks assigned to you yet.</p>
              ) : (
                <div className="space-y-4">
                  {visibleTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-lg border bg-card p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{task.taskName}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1">
                              <Key className="h-3 w-3" />
                              {task.keyNumber}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p className="font-medium text-foreground">{task.dueDate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
