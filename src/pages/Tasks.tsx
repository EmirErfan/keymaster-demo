import { useState } from 'react';
import { useApp, Task } from '@/contexts/AppContext';
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
import { Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Tasks() {
  const { user, tasks, getStaffAccounts, addTask, deleteTask } = useApp();
  const isSupervisor = user?.role === 'supervisor';
  const staffAccounts = getStaffAccounts();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    taskName: '',
    assignedTo: '',
    dueDate: '',
  });

  const resetForm = () => {
    setFormData({ taskName: '', assignedTo: '', dueDate: '' });
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.taskName || !formData.assignedTo || !formData.dueDate) {
      toast.error('Please fill in all fields');
      return;
    }

    addTask(formData);
    toast.success('Task created successfully');
    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteTask(deletingId);
      toast.success('Task deleted successfully');
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
              {isSupervisor ? 'Manage Tasks' : 'View Tasks'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isSupervisor
                ? 'Create and manage team tasks'
                : 'View all assigned tasks'}
            </p>
          </div>
          {isSupervisor && (
            <Button onClick={openCreateForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tasks List</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No tasks created yet.
                {isSupervisor && ' Click "Add Task" to create one.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    {isSupervisor && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.taskName}</TableCell>
                      <TableCell>{task.assignedTo}</TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                      {isSupervisor && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(task.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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

      {/* Create Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new task.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="taskName">Task Name</Label>
                <Input
                  id="taskName"
                  value={formData.taskName}
                  onChange={(e) => setFormData({ ...formData, taskName: e.target.value })}
                  placeholder="Enter task name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffAccounts.map((staff) => (
                      <SelectItem key={staff.id} value={staff.name}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <CheckCircle className="mr-2 h-4 w-4" />
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
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
