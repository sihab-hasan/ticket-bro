/**
 * SectionShell.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Reusable section wrapper used by ALL browse sections.
 *
 * Provides:
 *   - Consistent padding / Container
 *   - Section header with title, subtitle, badge icon, view-all link
 *   - Horizontal scroll wrapper (for row layouts)
 *   - Top/bottom divider option
 *
 * Usage:
 *   <SectionShell title="Trending Now" icon={Flame} subtitle="12 events" viewAllHref="/browse">
 *     <div className="grid ...">...</div>
 *   </SectionShell>
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Container from "@/components/layout/Container";

const SectionShell = ({
  title,
  subtitle,
  icon: Icon,
  viewAllHref,
  viewAllLabel = "View All",
  children,
  divider = true,
  scrollable = false,
  className = "",
  innerClassName = "",
  "aria-label": ariaLabel,
}) => (
  <section
    className={`w-full bg-background ${className}`}
    aria-label={ariaLabel || title}
  >
    <Container>
      <div className="py-8">
        {/* Header */}
        {title && (
          <div className="flex items-start justify-between mb-5 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {Icon && (
                <span className="flex items-center justify-center w-7 h-7 rounded shrink-0 bg-primary/10 text-primary border border-primary/20">
                  <Icon size={13} strokeWidth={2} />
                </span>
              )}
              <div>
                <h2
                  className="text-xl font-bold text-foreground leading-tight"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {title}
                </h2>
                {subtitle && (
                  <p
                    className="text-sm text-muted-foreground mt-0.5"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            {viewAllHref && (
              <Link
                to={viewAllHref}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80  shrink-0 mt-0.5"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {viewAllLabel}
                <ChevronRight size={13} />
              </Link>
            )}
          </div>
        )}

        {/* Content */}
        {scrollable ? (
          <div
            className={`flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory ${innerClassName}`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {children}
          </div>
        ) : (
          <div className={innerClassName}>{children}</div>
        )}
      </div>

      {divider && <div className="w-full h-px bg-border" />}
    </Container>
  </section>
);

export default SectionShell;
