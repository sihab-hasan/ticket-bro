import React, { useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { ArrowRight, ChevronRight, LogOut, Menu, X } from "lucide-react";

import Header from "@/components/layout/Header";
import Container from "@/components/layout/Container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PANEL_META } from "@/config/panels.config";
import { PANEL_ICON_BY_ID } from "@/config/panel-navigation.config";
import { useAuth } from "@/context/AuthContext";
import FloatingMessengerWidget from "@/components/shared/FloatingMessengerWidget";

const getFullName = (user) => {
  if (!user) return "Workspace";
  return (
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    "Workspace"
  );
};

const getInitials = (user) => {
  if (!user) return "U";
  const names = [user.firstName, user.lastName].filter(Boolean);
  if (names.length) {
    return names.map((value) => value.charAt(0)).join("").slice(0, 2).toUpperCase();
  }
  return String(user.fullName || user.email || "U")
    .split(" ")
    .map((value) => value.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const isRouteActive = (pathname, href, exact = false) => {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

const WorkspaceLink = ({ panel, current }) => {
  const Icon = PANEL_ICON_BY_ID[panel.id];

  return (
    <Link
      to={panel.path}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
        current
          ? "border-primary bg-primary/8 text-primary"
          : "border-border bg-background hover:bg-accent hover:text-foreground"
      }`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span className="font-medium">{panel.label}</span>
    </Link>
  );
};

const PanelNavSection = ({ section, pathname, onNavigate }) => (
  <div className="space-y-2">
    <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {section.section}
    </p>
    <div className="space-y-1">
      {section.items.map((item) => {
        const active = isRouteActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={`group flex items-start gap-3 rounded-xl px-3 py-3 transition-colors ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-accent"
            }`}
          >
            <item.icon className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{item.label}</p>
              <p
                className={`mt-0.5 text-xs leading-relaxed ${
                  active ? "text-primary-foreground/80" : "text-muted-foreground"
                }`}
              >
                {item.description}
              </p>
            </div>
            <ChevronRight
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                active ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}
            />
          </Link>
        );
      })}
    </div>
  </div>
);

const ControlPanelLayout = ({
  panelId,
  navigation = [],
  title,
  subtitle,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout, canAccessPanel, availablePanels = [] } = useAuth();

  if (!user || !canAccessPanel(panelId)) {
    return <Navigate to="/403" replace />;
  }

  const panelMeta = PANEL_META[panelId] || {
    id: panelId,
    label: title,
    path: location.pathname,
  };

  const activeItem = navigation
    .flatMap((section) => section.items)
    .find((item) => isRouteActive(location.pathname, item.href, item.exact));

  const workspaces = availablePanels.filter(Boolean);
  const fullName = getFullName(user);
  const initials = getInitials(user);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <button
        type="button"
        onClick={() => setSidebarOpen((value) => !value)}
        className="fixed bottom-4 right-4 z-[45] rounded-full bg-primary p-3 text-primary-foreground shadow-lg xl:hidden"
        aria-label="Toggle control panel navigation"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 xl:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      ) : null}

      <div className="flex">
        <aside
          className={`fixed bottom-0 left-0 top-14 z-40 w-80 border-r border-border bg-card transition-transform duration-300 xl:static xl:top-auto xl:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-border px-5 py-5">
              <Badge variant="outline" className="mb-3 text-[11px] uppercase tracking-wider">
                {panelMeta.label}
              </Badge>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                  <AvatarImage src={user.avatar} alt={fullName} />
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                    Current role: {String(user.role || "").replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
              {workspaces.length > 1 ? (
                <div className="space-y-3">
                  <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Switch Workspace
                  </p>
                  <div className="grid gap-2">
                    {workspaces.map((workspace) => (
                      <WorkspaceLink
                        key={workspace.id}
                        panel={workspace}
                        current={workspace.id === panelId}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {navigation.map((section) => (
                <PanelNavSection
                  key={section.section}
                  section={section}
                  pathname={location.pathname}
                  onNavigate={closeSidebar}
                />
              ))}
            </div>

            <div className="border-t border-border p-4">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={logout}
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-h-screen flex-1 bg-muted/10">
          <div className="sticky top-14 z-20 border-b border-border bg-background/90 backdrop-blur xl:top-16">
            <Container className="py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-2">
                  <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/10">
                    {panelMeta.label}
                  </Badge>
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                      {activeItem?.label || title}
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                      {activeItem?.description || subtitle}
                    </p>
                  </div>
                </div>

                {workspaces.length > 1 ? (
                  <div className="flex flex-wrap gap-2">
                    {workspaces.map((workspace) => (
                      <WorkspaceLink
                        key={workspace.id}
                        panel={workspace}
                        current={workspace.id === panelId}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </Container>
          </div>

          <Container className="py-6">
            <Outlet />
          </Container>
        </main>
      </div>

      <FloatingMessengerWidget />
    </div>
  );
};

export default ControlPanelLayout;
