import {
  CalendarSection,
  CategoryNavSection,
  EditorsPicksSection,
  EventGridSection,
  FeaturedSection,
  FiltersSection,
  HeroSection,
  MapSection,
  NearbySection,
  NewArrivalsSection,
  NewsletterSection,
  RecommendedSection,
  ReviewsSection,
  StatsSection,
  TopRatedSection,
  TrendingSection,
  UpcomingSection,
} from "@/components/browse/sections";
import React from "react";
import EventDetailsPage from "../EventDetails/EventDetailsPage";

const CategoryPage = () => {
  return (
    <div>
      <HeroSection />
      <CategoryNavSection />
      <FiltersSection />
      <EventGridSection />
      <FeaturedSection />
      <TrendingSection />
      <NewArrivalsSection />
      <UpcomingSection />
      <TopRatedSection />
      <EditorsPicksSection />
      <NearbySection />
      <MapSection />
      <CalendarSection />
      <RecommendedSection />
      <ReviewsSection />
      <StatsSection />
      <NewsletterSection />
    </div>
  );
};

export default CategoryPage;
