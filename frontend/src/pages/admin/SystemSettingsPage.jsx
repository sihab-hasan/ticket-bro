// pages/admin/SystemSettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Mail, CreditCard, Bell, Shield, Globe, Zap, ToggleLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/shared/PageHeader';
import { toast } from '@/components/shared/common';
import { adminService } from '@/api';

const SettingField = ({ label, hint, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-4 py-4 border-b border-border last:border-0">
    <div className="sm:w-64 shrink-0">
      <Label className="text-sm font-semibold text-foreground">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{hint}</p>}
    </div>
    <div className="flex-1">{children}</div>
  </div>
);

const SystemSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        const d = await adminService.getSystemSettings();
        setForm(d || {});
      } catch { toast.error('Failed to load settings'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminService.updateSystemSettings(form);
      toast.success('Settings saved successfully');
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const SaveBtn = () => (
    <Button onClick={handleSave} disabled={saving} className="font-bold" size="sm">
      {saving ? <><span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />Saving…</> : <><Save className="h-3.5 w-3.5 mr-2" />Save Changes</>}
    </Button>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <PageHeader title="System Settings" subtitle="Configure platform-wide settings" />
      <Tabs defaultValue="general">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general"><Settings className="h-3.5 w-3.5 mr-1.5" />General</TabsTrigger>
          <TabsTrigger value="payment"><CreditCard className="h-3.5 w-3.5 mr-1.5" />Payment</TabsTrigger>
          <TabsTrigger value="email"><Mail className="h-3.5 w-3.5 mr-1.5" />Email</TabsTrigger>
          <TabsTrigger value="features"><Zap className="h-3.5 w-3.5 mr-1.5" />Features</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-bold">General Settings</CardTitle><SaveBtn /></CardHeader>
            <CardContent>
              {loading ? <div className="space-y-6">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : (
                <>
                  <SettingField label="Platform Name" hint="Displayed in emails and UI"><Input value={form.platformName || ''} onChange={(e) => set('platformName', e.target.value)} className="max-w-sm" /></SettingField>
                  <SettingField label="Platform URL" hint="Your production domain"><Input value={form.platformUrl || ''} onChange={(e) => set('platformUrl', e.target.value)} placeholder="https://ticket-bro.com" className="max-w-sm" /></SettingField>
                  <SettingField label="Default Currency" hint="All prices shown in this currency">
                    <Select value={form.currency || 'USD'} onValueChange={(v) => set('currency', v)}>
                      <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['USD', 'BDT', 'INR', 'EUR', 'GBP'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </SettingField>
                  <SettingField label="Platform Commission" hint="Percentage fee deducted from organizer payouts">
                    <div className="flex items-center gap-2 max-w-xs">
                      <Input type="number" value={form.commissionRate || 5} onChange={(e) => set('commissionRate', e.target.value)} className="w-24" />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </SettingField>
                  <SettingField label="Maintenance Mode" hint="Disable public access during maintenance">
                    <div className="flex items-center gap-2"><Switch checked={form.maintenanceMode || false} onCheckedChange={(v) => set('maintenanceMode', v)} /><span className="text-sm">{form.maintenanceMode ? 'Enabled' : 'Disabled'}</span></div>
                  </SettingField>
                  <SettingField label="User Registration" hint="Allow new users to register">
                    <div className="flex items-center gap-2"><Switch checked={form.registrationEnabled !== false} onCheckedChange={(v) => set('registrationEnabled', v)} /><span className="text-sm">{form.registrationEnabled !== false ? 'Open' : 'Closed'}</span></div>
                  </SettingField>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-4">
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-bold">Payment Settings</CardTitle><SaveBtn /></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-40 w-full" /> : (
                <>
                  <SettingField label="Stripe" hint="Stripe API keys for card payments">
                    <div className="space-y-2 max-w-sm">
                      <Input value={form.stripePublicKey || ''} onChange={(e) => set('stripePublicKey', e.target.value)} placeholder="pk_live_..." className="font-mono text-xs" />
                      <Input type="password" value={form.stripeSecretKey || ''} onChange={(e) => set('stripeSecretKey', e.target.value)} placeholder="sk_live_..." className="font-mono text-xs" />
                    </div>
                  </SettingField>
                  <SettingField label="Payout Hold Period" hint="Days to hold funds after event before releasing payout">
                    <div className="flex items-center gap-2">
                      <Input type="number" value={form.payoutHoldDays || 7} onChange={(e) => set('payoutHoldDays', e.target.value)} className="w-24" />
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                  </SettingField>
                  <SettingField label="Booking Fee" hint="Fixed fee charged to buyer per booking">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">$</span>
                      <Input type="number" value={form.bookingFee || 2.5} onChange={(e) => set('bookingFee', e.target.value)} className="w-24" step="0.5" />
                    </div>
                  </SettingField>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-4">
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-bold">Email Settings</CardTitle><SaveBtn /></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-40 w-full" /> : (
                <>
                  <SettingField label="SMTP Host" hint="Email server hostname"><Input value={form.smtpHost || ''} onChange={(e) => set('smtpHost', e.target.value)} placeholder="smtp.gmail.com" className="max-w-sm" /></SettingField>
                  <SettingField label="SMTP Port"><Input type="number" value={form.smtpPort || 587} onChange={(e) => set('smtpPort', e.target.value)} className="w-24" /></SettingField>
                  <SettingField label="From Email" hint="Sender address for platform emails"><Input type="email" value={form.fromEmail || ''} onChange={(e) => set('fromEmail', e.target.value)} placeholder="noreply@ticket-bro.com" className="max-w-sm" /></SettingField>
                  <SettingField label="From Name"><Input value={form.fromName || 'Ticket-Bro'} onChange={(e) => set('fromName', e.target.value)} className="max-w-xs" /></SettingField>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-4">
          <Card>
            <CardHeader className="pb-2 flex-row items-center justify-between"><CardTitle className="text-sm font-bold">Feature Flags</CardTitle><SaveBtn /></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-40 w-full" /> : [
                { key: 'enableMessaging', label: 'In-app Messaging', hint: 'Allow users and organizers to message each other' },
                { key: 'enableReviews', label: 'App Reviews', hint: 'Allow users to leave one platform review and rating' },
                { key: 'enableLoyaltyPoints', label: 'Loyalty Points', hint: 'Users earn points on every booking' },
                { key: 'enableWaitlist', label: 'Waitlist', hint: 'Users can join waitlist for sold-out events' },
                { key: 'enableSeatMap', label: 'Seat Selection', hint: 'Visual seat map for seated events' },
                { key: 'enableOAuth', label: 'Social Login', hint: 'Google & Facebook OAuth sign-in' },
              ].map((f) => (
                <SettingField key={f.key} label={f.label} hint={f.hint}>
                  <div className="flex items-center gap-2">
                    <Switch checked={form[f.key] !== false} onCheckedChange={(v) => set(f.key, v)} />
                    <span className="text-sm">{form[f.key] !== false ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </SettingField>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettingsPage;
