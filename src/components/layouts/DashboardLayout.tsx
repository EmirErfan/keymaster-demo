import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { 
  Users, 
  Key, 
  ClipboardList, 
  BarChart3, 
  LogOut, 
  User,
  LayoutDashboard,
  KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
}

const supervisorNav: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/dashboard' },
  { label: 'Manage Accounts', icon: <Users className="h-5 w-5" />, path: '/accounts' },
  { label: 'Manage Keys', icon: <Key className="h-5 w-5" />, path: '/keys' },
  { label: 'Manage Tasks', icon: <ClipboardList className="h-5 w-5" />, path: '/tasks' },
  { label: 'View Reports', icon: <BarChart3 className="h-5 w-5" />, path: '/reports' },
];

const staffNav: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/dashboard' },
  { label: 'View Keys', icon: <Key className="h-5 w-5" />, path: '/keys' },
  { label: 'View Tasks', icon: <ClipboardList className="h-5 w-5" />, path: '/tasks' },
  { label: 'My Profile', icon: <User className="h-5 w-5" />, path: '/profile' },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = user?.role === 'supervisor' ? supervisorNav : staffNav;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <KeyRound className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">KMS</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="border-t border-sidebar-border p-4">
            <div className="mb-3 flex items-center gap-3 px-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs capitalize text-sidebar-foreground/60">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
