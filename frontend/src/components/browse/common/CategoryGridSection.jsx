import React, { useMemo } from "react";
import { ArrowUpRight, Layers3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useBrowse, unslugify } from "@/hooks";
import SectionShell from "./SectionShell";

const TaxonomyCard = ({ item }) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      className={`group flex h-full flex-col rounded-2xl border p-5 transition-all ${
        item.isActive
          ? "border-foreground bg-foreground text-background shadow-sm"
          : "border-border bg-card hover:border-foreground/20 hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors ${
            item.isActive
              ? "border-white/15 bg-white/10 text-white"
              : "border-primary/20 bg-primary/10 text-primary"
          }`}
        >
          {Icon ? <Icon size={18} strokeWidth={2} /> : <Layers3 size={18} strokeWidth={2} />}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            item.isActive
              ? "bg-white/10 text-white/80"
              : "bg-secondary text-muted-foreground"
          }`}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {item.count.toLocaleString()} events
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3
          className="text-base font-bold leading-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {item.name}
        </h3>
        <p
          className={`mt-2 text-sm leading-relaxed ${
            item.isActive ? "text-white/70" : "text-muted-foreground"
          }`}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {item.description}
        </p>
      </div>

      <div
        className={`mt-5 flex items-center gap-1 text-xs font-semibold ${
          item.isActive ? "text-white" : "text-primary"
        }`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <span>{item.ctaLabel || "Explore"}</span>
        <ArrowUpRight size={12} />
      </div>
    </Link>
  );
};

const CategoryGridSection = () => {
  const {
    level,
    categoryItems,
    categorySlug,
    subCategorySlug,
    eventTypeSlug,
    locationLabel,
    config,
    activeCategory,
    activeSubcategory,
    scopedEvents,
    buildCategoryUrl,
    buildSubCategoryUrl,
    buildEventTypeUrl,
  } = useBrowse();

  const eventTypeCounts = useMemo(
    () =>
      scopedEvents.reduce((acc, event) => {
        const slug = event?.eventType?.slug;
        if (!slug) {
          return acc;
        }
        acc[slug] = (acc[slug] || 0) + 1;
        return acc;
      }, {}),
    [scopedEvents],
  );

  const taxonomy = useMemo(() => {
    if (level === "root") {
      return {
        title: "Explore Categories",
        subtitle: `Start broad, then narrow down the strongest live experiences happening in ${locationLabel}.`,
        items: categoryItems.map((category) => ({
          key: category.slug,
          name: category.label,
          description:
            category.description ||
            `${category.totalEvents || 0} events live right now across ${category.label}.`,
          count: Number(category.totalEvents || 0),
          href: buildCategoryUrl(category.slug),
          icon: category.icon,
          ctaLabel: "Browse category",
          isActive: false,
        })),
      };
    }

    if (level === "category") {
      const subcategories = config.subcategories || [];
      return {
        title: `Inside ${config.label}`,
        subtitle: `Use subcategories to move from broad discovery to specific event lanes in ${locationLabel}.`,
        items: subcategories.map((subcategory) => ({
          key: subcategory.slug,
          name: subcategory.name || subcategory.label || unslugify(subcategory.slug),
          description:
            subcategory.description ||
            `${subcategory.count || 0} events currently listed in this subcategory.`,
          count: Number(subcategory.count || 0),
          href: buildSubCategoryUrl(categorySlug, subcategory.slug),
          icon: activeCategory?.icon || config.icon,
          ctaLabel: "Open subcategory",
          isActive: false,
        })),
      };
    }

    const eventTypes =
      activeSubcategory?.eventTypes ||
      config.eventTypes ||
      [];

    return {
      title:
        level === "subCategory"
          ? `${activeSubcategory?.name || unslugify(subCategorySlug)} Formats`
          : `More ${activeSubcategory?.name || config.label} Formats`,
      subtitle:
        level === "subCategory"
          ? `Each format has its own page, lineup, and buying flow for ${locationLabel}.`
          : `Switch between sibling event types without leaving ${activeSubcategory?.name || config.label}.`,
      items: eventTypes.map((eventType) => {
        const slug = eventType.slug;
        const count = Number(eventTypeCounts[slug] || 0);
        return {
          key: slug,
          name: eventType.name || eventType.label || unslugify(slug),
          description:
            count > 0
              ? `${count} active ${activeSubcategory?.name || config.label} events available now.`
              : `Keep exploring adjacent formats in ${locationLabel}.`,
          count,
          href: buildEventTypeUrl(categorySlug, activeSubcategory?.slug || subCategorySlug, slug),
          icon: activeCategory?.icon || config.icon,
          ctaLabel: level === "eventType" && slug === eventTypeSlug ? "Viewing now" : "Open format",
          isActive: level === "eventType" && slug === eventTypeSlug,
        };
      }),
    };
  }, [
    activeCategory?.icon,
    activeSubcategory,
    buildCategoryUrl,
    buildEventTypeUrl,
    buildSubCategoryUrl,
    categoryItems,
    categorySlug,
    config.eventTypes,
    config.icon,
    config.label,
    config.subcategories,
    config.description,
    eventTypeCounts,
    eventTypeSlug,
    level,
    locationLabel,
    subCategorySlug,
  ]);

  if (!taxonomy.items.length) {
    return null;
  }

  return (
    <SectionShell
      title={taxonomy.title}
      subtitle={taxonomy.subtitle}
      icon={activeCategory?.icon || config.icon || Layers3}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {taxonomy.items.map((item) => (
          <TaxonomyCard key={item.key} item={item} />
        ))}
      </div>
    </SectionShell>
  );
};

export default CategoryGridSection;
