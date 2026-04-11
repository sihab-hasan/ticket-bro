// frontend/src/components/browse/sections/HeroSection.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Tag,
  Layers,
  MapPin,
} from "lucide-react";
import Container from "@/components/layout/Container";
import {
  useLocation as useLocationCtx,
} from "@/context/LocationContext";
import { useBrowse, unslugify } from "@/hooks";
import Breadcrumb from "@/components/shared/common/Breadcrumb";
import LocationPicker from "@/components/shared/LocationPicker";
import { getLocationQueryValue } from "@/lib/locationSelection";

const StatCard = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-md border border-border bg-secondary/5 hover:bg-secondary/10 transition-all group hover:border-primary/30">
    <span className="flex items-center justify-center w-7 h-7 rounded shrink-0 bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary/20 ">
      <Icon size={13} strokeWidth={2} />
    </span>
    <div>
      <p
        className="text-sm font-bold leading-none text-foreground"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {value}
      </p>
      <p
        className="text-[11px] text-muted-foreground mt-0.5 leading-none"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {label}
      </p>
    </div>
  </div>
);

const HeroSection = () => {
  const navigate = useNavigate();
  const {
    selectedLocation,
    changeLocation,
    clearLocation,
    detectCurrentLocation,
    locations,
    isDetectingLocation,
  } = useLocationCtx();
  const {
    level,
    categorySlug,
    subCategorySlug,
    eventTypeSlug,
    config,
    locationLabel,
    locationFlag,
    totalCount,
    getHeroDescription,
    buildCategoryUrl,
    buildSubCategoryUrl,
    buildEventTypeUrl,
    categoryItems,
  } = useBrowse();
  const [search, setSearch] = useState("");
  const Icon = config.icon;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    const p = new URLSearchParams({
      q: search,
      ...(categorySlug && { category: categorySlug }),
      ...(subCategorySlug && { sub: subCategorySlug }),
      ...(eventTypeSlug && { type: eventTypeSlug }),
    });
    const selectedCity = getLocationQueryValue(selectedLocation);
    if (selectedCity) {
      p.set("city", selectedCity);
    }
    navigate(`/search?${p.toString()}`);
  };

  const titleNode = (() => {
    const cls =
      "text-4xl sm:text-5xl font-extrabold leading-[1.06] tracking-tight text-foreground mb-3";
    const acc = "border-b-2 border-primary pb-0.5 inline";
    if (level === "root")
      return (
        <h1 className={cls} style={{ fontFamily: "var(--font-heading)" }}>
          Find Your Next
          <br />
          <span className={acc}>Experience</span>
        </h1>
      );
    if (level === "category")
      return (
        <h1 className={cls} style={{ fontFamily: "var(--font-heading)" }}>
          Browse <span className={acc}>{config.label}</span>
          <br />
          Events
        </h1>
      );
    if (level === "subCategory")
      return (
        <h1 className={cls} style={{ fontFamily: "var(--font-heading)" }}>
          <span className={acc}>{unslugify(subCategorySlug)}</span>
          <br />
          <span className="text-muted-foreground font-semibold text-2xl sm:text-3xl">
            in {config.label}
          </span>
        </h1>
      );
    return (
      <h1 className={cls} style={{ fontFamily: "var(--font-heading)" }}>
        <span className={acc}>{unslugify(eventTypeSlug)}</span>
        <br />
        <span className="text-muted-foreground font-semibold text-xl sm:text-2xl">
          {unslugify(subCategorySlug)} · {config.label}
        </span>
      </h1>
    );
  })();

  const chipLinks = (() => {
    if (level === "root")
      return categoryItems.slice(0, 8).map((category) => ({
          label: category.label,
          href: buildCategoryUrl(category.slug),
          key: category.slug,
        }));
    if (level === "category")
      return (config.subcategories || []).map((subcategory) => ({
        label: subcategory.name || subcategory.label,
        href: buildSubCategoryUrl(categorySlug, subcategory.slug),
        key: subcategory.slug,
      }));
    if (level === "subCategory")
      return (config.eventTypes || []).map((item) => ({
        label: item.name || item.label,
        href: buildEventTypeUrl(categorySlug, subCategorySlug, item.slug),
        key: item.slug || item.name,
      }));
    return (config.eventTypes || []).map((item) => ({
      label: item.name || item.label,
      href: buildEventTypeUrl(categorySlug, subCategorySlug, item.slug),
      key: item.slug || item.name,
    }));
  })();

  const statCards = [
    {
      icon: Layers,
      value: `${totalCount.toLocaleString()}+`,
      label: `Events in ${locationLabel}`,
    },
    {
      icon: MapPin,
      value: `${locationFlag} ${locationLabel}`,
      label: "Current City",
    },
    { icon: Calendar, value: config.thisWeek || 0, label: "This Week" },
    {
      icon: Tag,
      value: config.subcategories.length || "All",
      label:
        level === "category"
          ? "Subcategories"
          : level === "root"
            ? "Categories"
            : "Types",
    },
  ];

  return (
    <section className="w-full bg-background" aria-label="Browse hero">
      <Container>
        <div className="py-4">
          <div className="mb-6">
            <Breadcrumb />
          </div>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 lg:gap-16">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded shrink-0 bg-primary/10 text-primary border border-primary/20">
                  <Icon size={13} strokeWidth={2} />
                </span>
                <span
                  className="text-[10px] font-bold tracking-widest uppercase text-primary"
                  style={{ fontFamily: "var(--font-brand)" }}
                >
                  {config.label}
                </span>
                <div className="ml-auto flex items-center gap-1.5 text-[11px] text-muted-foreground border border-border rounded-full px-2.5 py-1 bg-background/50">
                  <span>{locationFlag}</span>
                  <span className="font-medium text-foreground">
                    {locationLabel}
                  </span>
                </div>
              </div>
              {titleNode}
              <p
                className="text-sm text-muted-foreground mb-6 max-w-md leading-relaxed"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {getHeroDescription()}
              </p>
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-0 rounded-md border border-border bg-background overflow-hidden mb-6 h-10 shadow-sm hover:border-foreground/30 focus-within:border-primary "
              >
                <LocationPicker
                  locations={locations}
                  selectedLocation={selectedLocation}
                  onLocationChange={changeLocation}
                  onClearLocation={clearLocation}
                  onDetectLocation={detectCurrentLocation}
                  isDetecting={isDetectingLocation}
                  inline
                />
                <div className="w-px h-5 bg-border shrink-0" />
                <div className="flex flex-1 items-center gap-2 px-3">
                  <Search
                    size={13}
                    className="text-muted-foreground shrink-0"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${config.label === "All Events" ? "events" : config.label.toLowerCase()} in ${locationLabel}...`}
                    className="flex-1 bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
                    style={{ fontFamily: "var(--font-sans)" }}
                  />
                </div>
                <button
                  type="submit"
                  className="h-full px-4 text-xs font-semibold  shrink-0"
                  style={{
                    background: "var(--foreground)",
                    color: "var(--background)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Search
                </button>
              </form>
              {chipLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {chipLinks.map(({ label, href, key }) =>
                    href ? (
                      <Link
                        key={key}
                        to={href}
                        className="text-xs font-medium px-3.5 py-1.5 rounded-full border border-border bg-background text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all whitespace-nowrap"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {label}
                      </Link>
                    ) : (
                      <span
                        key={key}
                        className="text-xs font-medium px-3.5 py-1.5 rounded-full border border-border bg-background text-muted-foreground whitespace-nowrap"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {label}
                      </span>
                    ),
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:w-[220px] shrink-0">
              {statCards.map((s) => (
                <StatCard
                  key={s.label}
                  icon={s.icon}
                  value={s.value}
                  label={s.label}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="w-full h-[3px] bg-primary/60" />
      </Container>
    </section>
  );
};

export default HeroSection;
