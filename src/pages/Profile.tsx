import { useApp } from '@/contexts/AppContext';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, Phone, Shield } from 'lucide-react';

export default function Profile() {
  const { user } = useApp();

  const profileItems = [
    {
      label: 'Username',
      value: user?.username || 'N/A',
      icon: <User className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: 'Role',
      value: user?.role === 'staff' ? 'Staff' : 'Supervisor',
      icon: <Shield className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: 'Email',
      value: `${user?.username}@demo.com`,
      icon: <Mail className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: 'Status',
      value: 'Active',
      icon: <Phone className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="mt-1 text-muted-foreground">View your account information</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground capitalize">
                    {user?.username}
                  </h3>
                  <p className="text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="space-y-4">
                {profileItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 rounded-lg bg-muted/50 p-4"
                  >
                    {item.icon}
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-foreground">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Access Information</CardTitle>
              <CardDescription>Your permissions and access level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="mb-2 text-sm font-medium text-foreground">Permissions</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      View Keys
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      View Tasks
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-success" />
                      View Profile
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                  <p className="text-sm text-primary">
                    <strong>Note:</strong> This is a demo account for demonstration purposes.
                    All data is stored temporarily in memory.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
