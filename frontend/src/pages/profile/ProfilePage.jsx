// frontend/src/pages/profile/ProfilePage.jsx

import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit3,
  Key,
  Bell,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Clock,
  Ticket,
  CreditCard,
  Camera,
  MessageSquare,
  Heart,
  Globe,
  XCircle,
} from "lucide-react";
import {
  fetchProfile,
  selectProfile,
  selectUserLoading,
} from "@/store/slices/userSlice";
import { logoutUser } from "@/store/slices/authSlice";
import AvatarUpload from "@/components/roles/user/AvatarUpload";
import { ROUTES } from "@/app/AppRoutes";
import authService from "@/api/auth.api";
import Container from '@/components/layout/Container';
import { useSocket } from "@/hooks";

// ── Role badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    admin: "bg-destructive/10 text-destructive border-destructive/20",
    organizer:
      "bg-primary/15 text-lime-700 dark:text-lime-400 border-primary/30",
    user: "bg-secondary text-secondary-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border font-heading ${styles[role] ?? styles.user}`}
    >
      {role}
    </span>
  );
};

// ── Info row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground mb-0.5 uppercase tracking-wide font-medium">
          {label}
        </p>
        <p className="text-sm font-medium text-foreground break-words">
          {value}
        </p>
      </div>
    </div>
  );
};

// ── Card ──────────────────────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-card rounded-2xl p-4 sm:p-5 ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ title, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-sm font-bold text-foreground font-heading">{title}</h2>
    {action}
  </div>
);

// ── Nav item ──────────────────────────────────────────────────────────────────
const NavItem = ({ to, icon: Icon, label, desc, color, onClick, danger }) => {
  const inner = (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 sm:py-3 rounded-xl transition-colors cursor-pointer
      ${danger ? "hover:bg-destructive/5 active:bg-destructive/10" : "hover:bg-muted active:bg-muted/80"}`}
    >
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0
        ${danger ? "bg-destructive/10" : "bg-muted"}`}
      >
        <Icon
          size={15}
          className={
            danger ? "text-destructive" : color || "text-muted-foreground"
          }
        />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold font-heading truncate ${danger ? "text-destructive" : "text-foreground"}`}
        >
          {label}
        </p>
        {desc && (
          <p className="text-xs text-muted-foreground truncate hidden sm:block">
            {desc}
          </p>
        )}
      </div>
      <ChevronRight size={14} className="text-muted-foreground shrink-0" />
    </div>
  );

  if (onClick) return <div onClick={onClick}>{inner}</div>;
  return (
    <Link to={to} className="block no-underline">
      {inner}
    </Link>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <Container><div className="max-w-2xl mx-auto py-4 space-y-3 sm:space-y-4 animate-pulse">
    <div className="bg-card rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-muted shrink-0" />
        <div className="flex-1 w-full space-y-3">
          <div className="h-5 bg-muted rounded-lg w-40 mx-auto sm:mx-0" />
          <div className="h-3.5 bg-muted rounded-lg w-48 mx-auto sm:mx-0" />
          <div className="h-8 bg-muted rounded-lg w-28 mx-auto sm:mx-0" />
        </div>
      </div>
    </div>
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-card rounded-2xl p-4 sm:p-5"
      >
        <div className="h-4 bg-muted rounded w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2].map((j) => (
            <div key={j} className="h-10 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    ))}
  </div></Container>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profile = useSelector(selectProfile);
  const isLoading = useSelector(selectUserLoading);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  // ── Sessions state ───────────────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [revokingId, setRevokingId] = useState(null);

useEffect(() => {
    dispatch(fetchProfile());
  }, []);

  // Real-time updates for user panel
  const handleSocketEvent = useCallback((event, data) => {
    if (event === 'user:booking.confirmed' || event === 'user:booking.cancelled') {
      dispatch(fetchProfile());
    } else if (event === 'user:ticket.validated') {
      dispatch(fetchProfile());
    } else if (event === 'user:ticket.transferred') {
      dispatch(fetchProfile());
    } else if (event === 'user:payment.success' || event === 'user:payment.failed') {
      dispatch(fetchProfile());
    } else if (event === 'user:refund.processed') {
      dispatch(fetchProfile());
    } else if (event === 'user:event.updated' || event === 'user:event.cancelled') {
      // Could show notification toast
      console.log('Event update:', data);
    }
  }, [dispatch]);

  useSocket([
    'user:booking.confirmed',
    'user:booking.cancelled',
    'user:ticket.validated',
    'user:ticket.transferred',
    'user:payment.success',
    'user:payment.failed',
    'user:refund.processed',
    'user:event.updated',
    'user:event.cancelled',
  ], { onEvent: handleSocketEvent });

  // Fetch active sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoadingSessions(true);
        const data = await authService.getActiveSessions();
        // Ensure data is an array; the API returns an array of session objects
        setSessions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSessions(false);
      }
    };
    fetchSessions();
  }, []);

  // Handler to revoke a session
  const handleRevokeSession = async (id) => {
    if (!id) return;
    try {
      setRevokingId(id);
      await authService.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setRevokingId(null);
    }
  };

  if (isLoading && !profile) return <Skeleton />;
  if (!profile) return null;

  const address = [
    profile.address?.city,
    profile.address?.state,
    profile.address?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const dob = profile.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <Container aria-label="Profile"><div className="max-w-2xl mx-auto py-4 space-y-3 sm:space-y-4 font-sans pb-8">
      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-2 ring-border ring-offset-2 ring-offset-background">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-black font-heading"
                  style={{
                    background: "linear-gradient(135deg, #a3e635, #65a30d)",
                  }}
                >
                  {`${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAvatarUpload(true)}
              className="absolute -bottom-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
              title="Change avatar"
            >
              <Camera size={13} />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 w-full text-center sm:text-left">
            {/* Name + badges */}
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-foreground font-heading leading-tight">
                {profile.firstName} {profile.lastName}
              </h1>
              <RoleBadge role={profile.role} />
              {profile.isEmailVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={11} /> Verified
                </span>
              )}
            </div>

            {/* Email */}
            <p className="text-sm text-muted-foreground mb-1.5 truncate">
              {profile.email}
            </p>

            {/* Bio */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2 hidden sm:block">
              {profile.bio || "No bio added yet. Tell people about yourself."}
            </p>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
              <Link
                to={ROUTES.PROFILE.EDIT}
                className="inline-flex items-center gap-1.5 h-8 px-3 sm:px-3.5 rounded-lg bg-primary text-black text-xs font-bold font-heading no-underline hover:brightness-110 active:brightness-95 transition-all"
              >
                <Edit3 size={12} />
                <span>Edit profile</span>
              </Link>
              <Link
                to={ROUTES.PROFILE.CHANGE_PASSWORD}
                className="inline-flex items-center gap-1.5 h-8 px-3 sm:px-3.5 rounded-lg border border-border bg-card text-foreground text-xs font-semibold no-underline hover:border-accent hover:bg-accent transition-all"
              >
                <Key size={12} />
                <span>Password</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bio visible on mobile below the row */}
        {(profile.bio || true) && (
          <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-3 sm:hidden">
            {profile.bio || "No bio added yet. Tell people about yourself."}
          </p>
        )}
      </Card>

      {/* ── Personal info ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Personal information"
          action={
            <Link
              to={ROUTES.PROFILE.EDIT}
              className="text-xs font-semibold text-primary no-underline hover:brightness-90"
            >
              Edit
            </Link>
          }
        />
        <InfoRow icon={Mail} label="Email address" value={profile.email} />
        <InfoRow icon={Phone} label="Phone number" value={profile.phone} />
        <InfoRow icon={Calendar} label="Date of birth" value={dob} />
        <InfoRow
          icon={User}
          label="Age"
          value={profile.age ? `${profile.age} years old` : null}
        />
        <InfoRow icon={MapPin} label="Location" value={address} />
      </Card>

      {/* ── Account ───────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader title="Account" />
        <NavItem
          to={ROUTES.PROFILE.EDIT}
          icon={User}
          label="Edit profile"
          desc="Update your name, bio, and more"
        />
        <NavItem
          to={ROUTES.PROFILE.CHANGE_PASSWORD}
          icon={Key}
          label="Change password"
          desc="Update your account password"
        />
        <NavItem
          to={ROUTES.PROFILE.NOTIFICATIONS}
          icon={Bell}
          label="Notifications"
          desc="Manage your notification preferences"
        />
        <NavItem
          to={ROUTES.BOOKINGS.ROOT}
          icon={Ticket}
          label="My bookings"
          desc="View your event bookings"
        />
        <NavItem
          to={ROUTES.PAYMENTS.HISTORY}
          icon={CreditCard}
          label="Payment history"
          desc="View past transactions"
        />

        {/* NEW ITEMS */}
        <NavItem
          to="/messages"
          icon={MessageSquare}
          label="Messages"
          desc="View your conversations"
        />
        <NavItem
          to="/notifications"
          icon={Bell}
          label="All notifications"
          desc="System notifications"
        />
        <NavItem
          to="/favorites"
          icon={Heart}
          label="Saved events"
          desc="Events you saved"
        />
      </Card>

      {/* ── Security ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader title="Security" />
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 mb-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0
              ${profile.isTwoFactorEnabled ? "bg-emerald-500/10" : "bg-muted"}`}
            >
              <Shield
                size={15}
                className={
                  profile.isTwoFactorEnabled
                    ? "text-emerald-500"
                    : "text-muted-foreground"
                }
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground font-heading truncate">
                Two-factor auth
              </p>
              <p className="text-xs text-muted-foreground truncate hidden sm:block">
                {profile.isTwoFactorEnabled
                  ? "Your account is protected"
                  : "Add extra security to your account"}
              </p>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shrink-0
            ${
              profile.isTwoFactorEnabled
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {profile.isTwoFactorEnabled ? "On" : "Off"}
          </span>
        </div>

        {profile.lastLoginAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <Clock size={12} className="shrink-0" />
            <span className="truncate">
              Last sign in:{" "}
              {new Date(profile.lastLoginAt).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        )}
      </Card>

      {/* ── Sessions ──────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader title="Active sessions" />
        {loadingSessions ? (
          <div className="space-y-2 py-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-12 rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground px-1 py-3">
            No other active sessions.
          </p>
        ) : (
          sessions.map((session, index) => {
            const isCurrent = index === 0;
            return (
              <div
                key={session.id}
                className="flex items-start gap-3 py-3 px-1 border-b border-border last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {session.userAgent || "Unknown device"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                    <Globe size={12} className="shrink-0" />
                    {session.ipAddress || "Unknown IP"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                    <Clock size={12} className="shrink-0" />
                    {new Date(session.createdAt).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                {isCurrent ? (
                  <span className="text-xs font-semibold text-primary whitespace-nowrap">
                    Current device
                  </span>
                ) : (
                  <button
                    className="inline-flex items-center gap-1 text-xs font-semibold text-destructive hover:text-destructive/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={revokingId === session.id}
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    <XCircle size={12} />
                    <span>
                      {revokingId === session.id ? "Revoking..." : "Revoke"}
                    </span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </Card>

      {/* ── Sign out ──────────────────────────────────────────────────────── */}
      <Card>
        <NavItem
          icon={LogOut}
          label="Sign out"
          desc="Sign out of your account"
          danger
          onClick={() =>
            dispatch(logoutUser()).then(() => navigate('/?auth=login'))
          }
        />
      </Card>

      {/* Avatar Upload Dialog */}
      <AvatarUpload
        user={profile}
        open={showAvatarUpload}
        onOpenChange={setShowAvatarUpload}
      />
    </div></Container>
  );
};

export default ProfilePage;
