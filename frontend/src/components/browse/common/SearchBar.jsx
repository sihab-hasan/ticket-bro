import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Calendar, MapPin, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAutocomplete } from '@/hooks/useSearch';
import { ROUTES } from '@/app/AppRoutes';

const SearchBar = ({ 
  placeholder = "Search events, venues, organizers...", 
  onSearch,
  autoFocus = false,
  className = "",
  inputClassName = ""
}) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const { query, setQuery, suggestions, loading, isOpen, close, setOpen } = useAutocomplete({ 
    debounceMs: 200, 
    minLength: 2 
  });

  const handleSearch = useCallback((searchQuery = query) => {
    if ((searchQuery || '').trim()) {
      close();
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        navigate(`${ROUTES.SEARCH.ROOT}?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  }, [query, close, navigate, onSearch]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      close();
      setQuery('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    close();
    setQuery('');
    
    switch (suggestion.type) {
      case 'event':
        navigate(`/events/${suggestion.slug}`);
        break;
      case 'category':
        navigate(`/${suggestion.slug}`);
        break;
      case 'organizer':
        navigate(`/organizers/${suggestion.slug}`);
        break;
      default:
        handleSearch(suggestion.title);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [close]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`h-12 pl-11 pr-20 text-base rounded-2xl border-border ${inputClassName}`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {query && !loading && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setQuery('');
                close();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.slug}-${index}`}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {suggestion.type === 'event' && <Calendar className="h-4 w-4 text-primary" />}
                  {suggestion.type === 'category' && <Search className="h-4 w-4 text-primary" />}
                  {suggestion.type === 'organizer' && <TrendingUp className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{suggestion.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{suggestion.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-border p-2 bg-muted/30">
            <Button
              variant="ghost"
              className="w-full justify-start text-sm font-medium"
              onClick={() => handleSearch()}
            >
              Search for "{query}"
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
