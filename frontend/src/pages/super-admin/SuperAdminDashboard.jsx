import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Users,
} from "lucide-react";

import { superAdminService } from "@/api";
import { ROUTES } from "@/app/AppRoutes";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/shared/common";

const SuperAdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const payload = await superAdminService.getDashboard();
      setDashboard(payload);
    } catch (error) {
      toast.error(error.message || "Failed to load super admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = [
    {
      label: "Admins",
      value: dashboard?.admins ?? 0,
      icon: Users,
      href: ROUTES.SUPER_ADMIN.ROLES,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Moderators",
      value: dashboard?.moderators ?? 0,
      icon: Shield,
      href: ROUTES.MODERATOR.DASHBOARD,
      tone: "bg-orange-500/10 text-orange-600",
    },
    {
      label: "Audit Events",
      value: dashboard?.auditEvents ?? 0,
      icon: Activity,
      href: ROUTES.SUPER_ADMIN.AUDIT,
      tone: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Active Sessions",
      value: dashboard?.activeSessions ?? 0,
      icon: Server,
      href: ROUTES.SUPER_ADMIN.PLATFORM,
      tone: "bg-emerald-500/10 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super Admin Dashboard"
        subtitle="Governance, security, and platform-wide control backed by audited server actions."
        badge="High Trust"
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            onClick: fetchDashboard,
            loading,
            variant: "outline",
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} to={card.href} className="block">
            <Card className="h-full border-border/70 transition-colors hover:border-primary/30 hover:bg-accent/20">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={`rounded-2xl p-3 ${card.tone}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-3xl font-extrabold tracking-tight text-foreground">
                    {loading ? "..." : card.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Governance Areas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Role Management",
                description: "Change roles, assign admins, and review privileged staff accounts.",
                href: ROUTES.SUPER_ADMIN.ROLES,
              },
              {
                title: "Audit Center",
                description: "Trace role changes, security actions, and backend operational activity.",
                href: ROUTES.SUPER_ADMIN.AUDIT,
              },
              {
                title: "Platform Control",
                description: "Update settings, inspect health, and execute security-wide actions.",
                href: ROUTES.SUPER_ADMIN.PLATFORM,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border/70 bg-background p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={item.href}>Open</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">System Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <Badge variant="outline" className="w-fit">
              Backend Verified
            </Badge>
            <p>
              The super-admin panel is intentionally thin: permissions, role updates,
              sessions, and settings are enforced server-side and surfaced here.
            </p>
            <p>
              Health status:{" "}
              <span className="font-semibold text-foreground">
                {dashboard?.systemHealth?.database || "unknown"}
              </span>
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.SUPER_ADMIN.PLATFORM}>
                <Settings className="mr-2 h-4 w-4" />
                Open Platform Control
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
