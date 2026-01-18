import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'supervisor' | 'staff';

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Key {
  id: string;
  keyNumber: string;
  description: string;
  dueDate: string;
  status: 'Available' | 'Assigned';
}

export interface Task {
  id: string;
  taskName: string;
  assignedTo: string;
  dueDate: string;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  staffAccounts: StaffAccount[];
  addStaffAccount: (staff: Omit<StaffAccount, 'id'>) => void;
  updateStaffAccount: (id: string, staff: Omit<StaffAccount, 'id'>) => void;
  deleteStaffAccount: (id: string) => void;
  keys: Key[];
  addKey: (key: Omit<Key, 'id'>) => void;
  updateKey: (id: string, key: Omit<Key, 'id'>) => void;
  deleteKey: (id: string) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  deleteTask: (id: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial demo data
const initialStaff: StaffAccount[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', phone: '555-0101', role: 'Staff' },
  { id: '2', name: 'Jane Doe', email: 'jane@example.com', phone: '555-0102', role: 'Staff' },
];

const initialKeys: Key[] = [
  { id: '1', keyNumber: 'KEY-001', description: 'Main Office Door', dueDate: '2025-02-01', status: 'Available' },
  { id: '2', keyNumber: 'KEY-002', description: 'Server Room', dueDate: '2025-02-15', status: 'Assigned' },
];

const initialTasks: Task[] = [
  { id: '1', taskName: 'Weekly Security Check', assignedTo: 'John Smith', dueDate: '2025-01-25' },
  { id: '2', taskName: 'Key Inventory Audit', assignedTo: 'Jane Doe', dueDate: '2025-01-30' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [staffAccounts, setStaffAccounts] = useState<StaffAccount[]>(initialStaff);
  const [keys, setKeys] = useState<Key[]>(initialKeys);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addStaffAccount = (staff: Omit<StaffAccount, 'id'>) => {
    setStaffAccounts(prev => [...prev, { ...staff, id: generateId() }]);
  };

  const updateStaffAccount = (id: string, staff: Omit<StaffAccount, 'id'>) => {
    setStaffAccounts(prev => prev.map(s => s.id === id ? { ...staff, id } : s));
  };

  const deleteStaffAccount = (id: string) => {
    setStaffAccounts(prev => prev.filter(s => s.id !== id));
  };

  const addKey = (key: Omit<Key, 'id'>) => {
    setKeys(prev => [...prev, { ...key, id: generateId() }]);
  };

  const updateKey = (id: string, key: Omit<Key, 'id'>) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...key, id } : k));
  };

  const deleteKey = (id: string) => {
    setKeys(prev => prev.filter(k => k.id !== id));
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    setTasks(prev => [...prev, { ...task, id: generateId() }]);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      staffAccounts,
      addStaffAccount,
      updateStaffAccount,
      deleteStaffAccount,
      keys,
      addKey,
      updateKey,
      deleteKey,
      tasks,
      addTask,
      deleteTask,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
