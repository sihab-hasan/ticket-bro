import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import eventsService from "@/api/events.api";
import { normalizeEvent } from "@/utils/browse.utils";
import HighlightedEventsPage from "./HighlightedEventsPage";

const TrandingsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTrending = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await eventsService.getTrendingEvents(24);
      setEvents((response || []).map((event) => normalizeEvent(event)));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  const heroStats = useMemo(() => {
    const sold = events.reduce((sum, event) => sum + Number(event.totalSold || event.attendees || 0), 0);
    const categoryCount = new Set(events.map((event) => event?.category?.slug).filter(Boolean)).size;
    const avgRating = events.length
      ? (
        events.reduce((sum, event) => sum + Number(event.averageRating || event.rating || 0), 0) /
        events.length
      ).toFixed(1)
      : "0.0";

    return [
      { value: events.length.toLocaleString(), label: "High-momentum events" },
      { value: sold.toLocaleString(), label: "Tickets already moving" },
      { value: categoryCount.toLocaleString(), label: "Categories represented" },
      { value: avgRating, label: "Average attendee rating" },
    ];
  }, [events]);

  return (
    <HighlightedEventsPage
      icon={TrendingUp}
      eyebrow="Trending Feed"
      title="The events pulling the most attention right now."
      description="This page is powered by the live trending feed from the backend, ranked by momentum, sales activity, and upcoming demand so buyers can discover what is actually moving."
      heroStats={heroStats}
      events={events}
      loading={loading}
      error={error}
      onRetry={loadTrending}
      topSectionTitle="Momentum leaders"
      topSectionSubtitle="The strongest live performers on the platform right now."
      gridSectionTitle="More trending events"
      gridSectionSubtitle="Fresh demand signals from across categories and cities."
      emptyTitle="No trending events right now"
      emptyMessage="As soon as events begin gaining traction, they’ll appear here."
      showTrendingBadge
      theme={{
        heroBackground:
          "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(15,23,42,0.03) 45%, rgba(15,23,42,0) 100%)",
      }}
    />
  );
};

export default TrandingsPage;
