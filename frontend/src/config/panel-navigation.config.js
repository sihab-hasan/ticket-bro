import {
  Activity,
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  FolderTree,
  Gift,
  LayoutDashboard,
  MessageSquare,
  Server,
  Settings,
  Shield,
  Ticket,
  User,
  Users,
} from "lucide-react";

import { PANELS } from "@/config/panels.config";

export const PANEL_ICON_BY_ID = {
  [PANELS.USER]: User,
  [PANELS.ORGANIZER]: Calendar,
  [PANELS.MODERATOR]: Shield,
  [PANELS.ADMIN]: LayoutDashboard,
  [PANELS.SUPER_ADMIN]: Server,
};

export const PANEL_NAVIGATION = {
  [PANELS.ORGANIZER]: [
    {
      section: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/organizer/dashboard",
          icon: LayoutDashboard,
          exact: true,
          description: "Live event, booking, and payout overview",
        },
      ],
    },
    {
      section: "Operations",
      items: [
        {
          label: "Events",
          href: "/organizer/events",
          icon: Calendar,
          description: "Create and manage published and draft events",
        },
        {
          label: "Tickets",
          href: "/organizer/events/tickets",
          icon: Ticket,
          description: "Manage ticket types and inventory",
        },
        {
          label: "Bookings",
          href: "/organizer/bookings",
          icon: Users,
          description: "Monitor attendee orders and check-ins",
        },
        {
          label: "Revenue",
          href: "/organizer/revenue",
          icon: DollarSign,
          description: "Track earnings, fees, and payouts",
        },
        {
          label: "Analytics",
          href: "/organizer/analytics",
          icon: BarChart3,
          description: "Performance and audience insights",
        },
      ],
    },
    {
      section: "Setup",
      items: [
        {
          label: "Messages",
          href: "/messages",
          icon: MessageSquare,
          description: "Chat with attendees and answer questions",
        },
        {
          label: "Settings",
          href: "/organizer/settings",
          icon: Settings,
          description: "Organizer profile and verification settings",
        },
      ],
    },
  ],
  [PANELS.MODERATOR]: [
    {
      section: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/moderator/dashboard",
          icon: LayoutDashboard,
          exact: true,
          description: "Trust and safety command center",
        },
      ],
    },
    {
      section: "Moderation",
      items: [
        {
          label: "Reports Queue",
          href: "/moderator/reports",
          icon: FileText,
          description: "Resolve user-submitted reports",
        },
        {
          label: "Event Review",
          href: "/moderator/events",
          icon: Calendar,
          description: "Approve or reject pending events",
        },
        {
          label: "User Actions",
          href: "/moderator/users",
          icon: Users,
          description: "Suspend, restore, or warn user accounts",
        },
      ],
    },
  ],
  [PANELS.ADMIN]: [
    {
      section: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboard,
          exact: true,
          description: "Platform-wide operational overview",
        },
        {
          label: "Analytics",
          href: "/admin/analytics",
          icon: BarChart3,
          description: "Platform metrics and revenue trends",
        },
        {
          label: "Reports",
          href: "/admin/reports",
          icon: FileText,
          description: "Operational report handling",
        },
      ],
    },
    {
      section: "Operations",
      items: [
        {
          label: "Users",
          href: "/admin/users",
          icon: Users,
          description: "Manage accounts and account status",
        },
        {
          label: "Events",
          href: "/admin/events",
          icon: Calendar,
          description: "Control platform event visibility and quality",
        },
        {
          label: "Bookings",
          href: "/admin/bookings",
          icon: Ticket,
          description: "Handle booking issues and refunds",
        },
        {
          label: "Payments",
          href: "/admin/payments",
          icon: CreditCard,
          description: "Review payments, payouts, and settlement issues",
        },
        {
          label: "Promotions",
          href: "/admin/promotions",
          icon: Gift,
          description: "Manage promos and campaign controls",
        },
      ],
    },
    {
      section: "Platform",
      items: [
        {
          label: "Settings",
          href: "/admin/system/settings",
          icon: Settings,
          description: "Platform feature and settings controls",
        },
        {
          label: "Security",
          href: "/admin/system/security",
          icon: Shield,
          description: "Sessions, audits, and security alerts",
        },
        {
          label: "Health",
          href: "/admin/system/health",
          icon: Activity,
          description: "Infrastructure health and metrics",
        },
        {
          label: "Logs",
          href: "/admin/system/logs",
          icon: Server,
          description: "Backend operational logs",
        },
      ],
    },
  ],
  [PANELS.SUPER_ADMIN]: [
    {
      section: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/super-admin/dashboard",
          icon: LayoutDashboard,
          exact: true,
          description: "Governance and platform control center",
        },
      ],
    },
    {
      section: "Governance",
      items: [
        {
          label: "Role Management",
          href: "/super-admin/roles",
          icon: Users,
          description: "Assign roles and control staff access",
        },
        {
          label: "Audit Center",
          href: "/super-admin/audit",
          icon: FileText,
          description: "Review privileged activity and audit trails",
        },
        {
          label: "Platform Control",
          href: "/super-admin/platform",
          icon: Settings,
          description: "Global settings, security, and system actions",
        },
        {
          label: "Category Management",
          href: "/super-admin/categories",
          icon: FolderTree,
          description: "Create and manage categories, sub-categories, and event types",
        },
      ],
    },
  ],
};

export default {
  PANEL_ICON_BY_ID,
  PANEL_NAVIGATION,
};
