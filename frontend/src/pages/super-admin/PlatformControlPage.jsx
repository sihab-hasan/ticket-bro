import React, { useEffect, useState } from "react";
import {
  Power,
  RefreshCw,
  Save,
  Server,
  ShieldAlert,
} from "lucide-react";

import { superAdminService } from "@/api";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/shared/StatusBadge";
import { toast } from "@/components/shared/common";

const BOOLEAN_FIELDS = [
  { key: "maintenanceMode", label: "Maintenance Mode" },
  { key: "registrationEnabled", label: "Registration Enabled" },
  { key: "enableMessaging", label: "Messaging Enabled" },
  { key: "enableReviews", label: "Reviews Enabled" },
  { key: "enableWaitlist", label: "Waitlist Enabled" },
  { key: "enableSeatMap", label: "Seat Map Enabled" },
  { key: "enableOAuth", label: "OAuth Enabled" },
];

const PlatformControlPage = () => {
  const [settings, setSettings] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [forceLogoutOpen, setForceLogoutOpen] = useState(false);

  const fetchPlatformState = async () => {
    setLoading(true);
    try {
      const [settingsPayload, healthPayload] = await Promise.all([
        superAdminService.getSettings(),
        superAdminService.getHealth(),
      ]);
      setSettings(settingsPayload);
      setHealth(healthPayload);
    } catch (error) {
      toast.error(error.message || "Failed to load platform controls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatformState();
  }, []);

  const metrics = [
    { label: "API", value: health?.api || "unknown" },
    { label: "Database", value: health?.database || "unknown" },
    { label: "Email", value: health?.email || "unknown" },
    { label: "Payment", value: health?.payment || "unknown" },
  ];

  const updateField = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      await superAdminService.updateSettings({
        ...settings,
        commissionRate: Number(settings.commissionRate || 0),
        payoutHoldDays: Number(settings.payoutHoldDays || 0),
        bookingFee: Number(settings.bookingFee || 0),
      });
      toast.success("Platform settings updated");
    } catch (error) {
      toast.error(error.message || "Failed to update platform settings");
    } finally {
      setSaving(false);
    }
  };

  const handleForceLogout = async () => {
    try {
      await superAdminService.forceLogoutAll();
      toast.success("All active sessions were revoked");
      setForceLogoutOpen(false);
      fetchPlatformState();
    } catch (error) {
      toast.error(error.message || "Failed to revoke all sessions");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Control"
        subtitle="Manage backend settings, inspect health, and execute global security actions."
        actions={[
          {
            label: "Refresh",
            icon: RefreshCw,
            onClick: fetchPlatformState,
            loading,
            variant: "outline",
          },
          {
            label: "Save Settings",
            icon: Save,
            onClick: handleSave,
            loading: saving,
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="flex items-center gap-3 p-5">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Server className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="text-lg font-bold capitalize text-foreground">{metric.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Platform Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { key: "platformName", label: "Platform Name" },
                { key: "platformUrl", label: "Platform URL" },
                { key: "currency", label: "Currency" },
                { key: "commissionRate", label: "Commission Rate" },
                { key: "payoutHoldDays", label: "Payout Hold Days" },
                { key: "bookingFee", label: "Booking Fee" },
              ].map((field) => (
                <div key={field.key} className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {field.label}
                  </p>
                  <Input
                    value={settings?.[field.key] ?? ""}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {BOOLEAN_FIELDS.map((field) => (
                <div
                  key={field.key}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">{field.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Controlled by backend settings storage
                    </p>
                  </div>
                  <Switch
                    checked={Boolean(settings?.[field.key])}
                    onCheckedChange={(checked) => updateField(field.key, checked)}
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Security Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="mt-0.5 h-5 w-5 text-destructive" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Force Logout All Sessions</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Revoke every active refresh token and require all users to sign in again.
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="mt-4 w-full"
                  onClick={() => setForceLogoutOpen(true)}
                >
                  <Power className="mr-2 h-4 w-4" />
                  Revoke All Sessions
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Health Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Uptime: <span className="font-semibold text-foreground">{health?.uptime ?? 0} minutes</span></p>
              <p>CPU Usage: <span className="font-semibold text-foreground">{health?.cpuUsage ?? 0}%</span></p>
              <p>Memory Usage: <span className="font-semibold text-foreground">{health?.memoryUsage ?? 0}%</span></p>
              <p>API Latency: <span className="font-semibold text-foreground">{health?.apiLatency ?? 0} ms</span></p>
              <p>DB Latency: <span className="font-semibold text-foreground">{health?.dbLatency ?? 0} ms</span></p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={forceLogoutOpen}
        onOpenChange={setForceLogoutOpen}
        title="Force logout every active session?"
        description="This will revoke all active refresh tokens across the platform."
        confirmLabel="Revoke Sessions"
        onConfirm={handleForceLogout}
      />
    </div>
  );
};

export default PlatformControlPage;
