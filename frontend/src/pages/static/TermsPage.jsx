// pages/static/TermsPage.jsx
import React from 'react';
import Container from '@/components/layout/Container';

const Section = ({ title, children }) => (
  <div className="space-y-2">
    <h2 className="text-base font-bold font-heading">{title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </div>
);

const TermsPage = () => (
  <Container aria-label="Terms of service"><div className="py-6 max-w-2xl mx-auto space-y-8 font-sans">
    <div>
      <h1 className="text-2xl font-extrabold font-heading">Terms of Service</h1>
      <p className="text-xs text-muted-foreground mt-1">Last updated: March 12, 2026</p>
    </div>
    <Section title="1. Acceptance of Terms">
      <p>By accessing or using Ticket-Bro's services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.</p>
    </Section>
    <Section title="2. Use of Service">
      <p>You must be at least 13 years old to use our service. You are responsible for maintaining the security of your account and password. Ticket-Bro cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.</p>
    </Section>
    <Section title="3. Ticket Purchases">
      <p>All ticket sales are final unless the event is cancelled or rescheduled by the organizer. Refund eligibility is determined by our refund policy: 90% refund if cancelled 7+ days before the event, 50% refund if cancelled 2-7 days before, and no refund within 48 hours.</p>
    </Section>
    <Section title="4. Organizer Responsibilities">
      <p>Event organizers are solely responsible for the events they list on Ticket-Bro. Organizers must provide accurate event information, deliver the promised event experience, and handle refunds for cancelled events in accordance with our policy.</p>
    </Section>
    <Section title="5. Prohibited Activities">
      <p>You agree not to: (a) use the service for any illegal purpose; (b) attempt to resell tickets above face value without authorization; (c) create multiple accounts to circumvent purchase limits; (d) interfere with the proper functioning of the service.</p>
    </Section>
    <Section title="6. Fees and Payments">
      <p>Ticket-Bro charges a 5% service fee on all ticket transactions. This fee is non-refundable except in cases of event cancellation. Payment processing fees may apply depending on the payment method used.</p>
    </Section>
    <Section title="7. Limitation of Liability">
      <p>Ticket-Bro shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service, including but not limited to lost profits, lost data, or business interruption.</p>
    </Section>
    <Section title="8. Governing Law">
      <p>These terms shall be governed by and construed in accordance with the laws of the People's Republic of Bangladesh, without regard to its conflict of law provisions.</p>
    </Section>
    <Section title="9. Contact">
      <p>For questions about these Terms, contact us at legal@ticketbro.com.bd.</p>
    </Section>
  </div></Container>
);

export default TermsPage;
