// pages/static/AboutPage.jsx
import React from 'react';
import { Ticket, Users, Globe, Shield, Star, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/app/AppRoutes';
import Container from '@/components/layout/Container';

const StatBox = ({ value, label }) => (
  <div className="text-center">
    <p className="text-3xl font-extrabold font-heading text-primary">{value}</p>
    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
  </div>
);

const AboutPage = () => (
  <Container aria-label="About" className="font-sans">
    {/* Hero */}
    <div className="px-6 py-14 text-center bg-gradient-to-b from-primary/10 to-transparent">
      <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
        <Ticket className="h-7 w-7 text-black" />
      </div>
      <h1 className="text-3xl font-extrabold font-heading">About Ticket-Bro</h1>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
        Bangladesh's premier event ticketing platform. We connect event organizers with audiences across the country.
      </p>
    </div>

    <div className="px-6 pb-12 max-w-2xl mx-auto space-y-10">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 py-6 border-y border-border">
        <StatBox value="500K+" label="Tickets Sold" />
        <StatBox value="2,500+" label="Events Hosted" />
        <StatBox value="100K+" label="Happy Users" />
      </div>

      {/* Mission */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold font-heading">Our Mission</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          At Ticket-Bro, we believe every great experience deserves a great ticketing solution. We make it easy for organizers to sell tickets and for attendees to discover and book events they love.
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: Shield, title: 'Secure & Trusted', desc: 'End-to-end encrypted payments and verified organizers.' },
          { icon: Zap, title: 'Lightning Fast', desc: 'Book tickets in seconds with our streamlined checkout.' },
          { icon: Users, title: 'Community First', desc: 'Built for event lovers by event lovers in Bangladesh.' },
          { icon: Globe, title: 'Nationwide Coverage', desc: 'Events across all 64 districts of Bangladesh.' },
        ].map((v) => (
          <Card key={v.title}>
            <CardContent className="p-4 flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <v.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold">{v.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{v.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Link to={ROUTES.BROWSE.ROOT}><Button className="font-bold px-8">Explore Events</Button></Link>
      </div>
    </div>
  </Container>
);

export default AboutPage;
