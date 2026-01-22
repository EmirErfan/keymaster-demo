import { useState } from 'react';
import { useApp, Task, TodoItem } from '@/contexts/AppContext';
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
import { Plus, Trash2, CheckCircle, Key, Pencil, Eye, Square, CheckSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

export default function Tasks() {
  const { user, tasks, keys, getStaffAccounts, getAvailableKeys, addTask, updateTask, deleteTask, toggleTodoItem, completeTask } = useApp();
  const isSupervisor = user?.role === 'supervisor';
  const staffAccounts = getStaffAccounts();
  const availableKeys = getAvailableKeys();

  // Filter tasks for staff - only show their assigned tasks (pending only)
  const visibleTasks = isSupervisor 
    ? tasks 
    : tasks.filter(t => t.assignedToId === user?.id && t.status === 'pending');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<typeof tasks[0] | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    taskName: '',
    assignedToId: '',
    keyId: '',
    dueDate: '',
    todoItems: '' as string, // Comma-separated list for input
  });

  const resetForm = () => {
    setFormData({ taskName: '', assignedToId: '', keyId: '', dueDate: '', todoItems: '' });
    setEditingTask(null);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

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
      todoItems: task.todoItems.map(t => t.text).join(', '),
    });
    setIsFormOpen(true);
  };

  const openTaskDetail = (task: Task) => {
    setViewingTask(task);
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

    // Parse todo items from comma-separated input
    const todoItems: TodoItem[] = formData.todoItems
      .split(',')
      .map(text => text.trim())
      .filter(text => text.length > 0)
      .map(text => ({
        id: generateId(),
        text,
        completed: false,
      }));

    if (editingTask) {
      // Preserve existing todo items' completion status when editing
      const existingTodoMap = new Map(editingTask.todoItems.map(t => [t.text, t.completed]));
      const updatedTodoItems = todoItems.map(item => ({
        ...item,
        completed: existingTodoMap.get(item.text) || false,
      }));

      updateTask(editingTask.id, {
        taskName: formData.taskName,
        assignedTo: selectedStaff.name,
        assignedToId: selectedStaff.id,
        keyId: selectedKey.id,
        keyNumber: selectedKey.keyNumber,
        dueDate: formData.dueDate,
        todoItems: updatedTodoItems,
        status: editingTask.status,
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
        todoItems,
        status: 'pending',
      });
      toast.success('Task created and key assigned successfully');
    }
    
    setIsFormOpen(false);
    resetForm();
  };

  const handleToggleTodo = (todoId: string) => {
    if (viewingTask) {
      toggleTodoItem(viewingTask.id, todoId);
      // Update the viewing task to reflect changes
      const updatedTask = tasks.find(t => t.id === viewingTask.id);
      if (updatedTask) {
        setViewingTask({
          ...updatedTask,
          todoItems: updatedTask.todoItems.map(item =>
            item.id === todoId ? { ...item, completed: !item.completed } : item
          ),
        });
      }
    }
  };

  const handleCompleteTask = () => {
    if (viewingTask) {
      const allCompleted = viewingTask.todoItems.every(item => item.completed);
      if (!allCompleted) {
        toast.error('Please complete all checklist items first');
        return;
      }
      completeTask(viewingTask.id);
      setViewingTask(null);
      toast.success('Task completed! Key has been returned.');
    }
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
                    {isSupervisor && <TableHead>Status</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleTasks.map((task) => (
                    <TableRow 
                      key={task.id} 
                      className={!isSupervisor ? 'cursor-pointer hover:bg-muted/50' : ''}
                      onClick={() => !isSupervisor && openTaskDetail(task)}
                    >
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
                        <TableCell>
                          <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                            {task.status === 'completed' ? 'Completed' : 'Pending'}
                          </Badge>
                        </TableCell>
                      )}
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
                      {!isSupervisor && (
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openTaskDetail(task)}>
                            <Eye className="h-4 w-4" />
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
              <div className="space-y-2">
                <Label htmlFor="todoItems">Checklist Items (comma-separated)</Label>
                <Input
                  id="todoItems"
                  value={formData.todoItems}
                  onChange={(e) => setFormData({ ...formData, todoItems: e.target.value })}
                  placeholder="e.g., Check temperature, Clean filters, Verify backups"
                />
                <p className="text-xs text-muted-foreground">
                  Enter items separated by commas. Staff will see these as a checklist.
                </p>
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

      {/* Staff Task Detail Dialog */}
      <Dialog open={!!viewingTask} onOpenChange={(open) => !open && setViewingTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{viewingTask?.taskName}</DialogTitle>
            <DialogDescription>
              Complete all checklist items before marking as done
            </DialogDescription>
          </DialogHeader>
          {viewingTask && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Key className="h-4 w-4" />
                <span>Key: {viewingTask.keyNumber}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Due: {viewingTask.dueDate}
              </div>
              
              <div className="space-y-3">
                <Label>Checklist</Label>
                {viewingTask.todoItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No checklist items for this task.</p>
                ) : (
                  <div className="space-y-2">
                    {viewingTask.todoItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleToggleTodo(item.id)}
                      >
                        {item.completed ? (
                          <CheckSquare className="h-5 w-5 text-primary" />
                        ) : (
                          <Square className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  {viewingTask.todoItems.filter(t => t.completed).length} of {viewingTask.todoItems.length} completed
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setViewingTask(null)}>
              Close
            </Button>
            <Button
              type="button"
              onClick={handleCompleteTask}
              disabled={viewingTask && viewingTask.todoItems.length > 0 && !viewingTask.todoItems.every(t => t.completed)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
