// src/components/shared/Loader.jsx
import React from "react";
import Container from "@/components/layout/Container";

// Size configuration constants
const SIZE_CONFIG = {
  sm: {
    spinner: "h-8 w-8 border-t-2 border-b-2",
    text: "text-xs",
    brandText: "text-xs",
    spacing: "mt-4",
  },
  md: {
    spinner: "h-16 w-16 border-t-2 border-b-2",
    text: "text-sm",
    brandText: "text-xs",
    spacing: "mt-6",
  },
  lg: {
    spinner: "h-24 w-24 border-t-4 border-b-4",
    text: "text-base",
    brandText: "text-sm",
    spacing: "mt-8",
  },
  xl: {
    spinner: "h-32 w-32 border-t-4 border-b-4",
    text: "text-lg",
    brandText: "text-base",
    spacing: "mt-10",
  },
};

// Base Spinner Component
const Spinner = ({ size = "md", showBrand = true, brandText = "TicketBro" }) => {
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  
  return (
    <div className="relative">
      <div
        className={`animate-spin rounded-full ${config.spinner} border-brand-primary`}
      />
      {showBrand && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={config.brandText}>{brandText}</div>
        </div>
      )}
    </div>
  );
};

// Main Loader Component
export const Loader = ({
  // Content
  text = "Loading...",
  subtitle,
  city,
  
  // Appearance
  size = "md",
  brandText = "TicketBro",
  
  // Behavior
  fullScreen = false,
  showSpinner = true,
  showBrand = true,
  showText = true,
  showSubtitle = true,
  
  // Custom styling
  className = "",
  spinnerClassName = "",
  textClassName = "",
  subtitleClassName = "",
  
  // Container options
  withContainer = false,
  containerClassName = "",
  minHeight = "min-h-[200px]",
  
  // Actions
  actionButton = false,
  actionText = "Retry",
  onAction,
  
}) => {
  
  const config = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  
  // Build loader content
  const loaderContent = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {showSpinner && (
        <Spinner 
          size={size} 
          showBrand={showBrand} 
          brandText={brandText}
        />
      )}
      
      {showText && text && (
        <p className={`text-muted-foreground ${config.text} font-medium tracking-widest uppercase ${config.spacing} ${textClassName}`}>
          {text}
        </p>
      )}
      
      {showSubtitle && subtitle && (
        <p className={`text-muted-foreground/50 ${size === "sm" ? "text-xs" : "text-sm"} mt-2 ${subtitleClassName}`}>
          {subtitle}
        </p>
      )}
      
      {showSubtitle && city && !subtitle && (
        <p className={`text-muted-foreground/50 ${size === "sm" ? "text-xs" : "text-sm"} mt-2 ${subtitleClassName}`}>
          in {city}
        </p>
      )}
      
      {actionButton && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm text-xs font-medium uppercase tracking-wider transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
  
  // Handle full screen mode
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {loaderContent}
      </div>
    );
  }
  
  // Handle with container
  if (withContainer) {
    return (
      <section className="w-full">
        <Container>
          <div className={`w-full ${minHeight} flex items-center justify-center rounded-sm ${containerClassName}`}>
            {loaderContent}
          </div>
        </Container>
      </section>
    );
  }
  
  return loaderContent;
};

// Page Loader - Full page loader
export const PageLoader = ({ 
  text = "Loading...", 
  subtitle = "Please wait",
  city,
  ...props 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader
        size="xl"
        text={text}
        subtitle={subtitle}
        city={city}
        showBrand={true}
        {...props}
      />
    </div>
  );
};

// Section Loader - For loading specific sections
export const SectionLoader = ({ 
  text = "Loading...", 
  city,
  height = "h-64",
  withContainer = false,
  ...props 
}) => {
  return (
    <div className={`w-full ${height} flex items-center justify-center`}>
      <Loader
        size="md"
        text={text}
        city={city}
        {...props}
      />
    </div>
  );
};

// Inline Loader - For buttons or small areas
export const InlineLoader = ({ 
  text, 
  size = "sm",
  showBrand = false,
  ...props 
}) => {
  return (
    <div className="flex items-center gap-2">
      <Loader
        size={size}
        showBrand={showBrand}
        showText={false}
        {...props}
      />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
};

// FullScreen Loader - Modal style loader
export const FullScreenLoader = ({ 
  text = "Loading...", 
  subtitle,
  ...props 
}) => {
  return (
    <Loader
      fullScreen
      size="lg"
      text={text}
      subtitle={subtitle}
      {...props}
    />
  );
};

// Content Loader - For loading states inside content areas
export const ContentLoader = ({ 
  text = "Loading content...",
  city,
  height = "h-96",
  ...props 
}) => {
  return (
    <div className={`w-full ${height} flex items-center justify-center border border-border rounded-sm bg-card`}>
      <Loader
        size="lg"
        text={text}
        city={city}
        {...props}
      />
    </div>
  );
};

// Empty State Component
export const EmptyState = ({ 
  icon: Icon,
  title = "No items found",
  message = "Check back soon for updates",
  actionText = "Refresh",
  onAction,
  city,
  size = "md",
  ...props 
}) => {
  const iconSizes = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && (
        <Icon 
          size={iconSizes[size] || 48} 
          className="text-brand-primary opacity-30 mb-4" 
        />
      )}
      <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase text-center">
        {title} {city ? `in ${city}` : ""}
      </p>
      <p className="text-muted-foreground/50 text-xs mt-3 max-w-md text-center">
        {message}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-sm text-xs font-medium uppercase tracking-wider transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

// Export all
export default Loader;