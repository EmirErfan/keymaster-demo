import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Mail, Phone, Shield, Pencil, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, updateUserAccount } = useApp();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const openEditDialog = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: '',
      });
      setIsEditOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (user) {
      const updateData: any = {
        username: user.username,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: user.role,
        password: formData.password || user.password,
      };

      updateUserAccount(user.id, updateData);
      toast.success('Profile updated successfully');
      setIsEditOpen(false);
    }
  };

  const profileItems = [
    {
      label: 'Full Name',
      value: user?.name || 'N/A',
      icon: <User className="h-5 w-5 text-muted-foreground" />,
    },
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
      value: user?.email || 'N/A',
      icon: <Mail className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: 'Phone',
      value: user?.phone || 'N/A',
      icon: <Phone className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="mt-1 text-muted-foreground">View and edit your account information</p>
          </div>
          <Button onClick={openEditDialog}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
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
                  {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {user?.name}
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
                {user?.role === 'supervisor' ? (
                      <>
                        <li className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          Manage Accounts
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          Manage Keys
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          Manage Tasks
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          Generate Reports
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          View Assigned Tasks
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          Edit Own Profile
                        </li>
                      </>
                    )}
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

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your account information below. Leave password blank to keep current.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New Password (optional)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <CheckCircle className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
