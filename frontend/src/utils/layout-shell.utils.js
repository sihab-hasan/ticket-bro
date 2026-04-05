const normalizePathname = (pathname = "/") => {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
};

export const resolveLayoutShellVariant = (pathname, shellConfig) => {
  const currentPath = normalizePathname(pathname);

  const matchedRoute = shellConfig?.routes?.find((route) => route?.matcher?.match?.(currentPath));

  return matchedRoute?.variant || shellConfig?.defaultVariant || "default";
};

export const buildLayoutShellClassName = (pathname, shellConfig) => {
  const variant = resolveLayoutShellVariant(pathname, shellConfig);
  const pageGapClassName = shellConfig?.pageGapClassName || "page-shell";

  return `${pageGapClassName} page-shell--${variant}`.trim();
};

export { normalizePathname };
