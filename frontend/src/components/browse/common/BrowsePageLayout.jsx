import React from "react";
import { useBrowse } from "@/hooks";
import HeroSection from "./HeroSection";
import FiltersSection from "./FiltersSection";
import EventGridSection from "./EventGridSection";
import FeaturedSection from "./FeaturedSection";
import TrendingSection from "./TrendingSection";
import NewArrivalsSection from "./NewArrivalsSection";
import UpcomingSection from "./UpcomingSection";
import TopRatedSection from "./TopRatedSection";
import EditorsPicksSection from "./EditorsPicksSection";
import NearbySection from "./NearbySection";
import RecommendedSection from "./RecommendedSection";
import ReviewsSection from "./ReviewsSection";
import StatsSection from "./StatsSection";
import NewsletterSection from "./NewsletterSection";
import AppDownloadSection from "./AppDownloadSection";
import MapSection from "./MapSection";

const ROOT_SECTIONS = [
  HeroSection,
  FiltersSection,
  EventGridSection,
  FeaturedSection,
  TrendingSection,
  UpcomingSection,
  TopRatedSection,
  MapSection,
  EditorsPicksSection,
  NearbySection,
  RecommendedSection,
  ReviewsSection,
  StatsSection,
  AppDownloadSection,
  NewsletterSection,
];

const CATEGORY_SECTIONS = [
  HeroSection,
  FiltersSection,
  EventGridSection,
  FeaturedSection,
  TrendingSection,
  UpcomingSection,
  MapSection,
  RecommendedSection,
  NearbySection,
  ReviewsSection,
  StatsSection,
  NewsletterSection,
];

const SUBCATEGORY_SECTIONS = [
  HeroSection,
  FiltersSection,
  EventGridSection,
  UpcomingSection,
  TopRatedSection,
  NewArrivalsSection,
  MapSection,
  RecommendedSection,
  NearbySection,
  ReviewsSection,
  NewsletterSection,
];

const EVENT_TYPE_SECTIONS = [
  HeroSection,
  FiltersSection,
  EventGridSection,
  TopRatedSection,
  NewArrivalsSection,
  MapSection,
  RecommendedSection,
  NearbySection,
  ReviewsSection,
  NewsletterSection,
];

const SECTIONS_BY_LEVEL = {
  root: ROOT_SECTIONS,
  category: CATEGORY_SECTIONS,
  subCategory: SUBCATEGORY_SECTIONS,
  eventType: EVENT_TYPE_SECTIONS,
};

const BrowsePageLayout = () => {
  const { level } = useBrowse();
  const sections = SECTIONS_BY_LEVEL[level] || ROOT_SECTIONS;

  return (
    <>
      {sections.map((Section) => (
        <Section key={Section.displayName || Section.name} />
      ))}
    </>
  );
};

export default BrowsePageLayout;
