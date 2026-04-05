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
import { toast } from '@/components/shared/common';
import { ROUTES } from '@/config/routes.config';

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
const STEPS = ['Basic Info', 'Date & Venue', 'Tickets', 'Media & Publish'];
const TICKET_TYPES = ['general', 'vip', 'early_bird', 'group', 'backstage', 'online'];

const EMPTY_TICKET = {
  name: '',
  price: '',
  quantity: '',
  description: '',
  type: 'general',
};

const createReviewErrors = (form) => {
  const errors = {};

  if (!form.title.trim()) errors.title = 'Title is required';
  if (!form.category) errors.category = 'Category is required';
  if (!form.description.trim()) errors.description = 'Description is required';
  if (!form.startDate) errors.startDate = 'Start date is required';
  if (!form.startTime) errors.startTime = 'Start time is required';
  if (!form.endDate) errors.endDate = 'End date is required';
  if (!form.endTime) errors.endTime = 'End time is required';
  if (!form.isOnline && !form.venueName.trim()) {
    errors.venueName = 'Venue name is required';
  }
  if (form.isOnline && !form.onlineLink.trim()) {
    errors.onlineLink = 'Online event link is required';
  }

  if (!form.tickets.length) {
    errors.tickets = 'At least one ticket type is required';
  } else if (form.isFree) {
    if (!form.tickets[0]?.quantity) {
      errors.tickets = 'Capacity is required for free events';
    }
  } else if (
    form.tickets.some(
      (ticket) => !ticket.name.trim() || ticket.price === '' || !ticket.quantity,
    )
  ) {
    errors.tickets = 'Each ticket needs a name, price, and quantity';
  }

  if (
    form.startDate && form.startTime && form.endDate && form.endTime
    && new Date(`${form.endDate}T${form.endTime}:00`) <= new Date(`${form.startDate}T${form.startTime}:00`)
  ) {
    errors.endTime = 'End date/time must be after start date/time';
  }

  return errors;
};

const createDraftErrors = (form) => {
  const errors = {};

  if (!form.title.trim()) errors.title = 'Title is required to save a draft';
  if (!form.description.trim()) errors.description = 'Description is required to save a draft';
  if (!form.startDate) errors.startDate = 'Start date is required to save a draft';
  if (!form.startTime) errors.startTime = 'Start time is required to save a draft';
  if (!form.endDate) errors.endDate = 'End date is required to save a draft';
  if (!form.endTime) errors.endTime = 'End time is required to save a draft';

  if (
    form.startDate && form.startTime && form.endDate && form.endTime
    && new Date(`${form.endDate}T${form.endTime}:00`) <= new Date(`${form.startDate}T${form.startTime}:00`)
  ) {
    errors.endTime = 'End date/time must be after start date/time';
  }

  return errors;
};

const buildDateTime = (date, time) => (
  date && time ? `${date}T${time}:00` : undefined
);

const buildLocationPayload = (form, status) => {
  if (form.isOnline) {
    if (!form.onlineLink.trim() && status === 'draft') {
      return undefined;
    }

    return {
      type: 'online',
      onlineUrl: form.onlineLink.trim() || undefined,
    };
  }

  const hasPhysicalLocation = [
    form.venueName,
    form.venueAddress,
    form.venueCity,
    form.venueCountry,
  ].some((value) => value?.trim());

  if (!hasPhysicalLocation && status === 'draft') {
    return undefined;
  }

  return {
    type: 'physical',
    name: form.venueName.trim() || undefined,
    address: form.venueAddress.trim() || undefined,
    city: form.venueCity.trim() || undefined,
    country: form.venueCountry.trim() || undefined,
  };
};

const buildEventPayload = (form, status) => ({
  title: form.title.trim(),
  description: form.description.trim(),
  category: form.category || undefined,
  subcategory: form.subcategory || undefined,
  startDate: buildDateTime(form.startDate, form.startTime),
  endDate: buildDateTime(form.endDate, form.endTime),
  timezone: form.timezone,
  location: buildLocationPayload(form, status),
  ageRestriction: form.ageRestriction,
  isFree: form.isFree,
  coverImage: form.coverImage.trim() || undefined,
  status,
});

const getReviewTicketPayloads = (form) => (
  form.isFree
    ? [
        {
          name: form.tickets[0]?.name?.trim() || 'Free Admission',
          type: 'general',
          price: 0,
          quantity: Number.parseInt(form.tickets[0]?.quantity || '0', 10),
          description: form.tickets[0]?.description || undefined,
          isActive: true,
        },
      ]
    : form.tickets.map((ticket) => ({
        name: ticket.name.trim(),
        type: ticket.type,
        price: Number.parseFloat(ticket.price),
        quantity: Number.parseInt(ticket.quantity, 10),
        description: ticket.description || undefined,
        isActive: true,
      }))
);

const getDraftTicketPayloads = (form) => {
  if (form.isFree) {
    if (!form.tickets[0]?.quantity) return [];

    return [
      {
        name: form.tickets[0]?.name?.trim() || 'Free Admission',
        type: 'general',
        price: 0,
        quantity: Number.parseInt(form.tickets[0]?.quantity || '0', 10),
        description: form.tickets[0]?.description || undefined,
        isActive: true,
      },
    ];
  }

  return form.tickets
    .filter((ticket) => ticket.name.trim() && ticket.price !== '' && ticket.quantity)
    .map((ticket) => ({
      name: ticket.name.trim(),
      type: ticket.type,
      price: Number.parseFloat(ticket.price),
      quantity: Number.parseInt(ticket.quantity, 10),
      description: ticket.description || undefined,
      isActive: true,
    }));
};

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savingMode, setSavingMode] = useState('');
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [taxonomyLoading, setTaxonomyLoading] = useState(true);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    isOnline: false,
    ageRestriction: 'all',
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
    isFree: false,
    tickets: [{ ...EMPTY_TICKET, name: 'General Admission' }],
    coverImage: '',
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
      ['title', 'category', 'description'].forEach((key) => {
        if (nextErrors[key]) scopedErrors[key] = nextErrors[key];
      });
    }

    if (step === 1) {
      ['startDate', 'startTime', 'endDate', 'endTime', 'venueName'].forEach(
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

      if (eventKey && ticketPayloads.length) {
        try {
          await Promise.all(
            ticketPayloads.map((ticket) =>
              eventsService.createTicketType(eventKey, ticket),
            ),
          );
        } catch (ticketError) {
          toast.success('Draft saved. Finish ticket setup from the event editor.');
          navigate(ROUTES.ORGANIZER.EDIT_EVENT(eventKey));
          return;
        }
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

      try {
        await Promise.all(
          ticketPayloads.map((ticket) =>
            eventsService.createTicketType(eventKey, ticket),
          ),
        );
      } catch (ticketError) {
        toast.error(
          `Event created, but ticket setup failed: ${getApiErrorMessage(
            ticketError,
            'Please finish setup from the event editor',
          )}`,
        );
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
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Online Event</p>
                  <p className="text-xs text-muted-foreground">
                    This is a virtual or streamed event
                  </p>
                </div>
                <Switch
                  checked={form.isOnline}
                  onCheckedChange={(value) => setValue('isOnline', value)}
                />
              </div>
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
              <Separator />
              {form.isOnline ? (
                <Field
                  label="Online Event Link"
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
              ) : (
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
                </>
              )}
            </>
          )}

          {step === 2 && (
            <>
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
              <Field
                label="Cover Image URL"
                hint="Recommended: 1200x630px and optimized for the web"
              >
                <Input
                  value={form.coverImage}
                  onChange={(event) =>
                    setValue('coverImage', event.target.value)
                  }
                  placeholder="https://..."
                  className={inputCls}
                />
              </Field>
              {form.coverImage && (
                <img
                  src={form.coverImage}
                  alt="Cover preview"
                  className="w-full h-48 object-cover rounded-xl"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <Separator />
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-bold font-heading mb-1">
                  Ready to publish?
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Save as Draft if you want to keep editing. Submit for Review to
                  move the event into the organizer approval flow.
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
