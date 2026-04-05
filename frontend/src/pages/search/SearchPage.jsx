// pages/search/SearchPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, MapPin, Music, Briefcase, Gamepad2, Heart, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/app/AppRoutes';
import Container from '@/components/layout/Container';

const CATEGORIES = [
  { label: 'Music', icon: Music, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  { label: 'Tech', icon: Briefcase, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { label: 'Gaming', icon: Gamepad2, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  { label: 'Health', icon: Heart, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { label: 'Sports', icon: Star, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { label: 'Local', icon: MapPin, color: 'bg-primary/10 text-primary border-primary/20' },
];

const TRENDING = ['Dhaka Music Fest', 'React Bangladesh Meetup', 'Tech Summit 2026', 'Comedy Night Dhaka', 'Food Festival'];

const SearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const go = (q) => {
    if ((q || query).trim()) navigate(`${ROUTES.SEARCH.RESULTS}?q=${encodeURIComponent((q || query).trim())}`);
  };

  return (
    <Container className="py-6 space-y-8 font-sans">
      {/* Hero search */}
      <div className="pt-6 pb-2 text-center space-y-4">
        <h1 className="text-2xl font-extrabold font-heading">Find Your Next Experience</h1>
        <p className="text-sm text-muted-foreground">Concerts, meetups, workshops and more near you</p>
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go()} placeholder="Search events, venues, organizers…" className="h-12 pl-11 pr-14 text-base rounded-2xl border-border" />
          <Button onClick={() => go()} disabled={!query.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 font-bold px-4">Search</Button>
        </div>
      </div>

      {/* Categories */}
      <div>
        <p className="text-sm font-bold mb-3">Browse Categories</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <button key={cat.label} onClick={() => go(cat.label)} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all hover:scale-105 ${cat.color}`}>
              <cat.icon className="h-5 w-5" />
              <span className="text-xs font-bold">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold">Trending Searches</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {TRENDING.map((t) => (
            <Badge key={t} variant="secondary" className="cursor-pointer hover:bg-primary/10 transition-colors py-1.5 px-3 text-xs font-medium" onClick={() => go(t)}>{t}</Badge>
          ))}
        </div>
      </div>

      {/* Location shortcut */}
      <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">Events Near You</p>
          <p className="text-xs text-muted-foreground">Dhaka, Bangladesh</p>
        </div>
        <Button variant="outline" size="sm" className="font-semibold" onClick={() => go('events in Dhaka')}>Explore</Button>
      </div>
    </Container>
  );
};

export default SearchPage;
