// frontend/src/components/layout/Header.jsx
//
// ════════════════════════════════════════════════════════════════════
//  HEADER — layout shell only
//
//  Nav content is fully delegated to <UserMenu>.
//  This file owns:
//    • LocationSelector  — city/country picker
//    • ThemeSwitcher     — light/dark/system
//    • BrowseSubPanel    — event-category slide-over (needs NAV_ITEMS here)
//    • MobileSidebar     — chrome wrapper + <UserMenu mode="sidebar">
//    • Header            — sticky bar, search, cart, quick links
//
//  BREAKPOINTS
//    Mobile/tablet < 1024px  →  xl:hidden
//    Desktop       ≥ 1024px  →  hidden xl:flex
// ════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation }                  from "react-router-dom";
import {
  Menu, Search, ShoppingBag, Sun, Moon, Monitor,
  X,
  ChevronLeft, ChevronRight, ChevronDown, Calendar,
  PlusCircle, Tag, TrendingUp, MessageSquare, Bell,
} from "lucide-react";
import { Button }    from "@/components/ui/button";
import { Badge }     from "@/components/ui/badge";
import { Input }     from "@/components/ui/input";
import {
  DropdownMenu as RadixDropdown,
  DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Container     from "@/components/layout/Container";
import { useTheme }  from "@/context/ThemeContext";
import useAuth       from "@/context/AuthContext";
import { useCart }   from "@/context/CartContext";
import { useSearch } from "@/context/SearchContext";
import { useLocation as useLocationCtx } from "@/context/LocationContext";
import { useBrowse } from "@/hooks";
import LocationPicker from "@/components/shared/LocationPicker";
import lightLogo     from "@/assets/images/ticket-bro-logo-light-mode.png";
import darkLogo      from "@/assets/images/ticket-bro-logo-dark-mode.png";
import UserMenu      from "@/components/layout/UserMenu";
import { useSelector } from "react-redux";
import { selectUnreadCount } from "@/store/slices/messagingSlice";
import { notificationsService } from "@/api";
import { getLocationQueryValue } from "@/lib/locationSelection";

// Lightweight hook — polls notification unread count every 60 s
const useNotifCount = (isAuthenticated) => {
  const [count, setCount] = React.useState(0);
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    const fetch = async () => {
      try {
        const data = await notificationsService.getUnreadCount();
        if (!cancelled) setCount(typeof data === 'number' ? data : data?.count ?? 0);
      } catch {}
    };
    fetch();
    const id = setInterval(fetch, 60_000);
    return () => { cancelled = true; clearInterval(id); };
  }, [isAuthenticated]);
  return count;
};

/* ════════════════════════════════════════════════════════════════
   THEME SWITCHER
════════════════════════════════════════════════════════════════ */
const THEME_OPTIONS = [
  { value: "light",  Icon: Sun,     label: "Light"  },
  { value: "dark",   Icon: Moon,    label: "Dark"   },
  { value: "system", Icon: Monitor, label: "System" },
];

const ThemeSwitcher = ({ theme, setThemeMode, size = "md" }) => {
  const { Icon: ActiveIcon } = THEME_OPTIONS.find((o) => o.value === theme) || THEME_OPTIONS[2];
  return (
    <RadixDropdown>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`shrink-0 ${size === "sm" ? "h-8 w-8" : "h-9 w-9"}`}
          aria-label="Toggle theme"
        >
          <ActiveIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 border-none">
        {THEME_OPTIONS.map(({ value, Icon, label }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setThemeMode(value)}
            className="gap-2 cursor-pointer h-8 text-sm"
          >
            <Icon className="h-3.5 w-3.5" /> {label}
            {theme === value && <span className="ml-auto text-xs text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </RadixDropdown>
  );
};

/* ════════════════════════════════════════════════════════════════
   BROWSE SUB-PANEL
   Slides right → over the sidebar.
   Kept in Header because it owns the event-category NAV_ITEMS data.
════════════════════════════════════════════════════════════════ */
const BrowseSubPanel = ({ items, open, onBack, onClose }) => {
  const [openCatId, setOpenCatId] = useState(null);
  const { pathname } = useLocation();

  // Close on route change
  const prevPath = useRef(pathname);
  useEffect(() => {
    if (prevPath.current !== pathname) { prevPath.current = pathname; onClose(); }
  }, [pathname, onClose]);

  useEffect(() => { if (!open) setOpenCatId(null); }, [open]);

  const toggle = useCallback((id) => setOpenCatId((p) => (p === id ? null : id)), []);

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col bg-background"
      style={{
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 280ms cubic-bezier(0.16,1,0.3,1)",
        willChange: "transform",
      }}
    >
      {/* Panel header */}
      <div className="flex items-center gap-2 px-3 h-14 border-b border-border shrink-0">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent "
          aria-label="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-foreground flex-1">Browse Events</span>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent "
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* All Events link */}
      <div className="px-2 py-1.5 border-b border-border">
        <Link
          to="/browse"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-accent text-sm font-medium text-primary "
        >
          <Calendar className="h-4 w-4 shrink-0" />
          All Events
          <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground/40" />
        </Link>
      </div>

      {/* Category accordion */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {items.map((item) => {
          const isOpen  = openCatId === item.id;
          const hasCats = !!item.categories?.length;
          return (
            <div key={item.id} className="border-b border-border/50 last:border-0">
              <div className="flex items-center px-2">
                <Link
                  to={`/${item.slug}`}
                  onClick={onClose}
                  className="flex-1 px-3 py-3 text-sm font-medium text-foreground hover:text-primary "
                >
                  {item.name}
                </Link>
                {hasCats && (
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="flex items-center justify-center w-9 h-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent shrink-0 "
                    aria-label={isOpen ? `Collapse ${item.name}` : `Expand ${item.name}`}
                    aria-expanded={isOpen}
                  >
                    <ChevronDown
                      className="h-3.5 w-3.5"
                      style={{
                        transition: "transform 240ms cubic-bezier(0.4,0,0.2,1)",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                )}
              </div>
              {hasCats && (
                <div style={{
                  display: "grid",
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  transition: "grid-template-rows 240ms cubic-bezier(0.4,0,0.2,1)",
                }}>
                  <div style={{ overflow: "hidden" }}>
                    <ul className="pb-1">
                      {item.categories.map((cat) => (
                        <li key={cat.id}>
                          <Link
                            to={`/${item.slug}/${cat.slug}`}
                            onClick={onClose}
                            className="flex items-center gap-2 pl-10 pr-4 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 "
                          >
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/40 shrink-0" />
                            {cat.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   MOBILE SIDEBAR
   Chrome only. Nav content → <UserMenu mode="sidebar">.
════════════════════════════════════════════════════════════════ */
const MobileSidebar = ({ navItems, open, onClose }) => {
  const { pathname }                = useLocation();
  const [browseOpen, setBrowseOpen] = useState(false);

  const prevPath = useRef(pathname);
  useEffect(() => {
    if (prevPath.current !== pathname) { prevPath.current = pathname; onClose(); }
  }, [pathname, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => { if (!open) setBrowseOpen(false); }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed inset-y-0 left-0 z-50 flex flex-col w-[min(300px,85vw)] bg-background border-r border-border shadow-2xl overflow-hidden"
      >
        {/* Logo bar */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
          <Link to="/" onClick={onClose}>
            <span className="text-base font-bold" style={{ fontFamily: "var(--font-brand)" }}>
              Ticket<span className="text-primary">Bro</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent "
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* All nav — UserMenu owns auth check + content */}
        <UserMenu
          mode="sidebar"
          onClose={onClose}
          onBrowseOpen={() => setBrowseOpen(true)}
        />

        {/* Browse sub-panel slides over panel */}
        <BrowseSubPanel
          items={navItems}
          open={browseOpen}
          onBack={() => setBrowseOpen(false)}
          onClose={onClose}
        />
      </div>
    </>
  );
};

/* ════════════════════════════════════════════════════════════════
   HEADER
════════════════════════════════════════════════════════════════ */
const Header = () => {
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery,      setSearchQuery]      = useState("");
  const navigate = useNavigate();

  const { theme, isDark, setThemeMode }      = useTheme();
  const { isAuthenticated, hasPermission }   = useAuth();
  const { itemCount }                        = useCart();
  const { setQuery }                         = useSearch();
  const {
    selectedLocation,
    changeLocation,
    clearLocation,
    detectCurrentLocation,
    locations,
    isDetectingLocation,
  } = useLocationCtx();
  const { navigationItems } = useBrowse();
  const msgUnreadCount   = useSelector(selectUnreadCount);
  const notifUnreadCount = useNotifCount(isAuthenticated);

  // "Create Event" CTA — only for organizer / admin
  const canCreateEvent = isAuthenticated && hasPermission("event:create");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setMobileSearchOpen(false);
    const params = new URLSearchParams({ q: searchQuery.trim() });
    const selectedCity = getLocationQueryValue(selectedLocation);
    if (selectedCity) {
      params.set("city", selectedCity);
    }
    navigate(`/search?${params.toString()}`);
  };

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <Container>

          {/* ══ MOBILE / TABLET (< 1024px) ══════════════════════════ */}
          <div className="flex xl:hidden h-14 items-center justify-between">

            {/* Left: hamburger + location */}
            <div className="flex items-center gap-1 xs:gap-2 shrink-0">
              <Button
                variant="ghost" size="icon"
                className="h-9 w-9 shrink-0"
                onClick={openSidebar}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <LocationPicker
                locations={locations}
                selectedLocation={selectedLocation}
                onLocationChange={changeLocation}
                onClearLocation={clearLocation}
                onDetectLocation={detectCurrentLocation}
                isDetecting={isDetectingLocation}
                compact
              />
            </div>

            {/* Centre: wordmark */}
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="absolute left-1/2 -translate-x-1/2 z-10 hover:opacity-80 transition-opacity"
            >
              <span
                className="text-2xl font-bold text-foreground tracking-tight whitespace-nowrap"
                style={{ fontFamily: "var(--font-brand)" }}
              >
                Ticket<span className="text-primary">Bro</span>
              </span>
            </Link>

            {/* Right: search, cart, theme */}
            <div className="flex items-center gap-0.5 shrink-0">
              <Button
                variant="ghost" size="icon"
                className="h-8 w-8 xs:h-9 xs:w-9 shrink-0"
                onClick={() => setMobileSearchOpen((p) => !p)}
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Button>

              <Button variant="ghost" size="icon" className="relative h-8 w-8 xs:h-9 xs:w-9 shrink-0" asChild>
                <Link to="/cart" aria-label={`Cart${itemCount > 0 ? `, ${itemCount} item${itemCount !== 1 ? "s" : ""}` : ""}`}>
                  <ShoppingBag className="h-4 w-4" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 bg-primary text-primary-foreground rounded-full text-[9px] font-bold">
                      {itemCount > 9 ? "9+" : itemCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {isAuthenticated && (
                <Button variant="ghost" size="icon" className="relative h-8 w-8 xs:h-9 xs:w-9 shrink-0" asChild>
                  <Link to="/messages" aria-label={msgUnreadCount > 0 ? `Messages, ${msgUnreadCount} unread` : "Messages"}>
                    <MessageSquare className="h-4 w-4" />
                    {msgUnreadCount > 0 && (
                      <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 bg-primary text-primary-foreground rounded-full text-[9px] font-bold">
                        {msgUnreadCount > 9 ? "9+" : msgUnreadCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
              )}

              {isAuthenticated && (
                <Button variant="ghost" size="icon" className="relative h-8 w-8 xs:h-9 xs:w-9 shrink-0" asChild>
                  <Link to="/notifications" aria-label={notifUnreadCount > 0 ? `Notifications, ${notifUnreadCount} unread` : "Notifications"}>
                    <Bell className="h-4 w-4" />
                    {notifUnreadCount > 0 && (
                      <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 bg-primary text-primary-foreground rounded-full text-[9px] font-bold">
                        {notifUnreadCount > 9 ? "9+" : notifUnreadCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
              )}

              <ThemeSwitcher theme={theme} setThemeMode={setThemeMode} size="sm" />
            </div>
          </div>

          {/* Inline mobile search */}
          {mobileSearchOpen && (
            <div className="xl:hidden pb-2 pt-1">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  autoFocus
                  placeholder={`Search in ${selectedLocation?.label || "your city"}…`}
                  className="pl-9 pr-9 h-9 w-full text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(false)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Close search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* ══ DESKTOP (≥ 1024px) ══════════════════════════════════ */}
          <div className="hidden xl:flex h-16 items-center gap-2">

            {/* Logo */}
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
            >
              <img src={isDark ? darkLogo : lightLogo} alt="Ticket Bro" className="h-7 w-auto" />
              <span className="text-2xl font-bold text-foreground whitespace-nowrap" style={{ fontFamily: "var(--font-brand)" }}>
                Ticket<span className="text-primary">Bro</span>
              </span>
            </Link>

            <div className="h-5 w-px bg-border shrink-0 mx-1" />

            <LocationPicker
              locations={locations}
              selectedLocation={selectedLocation}
              onLocationChange={changeLocation}
              onClearLocation={clearLocation}
              onDetectLocation={detectCurrentLocation}
              isDetecting={isDetectingLocation}
            />

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-xl mx-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  autoFocus
                  placeholder={`Search in ${selectedLocation?.label || "your city"}…`}
                  className="pl-9 pr-9 h-9 w-full text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* Quick nav */}
            <Link to="/offers"   className="flex items-center gap-1.5 px-3 h-9 rounded-md text-sm font-medium text-foreground hover:text-primary hover:bg-accent shrink-0 ">
              <Tag className="h-3.5 w-3.5" /> Offers
            </Link>
            <Link to="/trending" className="flex items-center gap-1.5 px-3 h-9 rounded-md text-sm font-medium text-foreground hover:text-primary hover:bg-accent shrink-0 ">
              <TrendingUp className="h-3.5 w-3.5" /> Trending
            </Link>

            <ThemeSwitcher theme={theme} setThemeMode={setThemeMode} />

            {isAuthenticated && (
              <Button variant="ghost" size="icon" className="relative h-9 w-9 shrink-0" asChild>
                <Link to="/messages" aria-label={msgUnreadCount > 0 ? `Messages, ${msgUnreadCount} unread` : "Messages"}>
                  <MessageSquare className="h-4 w-4" />
                  {msgUnreadCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 bg-primary text-primary-foreground rounded-full text-[9px] font-bold">
                      {msgUnreadCount > 9 ? "9+" : msgUnreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}

            {isAuthenticated && (
              <Button variant="ghost" size="icon" className="relative h-9 w-9 shrink-0" asChild>
                <Link to="/notifications" aria-label={notifUnreadCount > 0 ? `Notifications, ${notifUnreadCount} unread` : "Notifications"}>
                  <Bell className="h-4 w-4" />
                  {notifUnreadCount > 0 && (
                    <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 bg-primary text-primary-foreground rounded-full text-[9px] font-bold">
                      {notifUnreadCount > 9 ? "9+" : notifUnreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}

            {/* User menu — UserMenu decides auth/guest + role visibility */}
            <UserMenu mode="dropdown" />

            {/* Create Event — backend permission driven */}
            {canCreateEvent && (
              <Button
                size="sm" asChild
                className="gap-1.5 bg-primary hover:bg-primary/90 h-9 px-3 text-sm shrink-0 whitespace-nowrap"
              >
                <Link to="/organizer/events/create">
                  <PlusCircle className="h-3.5 w-3.5" /> Create Event
                </Link>
              </Button>
            )}
          </div>

        </Container>
      </header>

      {/* Mobile sidebar — rendered outside <header> to overlay page correctly */}
      <MobileSidebar navItems={navigationItems} open={sidebarOpen} onClose={closeSidebar} />
    </>
  );
};

export default Header;
