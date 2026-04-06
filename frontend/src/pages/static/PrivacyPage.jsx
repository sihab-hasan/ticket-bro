// pages/static/PrivacyPage.jsx
import React from 'react';
import Container from '@/components/layout/Container';

const Section = ({ title, children }) => (
  <div className="space-y-2">
    <h2 className="text-base font-bold font-heading">{title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </div>
);

export const PrivacyPage = () => (
  <Container aria-label="Privacy policy"><div className="py-6 max-w-2xl mx-auto space-y-8 font-sans">
    <div>
      <h1 className="text-2xl font-extrabold font-heading">Privacy Policy</h1>
      <p className="text-xs text-muted-foreground mt-1">Last updated: March 12, 2026</p>
    </div>
    <Section title="1. Information We Collect">
      <p>We collect information you provide directly to us, such as when you create an account, book tickets, or contact us for support. This includes your name, email address, phone number, and payment information.</p>
      <p>We also collect information automatically when you use our services, including log data, device information, and usage statistics.</p>
    </Section>
    <Section title="2. How We Use Your Information">
      <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.</p>
    </Section>
    <Section title="3. Information Sharing">
      <p>We do not sell your personal information. We may share your information with event organizers to fulfill your booking, with payment processors to complete transactions, and with service providers who assist in our operations.</p>
    </Section>
    <Section title="4. Data Security">
      <p>We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. All data is encrypted in transit using SSL/TLS.</p>
    </Section>
    <Section title="5. Cookies">
      <p>We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
    </Section>
    <Section title="6. Your Rights">
      <p>You have the right to access, update, or delete your personal information at any time through your account settings or by contacting us directly at privacy@ticketbro.com.bd.</p>
    </Section>
    <Section title="7. Contact Us">
      <p>If you have any questions about this Privacy Policy, please contact us at privacy@ticketbro.com.bd or write to us at our registered office in Dhaka, Bangladesh.</p>
    </Section>
  </div></Container>
);

export default PrivacyPage;
