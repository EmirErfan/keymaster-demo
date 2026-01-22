import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'supervisor' | 'staff';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface Key {
  id: string;
  keyNumber: string;
  description: string;
  createdDate: string;
  status: 'Available' | 'Assigned';
  assignedTo?: string;
  assignedToName?: string;
}

export interface Task {
  id: string;
  taskName: string;
  assignedTo: string;
  assignedToId: string;
  keyId: string;
  keyNumber: string;
  dueDate: string;
}

export interface KeyHistoryEntry {
  id: string;
  keyId: string;
  keyNumber: string;
  action: 'checkout' | 'return';
  staffId: string;
  staffName: string;
  timestamp: string;
}

export interface GeneratedReport {
  id: string;
  name: string;
  generatedAt: string;
  data: string; // base64 encoded PDF
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userAccounts: UserAccount[];
  addUserAccount: (account: Omit<UserAccount, 'id'>) => void;
  updateUserAccount: (id: string, account: Omit<UserAccount, 'id'>) => void;
  deleteUserAccount: (id: string) => void;
  validateLogin: (username: string, password: string, role: UserRole) => UserAccount | null;
  keys: Key[];
  addKey: (key: Omit<Key, 'id' | 'createdDate'>) => void;
  updateKey: (id: string, key: Omit<Key, 'id'>) => void;
  deleteKey: (id: string) => void;
  assignKey: (keyId: string, userId: string) => void;
  unassignKey: (keyId: string) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Omit<Task, 'id'>) => void;
  deleteTask: (id: string, returnKey?: boolean) => void;
  getAvailableKeys: () => Key[];
  logout: () => void;
  getStaffAccounts: () => UserAccount[];
  keyHistory: KeyHistoryEntry[];
  generatedReports: GeneratedReport[];
  addGeneratedReport: (report: Omit<GeneratedReport, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial demo data - includes default supervisor
const initialAccounts: UserAccount[] = [
  { 
    id: 'sv-default', 
    username: 'supervisor', 
    password: '123456', 
    name: 'Default Supervisor', 
    email: 'supervisor@example.com', 
    phone: '555-0100', 
    role: 'supervisor' 
  },
  { 
    id: 'staff-1', 
    username: 'john', 
    password: '123456', 
    name: 'John Smith', 
    email: 'john@example.com', 
    phone: '555-0101', 
    role: 'staff' 
  },
  { 
    id: 'staff-2', 
    username: 'jane', 
    password: '123456', 
    name: 'Jane Doe', 
    email: 'jane@example.com', 
    phone: '555-0102', 
    role: 'staff' 
  },
];

const initialKeys: Key[] = [
  { id: '1', keyNumber: 'KEY-001', description: 'Main Office Door', createdDate: '2025-01-10', status: 'Available' },
  { id: '2', keyNumber: 'KEY-002', description: 'Server Room', createdDate: '2025-01-12', status: 'Assigned', assignedTo: 'staff-1', assignedToName: 'John Smith' },
];

const initialTasks: Task[] = [
  { id: '1', taskName: 'Server Room Maintenance', assignedTo: 'John Smith', assignedToId: 'staff-1', keyId: '2', keyNumber: 'KEY-002', dueDate: '2025-01-25' },
];

const initialKeyHistory: KeyHistoryEntry[] = [
  { id: 'h1', keyId: '2', keyNumber: 'KEY-002', action: 'checkout', staffId: 'staff-1', staffName: 'John Smith', timestamp: '2025-01-15T10:30:00' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(initialAccounts);
  const [keys, setKeys] = useState<Key[]>(initialKeys);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [keyHistory, setKeyHistory] = useState<KeyHistoryEntry[]>(initialKeyHistory);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);

  const addUserAccount = (account: Omit<UserAccount, 'id'>) => {
    setUserAccounts(prev => [...prev, { ...account, id: generateId() }]);
  };

  const updateUserAccount = (id: string, account: Omit<UserAccount, 'id'>) => {
    setUserAccounts(prev => prev.map(a => a.id === id ? { ...account, id } : a));
    
    // If the updated account is the current user, update the user session as well
    if (user && user.id === id) {
      setUser({
        id,
        username: account.username,
        name: account.name,
        email: account.email,
        phone: account.phone,
        password: account.password,
        role: account.role,
      });
    }
  };

  const deleteUserAccount = (id: string) => {
    setUserAccounts(prev => prev.filter(a => a.id !== id));
    // Unassign keys from deleted user
    setKeys(prev => prev.map(k => 
      k.assignedTo === id 
        ? { ...k, status: 'Available' as const, assignedTo: undefined, assignedToName: undefined }
        : k
    ));
  };

  const validateLogin = (username: string, password: string, role: UserRole): UserAccount | null => {
    return userAccounts.find(
      account => account.username === username && account.password === password && account.role === role
    ) || null;
  };

  const getStaffAccounts = () => {
    return userAccounts.filter(a => a.role === 'staff');
  };

  const addKey = (key: Omit<Key, 'id' | 'createdDate'>) => {
    const today = new Date().toISOString().split('T')[0];
    setKeys(prev => [...prev, { ...key, id: generateId(), createdDate: today }]);
  };

  const updateKey = (id: string, key: Omit<Key, 'id'>) => {
    setKeys(prev => prev.map(k => k.id === id ? { ...key, id } : k));
  };

  const deleteKey = (id: string) => {
    setKeys(prev => prev.filter(k => k.id !== id));
  };

  const assignKey = (keyId: string, userId: string) => {
    const staffMember = userAccounts.find(a => a.id === userId);
    const key = keys.find(k => k.id === keyId);
    if (staffMember && key) {
      setKeys(prev => prev.map(k => 
        k.id === keyId 
          ? { ...k, status: 'Assigned' as const, assignedTo: userId, assignedToName: staffMember.name }
          : k
      ));
      setKeyHistory(prev => [...prev, {
        id: generateId(),
        keyId,
        keyNumber: key.keyNumber,
        action: 'checkout',
        staffId: userId,
        staffName: staffMember.name,
        timestamp: new Date().toISOString(),
      }]);
    }
  };

  const unassignKey = (keyId: string) => {
    const key = keys.find(k => k.id === keyId);
    if (key && key.assignedTo && key.assignedToName) {
      setKeyHistory(prev => [...prev, {
        id: generateId(),
        keyId,
        keyNumber: key.keyNumber,
        action: 'return',
        staffId: key.assignedTo!,
        staffName: key.assignedToName!,
        timestamp: new Date().toISOString(),
      }]);
    }
    setKeys(prev => prev.map(k => 
      k.id === keyId 
        ? { ...k, status: 'Available' as const, assignedTo: undefined, assignedToName: undefined }
        : k
    ));
  };

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask = { ...task, id: generateId() };
    setTasks(prev => [...prev, newTask]);
    // Auto-assign the key to the staff member
    if (task.keyId && task.assignedToId) {
      assignKey(task.keyId, task.assignedToId);
    }
  };

  const updateTask = (id: string, task: Omit<Task, 'id'>) => {
    const existingTask = tasks.find(t => t.id === id);
    if (existingTask) {
      // If key changed, unassign old key and assign new one
      if (existingTask.keyId !== task.keyId) {
        if (existingTask.keyId) {
          unassignKey(existingTask.keyId);
        }
        if (task.keyId && task.assignedToId) {
          assignKey(task.keyId, task.assignedToId);
        }
      } else if (existingTask.assignedToId !== task.assignedToId && task.keyId) {
        // If staff changed but key is the same, reassign the key
        unassignKey(task.keyId);
        assignKey(task.keyId, task.assignedToId);
      }
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...task, id } : t));
  };

  const deleteTask = (id: string, returnKey: boolean = true) => {
    const task = tasks.find(t => t.id === id);
    if (task && returnKey && task.keyId) {
      unassignKey(task.keyId);
    }
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const getAvailableKeys = () => {
    return keys.filter(k => k.status === 'Available');
  };

  const addGeneratedReport = (report: Omit<GeneratedReport, 'id'>) => {
    setGeneratedReports(prev => [...prev, { ...report, id: generateId() }]);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      userAccounts,
      addUserAccount,
      updateUserAccount,
      deleteUserAccount,
      validateLogin,
      keys,
      addKey,
      updateKey,
      deleteKey,
      assignKey,
      unassignKey,
      tasks,
      addTask,
      updateTask,
      deleteTask,
      getAvailableKeys,
      logout,
      getStaffAccounts,
      keyHistory,
      generatedReports,
      addGeneratedReport,
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
