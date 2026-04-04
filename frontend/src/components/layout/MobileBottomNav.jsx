// frontend/src/components/layout/MobileBottomNav.jsx
import React, { useState }                     from "react";
import { Link, useLocation }                   from "react-router-dom";
import { Home, TrendingUp, Ticket, User, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSelector }  from "react-redux";
import { useAuth }      from "@/context/AuthContext";
import UserMenu         from "@/components/layout/UserMenu";
import { getFullName, getInitials } from "@/components/layout/MenuSheet";
import { selectUnreadCount } from "@/store/slices/messagingSlice";

// protected: true → redirect to /?auth=login when not authenticated
const TABS = [
  { label: "Home",     icon: Home,          to: "/",         protected: false },
  { label: "Trending", icon: TrendingUp,    to: "/trending", protected: false },
  { label: "Tickets",  icon: Ticket,        to: "/bookings", protected: true  },
  { label: "Messages", icon: MessageSquare, to: "/messages", protected: true, badge: true },
];

const MobileBottomNav = () => {
  const { pathname }              = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [menuOpen, setMenuOpen]   = useState(false);
  const msgUnreadCount            = useSelector(selectUnreadCount);

  const fullName = getFullName(user);
  const initials = getInitials(user);
  const isAccountActive = pathname.startsWith("/profile");

  return (
    <>
      <nav
        className="xl:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Mobile navigation"
      >
        <div className="flex items-stretch h-14">

          {/* ── Static tabs ─────────────────────────────────────── */}
          {TABS.map(({ label, icon: Icon, to, protected: isProtected, badge }) => {
            const href     = isProtected && !isAuthenticated ? "/?auth=login" : to;
            const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));
            const count    = badge && isAuthenticated ? msgUnreadCount : 0;

            return (
              <Link
                key={label}
                to={href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium relative
                  ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                aria-label={count > 0 ? `${label}, ${count} unread` : label}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="relative">
                  <Icon
                    className={`h-5 w-5 transition-transform duration-150 ${isActive ? "scale-110" : ""}`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {count > 0 && (
                    <span className="absolute -top-1 -right-1.5 h-3.5 min-w-3.5 px-0.5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[8px] font-bold leading-none">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </span>
                <span>{label}</span>
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {/* ── Account tab ─────────────────────────────────────── */}
          {isAuthenticated ? (
            <button
              onClick={() => setMenuOpen(true)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium relative
                ${isAccountActive || menuOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              aria-label="Open account menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
            >
              <Avatar className={`h-6 w-6 transition-all duration-150 ${
                isAccountActive || menuOpen
                  ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-110"
                  : "ring-1 ring-border"
              }`}>
                <AvatarImage src={user?.avatar} alt={fullName} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span>Account</span>
              {(isAccountActive || menuOpen) && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          ) : (
            <Link
              to="/?auth=login"
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium relative
                ${isAccountActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              aria-label="Sign in"
            >
              <User
                className={`h-5 w-5 transition-transform duration-150 ${isAccountActive ? "scale-110" : ""}`}
                strokeWidth={isAccountActive ? 2.5 : 2}
              />
              <span>Account</span>
              {isAccountActive && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
              )}
            </Link>
          )}

        </div>
      </nav>

      <UserMenu
        mode="sheet"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
    </>
  );
};

export default MobileBottomNav;
