// frontend/src/components/layout/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Ticket,
  CreditCard,
  BarChart3,
  FileText,
  Gift,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Activity,
  AlertCircle,
  Server,
  Bell,
  Search
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  // Check if user is admin
  if (!hasRole('admin')) {
    return <Navigate to="/403" replace />;
  }

  const navigation = [
    {
      section: 'Main',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, exact: true },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, badge: 'New' },
        { name: 'Reports', href: '/admin/reports', icon: FileText },
      ]
    },
    {
      section: 'Management',
      items: [
        { name: 'Users', href: '/admin/users', icon: Users, badge: '2.4k' },
        { name: 'Events', href: '/admin/events', icon: Calendar, badge: '156' },
        { name: 'Bookings', href: '/admin/bookings', icon: Ticket, badge: '89' },
        { name: 'Payments', href: '/admin/payments', icon: CreditCard, badge: '$45.2k' },
      ]
    },
    {
      section: 'Tools',
      items: [
        { name: 'Promotions', href: '/admin/promotions', icon: Gift },
        { name: 'Activity Log', href: '/admin/system/logs', icon: Activity },
        { name: 'System Health', href: '/admin/system/health', icon: Server },
      ]
    },
    {
      section: 'Administration',
      items: [
        { name: 'Settings', href: '/admin/system/settings', icon: Settings },
        { name: 'Security', href: '/admin/system/security', icon: Shield },
      ]
    }
  ];

  const stats = [
    { label: 'Active Users', value: '1,234', change: '+12%', icon: Users },
    { label: 'Total Events', value: '156', change: '+8%', icon: Calendar },
    { label: 'Revenue', value: '$45.2k', change: '+23%', icon: CreditCard },
    { label: 'Issues', value: '3', change: '-2', icon: AlertCircle, alert: true },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-primary text-primary-foreground rounded-full shadow-lg"
      >
        {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            bg-card border-r border-border
            transition-all duration-300 ease-in-out
            ${isCollapsed ? 'w-20' : 'w-72'}
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Admin Info */}
          <div className={`p-4 border-b border-border ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-10 w-10 mx-auto">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{user?.name}</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>
            )}
          </div>

          {/* Collapse Toggle (Desktop) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hidden lg:flex absolute -right-3 top-20 bg-background border border-border rounded-full h-6 w-6"
          >
            <ChevronDown className={`h-3 w-3 transition-transform ${isCollapsed ? 'rotate-90' : '-rotate-90'}`} />
          </Button>

          {/* Navigation */}
          <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {navigation.map((section) => (
              <div key={section.section}>
                {!isCollapsed && (
                  <p className="text-xs font-medium text-muted-foreground mb-2 px-3">
                    {section.section}
                  </p>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    
                    if (isCollapsed) {
                      return (
                        <TooltipProvider key={item.name}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                to={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`
                                  flex items-center justify-center p-3 rounded-md
                                  transition-colors relative
                                  ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                  }
                                `}
                              >
                                <item.icon className="h-5 w-5" />
                                {item.badge && (
                                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px]">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{item.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`
                          flex items-center justify-between px-3 py-2 rounded-md text-sm
                          transition-colors
                          ${isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            {isCollapsed ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-full text-muted-foreground hover:text-destructive"
                      onClick={logout}
                    >
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Logout</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen bg-muted/10">
          {/* Top Bar */}
          <div className="bg-card border-b border-border sticky top-0 z-20">
            <Container className="py-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                  <Badge variant="outline" className="hidden sm:flex">
                    Production
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Global Search */}
                  <div className="hidden md:block relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-9 w-64 bg-muted/50"
                    />
                  </div>

                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px]">
                      3
                    </Badge>
                  </Button>

                  {/* Quick Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1">
                        Quick Actions
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Create Admin</DropdownMenuItem>
                      <DropdownMenuItem>System Backup</DropdownMenuItem>
                      <DropdownMenuItem>Clear Cache</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View All Actions</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-muted/30 rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className={`p-2 rounded-md ${stat.alert ? 'bg-red-500/10' : 'bg-primary/10'}`}>
                      <stat.icon className={`h-4 w-4 ${stat.alert ? 'text-red-500' : 'text-primary'}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{stat.value}</p>
                        <span className={`text-xs ${stat.change?.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </div>

          {/* Page Content */}
          <Container className="py-6">
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;