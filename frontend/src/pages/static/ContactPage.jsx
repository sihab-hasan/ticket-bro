// pages/static/ContactPage.jsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/shared/common';
import { supportService } from '@/api';
import { getApiErrorMessage } from '@/api/client';
import Container from '@/components/layout/Container';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', category: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) return toast.error('Please fill required fields');
    setSubmitting(true);
    try {
      await supportService.sendContactMessage(form);
      setSent(true);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to send message'));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) return (
    <Container className="py-6 flex flex-col items-center justify-center min-h-64 text-center space-y-3 font-sans">
      <CheckCircle2 className="h-12 w-12 text-green-500" />
      <h2 className="text-xl font-extrabold font-heading">Message Sent!</h2>
      <p className="text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>
    </Container>
  );

  return (
    <Container className="py-6 space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold font-heading">Contact Us</h1>
        <p className="text-sm text-muted-foreground mt-1">We're here to help. Reach out via any of the channels below.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Mail, label: 'Email', value: 'support@ticketbro.com.bd', color: 'bg-blue-500/10 text-blue-500' },
          { icon: Phone, label: 'Phone', value: '+880 1700-000000', color: 'bg-green-500/10 text-green-500' },
          { icon: MapPin, label: 'Office', value: 'Gulshan-2, Dhaka', color: 'bg-orange-500/10 text-orange-500' },
        ].map((c) => (
          <Card key={c.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}><c.icon className="h-4 w-4" /></div>
              <div><p className="text-xs text-muted-foreground">{c.label}</p><p className="text-sm font-semibold">{c.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-base font-bold font-heading flex items-center gap-2"><MessageSquare className="h-4 w-4" />Send a Message</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-semibold">Name *</Label><Input value={form.name} onChange={(e) => set('name', e.target.value)} className="mt-1.5 h-9" /></div>
            <div><Label className="text-xs font-semibold">Email *</Label><Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="mt-1.5 h-9" /></div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Category</Label>
            <Select value={form.category} onValueChange={(v) => set('category', v)}>
              <SelectTrigger className="mt-1.5 h-9"><SelectValue placeholder="Select topic" /></SelectTrigger>
              <SelectContent>
                {['Booking Issue', 'Payment Problem', 'Refund Request', 'Event Information', 'Account Issue', 'Other'].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="text-xs font-semibold">Subject</Label><Input value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="Brief description" className="mt-1.5 h-9" /></div>
          <div><Label className="text-xs font-semibold">Message *</Label><Textarea value={form.message} onChange={(e) => set('message', e.target.value)} placeholder="Describe your issue in detail…" rows={5} className="mt-1.5 text-sm resize-none" /></div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full font-bold">
            {submitting ? 'Sending…' : <><Send className="h-4 w-4 mr-2" />Send Message</>}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ContactPage;
