// pages/static/FAQPage.jsx
import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const FAQS = [
  { q: 'How do I purchase a ticket?', a: 'Browse events, select the event you want to attend, choose your ticket type and quantity, then proceed to checkout. You can pay via card or mobile banking.' },
  { q: 'Can I cancel or refund my ticket?', a: 'Yes. You can cancel your booking up to 2 days before the event for a partial refund, or 7+ days before for a 90% refund. No refunds are given within 48 hours of the event.' },
  { q: 'How will I receive my tickets?', a: 'Tickets are emailed to you immediately after purchase. You can also view and download them from the "My Bookings" section in your account.' },
  { q: 'What payment methods are accepted?', a: 'We accept credit/debit cards (Visa, Mastercard), bKash, Nagad, Rocket, and bank transfers.' },
  { q: 'How do I become an event organizer?', a: 'Sign up for an account, go to Settings, and apply to become an organizer. We review applications within 1-2 business days.' },
  { q: 'What fees does Ticket-Bro charge?', a: 'Ticket-Bro charges a 5% service fee on each ticket purchase. This covers payment processing and platform maintenance.' },
  { q: 'What if an event is cancelled?', a: 'If an event is cancelled by the organizer, you will automatically receive a full refund within 5-10 business days.' },
  { q: 'Can I transfer my ticket to someone else?', a: 'Ticket transfers are available for selected events. Check the event page or contact support to verify if transfer is allowed.' },
  { q: 'Is my payment information secure?', a: 'Absolutely. All transactions are encrypted with SSL and we do not store card details. Payments are processed through certified payment gateways.' },
  { q: 'How do I contact the event organizer?', a: 'You can message the organizer directly through our in-app messaging system, accessible from the event page or your booking details.' },
];

const FAQPage = () => {
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = FAQS.filter((f) => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="content-shell" aria-label="FAQ"><div className="py-6 max-w-2xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold font-heading">Frequently Asked Questions</h1>
        <p className="text-sm text-muted-foreground mt-1">Find answers to common questions about Ticket-Bro.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search FAQs…" className="h-9 pl-9" />
      </div>

      <div className="space-y-2">
        {filtered.map((faq, i) => (
          <div key={i} className="border border-border rounded-2xl overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors" onClick={() => setOpen(open === i ? null : i)}>
              <span className="text-sm font-semibold pr-4">{faq.q}</span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && (
              <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No results found</p>}
      </div>
    </div></div>
  );
};

export default FAQPage;
