// src/pages/home/HomePage.jsx
import React from "react";
import HeroSection from "@/components/home/HeroSection";
import EventMarquee from "@/components/home/EventMarquee";
import { CalendarSection, EditorsPicksSection, EventGridSection, FeaturedSection, FiltersSection, MapSection, NearbySection, NewArrivalsSection, NewsletterSection, RecommendedSection, ReviewsSection, StatsSection, TopRatedSection, TrendingSection, UpcomingSection } from "@/components/browse/sections";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <EventMarquee />
      <FiltersSection />
      <EventGridSection />
      <FeaturedSection />
      <TrendingSection />
      <NewArrivalsSection />
      <UpcomingSection />
      <TopRatedSection />
      <EditorsPicksSection />
      <NearbySection />
      <MapSection/>
      <CalendarSection/>
      <RecommendedSection/>
      <ReviewsSection/>
      <StatsSection/>
      <NewsletterSection/>
    </>
  );
};

export default HomePage;
