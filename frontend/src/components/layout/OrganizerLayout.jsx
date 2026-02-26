// frontend/src/components/layout/OrganizerLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Clock,
  TrendingUp,
  Bell
} from 'lucide-react';

import useAuth from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Container from '@/components/layout/Container';
import Header from '@/components/layout/Header';

const OrganizerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();

  // Check if user has organizer access
  if (!hasRole('organizer') && !hasRole('admin')) {
    return <Navigate to="/403" replace />;
  }

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/organizer/dashboard', 
      icon: LayoutDashboard,
      exact: true
    },
    { 
      name: 'Events', 
      href: '/organizer/events', 
      icon: Calendar,
      subItems: [
        { name: 'All Events', href: '/organizer/events' },
        { name: 'Create Event', href: '/organizer/events/create' },
      ]
    },
    { 
      name: 'Tickets', 
      href: '/organizer/events/tickets', 
      icon: Ticket,
      badge: '23'
    },
    { 
      name: 'Bookings', 
      href: '/organizer/bookings', 
      icon: Users,
      badge: '12'
    },
    { 
      name: 'Revenue', 
      href: '/organizer/revenue', 
      icon: DollarSign,
      metrics: '$12.4k'
    },
    { 
      name: 'Analytics', 
      href: '/organizer/analytics', 
      icon: BarChart3,
    },
    { 
      name: 'Settings', 
      href: '/organizer/settings', 
      icon: Settings,
    },
  ];

  const quickActions = [
    { name: 'Create Event', href: '/organizer/events/create', icon: PlusCircle, primary: true },
    { name: 'Recent Bookings', href: '/organizer/bookings', icon: Clock },
    { name: 'Revenue Report', href: '/organizer/revenue', icon: TrendingUp },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
            w-72 bg-card border-r border-border
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Organizer Info */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground">Organizer</p>
                <Badge variant="outline" className="mt-1 text-xs">
                  Pro Account
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">Events</p>
                <p className="font-bold">12</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">Tickets Sold</p>
                <p className="font-bold">1.2k</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">QUICK ACTIONS</p>
            <div className="space-y-1">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm
                    ${action.primary 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <action.icon className="h-4 w-4" />
                  <span>{action.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.subItems?.some(sub => location.pathname === sub.href));
              
              return (
                <div key={item.name}>
                  <Link
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
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      {item.metrics && (
                        <span className="text-xs font-medium text-green-500">
                          {item.metrics}
                        </span>
                      )}
                    </div>
                  </Link>
                  
                  {/* Sub-items */}
                  {item.subItems && isActive && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`
                            block px-3 py-1.5 rounded-md text-xs
                            ${location.pathname === sub.href
                              ? 'text-primary font-medium'
                              : 'text-muted-foreground hover:text-foreground'
                            }
                          `}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen bg-muted/10">
          {/* Top Bar */}
          <div className="bg-card border-b border-border sticky top-0 z-20">
            <Container className="py-3">
              <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">
                  {navigation.find(item => 
                    location.pathname === item.href || 
                    item.subItems?.some(sub => location.pathname === sub.href)
                  )?.name || 'Organizer Dashboard'}
                </h1>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2">
                        <span className="hidden sm:inline">Help</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Documentation</DropdownMenuItem>
                      <DropdownMenuItem>Support</DropdownMenuItem>
                      <DropdownMenuItem>Video Tutorials</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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

export default OrganizerLayout;