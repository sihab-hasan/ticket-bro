import { ROUTES } from "@/config/routes.config";

const exactPath = (target) => ({
  type: "exact",
  match: (pathname) => pathname === target,
});

const startsWithPath = (target) => ({
  type: "startsWith",
  match: (pathname) => pathname === target || pathname.startsWith(`${target}/`),
});

const oneOf = (...matchers) => ({
  type: "oneOf",
  match: (pathname) => matchers.some((matcher) => matcher.match(pathname)),
});

export const SHELL_VARIANTS = Object.freeze({
  NARROW: "narrow",
  DEFAULT: "default",
  WIDE: "wide",
  FULL: "full",
});

export const MAIN_LAYOUT_SHELL = {
  defaultVariant: SHELL_VARIANTS.DEFAULT,
  pageGapClassName: "page-shell page-shell--public",
  mainClassName: "layout-main layout-main--public min-h-screen pb-16 xl:pb-0",
  routes: [
    {
      variant: SHELL_VARIANTS.WIDE,
      matcher: oneOf(
        exactPath(ROUTES.HOME),
        exactPath(ROUTES.BROWSE.ROOT),
        exactPath(ROUTES.SEARCH.RESULTS),
      ),
    },
    {
      variant: SHELL_VARIANTS.NARROW,
      matcher: oneOf(
        exactPath(ROUTES.STATIC.ABOUT),
        exactPath(ROUTES.STATIC.CONTACT),
        exactPath(ROUTES.STATIC.FAQ),
        exactPath(ROUTES.STATIC.PRIVACY),
        exactPath(ROUTES.STATIC.TERMS),
      ),
    },
  ],
};

export const USER_LAYOUT_SHELL = {
  defaultVariant: SHELL_VARIANTS.DEFAULT,
  pageGapClassName: "page-shell page-shell--user",
  mainClassName: "layout-main layout-main--user flex-1 pb-16 xl:pb-0",
  routes: [
    {
      variant: SHELL_VARIANTS.NARROW,
      matcher: oneOf(
        startsWithPath(ROUTES.PROFILE.ROOT),
        exactPath(ROUTES.NOTIFICATIONS.ROOT),
        exactPath(ROUTES.NOTIFICATIONS.DETAIL(":notificationId").replace("/:notificationId", "")),
      ),
    },
    {
      variant: SHELL_VARIANTS.DEFAULT,
      matcher: oneOf(
        startsWithPath(ROUTES.BOOKINGS.ROOT),
        startsWithPath("/reviews"),
      ),
    },
    {
      variant: SHELL_VARIANTS.NARROW,
      matcher: oneOf(
        startsWithPath("/tickets/select"),
        startsWithPath("/tickets/book"),
        startsWithPath("/tickets/payment"),
        startsWithPath("/tickets/confirm"),
        startsWithPath("/tickets/download"),
        startsWithPath("/payments"),
      ),
    },
  ],
};

export default {
  MAIN_LAYOUT_SHELL,
  USER_LAYOUT_SHELL,
  SHELL_VARIANTS,
};
