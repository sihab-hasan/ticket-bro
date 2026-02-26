import { CalendarSection, CategoryNavSection, EditorsPicksSection, EventGridSection, FeaturedSection, FiltersSection, HeroSection, MapSection, NearbySection, NewArrivalsSection, NewsletterSection, RecommendedSection, ReviewsSection, StatsSection, TopRatedSection, TrendingSection, UpcomingSection } from '@/components/browse/sections'
import React from 'react'

const BrowsePage = () => {
  return (
    <>
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
      <MapSection/>
      <CalendarSection/>
      <RecommendedSection/>
      <ReviewsSection/>
      <StatsSection/>
      <NewsletterSection/>
    </>
  );
}

export default BrowsePage
