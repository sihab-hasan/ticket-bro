// frontend/src/components/layout/UserMenu.jsx
//
// ════════════════════════════════════════════════════════════════════════
//  USER MENU — auth layer and menu orchestrator
//
//  This is the ONLY file that calls useAuth().
//  It reads the current user + role, builds the right sections via
//  MenuSheet.buildUserSections(), then renders the correct mode.
//
//  All nav data, role visibility rules, and UI primitives live in
//  MenuSheet.jsx. UserMenu just wires auth → data → UI.
//
//  MODES
//  ─────
//  "dropdown"  Desktop header avatar button → Radix popover
//              Auth:  avatar trigger + user info + user sections + support
//              Guest: "Sign In" link + "Get Started" button
//              Usage: <UserMenu />  or  <UserMenu mode="dropdown" />
//
//  "sidebar"   Mobile header left-panel (fills its flex container)
//              Auth:  user card + discover + user sections + support + logout
//              Guest: CTA buttons + discover + support
//              Usage: <UserMenu mode="sidebar" onClose={fn} onBrowseOpen={fn} />
//
//  "sheet"     Mobile bottom-nav sheet (slides up from bottom)
//              Auth:  user card + discover + user sections + support + logout
//              Guest: CTA buttons + discover + support
//              Usage: <UserMenu mode="sheet" open={bool} onClose={fn} />
//
//  ROLE → SECTION VISIBILITY (decided in MenuSheet.buildUserSections)
//  ──────────────────────────────────────────────────────────────────
//  guest      → no user sections at all
//  user       → Account
//  organizer  → Organizer + Account
//  admin      → Admin + Organizer + Account
// ════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AvatarUpload from "@/components/roles/user/AvatarUpload";
import { useAuth } from "@/context/AuthContext";
import {
  getFullName,
  getInitials,
  buildUserSections,
  DropdownContent,
  SidebarContent,
  SheetContent,
} from "@/components/layout/MenuSheet";

// ════════════════════════════════════════════════════════════════════
//  DROPDOWN MODE — desktop header
// ════════════════════════════════════════════════════════════════════
const DropdownMode = ({
  user,
  fullName,
  initials,
  userSections,
  onAvatarClick,
  onLogout,
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className="relative h-9 w-9 rounded-full p-0 hover:bg-accent ml-0.5 shrink-0"
        aria-label="Open user menu"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.avatar} alt={fullName} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="end"
      className="w-56 max-w-[calc(100vw-1rem)] border-none"
      sideOffset={8}
    >
      {/* User info header */}
      <DropdownMenuLabel className="py-2.5 px-3">
        <p className="text-sm font-semibold leading-none truncate">
          {fullName}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-1">
          {user?.email}
        </p>
        <Badge
          variant="outline"
          className="mt-1.5 w-fit text-[10px] px-1.5 py-0 capitalize"
        >
          {user?.role}
        </Badge>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      {/* All menu items — from MenuSheet */}
      <DropdownContent
        user={user}
        userSections={userSections}
        onAvatarClick={onAvatarClick}
        onLogout={onLogout}
      />
    </DropdownMenuContent>
  </DropdownMenu>
);

// Guest state in desktop header bar
const DropdownGuest = () => (
  <>
    <Link
      to="?auth=login"
      className="flex items-center gap-1.5 px-3 h-9 rounded-md text-sm font-medium text-foreground hover:text-primary hover:bg-accent shrink-0 "
    >
      <User className="h-3.5 w-3.5" /> Sign In
    </Link>
    <Button
      size="sm"
      className="h-9 px-3 text-sm shrink-0 hidden sm:flex"
      asChild
    >
      <Link to="?auth=register">Get Started</Link>
    </Button>
  </>
);

// ════════════════════════════════════════════════════════════════════
//  SHEET MODE — bottom-nav sheet chrome (overlay + panel)
// ════════════════════════════════════════════════════════════════════
const SheetWrapper = ({ open, onClose, children }) => {
  useEffect(() => {
    if (!open) return;
    const fn = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed bottom-0 inset-x-0 z-50 bg-background rounded-t-2xl shadow-2xl border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
        </div>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent "
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </>
  );
};

// ════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ════════════════════════════════════════════════════════════════════
const UserMenu = ({
  mode = "dropdown", // "dropdown" | "sidebar" | "sheet"
  open = false, // sheet mode: controls visibility
  onClose = () => {}, // sidebar + sheet: called on nav or close
  onBrowseOpen = null, // sidebar only: opens BrowseSubPanel in Header
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  // Derived from auth state
  const fullName = getFullName(user);
  const initials = getInitials(user);
  // Role-gated sections — empty array for guests
  const userSections = isAuthenticated ? buildUserSections(user) : [];

  const handleLogout = async () => {
    if (mode !== "dropdown") onClose();
    await logout();
  };

  const handleAvatarClick = () => setShowAvatarUpload(true);

  // Shared props passed down to all content components
  const contentProps = {
    user,
    isAuthenticated,
    fullName,
    initials,
    userSections,
    onClose,
    onAvatarClick: handleAvatarClick,
    onLogout: handleLogout,
  };

  return (
    <>
      {/* ── Dropdown ──────────────────────────────────────────────── */}
      {mode === "dropdown" &&
        (isAuthenticated ? (
          <DropdownMode {...contentProps} />
        ) : (
          <DropdownGuest />
        ))}

      {/* ── Sidebar ───────────────────────────────────────────────── */}
      {mode === "sidebar" && (
        <SidebarContent {...contentProps} onBrowseOpen={onBrowseOpen} />
      )}

      {/* ── Sheet ─────────────────────────────────────────────────── */}
      {mode === "sheet" && (
        <SheetWrapper open={open} onClose={onClose}>
          <SheetContent {...contentProps} navigate={navigate} />
        </SheetWrapper>
      )}

      {/* Avatar upload — available in all modes when authenticated */}
      {isAuthenticated && (
        <AvatarUpload
          user={user}
          open={showAvatarUpload}
          onOpenChange={setShowAvatarUpload}
        />
      )}
    </>
  );
};

export default UserMenu;
