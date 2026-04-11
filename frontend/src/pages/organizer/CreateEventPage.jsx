import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
  Plus,
  Ticket,
  X,
} from 'lucide-react';
import { categoriesService, eventsService, subcategoriesService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import { Card, CardContent } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import PageHeader from '@/components/shared/PageHeader';
import ImagePicker from '@/components/shared/ImagePicker';
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/app/AppRoutes';
import useEventImages from '@/hooks/useEventImages';

const StepIndicator = ({ steps, current }) => (
  <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
    {steps.map((step, index) => (
      <React.Fragment key={step}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            index === current
              ? 'bg-primary text-primary-foreground'
              : index < current
                ? 'bg-green-500/10 text-green-600'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {index < current ? (
            <Check className="h-3 w-3" />
          ) : (
            <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">
              {index + 1}
            </span>
          )}
          <span className="hidden sm:block">{step}</span>
        </div>
        {index < steps.length - 1 && (
          <div
            className={`h-0.5 w-6 rounded-full ${
              index < current ? 'bg-green-500' : 'bg-muted'
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

const Field = ({ label, required, error, hint, children }) => (
  <div className="space-y-1.5">
    <Label className="text-xs font-semibold text-foreground">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    {children}
    {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    {error && <p className="text-[11px] text-destructive">{error}</p>}
  </div>
);

const inputCls = 'h-9 text-sm';
const STEPS = ['Essentials', 'Schedule & Access', 'Tickets', 'Media, Policy & Review'];
const LOCATION_TYPES = ['physical', 'online', 'hybrid'];
const VISIBILITY_OPTIONS = ['public', 'unlisted', 'private'];
const CURRENCY_OPTIONS = ['BDT', 'USD', 'EUR', 'GBP', 'INR', 'SGD', 'AED'];
const TICKET_TYPES = ['general', 'vip', 'early_bird', 'group', 'backstage', 'online'];

const EMPTY_TICKET = {
  name: '',
  price: '',
  quantity: '',
  description: '',
  type: 'general',
  salesStart: '',
  salesEnd: '',
  minPerOrder: '',
  maxPerOrder: '',
  benefitsText: '',
};

const splitTextList = (value) =>
  String(value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const buildLocalDateTime = (value) => (
  value ? `${value}:00` : undefined
);

const createReviewErrors = (form) => {
  const errors = {};

  if (!form.title.trim()) errors.title = 'Title is required';
  if (!form.shortDescription.trim()) {
    errors.shortDescription = 'Short description is required';
  }
  if (!form.category) errors.category = 'Category is required';
  if (!form.description.trim()) errors.description = 'Description is required';
  if (!form.startDate) errors.startDate = 'Start date is required';
  if (!form.startTime) errors.startTime = 'Start time is required';
  if (!form.endDate) errors.endDate = 'End date is required';
  if (!form.endTime) errors.endTime = 'End time is required';
  if (['physical', 'hybrid'].includes(form.locationType) && !form.venueName.trim()) {
    errors.venueName = 'Venue name is required';
  }
  if (['online', 'hybrid'].includes(form.locationType) && !form.onlineLink.trim()) {
    errors.onlineLink = 'Online event link is required';
  }
  if ((form.doorsOpenDate && !form.doorsOpenTime) || (!form.doorsOpenDate && form.doorsOpenTime)) {
    errors.doorsOpenTime = 'Doors open date and time must both be set';
  }

  if (!form.tickets.length) {
    errors.tickets = 'At least one ticket type is required';
  } else if (form.tickets.some((ticket) => !ticket.name.trim() || !ticket.quantity)) {
    errors.tickets = 'Each ticket needs a name and quantity';
  } else if (
    !form.isFree &&
    form.tickets.some((ticket) => ticket.price === '')
  ) {
    errors.tickets = 'Each paid ticket needs a price';
  } else if (
    form.tickets.some((ticket) =>
      ticket.minPerOrder
      && ticket.maxPerOrder
      && Number.parseInt(ticket.minPerOrder, 10) > Number.parseInt(ticket.maxPerOrder, 10),
    )
  ) {
    errors.tickets = 'Ticket minimum per order cannot be greater than the maximum';
  } else if (
    form.tickets.some((ticket) =>
      ticket.salesStart
      && ticket.salesEnd
      && new Date(`${ticket.salesEnd}:00`) <= new Date(`${ticket.salesStart}:00`),
    )
  ) {
    errors.tickets = 'Ticket sales end must be after sales start';
  }

  if (
    form.startDate && form.startTime && form.endDate && form.endTime
    && new Date(`${form.endDate}T${form.endTime}:00`) <= new Date(`${form.startDate}T${form.startTime}:00`)
  ) {
    errors.endTime = 'End date/time must be after start date/time';
  }

  if (
    form.doorsOpenDate
    && form.doorsOpenTime
    && form.startDate
    && form.startTime
    && new Date(`${form.doorsOpenDate}T${form.doorsOpenTime}:00`) > new Date(`${form.startDate}T${form.startTime}:00`)
  ) {
    errors.doorsOpenTime = 'Doors open must be before the event starts';
  }

  return errors;
};

const createDraftErrors = (form) => {
  const errors = {};

  if (!form.title.trim()) errors.title = 'Title is required to save a draft';

  if ((form.startDate && !form.startTime) || (!form.startDate && form.startTime)) {
    errors.startTime = 'Start date and time must both be set';
  }

  if ((form.endDate && !form.endTime) || (!form.endDate && form.endTime)) {
    errors.endTime = 'End date and time must both be set';
  }

  if ((form.doorsOpenDate && !form.doorsOpenTime) || (!form.doorsOpenDate && form.doorsOpenTime)) {
    errors.doorsOpenTime = 'Doors open date and time must both be set';
  }

  if (
    form.startDate && form.startTime && form.endDate && form.endTime
    && new Date(`${form.endDate}T${form.endTime}:00`) <= new Date(`${form.startDate}T${form.startTime}:00`)
  ) {
    errors.endTime = 'End date/time must be after start date/time';
  }

  if (
    form.doorsOpenDate
    && form.doorsOpenTime
    && form.startDate
    && form.startTime
    && new Date(`${form.doorsOpenDate}T${form.doorsOpenTime}:00`) > new Date(`${form.startDate}T${form.startTime}:00`)
  ) {
    errors.doorsOpenTime = 'Doors open must be before the event starts';
  }

  return errors;
};

const buildDateTime = (date, time) => (
  date && time ? `${date}T${time}:00` : undefined
);

const buildLocationPayload = (form, status) => {
  const hasPhysicalLocation = [
    form.venueName,
    form.venueAddress,
    form.venueCity,
    form.venueState,
    form.venueCountry,
    form.venueZip,
  ].some((value) => value?.trim());

  const hasOnlineLocation = [
    form.onlineLink,
    form.onlinePlatform,
    form.streamPassword,
  ].some((value) => value?.trim());

  if (!hasPhysicalLocation && !hasOnlineLocation && status === 'draft') {
    return undefined;
  }

  const latitude = Number.parseFloat(form.venueLat);
  const longitude = Number.parseFloat(form.venueLng);

  return {
    type: form.locationType,
    name: ['physical', 'hybrid'].includes(form.locationType)
      ? form.venueName.trim() || undefined
      : undefined,
    address: ['physical', 'hybrid'].includes(form.locationType)
      ? form.venueAddress.trim() || undefined
      : undefined,
    city: ['physical', 'hybrid'].includes(form.locationType)
      ? form.venueCity.trim() || undefined
      : undefined,
    state: ['physical', 'hybrid'].includes(form.locationType)
      ? form.venueState.trim() || undefined
      : undefined,
    country: ['physical', 'hybrid'].includes(form.locationType)
      ? form.venueCountry.trim() || undefined
      : undefined,
    zip: ['physical', 'hybrid'].includes(form.locationType)
      ? form.venueZip.trim() || undefined
      : undefined,
    coordinates:
      ['physical', 'hybrid'].includes(form.locationType)
      && Number.isFinite(latitude)
      && Number.isFinite(longitude)
        ? {
            type: 'Point',
            coordinates: [longitude, latitude],
          }
        : undefined,
    onlineUrl: ['online', 'hybrid'].includes(form.locationType)
      ? form.onlineLink.trim() || undefined
      : undefined,
    onlinePlatform: ['online', 'hybrid'].includes(form.locationType)
      ? form.onlinePlatform.trim() || undefined
      : undefined,
    streamPassword: ['online', 'hybrid'].includes(form.locationType)
      ? form.streamPassword.trim() || undefined
      : undefined,
  };
};

const buildEventPayload = (form, status) => ({
  title: form.title.trim(),
  shortDescription: form.shortDescription.trim() || undefined,
  description: form.description.trim() || undefined,
  category: form.category || undefined,
  subcategory: form.subcategory || undefined,
  startDate: buildDateTime(form.startDate, form.startTime),
  endDate: buildDateTime(form.endDate, form.endTime),
  timezone: form.timezone,
  doorsOpen: buildDateTime(form.doorsOpenDate, form.doorsOpenTime),
  location: buildLocationPayload(form, status),
  ageRestriction: form.ageRestriction,
  isFree: form.isFree,
  currency: form.currency,
  visibility: form.visibility,
  requiresApproval: form.requiresApproval,
  videoUrl: form.videoUrl.trim() || undefined,
  refundPolicy: form.hasRefundPolicy
    ? {
        allowRefunds: form.allowRefunds,
        cutoffHours: Number.parseInt(form.refundCutoffHours || '0', 10),
        percentageBack: Number.parseInt(form.refundPercentageBack || '0', 10),
        notes: form.refundNotes.trim() || undefined,
      }
    : undefined,
  termsAndConditions: form.termsAndConditions.trim() || undefined,
  dressCode: form.dressCode.trim() || undefined,
  accessibilityInfo: form.accessibilityInfo.trim() || undefined,
  seo:
    form.seoMetaTitle.trim()
    || form.seoMetaDescription.trim()
    || form.seoKeywordsText.trim()
    || form.seoCanonicalUrl.trim()
    || form.seoOgImage.trim()
      ? {
          metaTitle: form.seoMetaTitle.trim() || undefined,
          metaDescription: form.seoMetaDescription.trim() || undefined,
          keywords: splitTextList(form.seoKeywordsText),
          canonicalUrl: form.seoCanonicalUrl.trim() || undefined,
          ogImage: form.seoOgImage.trim() || undefined,
        }
      : undefined,
  status,
});

const getReviewTicketPayloads = (form) => (
  form.tickets.map((ticket) => ({
        name: ticket.name.trim(),
        type: ticket.type,
        price: form.isFree ? 0 : Number.parseFloat(ticket.price),
        quantity: Number.parseInt(ticket.quantity, 10),
        description: ticket.description || undefined,
        salesStart: buildLocalDateTime(ticket.salesStart),
        salesEnd: buildLocalDateTime(ticket.salesEnd),
        minPerOrder: Number.parseInt(ticket.minPerOrder || '1', 10),
        maxPerOrder: Number.parseInt(ticket.maxPerOrder || '10', 10),
        benefits: splitTextList(ticket.benefitsText),
        isActive: true,
      }))
);

const getDraftTicketPayloads = (form) => {
  return form.tickets
    .filter((ticket) => ticket.name.trim() && ticket.quantity && (form.isFree || ticket.price !== ''))
    .map((ticket) => ({
      name: ticket.name.trim(),
      type: ticket.type,
      price: form.isFree ? 0 : Number.parseFloat(ticket.price),
      quantity: Number.parseInt(ticket.quantity, 10),
      description: ticket.description || undefined,
      salesStart: buildLocalDateTime(ticket.salesStart),
      salesEnd: buildLocalDateTime(ticket.salesEnd),
      minPerOrder: Number.parseInt(ticket.minPerOrder || '1', 10),
      maxPerOrder: Number.parseInt(ticket.maxPerOrder || '10', 10),
      benefits: splitTextList(ticket.benefitsText),
      isActive: true,
    }));
};

const CreateEventPage = () => {
  const navigate = useNavigate();
  const eventImages = useEventImages();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savingMode, setSavingMode] = useState('');
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    subcategory: '',
    visibility: 'public',
    locationType: 'physical',
    ageRestriction: 'all',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: 'Asia/Dhaka',
    doorsOpenDate: '',
    doorsOpenTime: '',
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueState: '',
    venueCountry: 'Bangladesh',
    venueZip: '',
    venueLat: '',
    venueLng: '',
    onlineLink: '',
    onlinePlatform: '',
    streamPassword: '',
    requiresApproval: false,
    accessibilityInfo: '',
    dressCode: '',
    isFree: false,
    currency: 'BDT',
    tickets: [{ ...EMPTY_TICKET, name: 'General Admission' }],
    coverImage: '',
    galleryImagesText: '',
    videoUrl: '',
    hasRefundPolicy: false,
    allowRefunds: true,
    refundCutoffHours: '24',
    refundPercentageBack: '100',
    refundNotes: '',
    termsAndConditions: '',
    seoMetaTitle: '',
    seoMetaDescription: '',
    seoKeywordsText: '',
    seoCanonicalUrl: '',
    seoOgImage: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
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

    fetchCategories();
  }, []);

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

  const setValue = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const validateCurrentStep = () => {
    const nextErrors = createReviewErrors(form);
    const scopedErrors = {};

    if (step === 0) {
      ['title', 'shortDescription', 'category', 'description'].forEach((key) => {
        if (nextErrors[key]) scopedErrors[key] = nextErrors[key];
      });
    }

    if (step === 1) {
      ['startDate', 'startTime', 'endDate', 'endTime', 'venueName', 'onlineLink', 'doorsOpenTime'].forEach(
        (key) => {
          if (nextErrors[key]) scopedErrors[key] = nextErrors[key];
        },
      );
    }

    if (step === 2 && nextErrors.tickets) {
      scopedErrors.tickets = nextErrors.tickets;
    }

    setErrors(scopedErrors);
    return Object.keys(scopedErrors).length === 0;
  };

  const validateForReview = () => {
    const nextErrors = createReviewErrors(form);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateForDraft = () => {
    const nextErrors = createDraftErrors(form);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const next = () => {
    if (validateCurrentStep()) {
      setStep((current) => Math.min(STEPS.length - 1, current + 1));
    }
  };

  const back = () => setStep((current) => Math.max(0, current - 1));

  const addTicket = () =>
    setForm((current) => ({
      ...current,
      tickets: [...current.tickets, { ...EMPTY_TICKET }],
    }));

  const removeTicket = (index) =>
    setForm((current) => ({
      ...current,
      tickets: current.tickets.filter((_, ticketIndex) => ticketIndex !== index),
    }));

  const updateTicket = (index, key, value) =>
    setForm((current) => ({
      ...current,
      tickets: current.tickets.map((ticket, ticketIndex) =>
        ticketIndex === index ? { ...ticket, [key]: value } : ticket,
      ),
    }));

  const handleSaveDraft = async () => {
    if (!validateForDraft()) return;

    setSaving(true);
    setSavingMode('draft');

    try {
      const createdEvent = await eventsService.createEvent(buildEventPayload(form, 'draft'));
      const eventKey = createdEvent?.slug || createdEvent?._id;
      const ticketPayloads = getDraftTicketPayloads(form);
      let ticketError = null;
      let imageError = null;

      if (eventKey && ticketPayloads.length) {
        try {
          await Promise.all(
            ticketPayloads.map((ticket) =>
              eventsService.createTicketType(eventKey, ticket),
            ),
          );
        } catch (nextTicketError) {
          ticketError = nextTicketError;
        }
      }

      if (eventKey) {
        try {
          await eventImages.saveImages(eventKey);
        } catch (nextImageError) {
          imageError = nextImageError;
        }
      }

      if (ticketError || imageError) {
        const issues = [
          ticketError ? `ticket setup: ${getApiErrorMessage(ticketError, 'finish it in the event editor')}` : null,
          imageError ? `image sync: ${getApiErrorMessage(imageError, 'finish it in the event editor')}` : null,
        ]
          .filter(Boolean)
          .join(' · ');

        toast.error(`Draft saved, but ${issues}.`);
        navigate(ROUTES.ORGANIZER.EDIT_EVENT(eventKey));
        return;
      }

      toast.success('Draft saved successfully');
      navigate(ROUTES.ORGANIZER.EDIT_EVENT(eventKey));
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save draft'));
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
      const createdEvent = await eventsService.createEvent(buildEventPayload(form, 'pending'));

      const eventKey = createdEvent?.slug || createdEvent?._id;
      const ticketPayloads = getReviewTicketPayloads(form);
      let ticketError = null;
      let imageError = null;

      if (ticketPayloads.length) {
        try {
          await Promise.all(
            ticketPayloads.map((ticket) =>
              eventsService.createTicketType(eventKey, ticket),
            ),
          );
        } catch (nextTicketError) {
          ticketError = nextTicketError;
        }
      }

      if (eventKey) {
        try {
          await eventImages.saveImages(eventKey);
        } catch (nextImageError) {
          imageError = nextImageError;
        }
      }

      if (ticketError || imageError) {
        const issues = [
          ticketError
            ? `ticket setup: ${getApiErrorMessage(
                ticketError,
                'finish it from the event editor',
              )}`
            : null,
          imageError
            ? `image sync: ${getApiErrorMessage(
                imageError,
                'finish it from the event editor',
              )}`
            : null,
        ]
          .filter(Boolean)
          .join(' · ');

        toast.error(`Event created, but ${issues}.`);
        navigate(ROUTES.ORGANIZER.EDIT_EVENT(eventKey));
        return;
      }

      toast.success('Event submitted for review');
      navigate(ROUTES.ORGANIZER.EVENTS);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create event'));
    } finally {
      setSaving(false);
      setSavingMode('');
    }
  };

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
        <PageHeader
          title="Create Event"
          subtitle="Fill in the details for your new event"
          className="mb-0"
        />
      </div>

      <StepIndicator steps={STEPS} current={step} />

      <Card>
        <CardContent className="p-6 space-y-5">
          {step === 0 && (
            <>
              <Field label="Event Title" required error={errors.title}>
                <Input
                  value={form.title}
                  onChange={(event) => setValue('title', event.target.value)}
                  placeholder="e.g. Summer Music Festival 2026"
                  className={inputCls}
                />
              </Field>
              <Field
                label="Short Description"
                required
                error={errors.shortDescription}
                hint="Use this as the one-line summary on browse cards and event previews."
              >
                <Textarea
                  value={form.shortDescription}
                  onChange={(event) =>
                    setValue('shortDescription', event.target.value)
                  }
                  placeholder="A clean one- or two-sentence summary that makes people want to click."
                  rows={3}
                  className="text-sm resize-none"
                />
              </Field>
              <Field
                label="Description"
                required
                error={errors.description}
                hint="Describe what attendees can expect."
              >
                <Textarea
                  value={form.description}
                  onChange={(event) =>
                    setValue('description', event.target.value)
                  }
                  placeholder="Tell people about your event..."
                  rows={5}
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
                    <SelectTrigger className={inputCls}>
                      <SelectValue
                        placeholder={
                          taxonomyLoading ? 'Loading categories...' : 'Select category'
                        }
                      />
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
                    onValueChange={(value) =>
                      setValue('subcategory', value === 'none' ? '' : value)
                    }
                    disabled={!form.category}
                  >
                    <SelectTrigger className={inputCls}>
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
              <Field
                label="Visibility"
                hint="Public events appear in browse. Unlisted events are link-only. Private events are invite-focused."
              >
                <Select
                  value={form.visibility}
                  onValueChange={(value) => setValue('visibility', value)}
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISIBILITY_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Age Restriction">
                <Select
                  value={form.ageRestriction}
                  onValueChange={(value) => setValue('ageRestriction', value)}
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    <SelectItem value="teen">13+</SelectItem>
                    <SelectItem value="adult">18+</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start Date" required error={errors.startDate}>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setValue('startDate', event.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Start Time" required error={errors.startTime}>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={(event) =>
                      setValue('startTime', event.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="End Date" required error={errors.endDate}>
                  <Input
                    type="date"
                    value={form.endDate}
                    onChange={(event) => setValue('endDate', event.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="End Time" required error={errors.endTime}>
                  <Input
                    type="time"
                    value={form.endTime}
                    onChange={(event) => setValue('endTime', event.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Timezone">
                <Select
                  value={form.timezone}
                  onValueChange={(value) => setValue('timezone', value)}
                >
                  <SelectTrigger className={inputCls}>
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
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Doors Open Date"
                  hint="Optional. Useful for venue entry or early access."
                >
                  <Input
                    type="date"
                    value={form.doorsOpenDate}
                    onChange={(event) =>
                      setValue('doorsOpenDate', event.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Doors Open Time" error={errors.doorsOpenTime}>
                  <Input
                    type="time"
                    value={form.doorsOpenTime}
                    onChange={(event) =>
                      setValue('doorsOpenTime', event.target.value)
                    }
                    className={inputCls}
                  />
                </Field>
              </div>
              <Separator />
              <Field
                label="Location Type"
                hint="Choose physical, online, or hybrid so the event can display the right access details."
              >
                <Select
                  value={form.locationType}
                  onValueChange={(value) => setValue('locationType', value)}
                >
                  <SelectTrigger className={inputCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {['physical', 'hybrid'].includes(form.locationType) && (
                <>
                  <Field label="Venue Name" required error={errors.venueName}>
                    <Input
                      value={form.venueName}
                      onChange={(event) =>
                        setValue('venueName', event.target.value)
                      }
                      placeholder="e.g. Convention Center"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Street Address">
                    <Input
                      value={form.venueAddress}
                      onChange={(event) =>
                        setValue('venueAddress', event.target.value)
                      }
                      placeholder="123 Main Street"
                      className={inputCls}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="City">
                      <Input
                        value={form.venueCity}
                        onChange={(event) =>
                          setValue('venueCity', event.target.value)
                        }
                        placeholder="Dhaka"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="State / Region">
                      <Input
                        value={form.venueState}
                        onChange={(event) =>
                          setValue('venueState', event.target.value)
                        }
                        placeholder="Dhaka Division"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Country">
                      <Input
                        value={form.venueCountry}
                        onChange={(event) =>
                          setValue('venueCountry', event.target.value)
                        }
                        placeholder="Bangladesh"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Postal Code">
                      <Input
                        value={form.venueZip}
                        onChange={(event) =>
                          setValue('venueZip', event.target.value)
                        }
                        placeholder="1207"
                        className={inputCls}
                      />
                    </Field>
                    <div />
                    <Field
                      label="Latitude"
                      hint="Optional. Add coordinates for accurate mapping."
                    >
                      <Input
                        value={form.venueLat}
                        onChange={(event) =>
                          setValue('venueLat', event.target.value)
                        }
                        placeholder="23.777176"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Longitude">
                      <Input
                        value={form.venueLng}
                        onChange={(event) =>
                          setValue('venueLng', event.target.value)
                        }
                        placeholder="90.399452"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </>
              )}
              {['online', 'hybrid'].includes(form.locationType) && (
                <>
                  <Separator />
                  <Field
                    label="Online Event Link"
                    error={errors.onlineLink}
                    hint="Zoom, Google Meet, YouTube Live, or another event URL."
                  >
                    <Input
                      value={form.onlineLink}
                      onChange={(event) =>
                        setValue('onlineLink', event.target.value)
                      }
                      placeholder="https://..."
                      className={inputCls}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Platform">
                      <Input
                        value={form.onlinePlatform}
                        onChange={(event) =>
                          setValue('onlinePlatform', event.target.value)
                        }
                        placeholder="Zoom"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Access Password">
                      <Input
                        value={form.streamPassword}
                        onChange={(event) =>
                          setValue('streamPassword', event.target.value)
                        }
                        placeholder="Optional"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Manual Approval</p>
                  <p className="text-xs text-muted-foreground">
                    Hold registrations for organizer approval before attendance is confirmed.
                  </p>
                </div>
                <Switch
                  checked={form.requiresApproval}
                  onCheckedChange={(value) => setValue('requiresApproval', value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Accessibility Info"
                  hint="Share wheelchair access, elevators, seating support, or other entry notes."
                >
                  <Textarea
                    value={form.accessibilityInfo}
                    onChange={(event) =>
                      setValue('accessibilityInfo', event.target.value)
                    }
                    rows={4}
                    className="text-sm resize-none"
                    placeholder="Accessible entrance at Gate 2, elevator access available."
                  />
                </Field>
                <Field
                  label="Dress Code"
                  hint="Optional. Add clear guidance if the event has an expected dress style."
                >
                  <Textarea
                    value={form.dressCode}
                    onChange={(event) =>
                      setValue('dressCode', event.target.value)
                    }
                    rows={4}
                    className="text-sm resize-none"
                    placeholder="Business casual"
                  />
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Currency">
                  <Select
                    value={form.currency}
                    onValueChange={(value) => setValue('currency', value)}
                  >
                    <SelectTrigger className={inputCls}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Free Event</p>
                    <p className="text-xs text-muted-foreground">
                      Switch on for a free registration flow
                    </p>
                  </div>
                  <Switch
                    checked={form.isFree}
                    onCheckedChange={(value) => setValue('isFree', value)}
                  />
                </div>
              </div>

              {errors.tickets && (
                <p className="text-xs text-destructive">{errors.tickets}</p>
              )}

              <div className="space-y-4">
                {form.tickets.map((ticket, index) => (
                  <div
                    key={`${ticket.name}-${index}`}
                    className="border border-border rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">
                        Ticket {index + 1}
                      </p>
                      {form.tickets.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-500"
                          onClick={() => removeTicket(index)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Ticket Name">
                        <Input
                          value={ticket.name}
                          onChange={(event) =>
                            updateTicket(index, 'name', event.target.value)
                          }
                          placeholder="General, VIP..."
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Type">
                        <Select
                          value={ticket.type}
                          onValueChange={(value) =>
                            updateTicket(index, 'type', value)
                          }
                        >
                          <SelectTrigger className={inputCls}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TICKET_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>
                    {!form.isFree ? (
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Price">
                          <Input
                            type="number"
                            value={ticket.price}
                            onChange={(event) =>
                              updateTicket(index, 'price', event.target.value)
                            }
                            placeholder="0.00"
                            className={inputCls}
                            min="0"
                            step="0.01"
                          />
                        </Field>
                        <Field label="Quantity">
                          <Input
                            type="number"
                            value={ticket.quantity}
                            onChange={(event) =>
                              updateTicket(index, 'quantity', event.target.value)
                            }
                            placeholder="100"
                            className={inputCls}
                            min="1"
                          />
                        </Field>
                      </div>
                    ) : (
                      <Field label="Max Capacity">
                        <Input
                          type="number"
                          value={ticket.quantity}
                          onChange={(event) =>
                            updateTicket(index, 'quantity', event.target.value)
                          }
                          placeholder="100"
                          className={inputCls}
                          min="1"
                        />
                      </Field>
                    )}
                    <Field label="Description" hint="Optional buyer-facing copy">
                      <Input
                        value={ticket.description}
                        onChange={(event) =>
                          updateTicket(index, 'description', event.target.value)
                        }
                        placeholder="What's included..."
                        className={inputCls}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Sales Start">
                        <Input
                          type="datetime-local"
                          value={ticket.salesStart}
                          onChange={(event) =>
                            updateTicket(index, 'salesStart', event.target.value)
                          }
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Sales End">
                        <Input
                          type="datetime-local"
                          value={ticket.salesEnd}
                          onChange={(event) =>
                            updateTicket(index, 'salesEnd', event.target.value)
                          }
                          className={inputCls}
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Min Per Order">
                        <Input
                          type="number"
                          value={ticket.minPerOrder}
                          onChange={(event) =>
                            updateTicket(index, 'minPerOrder', event.target.value)
                          }
                          placeholder="1"
                          className={inputCls}
                          min="1"
                        />
                      </Field>
                      <Field label="Max Per Order">
                        <Input
                          type="number"
                          value={ticket.maxPerOrder}
                          onChange={(event) =>
                            updateTicket(index, 'maxPerOrder', event.target.value)
                          }
                          placeholder="10"
                          className={inputCls}
                          min="1"
                        />
                      </Field>
                    </div>
                    <Field
                      label="Benefits"
                      hint="Comma-separated or one per line, for example: priority entry, reserved seating"
                    >
                      <Textarea
                        value={ticket.benefitsText}
                        onChange={(event) =>
                          updateTicket(index, 'benefitsText', event.target.value)
                        }
                        rows={3}
                        className="text-sm resize-none"
                        placeholder="Priority entry, welcome kit"
                      />
                    </Field>
                  </div>
                ))}

                <Button variant="outline" className="w-full h-9" onClick={addTicket}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Ticket Type
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <ImagePicker imageState={eventImages} disabled={saving} />
              <Field
                label="Promo Video URL"
                hint="Optional YouTube, Vimeo, or hosted video link."
              >
                <Input
                  value={form.videoUrl}
                  onChange={(event) =>
                    setValue('videoUrl', event.target.value)
                  }
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>
              <Separator />
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Refund Policy</p>
                  <p className="text-xs text-muted-foreground">
                    Turn this on if you want buyer-facing refund rules on the event page.
                  </p>
                </div>
                <Switch
                  checked={form.hasRefundPolicy}
                  onCheckedChange={(value) => setValue('hasRefundPolicy', value)}
                />
              </div>
              {form.hasRefundPolicy && (
                <div className="space-y-4 rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Allow Refunds</p>
                      <p className="text-xs text-muted-foreground">
                        Switch off if the event is fully non-refundable.
                      </p>
                    </div>
                    <Switch
                      checked={form.allowRefunds}
                      onCheckedChange={(value) => setValue('allowRefunds', value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Refund Cutoff (Hours)">
                      <Input
                        type="number"
                        value={form.refundCutoffHours}
                        onChange={(event) =>
                          setValue('refundCutoffHours', event.target.value)
                        }
                        className={inputCls}
                        min="0"
                      />
                    </Field>
                    <Field label="Refund Percentage">
                      <Input
                        type="number"
                        value={form.refundPercentageBack}
                        onChange={(event) =>
                          setValue('refundPercentageBack', event.target.value)
                        }
                        className={inputCls}
                        min="0"
                        max="100"
                      />
                    </Field>
                  </div>
                  <Field label="Refund Notes">
                    <Textarea
                      value={form.refundNotes}
                      onChange={(event) =>
                        setValue('refundNotes', event.target.value)
                      }
                      rows={3}
                      className="text-sm resize-none"
                      placeholder="Refunds available up to 48 hours before event start."
                    />
                  </Field>
                </div>
              )}
              <Field
                label="Terms & Conditions"
                hint="Optional buyer-facing terms, photo policy, prohibited items, or entry rules."
              >
                <Textarea
                  value={form.termsAndConditions}
                  onChange={(event) =>
                    setValue('termsAndConditions', event.target.value)
                  }
                  rows={4}
                  className="text-sm resize-none"
                  placeholder="Tickets are non-transferable. Entry may be denied for prohibited items or disruptive behavior."
                />
              </Field>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="SEO Meta Title"
                  hint="Optional search title, usually under 70 characters."
                >
                  <Input
                    value={form.seoMetaTitle}
                    onChange={(event) =>
                      setValue('seoMetaTitle', event.target.value)
                    }
                    placeholder="Dhaka Design Summit 2026 | TicketBro"
                    className={inputCls}
                  />
                </Field>
                <Field
                  label="SEO Meta Description"
                  hint="Optional description for search and social previews."
                >
                  <Textarea
                    value={form.seoMetaDescription}
                    onChange={(event) =>
                      setValue('seoMetaDescription', event.target.value)
                    }
                    rows={3}
                    className="text-sm resize-none"
                    placeholder="Two days of talks, workshops, and networking with designers and founders."
                  />
                </Field>
                <Field
                  label="SEO Keywords"
                  hint="Comma-separated keywords."
                >
                  <Input
                    value={form.seoKeywordsText}
                    onChange={(event) =>
                      setValue('seoKeywordsText', event.target.value)
                    }
                    placeholder="design summit, startup event, UX conference"
                    className={inputCls}
                  />
                </Field>
                <Field label="Canonical URL">
                  <Input
                    value={form.seoCanonicalUrl}
                    onChange={(event) =>
                      setValue('seoCanonicalUrl', event.target.value)
                    }
                    placeholder="https://..."
                    className={inputCls}
                  />
                </Field>
                <Field label="Open Graph Image URL">
                  <Input
                    value={form.seoOgImage}
                    onChange={(event) =>
                      setValue('seoOgImage', event.target.value)
                    }
                    placeholder="https://..."
                    className={inputCls}
                  />
                </Field>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-bold font-heading mb-1">
                  Ready to submit?
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Save as Draft if you want to keep editing. Submit for Review to
                  move the event into the organizer approval flow with a richer, buyer-facing listing.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={saving}
          className="flex-1 font-semibold min-w-[160px]"
        >
          {saving && savingMode === 'draft' ? (
            <>
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Saving Draft...
            </>
          ) : (
            'Save as Draft'
          )}
        </Button>
        {step > 0 && (
          <Button variant="outline" onClick={back} className="flex-1 font-semibold min-w-[140px]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={next} className="flex-1 font-bold min-w-[160px]">
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmitForReview}
            disabled={saving}
            className="flex-1 font-bold min-w-[180px]"
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
    </div>
  );
};

export default CreateEventPage;
