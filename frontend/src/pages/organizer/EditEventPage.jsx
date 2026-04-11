import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, ArrowRight, Save, Ticket } from 'lucide-react';
import { categoriesService, eventsService, subcategoriesService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import EventImageManager from '@/components/roles/organizer/EventImageManager';
import { ConfirmDialog, StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import {
  LOCATION_TYPES,
  VISIBILITY_OPTIONS,
  buildEventPayload,
  createDraftErrors,
  createReviewErrors,
  getDefaultEventForm,
  mapEventToForm,
} from '@/lib/eventForm';

const Field = ({ label, required, error, hint, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold">
      {label}
      {required && <span className="ml-1 text-destructive">*</span>}
    </Label>
    {children}
    {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    {error && <p className="text-[11px] text-destructive">{error}</p>}
  </div>
);

const STAFF_ROLES = new Set(['moderator', 'admin', 'super_admin']);

const getIdentityId = (value) =>
  value?._id ||
  value?.id ||
  value?.user?._id ||
  value?.user ||
  value?.owner ||
  value?.userId ||
  null;

const getManagerIds = (event) => {
  const ids = new Set();

  [event?.organizer, event?.organizerProfile].forEach((entry) => {
    const id = getIdentityId(entry);
    if (id) {
      ids.add(String(id));
    }
  });

  (event?.coOrganizers || []).forEach((entry) => {
    const id = getIdentityId(entry) || entry;
    if (id) {
      ids.add(String(id));
    }
  });

  return ids;
};

const canManageEvent = (event, user) => {
  if (!event || !user) {
    return false;
  }

  if (STAFF_ROLES.has(user.role)) {
    return true;
  }

  const userId = user?._id || user?.id;
  return Boolean(userId && getManagerIds(event).has(String(userId)));
};

const EditEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingMode, setSavingMode] = useState('');
  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(getDefaultEventForm);

  useEffect(() => {
    const fetchTaxonomy = async () => {
      setTaxonomyLoading(true);
      try {
        setCategories((await categoriesService.getAll()) || []);
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load categories'));
      } finally {
        setTaxonomyLoading(false);
      }
    };
    fetchTaxonomy();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchEvent = async () => {
      setLoading(true);
      try {
        const currentEvent = await eventsService.getEventBySlug(eventId);
        if (!canManageEvent(currentEvent, user)) {
          toast.error('You do not have permission to manage this event.');
          navigate(ROUTES.ORGANIZER.EVENTS);
          return;
        }
        const key = currentEvent?.slug || eventId;
        const ticketTypes = await eventsService.getTicketTypes(key).catch(() => []);
        setEvent(currentEvent);
        setForm(mapEventToForm(currentEvent, ticketTypes));
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load event'));
        navigate(ROUTES.ORGANIZER.EVENTS);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, navigate, user]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!form.category) return setSubcategories([]);
      try {
        setSubcategories((await subcategoriesService.getAll({ categoryId: form.category })) || []);
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load subcategories'));
      }
    };
    fetchSubcategories();
  }, [form.category]);

  const setValue = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleEventImagesUpdated = (updatedEvent) => {
    if (!updatedEvent) return;

    setEvent(updatedEvent);
    setForm((current) => ({
      ...current,
      coverImage: updatedEvent.coverImage || '',
      galleryImagesText: Array.isArray(updatedEvent.images)
        ? updatedEvent.images.filter(Boolean).join('\n')
        : '',
    }));
  };

  const isDraftLikeStatus = ['draft', 'rejected'].includes(event?.status);
  const canSubmit = ['draft', 'rejected'].includes(event?.status);
  const eventKey = event?.slug || eventId;
  const ticketCount = form.tickets.length;
  const managerNames = (event?.coOrganizers || [])
    .map((manager) => [manager?.firstName, manager?.lastName].filter(Boolean).join(' ').trim() || manager?.email)
    .filter(Boolean);

  const validateForSave = () => {
    const nextErrors = isDraftLikeStatus
      ? createDraftErrors(form)
      : createReviewErrors(form, { requireTickets: false });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateForReview = () => {
    const nextErrors = createReviewErrors(form);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForSave()) {
      toast.error(isDraftLikeStatus ? 'Please fix the draft errors before saving' : 'Please complete the required event details');
      return;
    }
    setSaving(true);
    setSavingMode('save');
    try {
      const updatedEvent = await eventsService.updateEvent(eventKey, buildEventPayload(form));
      setEvent(updatedEvent || event);
      toast.success(event?.status === 'draft' ? 'Draft updated successfully' : 'Event updated successfully');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save event'));
    } finally {
      setSaving(false);
      setSavingMode('');
    }
  };

  const handleSubmitForReview = async () => {
    if (!validateForReview()) return;
    setSaving(true);
    setSavingMode('review');
    try {
      const updatedEvent = await eventsService.updateEvent(eventKey, buildEventPayload(form));
      const submittedEvent = await eventsService.publishEvent(updatedEvent?.slug || eventKey);
      setEvent(submittedEvent || updatedEvent || event);
      toast.success('Event submitted for review');
      navigate(ROUTES.ORGANIZER.EVENTS);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit draft for review'));
    } finally {
      setSaving(false);
      setSavingMode('');
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await eventsService.cancelEvent(eventKey);
      toast.success('Event cancelled');
      navigate(ROUTES.ORGANIZER.EVENTS);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to cancel event'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 font-sans sm:p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate(ROUTES.ORGANIZER.EVENTS)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <PageHeader title="Edit Event" subtitle={event?.title} className="mb-0" />
        </div>
        {event?.status && <StatusBadge status={event.status} />}
      </div>

      {event?.rejectionReason && (
        <Card className="border-amber-300 bg-amber-50/60">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-amber-700">Rejection feedback</p>
            <p className="mt-1 text-sm text-amber-900">{event.rejectionReason}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="details">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="venue">Date & Venue</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="policy">Policy & SEO</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="space-y-5 p-6">
              <Field label="Event Title" required error={errors.title}>
                <Input value={form.title} onChange={(e) => setValue('title', e.target.value)} className="h-9" />
              </Field>
              <Field label="Short Description" required error={errors.shortDescription}>
                <Textarea value={form.shortDescription} onChange={(e) => setValue('shortDescription', e.target.value)} rows={3} className="resize-none text-sm" />
              </Field>
              <Field label="Description" error={errors.description}>
                <Textarea value={form.description} onChange={(e) => setValue('description', e.target.value)} rows={6} className="resize-none text-sm" />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Category" required error={errors.category}>
                  <Select value={form.category} onValueChange={(value) => { setValue('category', value); setValue('subcategory', ''); }}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={taxonomyLoading ? 'Loading categories...' : 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Subcategory">
                  <Select value={form.subcategory || 'none'} onValueChange={(value) => setValue('subcategory', value === 'none' ? '' : value)} disabled={!form.category}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No subcategory</SelectItem>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory._id} value={subcategory._id}>{subcategory.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Visibility">
                  <Select value={form.visibility} onValueChange={(value) => setValue('visibility', value)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VISIBILITY_OPTIONS.map((visibility) => (
                        <SelectItem key={visibility} value={visibility}>
                          {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Age Restriction">
                  <Select value={form.ageRestriction} onValueChange={(value) => setValue('ageRestriction', value)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ages</SelectItem>
                      <SelectItem value="teen">13+</SelectItem>
                      <SelectItem value="adult">18+</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Manual attendee approval</p>
                    <p className="mt-1 text-xs text-muted-foreground">Hold bookings for organizer approval before the attendee is confirmed.</p>
                  </div>
                  <Switch checked={form.requiresApproval} onCheckedChange={(value) => setValue('requiresApproval', value)} />
                </div>
              </div>
              <Field label="Location Type">
                <Select value={form.locationType} onValueChange={(value) => setValue('locationType', value)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {(event?.organizer?.email || managerNames.length > 0) && (
                <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm">
                  <p className="font-semibold text-foreground">Event managers</p>
                  <p className="mt-1 text-muted-foreground">Primary organizer: {event?.organizer?.email || 'Unknown'}</p>
                  {managerNames.length > 0 && <p className="mt-1 text-muted-foreground">Co-organizers: {managerNames.join(', ')}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="venue" className="mt-4">
          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start Date" required error={errors.startDate}><Input type="date" value={form.startDate} onChange={(e) => setValue('startDate', e.target.value)} className="h-9" /></Field>
                <Field label="Start Time" required error={errors.startTime}><Input type="time" value={form.startTime} onChange={(e) => setValue('startTime', e.target.value)} className="h-9" /></Field>
                <Field label="End Date" required error={errors.endDate}><Input type="date" value={form.endDate} onChange={(e) => setValue('endDate', e.target.value)} className="h-9" /></Field>
                <Field label="End Time" required error={errors.endTime}><Input type="time" value={form.endTime} onChange={(e) => setValue('endTime', e.target.value)} className="h-9" /></Field>
              </div>
              <Field label="Timezone">
                <Select value={form.timezone} onValueChange={(value) => setValue('timezone', value)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Asia/Dhaka', 'Asia/Kolkata', 'Asia/Singapore', 'America/New_York', 'Europe/London', 'UTC'].map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>{timezone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Doors Open Date" error={errors.doorsOpenTime}><Input type="date" value={form.doorsOpenDate} onChange={(e) => setValue('doorsOpenDate', e.target.value)} className="h-9" /></Field>
                <Field label="Doors Open Time" error={errors.doorsOpenTime}><Input type="time" value={form.doorsOpenTime} onChange={(e) => setValue('doorsOpenTime', e.target.value)} className="h-9" /></Field>
              </div>
              {['physical', 'hybrid'].includes(form.locationType) && (
                <>
                  <Separator />
                  <Field label="Venue Name" required error={errors.venueName}><Input value={form.venueName} onChange={(e) => setValue('venueName', e.target.value)} className="h-9" /></Field>
                  <Field label="Address"><Input value={form.venueAddress} onChange={(e) => setValue('venueAddress', e.target.value)} className="h-9" /></Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="City"><Input value={form.venueCity} onChange={(e) => setValue('venueCity', e.target.value)} className="h-9" /></Field>
                    <Field label="State / Province"><Input value={form.venueState} onChange={(e) => setValue('venueState', e.target.value)} className="h-9" /></Field>
                    <Field label="Country"><Input value={form.venueCountry} onChange={(e) => setValue('venueCountry', e.target.value)} className="h-9" /></Field>
                    <Field label="Postal Code"><Input value={form.venueZip} onChange={(e) => setValue('venueZip', e.target.value)} className="h-9" /></Field>
                    <Field label="Latitude"><Input value={form.venueLat} onChange={(e) => setValue('venueLat', e.target.value)} className="h-9" /></Field>
                    <Field label="Longitude"><Input value={form.venueLng} onChange={(e) => setValue('venueLng', e.target.value)} className="h-9" /></Field>
                  </div>
                </>
              )}
              {['online', 'hybrid'].includes(form.locationType) && (
                <>
                  <Separator />
                  <Field label="Streaming / Meeting Link" required error={errors.onlineLink}><Input value={form.onlineLink} onChange={(e) => setValue('onlineLink', e.target.value)} placeholder="https://..." className="h-9" /></Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Platform"><Input value={form.onlinePlatform} onChange={(e) => setValue('onlinePlatform', e.target.value)} className="h-9" /></Field>
                    <Field label="Access Password"><Input value={form.streamPassword} onChange={(e) => setValue('streamPassword', e.target.value)} className="h-9" /></Field>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <Card>
            <CardContent className="space-y-5 p-6">
              <EventImageManager
                event={event}
                onUpdated={handleEventImagesUpdated}
                isLoading={saving}
              />
              <Field label="Video URL"><Input value={form.videoUrl} onChange={(e) => setValue('videoUrl', e.target.value)} placeholder="https://..." className="h-9" /></Field>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Ticket setup</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ticketCount ? `${ticketCount} ticket type${ticketCount > 1 ? 's are' : ' is'} attached to this event.` : 'No ticket types are attached yet.'}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to={ROUTES.ORGANIZER.TICKET_MGMT(eventKey)}>
                      <Ticket className="mr-2 h-4 w-4" />
                      Manage Tickets
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policy" className="mt-4">
          <Card>
            <CardContent className="space-y-5 p-6">
              <Field label="Accessibility Info"><Textarea value={form.accessibilityInfo} onChange={(e) => setValue('accessibilityInfo', e.target.value)} rows={3} className="resize-none text-sm" /></Field>
              <Field label="Dress Code"><Input value={form.dressCode} onChange={(e) => setValue('dressCode', e.target.value)} className="h-9" /></Field>
              <Field label="Terms & Conditions"><Textarea value={form.termsAndConditions} onChange={(e) => setValue('termsAndConditions', e.target.value)} rows={4} className="resize-none text-sm" /></Field>
              <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Refund policy</p>
                    <p className="mt-1 text-xs text-muted-foreground">Define how and when buyers can request refunds.</p>
                  </div>
                  <Switch checked={form.hasRefundPolicy} onCheckedChange={(value) => setValue('hasRefundPolicy', value)} />
                </div>
                {form.hasRefundPolicy && (
                  <>
                    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">Allow refunds</p>
                        <p className="mt-1 text-xs text-muted-foreground">Buyers can request refunds before the cutoff window.</p>
                      </div>
                      <Switch checked={form.allowRefunds} onCheckedChange={(value) => setValue('allowRefunds', value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Cutoff Hours"><Input type="number" min="0" value={form.refundCutoffHours} onChange={(e) => setValue('refundCutoffHours', e.target.value)} className="h-9" /></Field>
                      <Field label="Refund Percentage"><Input type="number" min="0" max="100" value={form.refundPercentageBack} onChange={(e) => setValue('refundPercentageBack', e.target.value)} className="h-9" /></Field>
                    </div>
                    <Field label="Refund Notes"><Textarea value={form.refundNotes} onChange={(e) => setValue('refundNotes', e.target.value)} rows={3} className="resize-none text-sm" /></Field>
                  </>
                )}
              </div>
              <Separator />
              <Field label="SEO Meta Title"><Input value={form.seoMetaTitle} onChange={(e) => setValue('seoMetaTitle', e.target.value)} className="h-9" /></Field>
              <Field label="SEO Meta Description"><Textarea value={form.seoMetaDescription} onChange={(e) => setValue('seoMetaDescription', e.target.value)} rows={3} className="resize-none text-sm" /></Field>
              <Field label="SEO Keywords"><Textarea value={form.seoKeywordsText} onChange={(e) => setValue('seoKeywordsText', e.target.value)} rows={3} className="resize-none text-sm" /></Field>
              <Field label="Canonical URL"><Input value={form.seoCanonicalUrl} onChange={(e) => setValue('seoCanonicalUrl', e.target.value)} className="h-9" /></Field>
              <Field label="Open Graph Image"><Input value={form.seoOgImage} onChange={(e) => setValue('seoOgImage', e.target.value)} className="h-9" /></Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="mt-4">
          <Card className="border-destructive/30">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-bold text-destructive">Danger Zone</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <div>
                  <p className="text-sm font-semibold">Cancel This Event</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">This updates the event status to cancelled and removes it from active sales.</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => setCancelConfirm(true)} disabled={event?.status === 'cancelled'}>
                  Cancel Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => navigate(ROUTES.ORGANIZER.EVENTS)} className="font-semibold">Back to Events</Button>
        <Button onClick={handleSave} disabled={saving} className="min-w-[180px] flex-1 font-bold">
          {saving && savingMode === 'save'
            ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Saving...</>
            : <><Save className="mr-2 h-4 w-4" />{event?.status === 'draft' ? 'Save Draft' : 'Save Changes'}</>}
        </Button>
        {canSubmit && (
          <Button onClick={handleSubmitForReview} disabled={saving} className="min-w-[200px] flex-1 font-bold">
            {saving && savingMode === 'review'
              ? <><span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Submitting...</>
              : <>Submit for Review<ArrowRight className="ml-2 h-4 w-4" /></>}
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={cancelConfirm}
        onOpenChange={setCancelConfirm}
        title="Cancel Event?"
        description="This will change the event status to cancelled."
        confirmLabel="Cancel Event"
        onConfirm={handleCancel}
        loading={cancelling}
      />
    </div>
  );
};

export default EditEventPage;
