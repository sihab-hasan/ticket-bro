// pages/admin/SystemSecurityPage.jsx
import React, { useState, useEffect } from 'react';
import { Shield, Users, LogOut, Lock, AlertTriangle, RefreshCw, XCircle, Clock, Globe, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import { RoleBadge, ConfirmDialog } from '@/components/shared/StatusBadge';
import { formatDate } from '@/utils/formatters';
import { toast } from '@/components/shared/common';
import { adminService } from '@/api';

const SystemSecurityPage = () => {
  const [sessions, setSessions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revokeConfirm, setRevokeConfirm] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const [sessRes, alertRes, auditRes] = await Promise.allSettled([
        adminService.getSystemSessions(),
        adminService.getSecurityAlerts(),
        adminService.getAuditLogs({ limit: 20 }),
      ]);
      if (sessRes.status === 'fulfilled') { setSessions(sessRes.value?.sessions || []); }
      if (alertRes.status === 'fulfilled') { setAlerts(alertRes.value?.alerts || []); }
      if (auditRes.status === 'fulfilled') { setAuditLogs(auditRes.value?.logs || []); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleRevokeSession = async () => {
    setRevoking(true);
    try {
      await adminService.revokeSystemSession(revokeConfirm._id);
      toast.success('Session revoked'); fetch(); setRevokeConfirm(null);
    } catch { toast.error('Failed to revoke session'); }
    finally { setRevoking(false); }
  };

  const handleRevokeAll = async () => {
    try {
      await adminService.clearSystemSessions();
      toast.success('All sessions revoked'); fetch();
    } catch { toast.error('Failed'); }
  };

  const SEVERITY = {
    critical: 'bg-red-500/10 text-red-600 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    low: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  };

  const ACTION_COLORS = {
    login: 'text-green-600', logout: 'text-gray-500', create: 'text-blue-500',
    update: 'text-yellow-600', delete: 'text-red-500', ban: 'text-red-600',
    approve: 'text-green-500', reject: 'text-orange-500',
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <PageHeader title="Security" subtitle="Active sessions, alerts & audit trail"
        actions={[{ label: 'Refresh', icon: RefreshCw, onClick: fetch, variant: 'outline' }]}
      />

      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions"><Users className="h-3.5 w-3.5 mr-1.5" />Active Sessions {sessions.length > 0 && <Badge className="ml-1.5 text-xs px-1.5 h-4">{sessions.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="alerts"><AlertTriangle className="h-3.5 w-3.5 mr-1.5" />Alerts {alerts.filter((a) => !a.resolved).length > 0 && <Badge variant="destructive" className="ml-1.5 text-xs px-1.5 h-4">{alerts.filter((a) => !a.resolved).length}</Badge>}</TabsTrigger>
          <TabsTrigger value="audit"><Lock className="h-3.5 w-3.5 mr-1.5" />Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">{sessions.length} Active Sessions</CardTitle>
              <Button variant="destructive" size="sm" onClick={handleRevokeAll} className="h-8 text-xs">
                <LogOut className="h-3.5 w-3.5 mr-1.5" />Revoke All
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />) :
                sessions.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No active sessions</p> :
                sessions.map((s) => (
                  <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                        {s.user?.firstName?.[0]}{s.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{s.user?.firstName} {s.user?.lastName}</p>
                        <RoleBadge role={s.user?.role} />
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Globe className="h-3 w-3" />{s.ipAddress || 'Unknown IP'}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Monitor className="h-3 w-3" />{s.device || 'Unknown'}</span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{formatDate(s.lastActiveAt, { dateStyle: undefined, timeStyle: 'short' })}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500 hover:text-red-600" onClick={() => setRevokeConfirm(s)}>
                      <XCircle className="h-3.5 w-3.5 mr-1" />Revoke
                    </Button>
                  </div>
                ))
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardContent className="pt-5 space-y-3">
              {loading ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />) :
                alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">No security alerts</p>
                  </div>
                ) : alerts.map((a) => (
                  <div key={a._id} className={`p-3.5 rounded-xl border ${SEVERITY[a.severity] || SEVERITY.low}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{a.title}</p>
                        <p className="text-xs mt-0.5 opacity-80">{a.description}</p>
                        <p className="text-[11px] mt-1.5 opacity-60 flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(a.createdAt)}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${SEVERITY[a.severity] || SEVERITY.low}`}>{a.severity}</span>
                    </div>
                  </div>
                ))
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardContent className="pt-5">
              {loading ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full mb-2" />) :
                auditLogs.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No audit logs</p> :
                auditLogs.map((log) => (
                  <div key={log._id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">
                        <span className="font-semibold">{log.actor?.firstName} {log.actor?.lastName}</span>
                        {' '}
                        <span className={`font-semibold ${ACTION_COLORS[log.action] || 'text-foreground'}`}>{log.action}</span>
                        {' '}
                        <span className="text-muted-foreground">{log.target} {log.targetId ? `(${log.targetId.slice(-6)})` : ''}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(log.createdAt)}</p>
                    </div>
                  </div>
                ))
              }
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ConfirmDialog open={!!revokeConfirm} onOpenChange={() => setRevokeConfirm(null)}
        title="Revoke Session?" description="This will immediately sign out the user from this session."
        confirmLabel="Revoke Session" onConfirm={handleRevokeSession} loading={revoking}
      />
    </div>
  );
};

export default SystemSecurityPage;
