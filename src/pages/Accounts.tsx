import { useState } from 'react';
import { useApp, UserAccount, UserRole } from '@/contexts/AppContext';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, CheckCircle, Shield, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Accounts() {
  const { userAccounts, addUserAccount, updateUserAccount, deleteUserAccount } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: '' as UserRole | '',
  });

  const resetForm = () => {
    setFormData({ username: '', password: '', name: '', email: '', phone: '', role: '' });
    setEditingAccount(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (account: UserAccount) => {
    setEditingAccount(account);
    setFormData({
      username: account.username,
      password: account.password,
      name: account.name,
      email: account.email,
      phone: account.phone,
      role: account.role,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.name || !formData.email || !formData.phone || !formData.role) {
      toast.error('Please fill in all fields');
      return;
    }

    // Check for duplicate username (excluding current account when editing)
    const isDuplicate = userAccounts.some(
      a => a.username === formData.username && a.id !== editingAccount?.id
    );
    if (isDuplicate) {
      toast.error('Username already exists');
      return;
    }

    if (editingAccount) {
      updateUserAccount(editingAccount.id, formData as Omit<UserAccount, 'id'>);
      toast.success('Account updated successfully');
    } else {
      addUserAccount(formData as Omit<UserAccount, 'id'>);
      toast.success('Account created successfully');
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deletingId) {
      // Prevent deleting the default supervisor
      if (deletingId === 'sv-default') {
        toast.error('Cannot delete the default supervisor account');
        setIsDeleteOpen(false);
        setDeletingId(null);
        return;
      }
      deleteUserAccount(deletingId);
      toast.success('Account deleted successfully');
      setIsDeleteOpen(false);
      setDeletingId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Manage Accounts</h1>
            <p className="mt-1 text-muted-foreground">Create supervisor and staff accounts</p>
          </div>
          <Button onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {userAccounts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No accounts yet. Click "Add Account" to create one.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.name}</TableCell>
                      <TableCell>{account.username}</TableCell>
                      <TableCell>{account.email}</TableCell>
                      <TableCell>{account.phone}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                          account.role === 'supervisor' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {account.role === 'supervisor' ? (
                            <Shield className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          {account.role === 'supervisor' ? 'Supervisor' : 'Staff'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(account)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(account.id)}
                            disabled={account.id === 'sv-default'}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? 'Edit Account' : 'Create Account'}
            </DialogTitle>
            <DialogDescription>
              {editingAccount
                ? 'Update the account information below.'
                : 'Fill in the details to create a new account.'}
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
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Login username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Login password"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <CheckCircle className="mr-2 h-4 w-4" />
                {editingAccount ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this account? This action cannot be undone.
              Any keys assigned to this user will be unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
