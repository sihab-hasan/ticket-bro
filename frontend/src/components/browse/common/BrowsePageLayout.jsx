import React from "react";
import { useBrowse } from "@/hooks";
import HeroSection from "./HeroSection";
import CategoryNavSection from "./CategoryNavSection";
import CategoryGridSection from "./CategoryGridSection";
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

const ROOT_SECTIONS = [
  HeroSection,
  CategoryNavSection,
  CategoryGridSection,
  FiltersSection,
  EventGridSection,
  FeaturedSection,
  TrendingSection,
  UpcomingSection,
  TopRatedSection,
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
  CategoryNavSection,
  CategoryGridSection,
  FiltersSection,
  EventGridSection,
  FeaturedSection,
  TrendingSection,
  UpcomingSection,
  RecommendedSection,
  NearbySection,
  ReviewsSection,
  StatsSection,
  NewsletterSection,
];

const SUBCATEGORY_SECTIONS = [
  HeroSection,
  CategoryNavSection,
  CategoryGridSection,
  FiltersSection,
  EventGridSection,
  UpcomingSection,
  TopRatedSection,
  NewArrivalsSection,
  RecommendedSection,
  NearbySection,
  ReviewsSection,
  NewsletterSection,
];

const EVENT_TYPE_SECTIONS = [
  HeroSection,
  CategoryNavSection,
  CategoryGridSection,
  FiltersSection,
  EventGridSection,
  TopRatedSection,
  NewArrivalsSection,
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
