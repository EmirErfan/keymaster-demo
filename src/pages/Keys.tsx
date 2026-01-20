import { useState } from 'react';
import { useApp, Key } from '@/contexts/AppContext';
import { format } from 'date-fns';
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
import { Plus, Pencil, Trash2, CheckCircle, UserPlus, UserMinus, History } from 'lucide-react';
import { toast } from 'sonner';

export default function Keys() {
  const { user, keys, addKey, updateKey, deleteKey, assignKey, unassignKey, getStaffAccounts, keyHistory } = useApp();
  const isSupervisor = user?.role === 'supervisor';
  const staffAccounts = getStaffAccounts();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<Key | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [assigningKey, setAssigningKey] = useState<Key | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  const [formData, setFormData] = useState({
    keyNumber: '',
    description: '',
    status: 'Available' as 'Available' | 'Assigned',
  });

  const resetForm = () => {
    setFormData({ keyNumber: '', description: '', status: 'Available' });
    setEditingKey(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (key: Key) => {
    setEditingKey(key);
    setFormData({
      keyNumber: key.keyNumber,
      description: key.description,
      status: key.status,
    });
    setIsFormOpen(true);
  };

  const openAssignDialog = (key: Key) => {
    setAssigningKey(key);
    setSelectedStaffId(key.assignedTo || '');
    setIsAssignOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.keyNumber || !formData.description) {
      toast.error('Please fill in all fields');
      return;
    }

    if (editingKey) {
      updateKey(editingKey.id, {
        ...formData,
        createdDate: editingKey.createdDate,
        assignedTo: editingKey.assignedTo,
        assignedToName: editingKey.assignedToName,
      });
      toast.success('Key updated successfully');
    } else {
      addKey({ ...formData, status: 'Available' });
      toast.success('Key created successfully');
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleAssign = () => {
    if (assigningKey && selectedStaffId) {
      assignKey(assigningKey.id, selectedStaffId);
      toast.success('Key assigned successfully');
      setIsAssignOpen(false);
      setAssigningKey(null);
      setSelectedStaffId('');
    }
  };

  const handleUnassign = (keyId: string) => {
    unassignKey(keyId);
    toast.success('Key unassigned successfully');
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteKey(deletingId);
      toast.success('Key deleted successfully');
      setIsDeleteOpen(false);
      setDeletingId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  // Filter keys for staff - they only see keys assigned to them
  const visibleKeys = isSupervisor 
    ? keys 
    : keys.filter(k => k.assignedTo === user?.id);

  // Filter history for staff - they only see their own history
  const visibleHistory = isSupervisor
    ? keyHistory
    : keyHistory.filter(h => h.staffId === user?.id);

  // Sort history by timestamp descending (most recent first)
  const sortedHistory = [...visibleHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isSupervisor ? 'Manage Keys' : 'My Keys'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isSupervisor
                ? 'Create, assign, and manage keys'
                : 'View keys assigned to you'}
            </p>
          </div>
          {isSupervisor && (
            <Button onClick={openCreateForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Key
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Keys Registry</CardTitle>
          </CardHeader>
          <CardContent>
            {visibleKeys.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {isSupervisor 
                  ? 'No keys registered yet. Click "Add Key" to create one.'
                  : 'No keys assigned to you yet.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    {isSupervisor && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.keyNumber}</TableCell>
                      <TableCell>{key.description}</TableCell>
                      <TableCell>{key.createdDate}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            key.status === 'Available'
                              ? 'bg-success/10 text-success'
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {key.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {key.assignedToName || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      {isSupervisor && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {key.status === 'Available' ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openAssignDialog(key)}
                                title="Assign to staff"
                              >
                                <UserPlus className="h-4 w-4 text-primary" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUnassign(key.id)}
                                title="Unassign key"
                              >
                                <UserMinus className="h-4 w-4 text-warning" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditForm(key)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(key.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Key Checkout/Return History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Key Checkout/Return History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedHistory.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No history records yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Key Number</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Staff Member</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">{entry.keyNumber}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            entry.action === 'checkout'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-success/10 text-success'
                          }`}
                        >
                          {entry.action === 'checkout' ? 'Checked Out' : 'Returned'}
                        </span>
                      </TableCell>
                      <TableCell>{entry.staffName}</TableCell>
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
            <DialogTitle>{editingKey ? 'Edit Key' : 'Create Key'}</DialogTitle>
            <DialogDescription>
              {editingKey
                ? 'Update the key information below.'
                : 'Fill in the details to register a new key.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="keyNumber">Key Number</Label>
                <Input
                  id="keyNumber"
                  value={formData.keyNumber}
                  onChange={(e) => setFormData({ ...formData, keyNumber: e.target.value })}
                  placeholder="e.g., KEY-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter key description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <CheckCircle className="mr-2 h-4 w-4" />
                {editingKey ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Key Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Key</DialogTitle>
            <DialogDescription>
              Select a staff member to assign key "{assigningKey?.keyNumber}" to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="staffSelect">Staff Member</Label>
            <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffAccounts.length === 0 ? (
                  <SelectItem value="" disabled>No staff accounts available</SelectItem>
                ) : (
                  staffAccounts.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedStaffId}>
              <UserPlus className="mr-2 h-4 w-4" />
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this key? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
