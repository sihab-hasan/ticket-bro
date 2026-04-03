// frontend/src/components/browse/sections/FiltersSection.jsx
import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, ChevronDown, X, Calendar, MapPin, Tag, Clock, Check, RotateCcw } from "lucide-react";
import Container from "@/components/layout/Container";
import { useBrowse } from "@/hooks";

const DATE_OPTIONS = [
  { value: "today", label: "Today" }, { value: "tomorrow", label: "Tomorrow" },
  { value: "this-week", label: "This Week" }, { value: "this-weekend", label: "This Weekend" },
  { value: "this-month", label: "This Month" }, { value: "next-month", label: "Next Month" },
];
const PRICE_OPTIONS = [
  { value: "free", label: "Free" }, { value: "under-500", label: "Under ৳500" },
  { value: "500-1000", label: "৳500 – ৳1,000" }, { value: "1000-2500", label: "৳1,000 – ৳2,500" },
  { value: "2500-plus", label: "৳2,500+" },
];
const FORMAT_OPTIONS = [
  { value: "in-person", label: "In Person" }, { value: "online", label: "Online" }, { value: "hybrid", label: "Hybrid" },
];
const TIME_OPTIONS = [
  { value: "morning", label: "Morning (6am–12pm)" }, { value: "afternoon", label: "Afternoon (12pm–5pm)" },
  { value: "evening", label: "Evening (5pm–9pm)" }, { value: "night", label: "Night (9pm+)" },
];
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" }, { value: "date-asc", label: "Date: Soonest" },
  { value: "date-desc", label: "Date: Latest" }, { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" }, { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];
const createFiltersFromSearchParams = (searchParams) => ({
  date: searchParams.get("date"),
  price: searchParams.get("price"),
  format: searchParams.get("format"),
  time: searchParams.get("time"),
  sort: searchParams.get("sort") || "relevance",
});

const FilterDropdown = ({ label, icon: Icon, options, value, onChange, counts = {} }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const isActive = value !== null && value !== undefined;
  const triggerLabel = isActive ? options.find((o) => o.value === value)?.label || label : label;
  return (
    <div className="relative shrink-0" ref={ref}>
      <button onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium whitespace-nowrap"
        style={{ background: isActive ? "var(--foreground)" : "var(--background)", borderColor: isActive ? "var(--foreground)" : "var(--border)", color: isActive ? "var(--background)" : "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}>
        {Icon && <Icon size={12} className="shrink-0" />}
        <span>{triggerLabel}</span>
        {isActive ? (
          <span role="button" aria-label={`Clear ${label}`} onClick={(e) => { e.stopPropagation(); onChange(null); }} className="hover:opacity-70"><X size={11} /></span>
        ) : (
          <ChevronDown size={11} className={`shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 min-w-[210px] rounded-md  bg-popover shadow-md z-50 py-1" style={{ fontFamily: "var(--font-sans)" }}>
          {options.map((option) => {
            const count = counts[option.value];
            const selected = value === option.value;
            const disabled = count === 0;
            return (
              <button key={option.value} onClick={() => { if (!disabled) { onChange(selected ? null : option.value); setOpen(false); } }}
                disabled={disabled}
                className="flex items-center w-full px-3 py-2 text-xs hover:bg-accent text-left gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: selected ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: selected ? 600 : 400 }}>
                <span className="w-3 shrink-0">{selected && <Check size={11} className="text-foreground" />}</span>
                <span className="flex-1">{option.label}</span>
                {count !== undefined && count !== null && (
                  <span className="ml-auto text-[10px] font-medium tabular-nums text-muted-foreground">{count.toLocaleString()}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SortDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const currentLabel = SORT_OPTIONS.find((o) => o.value === value)?.label || "Relevance";
  return (
    <div className="relative shrink-0" ref={ref}>
      <button onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-background text-xs font-medium text-muted-foreground hover:bg-accent whitespace-nowrap"
        style={{ fontFamily: "var(--font-sans)" }}>
        <SlidersHorizontal size={12} />
        <span>Sort: <span className="text-foreground font-semibold">{currentLabel}</span></span>
        <ChevronDown size={11} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 min-w-[200px] rounded-md  bg-popover shadow-md z-50 py-1" style={{ fontFamily: "var(--font-sans)" }}>
          {SORT_OPTIONS.map((option) => (
            <button key={option.value} onClick={() => { onChange(option.value); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-accent"
              style={{ color: value === option.value ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: value === option.value ? 600 : 400 }}>
              <span className="w-3 shrink-0">{value === option.value && <Check size={11} className="text-foreground" />}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ActiveChips = ({ filters, onRemove }) => {
  const optMap = { date: DATE_OPTIONS, price: PRICE_OPTIONS, format: FORMAT_OPTIONS, time: TIME_OPTIONS };
  const chips = Object.entries(optMap).flatMap(([key, opts]) => {
    const val = filters[key];
    if (!val) return [];
    const opt = opts.find((o) => o.value === val);
    return opt ? [{ key, value: val, label: opt.label }] : [];
  });
  if (!chips.length) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap pb-2.5">
      {chips.map((chip) => (
        <span key={`${chip.key}-${chip.value}`}
          className="inline-flex items-center gap-1.5 h-6 pl-2.5 pr-1.5 rounded-full border text-[11px] font-medium"
          style={{ background: "var(--secondary)", borderColor: "var(--border)", color: "var(--foreground)", fontFamily: "var(--font-sans)" }}>
          {chip.label}
          <button onClick={() => onRemove(chip.key)}
            className="hover:opacity-60 transition-opacity flex items-center justify-center w-4 h-4 rounded-full hover:bg-border"
            aria-label={`Remove ${chip.label}`}><X size={10} /></button>
        </span>
      ))}
    </div>
  );
};

const FiltersSection = ({ onFiltersChange, counts }) => {
  const { getFacets } = useBrowse();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => createFiltersFromSearchParams(searchParams));
  const resolvedCounts = counts || getFacets();
  const activeCount = ["date","price","format","time"].filter((k) => filters[k] !== null).length;

  useEffect(() => {
    setFilters(createFiltersFromSearchParams(searchParams));
  }, [searchParams]);

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFiltersChange?.(next);
    const params = new URLSearchParams(searchParams);
    value ? params.set(key, value) : params.delete(key);
    setSearchParams(params, { replace: true });
  };

  const resetAll = () => {
    const next = { date: null, price: null, format: null, time: null, sort: "relevance" };
    setFilters(next);
    onFiltersChange?.(next);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="w-full bg-background border-b border-border">
      <Container aria-label="Filters">
        <div className="flex items-center gap-2 py-2.5 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0 pr-2.5 border-r border-border mr-0.5">
              <SlidersHorizontal size={13} className="text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground hidden sm:inline" style={{ fontFamily: "var(--font-brand)" }}>Filters</span>
              {activeCount > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold"
                  style={{ background: "var(--foreground)", color: "var(--background)" }}>{activeCount}</span>
              )}
            </div>
            <FilterDropdown label="Date" icon={Calendar} options={DATE_OPTIONS} value={filters.date} onChange={(v) => updateFilter("date", v)} counts={resolvedCounts.date} />
            <FilterDropdown label="Price" icon={Tag} options={PRICE_OPTIONS} value={filters.price} onChange={(v) => updateFilter("price", v)} counts={resolvedCounts.price} />
            <FilterDropdown label="Format" icon={MapPin} options={FORMAT_OPTIONS} value={filters.format} onChange={(v) => updateFilter("format", v)} counts={resolvedCounts.format} />
            <FilterDropdown label="Time of Day" icon={Clock} options={TIME_OPTIONS} value={filters.time} onChange={(v) => updateFilter("time", v)} counts={resolvedCounts.time} />
            {activeCount > 0 && (
              <button onClick={resetAll} className="flex items-center gap-1 h-8 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0" style={{ fontFamily: "var(--font-sans)" }}>
                <RotateCcw size={11} /><span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
          <SortDropdown value={filters.sort} onChange={(v) => updateFilter("sort", v)} />
        </div>
        {activeCount > 0 && (
          <div className="border-t border-border pt-1">
            <ActiveChips filters={filters} onRemove={(k) => updateFilter(k, null)} />
          </div>
        )}
      </Container>
    </div>
  );
};

export default FiltersSection;
