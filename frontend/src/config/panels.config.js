export const PANELS = {
  USER: "user",
  ORGANIZER: "organizer",
  MODERATOR: "moderator",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

export const PANEL_META = {
  [PANELS.USER]: {
    id: PANELS.USER,
    label: "User Panel",
    path: "/profile",
  },
  [PANELS.ORGANIZER]: {
    id: PANELS.ORGANIZER,
    label: "Organizer Panel",
    path: "/organizer/dashboard",
  },
  [PANELS.MODERATOR]: {
    id: PANELS.MODERATOR,
    label: "Moderator Panel",
    path: "/moderator/dashboard",
  },
  [PANELS.ADMIN]: {
    id: PANELS.ADMIN,
    label: "Admin Panel",
    path: "/admin/dashboard",
  },
  [PANELS.SUPER_ADMIN]: {
    id: PANELS.SUPER_ADMIN,
    label: "Super Admin Panel",
    path: "/super-admin/dashboard",
  },
};

export default {
  PANELS,
  PANEL_META,
};
