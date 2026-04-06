import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  FileText,
  RefreshCw,
  Shield,
  Users,
} from "lucide-react";

import { moderatorService } from "@/api";
import { ROUTES } from "@/app/AppRoutes";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/shared/common";

const ModeratorDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const payload = await moderatorService.getDashboard();
      setDashboard(payload);
    } catch (error) {
      toast.error(error.message || "Failed to load moderator dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const cards = [
    {
      label: "Open Reports",
      value: dashboard?.openReports ?? 0,
      icon: FileText,
      href: ROUTES.MODERATOR.REPORTS,
      tone: "bg-orange-500/10 text-orange-600",
    },
    {
      label: "Pending Events",
      value: dashboard?.pendingEvents ?? 0,
      icon: Calendar,
      href: ROUTES.MODERATOR.EVENTS,
      tone: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Suspended Users",
      value: dashboard?.suspendedUsers ?? 0,
      icon: Users,
      href: ROUTES.MODERATOR.USERS,
      tone: "bg-red-500/10 text-red-600",
    },
    {
      label: "Warnings Issued",
      value: dashboard?.warningsIssued ?? 0,
      icon: Shield,
      href: ROUTES.MODERATOR.USERS,
      tone: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderator Dashboard"
        subtitle="Trust and safety actions powered directly by backend moderation queues."
        badge="Live"
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
            <CardTitle className="text-lg font-bold">Moderation Flow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                title: "Reports Queue",
                description: "Review user reports, capture a resolution note, and close the case from one place.",
                href: ROUTES.MODERATOR.REPORTS,
              },
              {
                title: "Event Review",
                description: "Approve or reject pending events with a recorded moderation reason.",
                href: ROUTES.MODERATOR.EVENTS,
              },
              {
                title: "User Actions",
                description: "Suspend abusive accounts, restore users, or issue formal warnings.",
                href: ROUTES.MODERATOR.USERS,
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
            <CardTitle className="text-lg font-bold">Guardrails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <Badge variant="outline" className="w-fit">
              Backend First
            </Badge>
            <p>
              Moderator actions run through backend permissions and audit logging,
              so the frontend is only orchestrating real workflows.
            </p>
            <p>
              Staff-only user actions are blocked server-side. Moderators can work
              quickly here without owning business logic in the browser.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModeratorDashboard;
