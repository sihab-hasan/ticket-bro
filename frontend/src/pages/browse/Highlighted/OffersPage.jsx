import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Tag } from "lucide-react";
import eventsService from "@/api/events.api";
import { normalizeEvent } from "@/utils/browse.utils";
import HighlightedEventsPage from "./HighlightedEventsPage";

const DEFAULT_SUMMARY = {
  totalOffers: 0,
  promotionCount: 0,
  freeCount: 0,
  averageDiscountPercent: 0,
  expiringSoon: 0,
};

const OffersPage = () => {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await eventsService.getOfferEvents({ limit: 24 });
      setEvents((response?.events || []).map((event) => normalizeEvent(event)));
      setSummary({
        ...DEFAULT_SUMMARY,
        ...(response?.summary || {}),
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const heroStats = useMemo(() => {
    const categories = new Set(events.map((event) => event?.category?.slug).filter(Boolean)).size;

    return [
      { value: summary.totalOffers.toLocaleString(), label: "Live offer-backed events" },
      { value: `${summary.averageDiscountPercent || 0}%`, label: "Average promo savings" },
      { value: summary.expiringSoon.toLocaleString(), label: "Offers ending within 7 days" },
      {
        value: `${summary.promotionCount}/${summary.freeCount}`,
        label: `Promo deals / free-entry picks across ${categories || 0} categories`,
      },
    ];
  }, [events, summary]);

  return (
    <HighlightedEventsPage
      icon={Tag}
      eyebrow="Offers & Savings"
      title="Public deals, promo-backed events, and free-entry picks."
      description="This page is driven by the backend offers feed. It combines active event promotions with public event data so visitors see real savings labels, expiry signals, and free-entry picks instead of placeholder marketing blocks."
      heroStats={heroStats}
      events={events}
      loading={loading}
      error={error}
      onRetry={loadOffers}
      topSectionTitle="Best live deals"
      topSectionSubtitle="Highest-signal offers with active event pages and real ticket inventory."
      gridSectionTitle="More events on offer"
      gridSectionSubtitle="Promotions and free-entry opportunities surfaced from the public catalog."
      emptyTitle="No public offers are live right now"
      emptyMessage="When organizers publish valid promotions or free-entry events, they’ll show up here automatically."
      theme={{
        heroBackground:
          "linear-gradient(135deg, rgba(22,163,74,0.12) 0%, rgba(234,179,8,0.10) 42%, rgba(15,23,42,0.02) 100%)",
      }}
    />
  );
};

export default OffersPage;
