import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'supervisor' | 'staff';

export interface User {
  id: string;
  username: string;
  name: string;
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
  dueDate: string;
  status: 'Available' | 'Assigned';
  assignedTo?: string; // User ID of assigned staff
  assignedToName?: string; // Name of assigned staff for display
}

export interface Task {
  id: string;
  taskName: string;
  assignedTo: string;
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

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  userAccounts: UserAccount[];
  addUserAccount: (account: Omit<UserAccount, 'id'>) => void;
  updateUserAccount: (id: string, account: Omit<UserAccount, 'id'>) => void;
  deleteUserAccount: (id: string) => void;
  validateLogin: (username: string, password: string, role: UserRole) => UserAccount | null;
  keys: Key[];
  addKey: (key: Omit<Key, 'id'>) => void;
  updateKey: (id: string, key: Omit<Key, 'id'>) => void;
  deleteKey: (id: string) => void;
  assignKey: (keyId: string, userId: string) => void;
  unassignKey: (keyId: string) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  deleteTask: (id: string) => void;
  logout: () => void;
  getStaffAccounts: () => UserAccount[];
  keyHistory: KeyHistoryEntry[];
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
  { id: '1', keyNumber: 'KEY-001', description: 'Main Office Door', dueDate: '2025-02-01', status: 'Available' },
  { id: '2', keyNumber: 'KEY-002', description: 'Server Room', dueDate: '2025-02-15', status: 'Assigned', assignedTo: 'staff-1', assignedToName: 'John Smith' },
];

const initialTasks: Task[] = [
  { id: '1', taskName: 'Weekly Security Check', assignedTo: 'John Smith', dueDate: '2025-01-25' },
  { id: '2', taskName: 'Key Inventory Audit', assignedTo: 'Jane Doe', dueDate: '2025-01-30' },
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

  const addUserAccount = (account: Omit<UserAccount, 'id'>) => {
    setUserAccounts(prev => [...prev, { ...account, id: generateId() }]);
  };

  const updateUserAccount = (id: string, account: Omit<UserAccount, 'id'>) => {
    setUserAccounts(prev => prev.map(a => a.id === id ? { ...account, id } : a));
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

  const addKey = (key: Omit<Key, 'id'>) => {
    setKeys(prev => [...prev, { ...key, id: generateId() }]);
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
      deleteTask,
      logout,
      getStaffAccounts,
      keyHistory,
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
