// src/pages/home/HomePage.jsx
import React from "react";
import HeroSection from "@/components/home/HeroSection";
import EventMarquee from "@/components/home/EventMarquee";
import { CalendarSection, EditorsPicksSection, EventGridSection, FeaturedSection, FiltersSection, MapSection, NearbySection, NewArrivalsSection, NewsletterSection, RecommendedSection, ReviewsSection, StatsSection, TopRatedSection, TrendingSection, UpcomingSection } from "@/components/browse/sections";
import MostLovedCategories from "@/components/home/MostLovedCategories";
import Scenes from "@/components/home/Scenes";
import LiveNearYou from "@/components/home/LiveNearYou";
import ExploreByDate from "@/components/home/ExploreByDate";
import LastChance from "@/components/home/LastChance";
import ArtistSection from "@/components/home/ArtistSection";
import TrustRibbon from "@/components/home/TrustRibbon";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <EventMarquee />
      <FiltersSection />
      <MostLovedCategories/>
      <Scenes/>
      <LiveNearYou/>
      <TopRatedSection/>
      <ExploreByDate/>
      <LastChance/>
      <ArtistSection/>
      <TrustRibbon/>
     
    </>
  );
};

export default HomePage;
