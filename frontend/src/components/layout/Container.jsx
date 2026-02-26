// Container.jsx - Professional React Container Component

import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import clsx from "clsx"; // Recommended for className merging
import "@/styles/container.css";

/**
 * Container Component
 *
 * A flexible, responsive container component that provides consistent
 * max-width and padding across different screen sizes.
 *
 * @component
 * @example
 * // Basic usage
 * <Container>
 *   <YourContent />
 * </Container>
 *
 * @example
 * // Fluid container (full width)
 * <Container fluid>
 *   <YourContent />
 * </Container>
 *
 * @example
 * // Custom size with no padding
 * <Container size="lg" noPadding>
 *   <YourContent />
 * </Container>
 */

const Container = forwardRef(
  (
    {
      children,
      className = "",
      fluid = false,
      size = null, // 'sm', 'md', 'lg', 'xl', 'xxl'
      noPadding = false,
      as: Component = "div",
      role = "region",
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    // Generate container classes
    const containerClasses = clsx(
      // Base class
      !fluid && "container",
      fluid && "container-fluid",

      // Size modifier (overrides responsive behavior)
      size && `container-${size}`,

      // No padding modifier
      noPadding && "container-no-padding",

      // Custom className
      className,
    );

    return (
      <Component
        ref={ref}
        className={containerClasses}
        role={role}
        aria-label={ariaLabel}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

Container.displayName = "Container";

Container.propTypes = {
  /** Content to be rendered inside the container */
  children: PropTypes.node.isRequired,

  /** Additional CSS classes */
  className: PropTypes.string,

  /** If true, container becomes full-width with responsive padding */
  fluid: PropTypes.bool,

  /** Fixed size override (overrides responsive behavior) */
  size: PropTypes.oneOf(["sm", "md", "lg", "xl", "xxl", null]),

  /** Remove all padding */
  noPadding: PropTypes.bool,

  /** HTML element to render */
  as: PropTypes.elementType,

  /** ARIA role for accessibility */
  role: PropTypes.string,

  /** ARIA label for accessibility */
  "aria-label": PropTypes.string,
};

Container.defaultProps = {
  className: "",
  fluid: false,
  size: null,
  noPadding: false,
  as: "div",
  role: "region",
  "aria-label": undefined,
};

export default Container;
