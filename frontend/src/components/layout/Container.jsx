import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import '@/styles/container.css';

const variantClasses = {
  narrow: 'container--narrow',
  default: 'container--default',
  wide: 'container--wide',
  full: 'container--full',
};

const Container = forwardRef(
  (
    {
      children,
      className = '',
      fluid = false,
      noPadding = false,
      variant = 'default',
      as: Component = 'div',
      ...props
    },
    ref,
  ) => {
    const containerClasses = clsx(
      fluid ? 'container-fluid' : 'container',
      variantClasses[variant],
      noPadding && 'container-no-padding',
      className,
    );

    return (
      <Component ref={ref} className={containerClasses} {...props}>
        {children}
      </Component>
    );
  },
);

Container.displayName = 'Container';

Container.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  fluid: PropTypes.bool,
  noPadding: PropTypes.bool,
  variant: PropTypes.oneOf(['narrow', 'default', 'wide', 'full']),
  as: PropTypes.elementType,
};

export default Container;
