import { useState } from 'react';
import { useApp, Key } from '@/contexts/AppContext';
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
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Keys() {
  const { user, keys, addKey, updateKey, deleteKey } = useApp();
  const isSupervisor = user?.role === 'supervisor';

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<Key | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    keyNumber: '',
    description: '',
    dueDate: '',
    status: 'Available' as 'Available' | 'Assigned',
  });

  const resetForm = () => {
    setFormData({ keyNumber: '', description: '', dueDate: '', status: 'Available' });
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
      dueDate: key.dueDate,
      status: key.status,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.keyNumber || !formData.description || !formData.dueDate) {
      toast.error('Please fill in all fields');
      return;
    }

    if (editingKey) {
      updateKey(editingKey.id, formData);
      toast.success('Key updated successfully');
    } else {
      addKey(formData);
      toast.success('Key created successfully');
    }

    setIsFormOpen(false);
    resetForm();
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isSupervisor ? 'Manage Keys' : 'View Keys'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isSupervisor
                ? 'Create, view, and manage keys'
                : 'View all available and assigned keys'}
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
            {keys.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No keys registered yet.
                {isSupervisor && ' Click "Add Key" to create one.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    {isSupervisor && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.keyNumber}</TableCell>
                      <TableCell>{key.description}</TableCell>
                      <TableCell>{key.dueDate}</TableCell>
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
                      {isSupervisor && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
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
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              {editingKey && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as 'Available' | 'Assigned' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Assigned">Assigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
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
