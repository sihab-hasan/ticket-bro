import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Building,
  CheckCircle2,
  Clock,
  CreditCard,
  Save,
  Shield,
} from 'lucide-react';
import { organizersService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/shared/PageHeader';
import { toast } from '@/components/shared/common';
import { formatDate } from '@/utils/formatters';

const Field = ({ label, hint, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold">{label}</Label>
    {children}
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

const EMPTY_FORM = {
  displayName: '',
  bio: '',
  website: '',
  phone: '',
  email: '',
  logo: '',
  coverImage: '',
  instagram: '',
  facebook: '',
  twitter: '',
  youtube: '',
};

const SettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);

      try {
        const [profileResult, verificationResult] = await Promise.all([
          organizersService.getProfile(),
          organizersService.getVerification(),
        ]);

        setProfile(profileResult || null);
        setVerification(verificationResult || null);
        setForm({
          displayName: profileResult?.displayName || '',
          bio: profileResult?.bio || '',
          website: profileResult?.website || '',
          phone: profileResult?.phone || '',
          email: profileResult?.email || '',
          logo: profileResult?.logo || '',
          coverImage: profileResult?.coverImage || '',
          instagram: profileResult?.socialLinks?.instagram || '',
          facebook: profileResult?.socialLinks?.facebook || '',
          twitter: profileResult?.socialLinks?.twitter || '',
          youtube: profileResult?.socialLinks?.youtube || '',
        });
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load organizer settings'));
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const setValue = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const saveProfile = async () => {
    setSaving(true);

    try {
      const updatedProfile = await organizersService.updateProfile({
        displayName: form.displayName.trim(),
        bio: form.bio || undefined,
        website: form.website || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        logo: form.logo || undefined,
        coverImage: form.coverImage || undefined,
        socialLinks: {
          instagram: form.instagram || undefined,
          facebook: form.facebook || undefined,
          twitter: form.twitter || undefined,
          youtube: form.youtube || undefined,
        },
      });

      setProfile(updatedProfile || null);
      toast.success('Organizer profile saved');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save organizer profile'));
    } finally {
      setSaving(false);
    }
  };

  const submitVerification = async () => {
    setSubmitting(true);

    try {
      await organizersService.submitVerification();
      const nextVerification = await organizersService.getVerification();
      setVerification(nextVerification || null);
      toast.success('Verification request submitted');
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to submit verification request'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const SaveBtn = ({ onClick, label = 'Save Changes' }) => (
    <Button onClick={onClick} disabled={saving} size="sm" className="font-bold">
      {saving ? (
        'Saving...'
      ) : (
        <>
          <Save className="h-3.5 w-3.5 mr-2" />
          {label}
        </>
      )}
    </Button>
  );

  const verificationStatus = {
    unverified: {
      icon: Shield,
      text: 'Not Verified Yet',
      color: 'text-muted-foreground',
      bg: 'bg-muted/50 border-border',
    },
    pending: {
      icon: Clock,
      text: 'Verification Pending',
      color: 'text-yellow-600',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
    },
    verified: {
      icon: CheckCircle2,
      text: 'Verified Organizer',
      color: 'text-green-600',
      bg: 'bg-green-500/10 border-green-500/20',
    },
    rejected: {
      icon: AlertCircle,
      text: 'Verification Rejected',
      color: 'text-red-500',
      bg: 'bg-red-500/10 border-red-500/20',
    },
  };

  const currentVerification =
    verificationStatus[verification?.status || 'unverified'] ||
    verificationStatus.unverified;

  return (
    <div className="p-4 sm:p-6 space-y-6 font-sans">
      <PageHeader
        title="Organizer Settings"
        subtitle="Profile settings are wired to the shared organizer API service"
      />
      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="profile">
            <Building className="h-3.5 w-3.5 mr-1.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="verification">
            <Shield className="h-3.5 w-3.5 mr-1.5" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="bank">
            <CreditCard className="h-3.5 w-3.5 mr-1.5" />
            Payout Setup
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold">
                Organizer Profile
              </CardTitle>
              <SaveBtn onClick={saveProfile} />
            </CardHeader>
            <CardContent className="space-y-5">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-9 w-full" />
                ))
              ) : (
                <>
                  <Field label="Display Name">
                    <Input
                      value={form.displayName}
                      onChange={(event) =>
                        setValue('displayName', event.target.value)
                      }
                      className="h-9"
                    />
                  </Field>
                  <Field label="Bio" hint="Shown on your public organizer profile">
                    <Textarea
                      value={form.bio}
                      onChange={(event) => setValue('bio', event.target.value)}
                      rows={4}
                      className="text-sm resize-none"
                    />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Website">
                      <Input
                        value={form.website}
                        onChange={(event) =>
                          setValue('website', event.target.value)
                        }
                        placeholder="https://..."
                        className="h-9"
                      />
                    </Field>
                    <Field label="Phone">
                      <Input
                        value={form.phone}
                        onChange={(event) => setValue('phone', event.target.value)}
                        className="h-9"
                      />
                    </Field>
                    <Field label="Public Contact Email">
                      <Input
                        value={form.email}
                        onChange={(event) => setValue('email', event.target.value)}
                        className="h-9"
                      />
                    </Field>
                    <Field label="Organizer Slug" hint="Generated from your display name">
                      <Input
                        value={profile?.slug || ''}
                        readOnly
                        className="h-9 bg-muted"
                      />
                    </Field>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Logo URL">
                      <Input
                        value={form.logo}
                        onChange={(event) => setValue('logo', event.target.value)}
                        placeholder="https://..."
                        className="h-9"
                      />
                    </Field>
                    <Field label="Cover Image URL">
                      <Input
                        value={form.coverImage}
                        onChange={(event) =>
                          setValue('coverImage', event.target.value)
                        }
                        placeholder="https://..."
                        className="h-9"
                      />
                    </Field>
                  </div>
                  <Separator />
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Social Links
                  </p>
                  {[
                    { key: 'instagram', label: 'Instagram' },
                    { key: 'facebook', label: 'Facebook' },
                    { key: 'twitter', label: 'Twitter / X' },
                    { key: 'youtube', label: 'YouTube' },
                  ].map((social) => (
                    <Field key={social.key} label={social.label}>
                      <Input
                        value={form[social.key]}
                        onChange={(event) =>
                          setValue(social.key, event.target.value)
                        }
                        placeholder="https://..."
                        className="h-9"
                      />
                    </Field>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${currentVerification.bg}`}>
                {React.createElement(currentVerification.icon, {
                  className: `h-5 w-5 ${currentVerification.color} shrink-0`,
                })}
                <div>
                  <p className={`text-sm font-semibold ${currentVerification.color}`}>
                    {currentVerification.text}
                  </p>
                  {verification?.updatedAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Updated{' '}
                      {formatDate(verification.updatedAt, {
                        dateStyle: 'medium',
                        timeStyle: undefined,
                      })}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold">Why get verified?</p>
                {[
                  'Verified trust signal on your organizer profile',
                  'Improved confidence for attendees before purchase',
                  'A cleaner path for moderation and support reviews',
                  'Better alignment with future organizer tooling',
                ].map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    {benefit}
                  </div>
                ))}
              </div>

              {(!verification || ['unverified', 'rejected'].includes(verification.status)) && (
                <Button
                  onClick={submitVerification}
                  disabled={submitting}
                  className="w-full font-bold"
                >
                  {submitting ? 'Submitting...' : 'Submit Verification Request'}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">
                Payout Setup Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground">
                The frontend is now connected only to real payout APIs. Dedicated
                bank-account management endpoints are not fully exposed by the
                backend yet, so payout requests are handled from the Revenue page.
              </div>
              <p className="text-xs text-muted-foreground">
                This avoids pretending a save succeeded when the backend cannot
                actually persist the data yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border text-sm text-muted-foreground">
                Organizer notification preference endpoints are not available in
                the backend contract yet, so this screen stays informational for
                now instead of sending fake update requests.
              </div>
              <p className="text-xs text-muted-foreground">
                Once those APIs exist, this tab can be wired into the same shared
                service layer used across the rest of the organizer frontend.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
