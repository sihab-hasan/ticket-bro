// frontend/src/components/layout/MenuSheet.jsx
//
// ════════════════════════════════════════════════════════════════════════
//  MENU SHEET — nav data, role visibility rules, and all reusable menu UI
//
//  This file has NO auth logic (no useAuth, no context reads).
//  All auth state is passed in as props from UserMenu.
//
//  WHAT LIVES HERE
//  ───────────────
//  1. ROLE constants
//  2. USER HELPERS  — getFullName, getInitials  (exported)
//  3. NAV DATA      — single source of truth for every link in the app
//       • DISCOVER_ITEMS  — public nav shown in sidebar/sheet for everyone
//       • SUPPORT_ITEMS   — support links shown in sidebar/sheet for everyone
//       • buildUserSections(user) — auth-only sections, role-gated
//  4. UI PRIMITIVES — NavItem, BrowseNavItem, NavSection, UserCard,
//                     SheetItem, SheetSectionLabel  (all exported)
//  5. RENDERED SECTIONS (exported, composed by UserMenu)
//       • DropdownContent   — desktop popover body (user-sections + support)
//       • SidebarContent    — left-panel body (discover + user-sections + support)
//       • SheetContent      — bottom-sheet body (discover + user-sections + support)
//
//  SECTION VISIBILITY BY ROLE
//  ──────────────────────────
//  Section      │ guest │ user │ organizer │ admin
//  ─────────────┼───────┼──────┼───────────┼──────
//  Discover     │  ✓    │  ✓   │    ✓      │  ✓     (sidebar + sheet only)
//  Support      │  ✓    │  ✓   │    ✓      │  ✓     (all modes)
//  Account      │  ✗    │  ✓   │    ✓      │  ✓
//  Organizer    │  ✗    │  ✗   │    ✓      │  ✓
//  Admin        │  ✗    │  ✗   │    ✗      │  ✓
//
//  SECTION ORDER (sidebar + sheet, authenticated)
//    Discover → Admin → Organizer → Account → Support
//  SECTION ORDER (dropdown, authenticated)
//    Admin → Organizer → Account → Support   (no Discover)
//  GUEST sidebar/sheet
//    Sign-in CTA → Discover → Support
// ════════════════════════════════════════════════════════════════════════

import React   from "react";
import { Link } from "react-router-dom";
import {
  User, Settings, Ticket, Calendar, CreditCard,
  Heart, PlusCircle, Camera, LayoutDashboard, BarChart3,
  Users, Shield, Server, FileText, ChevronRight, Search, Tag, TrendingUp,
  Info, Mail, HelpCircle, LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge }                               from "@/components/ui/badge";
import {
  DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { PANELS } from "@/config/panels.config";
import { PANEL_ICON_BY_ID } from "@/config/panel-navigation.config";
import {
  canUserAccessPanel,
  getUserAvailablePanels,
  hasUserPermission,
} from "@/utils/access.utils";

// ════════════════════════════════════════════════════════════════════
//  1. ROLE CONSTANTS
// ════════════════════════════════════════════════════════════════════
export const Role = {
  ADMIN:     "admin",
  ORGANIZER: "organizer",
  MODERATOR: "moderator",
  SUPER_ADMIN: "super_admin",
  USER:      "user",
};

// ════════════════════════════════════════════════════════════════════
//  2. USER HELPERS
// ════════════════════════════════════════════════════════════════════
export const getFullName = (u) => {
  if (!u) return "";
  if (u.name) return u.name;
  return [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "";
};

export const getInitials = (u) => {
  if (!u) return "U";
  const f = u.firstName || u.name?.split(" ")[0] || "";
  const l = u.lastName  || u.name?.split(" ")[1] || "";
  return `${f.charAt(0)}${l.charAt(0)}`.toUpperCase() || "U";
};

// ════════════════════════════════════════════════════════════════════
//  3. NAV DATA — single source of truth
// ════════════════════════════════════════════════════════════════════

// Public nav — sidebar + sheet for ALL users (auth & guest). Never in dropdown.
export const DISCOVER_ITEMS = [
  { icon: LayoutDashboard, label: "Home",          to: "/"         },
  { icon: Search,          label: "Search",        to: "/search"   },
  // browseArrow: true → renders as split-button in sidebar (link left, arrow right)
  { icon: Calendar,        label: "Browse Events", to: "/browse",  browseArrow: true },
  { icon: Tag,             label: "Offers",        to: "/offers"   },
  { icon: TrendingUp,      label: "Trending",      to: "/trending" },
];

// Support links — shown in all modes for all users.
export const SUPPORT_ITEMS = [
  { icon: Info,       label: "About",   to: "/about"   },
  { icon: Mail,       label: "Contact", to: "/contact" },
  { icon: HelpCircle, label: "FAQ",     to: "/faq"     },
];

// Auth-only sections, role-gated.
// Returns array of { id, label, items[] } — only sections the user can see.
export const buildUserSections = (user) => {
  const workspaces = getUserAvailablePanels(user)
    .filter((panel) => panel?.id && panel?.path)
    .map((panel) => ({
      icon: PANEL_ICON_BY_ID[panel.id] || LayoutDashboard,
      label: panel.label,
      to: panel.path,
      highlight: panel.id === user?.defaultPanel,
    }));

  const sections = [];

  if (workspaces.length > 1) {
    sections.push({
      id: "workspaces",
      label: "Workspaces",
      items: workspaces,
    });
  }

  if (canUserAccessPanel(user, PANELS.ORGANIZER)) {
    sections.push({
      id: "organizer",
      label: "Organizer",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", to: "/organizer/dashboard" },
        { icon: Calendar, label: "My Events", to: "/organizer/events" },
        { icon: BarChart3, label: "Revenue", to: "/organizer/revenue" },
        ...(hasUserPermission(user, "event:create")
          ? [
              {
                icon: PlusCircle,
                label: "Create Event",
                to: "/organizer/events/create",
                highlight: true,
              },
            ]
          : []),
      ],
    });
  }

  if (canUserAccessPanel(user, PANELS.MODERATOR)) {
    sections.push({
      id: "moderation",
      label: "Moderation",
      items: [
        { icon: Shield, label: "Moderator Dashboard", to: "/moderator/dashboard" },
        { icon: FileText, label: "Reports Queue", to: "/moderator/reports" },
        { icon: Users, label: "User Actions", to: "/moderator/users" },
      ],
    });
  }

  if (canUserAccessPanel(user, PANELS.ADMIN)) {
    sections.push({
      id: "admin",
      label: "Admin",
      items: [
        { icon: LayoutDashboard, label: "Admin Dashboard", to: "/admin/dashboard" },
        { icon: Users, label: "User Management", to: "/admin/users" },
        { icon: Server, label: "System Security", to: "/admin/system/security" },
      ],
    });
  }

  if (canUserAccessPanel(user, PANELS.SUPER_ADMIN)) {
    sections.push({
      id: "governance",
      label: "Super Admin",
      items: [
        { icon: Server, label: "Super Admin Dashboard", to: "/super-admin/dashboard" },
        { icon: Users, label: "Role Management", to: "/super-admin/roles" },
        { icon: FileText, label: "Audit Center", to: "/super-admin/audit" },
      ],
    });
  }

  sections.push({
    id: "account",
    label: "Account",
    items: [
      { icon: Ticket, label: "My Tickets", to: "/bookings" },
      { icon: Calendar, label: "Calendar", to: "/browse#events-calendar" },
      { icon: CreditCard, label: "Payments", to: "/payments/history" },
      { icon: Heart, label: "Favorites", to: "/favorites" },
      { icon: User, label: "Profile", to: "/profile" },
      { icon: Settings, label: "Settings", to: "/settings" },
    ],
  });

  return sections;
};

// ════════════════════════════════════════════════════════════════════
//  4. UI PRIMITIVES — sidebar / sheet shared atoms
// ════════════════════════════════════════════════════════════════════

// Section header label
export const SectionLabel = ({ children }) => (
  <p className="text-[10px] font-semibold text-muted-foreground px-4 py-2 uppercase tracking-wider select-none">
    {children}
  </p>
);

// Standard nav row (sidebar)
export const NavItem = ({ icon: Icon, label, to, onClick, highlight = false }) => (
  <li>
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm min-h-[36px]  hover:bg-muted
        ${highlight ? "text-primary font-medium" : "text-foreground"}`}
    >
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
    </Link>
  </li>
);

// Browse Events split row: left = link to /browse, right = arrow button for sub-panel
export const BrowseNavItem = ({ onClose, onBrowseOpen }) => (
  <li>
    <div className="flex items-center">
      <Link
        to="/browse"
        onClick={onClose}
        className="flex items-center gap-3 px-3 py-2 rounded-l-md hover:bg-muted text-sm min-h-[36px] text-foreground flex-1 "
      >
        <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1">Browse Events</span>
      </Link>
      {onBrowseOpen && (
        <button
          type="button"
          onClick={onBrowseOpen}
          className="flex items-center justify-center w-9 h-9 rounded-r-md hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 border-l border-border/50 "
          aria-label="Browse event categories"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  </li>
);

// Renders a full labelled section (sidebar)
export const NavSection = ({ label, items, onClose, onBrowseOpen }) => (
  <div className="py-1">
    <SectionLabel>{label}</SectionLabel>
    <ul className="space-y-0.5 px-2">
      {items.map(({ icon, label: itemLabel, to, browseArrow, highlight }) =>
        browseArrow ? (
          <BrowseNavItem key={to} onClose={onClose} onBrowseOpen={onBrowseOpen} />
        ) : (
          <NavItem key={to} icon={icon} label={itemLabel} to={to} onClick={onClose} highlight={highlight} />
        )
      )}
    </ul>
  </div>
);

// User avatar card — sidebar (size="md") and sheet (size="lg")
export const UserCard = ({ user, fullName, initials, onAvatarClick, size = "md" }) => (
  <div className={`flex items-center gap-3 ${size === "lg" ? "px-5 py-4" : "p-4"}`}>
    <button onClick={onAvatarClick} className="relative shrink-0 group" aria-label="Change avatar">
      <Avatar className={`ring-2 ring-primary/20 ${size === "lg" ? "h-12 w-12" : "h-10 w-10"}`}>
        <AvatarImage src={user?.avatar} alt={fullName} />
        <AvatarFallback className={`bg-primary/10 text-primary font-semibold ${size === "lg" ? "text-base" : "text-sm"}`}>
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Camera className={`text-white ${size === "lg" ? "h-4 w-4" : "h-3 w-3"}`} />
      </div>
    </button>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-sm truncate leading-tight">{fullName}</p>
      <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
      <Badge variant="outline" className="mt-1 text-[10px] px-1.5 py-0 h-4 capitalize">{user?.role}</Badge>
    </div>
  </div>
);

// Sheet flat row (button, navigates via navigate())
export const SheetItem = ({ icon: Icon, label, onClick, highlight = false, danger = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium  hover:bg-accent/70 text-left
      ${danger ? "text-destructive hover:text-destructive" : highlight ? "text-primary" : "text-foreground"}`}
  >
    <Icon className="h-4 w-4 shrink-0 opacity-70" />
    <span>{label}</span>
  </button>
);

export const SheetSectionLabel = ({ children }) => (
  <p className="px-5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
    {children}
  </p>
);

// ════════════════════════════════════════════════════════════════════
//  5. RENDERED SECTIONS — composed by UserMenu
// ════════════════════════════════════════════════════════════════════

// ── DropdownContent ─────────────────────────────────────────────────
// Desktop popover body. Sections: Admin → Organizer → Account → Support. No Discover.
export const DropdownContent = ({ user, userSections, onAvatarClick, onLogout }) => (
  <>
    {/* Avatar change */}
    <DropdownMenuItem onClick={onAvatarClick} className="h-9 text-sm cursor-pointer gap-2">
      <Camera className="h-3.5 w-3.5 shrink-0" /> Change Avatar
    </DropdownMenuItem>

    {/* User sections: Admin → Organizer → Account */}
    {userSections.map((section) => (
      <React.Fragment key={section.id}>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] text-muted-foreground px-3 py-1.5 uppercase tracking-wider">
            {section.label}
          </DropdownMenuLabel>
          {section.items.map(({ icon: Icon, label, to, highlight }) => (
            <DropdownMenuItem key={to} asChild className="h-9 text-sm">
              <Link to={to} className={`cursor-pointer flex items-center gap-2 ${highlight ? "text-primary font-medium" : ""}`}>
                <Icon className="h-3.5 w-3.5 shrink-0" /> {label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </React.Fragment>
    ))}

    {/* Support — always before logout */}
    <DropdownMenuSeparator />
    <DropdownMenuGroup>
      <DropdownMenuLabel className="text-[10px] text-muted-foreground px-3 py-1.5 uppercase tracking-wider">
        Support
      </DropdownMenuLabel>
      {SUPPORT_ITEMS.map(({ icon: Icon, label, to }) => (
        <DropdownMenuItem key={to} asChild className="h-9 text-sm">
          <Link to={to} className="cursor-pointer flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 shrink-0" /> {label}
          </Link>
        </DropdownMenuItem>
      ))}
    </DropdownMenuGroup>

    {/* Logout */}
    <DropdownMenuSeparator />
    <DropdownMenuItem
      onClick={onLogout}
      className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer h-9 text-sm gap-2"
    >
      <LogOut className="h-3.5 w-3.5 shrink-0" /> Sign Out
      <DropdownMenuShortcut className="hidden sm:block opacity-60">⇧⌘Q</DropdownMenuShortcut>
    </DropdownMenuItem>
  </>
);

// ── SidebarContent ──────────────────────────────────────────────────
// Left-panel body (fills flex container).
// Auth:  user card → Discover → Admin → Organizer → Account → Support → logout (pinned)
// Guest: CTA buttons → Discover → Support
export const SidebarContent = ({
  user, isAuthenticated, fullName, initials,
  userSections, onClose, onBrowseOpen, onAvatarClick, onLogout,
}) => (
  <div className="flex flex-col min-h-0 flex-1">

    {/* Top: user card (auth) or sign-in CTA (guest) */}
    {isAuthenticated ? (
      <div className="border-b border-border bg-muted/30 shrink-0">
        <UserCard
          user={user} fullName={fullName} initials={initials}
          onAvatarClick={() => { onClose(); onAvatarClick(); }}
        />
      </div>
    ) : (
      <div className="p-4 border-b border-border space-y-2 shrink-0">
        <Link
          to="?auth=login"
          onClick={onClose}
          className="flex items-center justify-center w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 "
        >
          Sign In
        </Link>
        <Link
          to="?auth=register"
          onClick={onClose}
          className="flex items-center justify-center w-full h-9 rounded-md border border-border text-foreground text-sm font-medium hover:bg-muted "
        >
          Create Account
        </Link>
      </div>
    )}

    {/* Scrollable nav */}
    <div className="flex-1 overflow-y-auto overscroll-contain">

      {/* Discover — always first for all users */}
      <NavSection
        label="Discover"
        items={DISCOVER_ITEMS}
        onClose={onClose}
        onBrowseOpen={onBrowseOpen}
      />

      {/* Auth-only: Admin → Organizer → Account */}
      {userSections.map((section) => (
        <NavSection
          key={section.id}
          label={section.label}
          items={section.items}
          onClose={onClose}
        />
      ))}

      {/* Support — always last in scroll area */}
      <NavSection label="Support" items={SUPPORT_ITEMS} onClose={onClose} />

    </div>

    {/* Logout — pinned at bottom (auth only) */}
    {isAuthenticated && (
      <div className="p-4 border-t border-border shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 "
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </button>
      </div>
    )}

  </div>
);

// ── SheetContent ─────────────────────────────────────────────────────
// Bottom-sheet body.
// Auth:  user card → Discover → Admin → Organizer → Account → Support → logout
// Guest: CTA buttons → Discover → Support
export const SheetContent = ({
  user, isAuthenticated, fullName, initials,
  userSections, onClose, onAvatarClick, onLogout, navigate,
}) => {
  const go = (to) => { onClose(); navigate(to); };

  return (
    <>
      {/* User card (auth) or CTA (guest) */}
      {isAuthenticated ? (
        <div className="border-b border-border">
          <UserCard
            user={user} fullName={fullName} initials={initials}
            onAvatarClick={() => { onClose(); onAvatarClick(); }}
            size="lg"
          />
        </div>
      ) : (
        <div className="flex gap-3 px-5 py-4 border-b border-border">
          <button
            onClick={() => go("?auth=login")}
            className="flex-1 h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 "
          >
            Sign In
          </button>
          <button
            onClick={() => go("?auth=register")}
            className="flex-1 h-9 rounded-md border border-border text-foreground text-sm font-medium hover:bg-muted "
          >
            Register
          </button>
        </div>
      )}

      {/* Scrollable sections */}
      <div className="overflow-y-auto max-h-[55vh] py-1">

        {/* Auth-only: Admin → Organizer → Account */}
        {userSections.map((section) => (
          <React.Fragment key={section.id}>
            <SheetSectionLabel>{section.label}</SheetSectionLabel>
            {section.items.map(({ icon, label, to, highlight }) => (
              <SheetItem key={to} icon={icon} label={label} onClick={() => go(to)} highlight={highlight} />
            ))}
          </React.Fragment>
        ))}

        {/* Support — all users, always last */}
        <SheetSectionLabel>Support</SheetSectionLabel>
        {SUPPORT_ITEMS.map(({ icon, label, to }) => (
          <SheetItem key={to} icon={icon} label={label} onClick={() => go(to)} />
        ))}

        {/* Logout — auth only */}
        {isAuthenticated && (
          <>
            <div className="h-px bg-border mx-4 my-2" />
            <SheetItem icon={LogOut} label="Sign Out" onClick={onLogout} danger />
          </>
        )}

      </div>
    </>
  );
};
