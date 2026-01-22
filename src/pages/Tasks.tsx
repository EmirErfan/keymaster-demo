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
import { Plus, Trash2, CheckCircle, Key, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function Tasks() {
  const { user, tasks, keys, getStaffAccounts, getAvailableKeys, addTask, updateTask, deleteTask } = useApp();
  const isSupervisor = user?.role === 'supervisor';
  const staffAccounts = getStaffAccounts();
  const availableKeys = getAvailableKeys();

  // Filter tasks for staff - only show their assigned tasks
  const visibleTasks = isSupervisor 
    ? tasks 
    : tasks.filter(t => t.assignedToId === user?.id);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<typeof tasks[0] | null>(null);

  const [formData, setFormData] = useState({
    taskName: '',
    assignedToId: '',
    keyId: '',
    dueDate: '',
  });

  const resetForm = () => {
    setFormData({ taskName: '', assignedToId: '', keyId: '', dueDate: '' });
    setEditingTask(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (task: typeof tasks[0]) => {
    setEditingTask(task);
    setFormData({
      taskName: task.taskName,
      assignedToId: task.assignedToId,
      keyId: task.keyId,
      dueDate: task.dueDate,
    });
    setIsFormOpen(true);
  };

  // Get keys that are available OR currently assigned to this task (for editing)
  const getSelectableKeys = () => {
    if (editingTask) {
      const currentKey = keys.find(k => k.id === editingTask.keyId);
      if (currentKey) {
        // Check if the current key is already in availableKeys to avoid duplicates
        const isAlreadyAvailable = availableKeys.some(k => k.id === currentKey.id);
        if (isAlreadyAvailable) {
          return availableKeys;
        }
        // Put current key first, then available keys
        return [currentKey, ...availableKeys];
      }
    }
    return availableKeys;
  };

  const selectableKeys = getSelectableKeys();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.taskName || !formData.assignedToId || !formData.keyId || !formData.dueDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const selectedStaff = staffAccounts.find(s => s.id === formData.assignedToId);
    const selectedKey = selectableKeys.find(k => k.id === formData.keyId);

    if (!selectedStaff || !selectedKey) {
      toast.error('Invalid staff or key selection');
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        taskName: formData.taskName,
        assignedTo: selectedStaff.name,
        assignedToId: selectedStaff.id,
        keyId: selectedKey.id,
        keyNumber: selectedKey.keyNumber,
        dueDate: formData.dueDate,
      });
      toast.success('Task updated successfully');
    } else {
      addTask({
        taskName: formData.taskName,
        assignedTo: selectedStaff.name,
        assignedToId: selectedStaff.id,
        keyId: selectedKey.id,
        keyNumber: selectedKey.keyNumber,
        dueDate: formData.dueDate,
      });
      toast.success('Task created and key assigned successfully');
    }
    
    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteTask(deletingId, true);
      toast.success('Task deleted and key returned');
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
            {visibleTasks.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                {isSupervisor 
                  ? 'No tasks created yet. Click "Add Task" to create one.'
                  : 'No tasks assigned to you yet.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Assigned Key</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    {isSupervisor && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.taskName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Key className="h-3 w-3" />
                          {task.keyNumber}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.assignedTo}</TableCell>
                      <TableCell>{task.dueDate}</TableCell>
                      {isSupervisor && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditForm(task)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
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
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
            <DialogDescription>
              {editingTask ? 'Update the task details below.' : 'Fill in the details to create a new task.'}
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
                <Label htmlFor="keyId">Assign Key</Label>
                <Select
                  value={formData.keyId}
                  onValueChange={(value) => setFormData({ ...formData, keyId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select key to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectableKeys.length === 0 ? (
                      <SelectItem value="none" disabled>No available keys</SelectItem>
                    ) : (
                      selectableKeys.map((key) => (
                        <SelectItem key={key.id} value={key.id}>
                          {key.keyNumber} - {key.description}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assign To Staff</Label>
                <Select
                  value={formData.assignedToId}
                  onValueChange={(value) => setFormData({ ...formData, assignedToId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffAccounts.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
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
                {editingTask ? 'Update Task' : 'Create Task & Assign Key'}
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
