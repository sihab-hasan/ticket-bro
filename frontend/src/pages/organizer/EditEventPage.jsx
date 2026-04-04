import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { categoriesService, eventsService, subcategoriesService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/shared/PageHeader';
import { ConfirmDialog, StatusBadge } from '@/components/shared/StatusBadge';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';

const Field = ({ label, required, error, hint, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
    {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    {error && <p className="text-[11px] text-destructive">{error}</p>}
  </div>
);

const toDateInput = (value) => (value ? value.split('T')[0] : '');
const toTimeInput = (value) => (value ? value.split('T')[1]?.slice(0, 5) || '' : '');
const buildDateTime = (date, time, fallback = '00:00') => (
  date ? `${date}T${time || fallback}:00` : undefined
);

const EditEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
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
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    isOnline: false,
    coverImage: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: 'Asia/Dhaka',
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueCountry: 'Bangladesh',
    onlineLink: '',
    ageRestriction: 'all',
  });

  useEffect(() => {
    const fetchTaxonomy = async () => {
      setTaxonomyLoading(true);
      try {
        const result = await categoriesService.getAll();
        setCategories(result || []);
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load categories'));
      } finally {
        setTaxonomyLoading(false);
      }
    };

    fetchTaxonomy();
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);

      try {
        const currentEvent = await eventsService.getEventBySlug(eventId);
        const isOnline =
          currentEvent?.location?.type === 'online' ||
          currentEvent?.location?.type === 'hybrid';

        setEvent(currentEvent);
        setForm({
          title: currentEvent?.title || '',
          description: currentEvent?.description || '',
          category: currentEvent?.category?._id || currentEvent?.category || '',
          subcategory: currentEvent?.subcategory?._id || currentEvent?.subcategory || '',
          isOnline,
          coverImage: currentEvent?.coverImage || '',
          startDate: toDateInput(currentEvent?.startDate),
          startTime: toTimeInput(currentEvent?.startDate),
          endDate: toDateInput(currentEvent?.endDate),
          endTime: toTimeInput(currentEvent?.endDate),
          timezone: currentEvent?.timezone || 'Asia/Dhaka',
          venueName: currentEvent?.location?.name || '',
          venueAddress: currentEvent?.location?.address || '',
          venueCity: currentEvent?.location?.city || '',
          venueCountry: currentEvent?.location?.country || 'Bangladesh',
          onlineLink: currentEvent?.location?.onlineUrl || '',
          ageRestriction: currentEvent?.ageRestriction || 'all',
        });
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Failed to load event'));
        navigate(ROUTES.ORGANIZER.EVENTS);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, navigate]);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!form.category) {
        setSubcategories([]);
        return;
      }

      try {
        const result = await subcategoriesService.getAll({ categoryId: form.category });
        setSubcategories(result || []);
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

  const statusAllowsSubmission = useMemo(
    () => ['draft', 'rejected'].includes(event?.status),
    [event?.status],
  );

  const validateForReview = () => {
    const nextErrors = {};

    if (!form.title.trim()) nextErrors.title = 'Title is required';
    if (!form.description.trim()) nextErrors.description = 'Description is required';
    if (!form.category) nextErrors.category = 'Category is required';
    if (!form.startDate) nextErrors.startDate = 'Start date is required';
    if (!form.startTime) nextErrors.startTime = 'Start time is required';
    if (!form.endDate) nextErrors.endDate = 'End date is required';
    if (!form.endTime) nextErrors.endTime = 'End time is required';
    if (!form.isOnline && !form.venueName.trim()) nextErrors.venueName = 'Venue name is required';
    if (form.isOnline && !form.onlineLink.trim()) nextErrors.onlineLink = 'Online link is required';

    if (
      form.startDate && form.startTime && form.endDate && form.endTime
      && new Date(`${form.endDate}T${form.endTime}:00`) <= new Date(`${form.startDate}T${form.startTime}:00`)
    ) {
      nextErrors.endTime = 'End date/time must be after start date/time';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category || undefined,
    subcategory: form.subcategory || undefined,
    coverImage: form.coverImage.trim() || undefined,
    startDate: buildDateTime(form.startDate, form.startTime),
    endDate: buildDateTime(form.endDate, form.endTime, '23:59'),
    timezone: form.timezone,
    location: form.isOnline
      ? {
          type: 'online',
          onlineUrl: form.onlineLink.trim() || undefined,
        }
      : {
          type: 'physical',
          name: form.venueName.trim() || undefined,
          address: form.venueAddress.trim() || undefined,
          city: form.venueCity.trim() || undefined,
          country: form.venueCountry.trim() || undefined,
        },
    ageRestriction: form.ageRestriction,
  });

  const handleSave = async () => {
    const eventKey = event?.slug || eventId;
    if (!form.title.trim()) {
      setErrors((current) => ({ ...current, title: 'Title is required' }));
      toast.error('Title is required');
      return;
    }

    if (!form.startDate || !form.startTime || !form.endDate || !form.endTime) {
      toast.error('Start and end date/time are required');
      return;
    }

    setSaving(true);
    setSavingMode('save');

    try {
      const updatedEvent = await eventsService.updateEvent(eventKey, buildPayload());
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

    const eventKey = event?.slug || eventId;
    setSaving(true);
    setSavingMode('review');

    try {
      const updatedEvent = await eventsService.updateEvent(eventKey, buildPayload());
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
      await eventsService.cancelEvent(event?.slug || eventId);
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
      <div className="p-4 sm:p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6 font-sans">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => navigate(ROUTES.ORGANIZER.EVENTS)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <PageHeader
            title="Edit Event"
            subtitle={event?.title}
            className="mb-0"
          />
        </div>
        {event?.status && <StatusBadge status={event.status} />}
      </div>

      {event?.rejectionReason && (
        <Card className="border-amber-300 bg-amber-50/60">
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-amber-700">Rejection feedback</p>
            <p className="text-sm text-amber-900 mt-1">{event.rejectionReason}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="venue">Date & Venue</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-5">
              <Field label="Event Title" required error={errors.title}>
                <Input
                  value={form.title}
                  onChange={(eventValue) => setValue('title', eventValue.target.value)}
                  className="h-9"
                />
              </Field>
              <Field label="Description" error={errors.description}>
                <Textarea
                  value={form.description}
                  onChange={(eventValue) =>
                    setValue('description', eventValue.target.value)
                  }
                  rows={6}
                  className="text-sm resize-none"
                />
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Category" required error={errors.category}>
                  <Select
                    value={form.category}
                    onValueChange={(value) => {
                      setValue('category', value);
                      setValue('subcategory', '');
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={taxonomyLoading ? 'Loading categories...' : 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Subcategory">
                  <Select
                    value={form.subcategory || 'none'}
                    onValueChange={(value) => setValue('subcategory', value === 'none' ? '' : value)}
                    disabled={!form.category}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No subcategory</SelectItem>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory._id} value={subcategory._id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Age Restriction">
                <Select
                  value={form.ageRestriction}
                  onValueChange={(value) => setValue('ageRestriction', value)}
                >
                  <SelectTrigger className="h-9 w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="teen">13+</SelectItem>
                    <SelectItem value="adult">18+</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                <div className="flex-1">
                  <p className="text-sm font-semibold">Online Event</p>
                  <p className="text-xs text-muted-foreground">
                    Toggle between virtual and in-person attendance.
                  </p>
                </div>
                <Switch
                  checked={form.isOnline}
                  onCheckedChange={(value) => setValue('isOnline', value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="venue" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start Date" required error={errors.startDate}>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(eventValue) =>
                      setValue('startDate', eventValue.target.value)
                    }
                    className="h-9"
                  />
                </Field>
                <Field label="Start Time" required error={errors.startTime}>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={(eventValue) =>
                      setValue('startTime', eventValue.target.value)
                    }
                    className="h-9"
                  />
                </Field>
                <Field label="End Date" required error={errors.endDate}>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(eventValue) =>
                      setValue('endDate', eventValue.target.value)
                    }
                    className="h-9"
                  />
                </Field>
                <Field label="End Time" required error={errors.endTime}>
                  <Input
                    type="time"
                    value={form.endTime}
                    onChange={(eventValue) =>
                      setValue('endTime', eventValue.target.value)
                    }
                    className="h-9"
                  />
                </Field>
              </div>
              <Field label="Timezone">
                <Select
                  value={form.timezone}
                  onValueChange={(value) => setValue('timezone', value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'Asia/Dhaka',
                      'Asia/Kolkata',
                      'Asia/Singapore',
                      'America/New_York',
                      'Europe/London',
                      'UTC',
                    ].map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {!form.isOnline ? (
                <>
                  <Separator />
                  <Field label="Venue Name" required error={errors.venueName}>
                    <Input
                      value={form.venueName}
                      onChange={(eventValue) =>
                        setValue('venueName', eventValue.target.value)
                      }
                      className="h-9"
                    />
                  </Field>
                  <Field label="Address">
                    <Input
                      value={form.venueAddress}
                      onChange={(eventValue) =>
                        setValue('venueAddress', eventValue.target.value)
                      }
                      className="h-9"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="City">
                      <Input
                        value={form.venueCity}
                        onChange={(eventValue) =>
                          setValue('venueCity', eventValue.target.value)
                        }
                        className="h-9"
                      />
                    </Field>
                    <Field label="Country">
                      <Input
                        value={form.venueCountry}
                        onChange={(eventValue) =>
                          setValue('venueCountry', eventValue.target.value)
                        }
                        className="h-9"
                      />
                    </Field>
                  </div>
                </>
              ) : (
                <Field label="Streaming / Meeting Link" required error={errors.onlineLink}>
                  <Input
                    value={form.onlineLink}
                    onChange={(eventValue) =>
                      setValue('onlineLink', eventValue.target.value)
                    }
                    placeholder="https://..."
                    className="h-9"
                  />
                </Field>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-5">
              <Field
                label="Cover Image URL"
                hint="Paste a direct image URL (1200x630px recommended)"
              >
                <Input
                  value={form.coverImage}
                  onChange={(eventValue) =>
                    setValue('coverImage', eventValue.target.value)
                  }
                  placeholder="https://..."
                  className="h-9"
                />
              </Field>
              {form.coverImage && (
                <img
                  src={form.coverImage}
                  alt="Preview"
                  className="w-full h-52 object-cover rounded-xl border border-border"
                  onError={(eventValue) => {
                    eventValue.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="mt-4">
          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-destructive">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <div>
                  <p className="text-sm font-semibold">Cancel This Event</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This updates the event status to cancelled and removes it from
                    active sales.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setCancelConfirm(true)}
                  disabled={event?.status === 'cancelled'}
                >
                  Cancel Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.ORGANIZER.EVENTS)}
          className="font-semibold"
        >
          Back to Events
        </Button>
        <Button onClick={handleSave} disabled={saving} className="font-bold flex-1 min-w-[180px]">
          {saving && savingMode === 'save' ? (
            <>
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {event?.status === 'draft' ? 'Save Draft' : 'Save Changes'}
            </>
          )}
        </Button>
        {statusAllowsSubmission && (
          <Button
            onClick={handleSubmitForReview}
            disabled={saving}
            className="font-bold flex-1 min-w-[200px]"
          >
            {saving && savingMode === 'review' ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                Submit for Review
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
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
