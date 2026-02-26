import React, { useState, useEffect } from "react";
import {
  LogOut,
  User,
  Shield,
  Monitor,
  ChevronRight,
  Check,
  Eye,
  EyeOff,
  Key,
  Clock,
  Globe,
  Smartphone,
  AlertCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import useAuth from "../context/AuthContext";
import { InputGroup, Spinner, Badge, Card } from "../components/shared/ui";
import { changePwSchema } from "../utils/validators";
import authService from "../services/authService";
import authConfig from "../config/auth.config";

// ── Top Nav ───────────────────────────────────────────────────────────────────
const Nav = ({ user, logout }) => {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("auth_theme", next ? "dark" : "light");
  };

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--card)",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "0 1.5rem",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "calc(var(--radius)*2)",
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={14} style={{ color: "var(--primary-foreground)" }} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--foreground)",
            }}
          >
            {authConfig.appName}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={toggle}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1.5px solid var(--border)",
              background: "var(--background)",
              color: "var(--foreground)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {dark ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 12px",
              border: "1px solid var(--border)",
              borderRadius: "calc(var(--radius)*2)",
              background: "var(--muted)",
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--primary-foreground)",
                fontFamily: "var(--font-heading)",
              }}
            >
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--foreground)",
                fontFamily: "var(--font-heading)",
              }}
            >
              {user?.firstName} {user?.lastName}
            </span>
          </div>
          <button
            onClick={logout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "calc(var(--radius)*2)",
              border: "1.5px solid var(--border)",
              background: "var(--background)",
              color: "var(--muted-foreground)",
              fontSize: 13,
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              cursor: "pointer",
            }}
            className="hover:bg-[var(--muted)] transition-colors"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const Stat = ({ label, value, badge, icon: Icon }) => (
  <div
    style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "calc(var(--radius)*3)",
      padding: "1rem 1.25rem",
      display: "flex",
      alignItems: "center",
      gap: 12,
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "calc(var(--radius)*2)",
        background: "var(--muted)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={16} style={{ color: "var(--foreground)" }} />
    </div>
    <div>
      <p
        style={{
          fontSize: 11,
          color: "var(--muted-foreground)",
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 2,
        }}
      >
        {label}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--foreground)",
            fontFamily: "var(--font-heading)",
          }}
        >
          {value}
        </p>
        {badge}
      </div>
    </div>
  </div>
);

// ── Tab Button ────────────────────────────────────────────────────────────────
const Tab = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "0.625rem 1rem",
      fontFamily: "var(--font-heading)",
      fontWeight: 600,
      fontSize: 13,
      cursor: "pointer",
      borderBottom: active
        ? "2px solid var(--foreground)"
        : "2px solid transparent",
      color: active ? "var(--foreground)" : "var(--muted-foreground)",
      background: "none",
      border: "none",
      borderBottom: active
        ? "2px solid var(--foreground)"
        : "2px solid transparent",
      transition: "color 0.15s",
    }}
  >
    <Icon size={14} />
    {label}
  </button>
);

// ── Change Password Form ──────────────────────────────────────────────────────
const ChangePasswordForm = ({ onSuccess }) => {
  const [show, setShow] = useState({});
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(changePwSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.changePassword(data);
      toast.success("Password changed. Please sign in again.");
      reset();
      onSuccess?.();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const f = (key) => ({
    left: <Key size={15} />,
    right: (
      <button
        type="button"
        onClick={() => setShow((p) => ({ ...p, [key]: !p[key] }))}
        style={{ color: "var(--muted-foreground)" }}
        className="hover:opacity-70"
      >
        {show[key] ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    ),
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      style={{ maxWidth: 380 }}
    >
      <InputGroup
        label="Current password"
        error={errors.currentPassword?.message}
        {...f("current")}
      >
        <input
          {...register("currentPassword")}
          type={show.current ? "text" : "password"}
          placeholder="••••••••"
        />
      </InputGroup>
      <InputGroup
        label="New password"
        error={errors.newPassword?.message}
        {...f("new")}
      >
        <input
          {...register("newPassword")}
          type={show.new ? "text" : "password"}
          placeholder="••••••••"
        />
      </InputGroup>
      <InputGroup
        label="Confirm new password"
        error={errors.confirmNewPassword?.message}
        {...f("confirm")}
      >
        <input
          {...register("confirmNewPassword")}
          type={show.confirm ? "text" : "password"}
          placeholder="••••••••"
        />
      </InputGroup>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary !w-auto px-8 flex items-center gap-2"
      >
        {loading ? <Spinner /> : <>Update password</>}
      </button>
    </form>
  );
};

// ── Sessions ──────────────────────────────────────────────────────────────────
const Sessions = () => {
  const [sessions, setSessions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getActiveSessions()
      .then((r) => setSessions(r.data.data))
      .catch(() => toast.error("Failed to load sessions"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner size={24} />
      </div>
    );

  return (
    <div>
      <p
        style={{
          fontSize: 13,
          color: "var(--muted-foreground)",
          marginBottom: 16,
        }}
      >
        {sessions?.length || 0} active session
        {sessions?.length !== 1 ? "s" : ""}
      </p>
      <div className="space-y-3">
        {sessions?.map((s, i) => (
          <div
            key={s.id || i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0.875rem 1rem",
              border: "1px solid var(--border)",
              borderRadius: "calc(var(--radius)*3)",
              background: "var(--card)",
            }}
          >
            <Smartphone
              size={16}
              style={{ color: "var(--muted-foreground)", flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--foreground)",
                  fontFamily: "var(--font-heading)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {s.userAgent || "Unknown device"}
              </p>
              <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
                {s.ipAddress || "—"} ·{" "}
                {s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}
              </p>
            </div>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "oklch(0.5 0.15 142)",
                flexShrink: 0,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("profile");

  const fields = [
    ["First name", user?.firstName],
    ["Last name", user?.lastName],
    ["Email", user?.email],
    ["Phone", user?.phone || "—"],
    ["Role", user?.role],
    ["OAuth provider", user?.oauthProvider || "local"],
    [
      "Member since",
      user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—",
    ],
    [
      "Last login",
      user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never",
    ],
  ];

  return (
    <div style={{ minHeight: "100svh", background: "var(--background)" }}>
      <Nav user={user} logout={logout} />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {/* Welcome */}
        <div className="animate-fade-up" style={{ marginBottom: 28 }}>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 26,
              fontWeight: 800,
              color: "var(--foreground)",
              marginBottom: 4,
            }}
          >
            Hello, {user?.firstName} 👋
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Manage your account, security settings and active sessions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 animate-fade-up delay-100">
          <Stat
            icon={User}
            label="Account"
            value={user?.isEmailVerified ? "Verified" : "Unverified"}
            badge={
              <Badge variant={user?.isEmailVerified ? "success" : "danger"}>
                {user?.isEmailVerified ? "✓ Active" : "! Pending"}
              </Badge>
            }
          />
          <Stat
            icon={Shield}
            label="2FA"
            value={user?.isTwoFactorEnabled ? "Enabled" : "Disabled"}
            badge={
              <Badge variant={user?.isTwoFactorEnabled ? "success" : "default"}>
                {user?.isTwoFactorEnabled ? "On" : "Off"}
              </Badge>
            }
          />
          <Stat
            icon={Globe}
            label="Auth method"
            value={user?.oauthProvider || "local"}
            badge={null}
          />
        </div>

        {/* Tabs */}
        <div
          className="animate-fade-up delay-200"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "calc(var(--radius)*3)",
            overflow: "hidden",
          }}
        >
          {/* Tab bar */}
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--border)",
              padding: "0 1rem",
            }}
          >
            <Tab
              active={tab === "profile"}
              onClick={() => setTab("profile")}
              icon={User}
              label="Profile"
            />
            <Tab
              active={tab === "security"}
              onClick={() => setTab("security")}
              icon={Shield}
              label="Security"
            />
            <Tab
              active={tab === "sessions"}
              onClick={() => setTab("sessions")}
              icon={Monitor}
              label="Sessions"
            />
          </div>

          <div style={{ padding: "1.5rem" }}>
            {/* Profile */}
            {tab === "profile" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 28,
                    paddingBottom: 20,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: 18,
                      color: "var(--primary-foreground)",
                      flexShrink: 0,
                    }}
                  >
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 800,
                        fontSize: 17,
                        color: "var(--foreground)",
                      }}
                    >
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p
                      style={{ fontSize: 13, color: "var(--muted-foreground)" }}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {fields.map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        padding: "0.75rem 1rem",
                        background: "var(--muted)",
                        border: "1px solid var(--border)",
                        borderRadius: "calc(var(--radius)*2)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--muted-foreground)",
                          fontWeight: 600,
                          fontFamily: "var(--font-heading)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: 3,
                        }}
                      >
                        {k}
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: "var(--foreground)",
                          fontWeight: 500,
                        }}
                      >
                        {v}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security */}
            {tab === "security" && (
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: 15,
                    color: "var(--foreground)",
                    marginBottom: 20,
                  }}
                >
                  Change password
                </h3>
                <ChangePasswordForm onSuccess={logout} />
              </div>
            )}

            {/* Sessions */}
            {tab === "sessions" && <Sessions />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
