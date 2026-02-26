import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Container from "@/components/layout/Container";

/* --------------------------
   Static Nav Data
   Route pattern: /browse/:categorySlug/:subCategorySlug/:eventTypeSlug
---------------------------*/
const NAV_ITEMS = [
  {
    id: 1,
    name: "Music",
    slug: "music",
    categories: [
      {
        id: 11,
        name: "Concerts",
        slug: "concerts",
        subcategories: [
          { id: 111, name: "Live Bands", slug: "live-bands" },
          { id: 112, name: "Solo Artists", slug: "solo-artists" },
          { id: 113, name: "Open Mic", slug: "open-mic" },
        ],
      },
      {
        id: 12,
        name: "Festivals",
        slug: "festivals",
        subcategories: [
          { id: 121, name: "Multi-Day", slug: "multi-day" },
          { id: 122, name: "Outdoor", slug: "outdoor" },
        ],
      },
      { id: 13, name: "Club Nights", slug: "club-nights", subcategories: [] },
    ],
  },
  {
    id: 2,
    name: "Sports",
    slug: "sports",
    categories: [
      {
        id: 21,
        name: "Football",
        slug: "football",
        subcategories: [
          { id: 211, name: "League Matches", slug: "league-matches" },
          { id: 212, name: "Cup Games", slug: "cup-games" },
        ],
      },
      {
        id: 22,
        name: "Cricket",
        slug: "cricket",
        subcategories: [
          { id: 221, name: "T20", slug: "t20" },
          { id: 222, name: "ODI", slug: "odi" },
        ],
      },
      { id: 23, name: "Tennis", slug: "tennis", subcategories: [] },
      { id: 24, name: "Basketball", slug: "basketball", subcategories: [] },
    ],
  },
  {
    id: 3,
    name: "Arts & Culture",
    slug: "arts-culture",
    categories: [
      {
        id: 31,
        name: "Theatre",
        slug: "theatre",
        subcategories: [
          { id: 311, name: "Drama", slug: "drama" },
          { id: 312, name: "Musical", slug: "musical" },
          { id: 313, name: "Comedy", slug: "comedy" },
        ],
      },
      {
        id: 32,
        name: "Exhibitions",
        slug: "exhibitions",
        subcategories: [
          { id: 321, name: "Art Galleries", slug: "art-galleries" },
          { id: 322, name: "Photography", slug: "photography" },
        ],
      },
      { id: 33, name: "Film", slug: "film", subcategories: [] },
    ],
  },
  {
    id: 4,
    name: "Food & Drink",
    slug: "food-drink",
    categories: [
      {
        id: 41,
        name: "Dining",
        slug: "dining",
        subcategories: [
          { id: 411, name: "Pop-Up", slug: "pop-up" },
          { id: 412, name: "Fine Dining", slug: "fine-dining" },
        ],
      },
      {
        id: 42,
        name: "Tastings",
        slug: "tastings",
        subcategories: [
          { id: 421, name: "Wine", slug: "wine" },
          { id: 422, name: "Craft Beer", slug: "craft-beer" },
        ],
      },
    ],
  },
  {
    id: 5,
    name: "Business",
    slug: "business",
    categories: [
      {
        id: 51,
        name: "Conferences",
        slug: "conferences",
        subcategories: [
          { id: 511, name: "Tech", slug: "tech" },
          { id: 512, name: "Marketing", slug: "marketing" },
        ],
      },
      {
        id: 52,
        name: "Networking",
        slug: "networking",
        subcategories: [],
      },
      {
        id: 53,
        name: "Workshops",
        slug: "workshops",
        subcategories: [
          { id: 531, name: "Leadership", slug: "leadership" },
          { id: 532, name: "Finance", slug: "finance" },
        ],
      },
    ],
  },
  {
    id: 6,
    name: "Education",
    slug: "education",
    categories: [
      {
        id: 61,
        name: "Seminars",
        slug: "seminars",
        subcategories: [
          { id: 611, name: "Science", slug: "science" },
          { id: 612, name: "History", slug: "history" },
        ],
      },
      { id: 62, name: "Courses", slug: "courses", subcategories: [] },
    ],
  },
  {
    id: 7,
    name: "Health",
    slug: "health",
    categories: [
      {
        id: 71,
        name: "Wellness",
        slug: "wellness",
        subcategories: [
          { id: 711, name: "Yoga", slug: "yoga" },
          { id: 712, name: "Meditation", slug: "meditation" },
        ],
      },
      {
        id: 72,
        name: "Fitness",
        slug: "fitness",
        subcategories: [
          { id: 721, name: "HIIT", slug: "hiit" },
          { id: 722, name: "CrossFit", slug: "crossfit" },
        ],
      },
    ],
  },
  {
    id: 8,
    name: "Technology",
    slug: "technology",
    categories: [
      {
        id: 81,
        name: "Hackathons",
        slug: "hackathons",
        subcategories: [
          { id: 811, name: "AI & ML", slug: "ai-ml" },
          { id: 812, name: "Web Dev", slug: "web-dev" },
        ],
      },
      { id: 82, name: "Meetups", slug: "meetups", subcategories: [] },
    ],
  },
  {
    id: 9,
    name: "Kids & Family",
    slug: "kids-family",
    categories: [
      {
        id: 91,
        name: "Activities",
        slug: "activities",
        subcategories: [
          { id: 911, name: "Outdoor", slug: "outdoor" },
          { id: 912, name: "Indoor", slug: "indoor" },
        ],
      },
      { id: 92, name: "Shows", slug: "shows", subcategories: [] },
    ],
  },
  {
    id: 10,
    name: "Community",
    slug: "community",
    categories: [
      {
        id: 101,
        name: "Charity",
        slug: "charity",
        subcategories: [
          { id: 1011, name: "Fundraisers", slug: "fundraisers" },
          { id: 1012, name: "Volunteering", slug: "volunteering" },
        ],
      },
      { id: 102, name: "Markets", slug: "markets", subcategories: [] },
    ],
  },
];

/* --------------------------
   Visible / Hidden split
   Show first N items, rest go into "Others"
   Adjust VISIBLE_COUNT based on your UI needs
---------------------------*/
const VISIBLE_COUNT = 6;
const visibleItems = NAV_ITEMS.slice(0, VISIBLE_COUNT);
const hiddenItems = NAV_ITEMS.slice(VISIBLE_COUNT);

/* --------------------------
   Design Tokens
---------------------------*/
const navItemStyles =
  "relative flex items-center h-full px-4 text-xs font-medium tracking-wide whitespace-nowrap cursor-pointer";

const mainIndicator =
  "absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-primary transition-all duration-300 origin-center";

const subItemStyles =
  "relative flex items-center px-5 py-2.5 text-xs transition-all duration-200 w-full";

const subIndicator =
  "absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-primary transition-all duration-300 origin-center";

/* --------------------------
   Active Helpers
---------------------------*/
const useActiveHelpers = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  const isCategoryActive = (categorySlug) =>
    segments[0] === "browse" && segments[1] === categorySlug;

  const isSubCategoryActive = (categorySlug, subCategorySlug) =>
    segments[0] === "browse" &&
    segments[1] === categorySlug &&
    segments[2] === subCategorySlug;

  const isEventTypeActive = (categorySlug, subCategorySlug, eventTypeSlug) =>
    segments[0] === "browse" &&
    segments[1] === categorySlug &&
    segments[2] === subCategorySlug &&
    segments[3] === eventTypeSlug;

  return { isCategoryActive, isSubCategoryActive, isEventTypeActive, pathname: location.pathname };
};

/* --------------------------
   Sub-dropdown for subcategories (eventTypeSlug level)
---------------------------*/
const SubcategoryDropdown = ({ subcategories, categorySlug, subCategorySlug, isEventTypeActive }) => {
  if (!subcategories?.length) return null;
  return (
    <div className="absolute left-full top-0 hidden group-hover/category:block pl-1 z-50">
      <ul className="bg-popover border border-border rounded-md shadow-lg min-w-[200px] py-1.5">
        {subcategories.map((sub) => (
          <li key={sub.id} className="group/subcategory">
            <Link
              to={`/browse/${categorySlug}/${subCategorySlug}/${sub.slug}`}
              className={`${subItemStyles} relative ${
                isEventTypeActive(categorySlug, subCategorySlug, sub.slug)
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {sub.name}
              <span
                className={`${subIndicator} ${
                  isEventTypeActive(categorySlug, subCategorySlug, sub.slug)
                    ? "w-[60%]"
                    : "w-0 group-hover/subcategory:w-[60%]"
                }`}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* --------------------------
   Categories dropdown (subCategorySlug level)
---------------------------*/
const CategoriesDropdown = ({ categories, categorySlug, isCategoryActive, isSubCategoryActive, isEventTypeActive, align = "left" }) => {
  if (!categories?.length) return null;
  return (
    <div className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} hidden group-hover:block pt-1 z-50`}>
      <ul className="bg-popover border border-border rounded-md shadow-lg min-w-[220px] py-1.5">
        {categories.map((category) => (
          <li key={category.id} className="relative group/category">
            <Link
              to={`/browse/${categorySlug}/${category.slug}`}
              className={`${subItemStyles} relative justify-between ${
                isSubCategoryActive(categorySlug, category.slug)
                  ? "text-foreground bg-accent"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {category.name}
              {category.subcategories?.length > 0 && (
                <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
              )}
              <span
                className={`${subIndicator} ${
                  isSubCategoryActive(categorySlug, category.slug)
                    ? "w-[60%]"
                    : "w-0 group-hover/category:w-[60%]"
                }`}
              />
            </Link>
            <SubcategoryDropdown
              subcategories={category.subcategories}
              categorySlug={categorySlug}
              subCategorySlug={category.slug}
              isEventTypeActive={isEventTypeActive}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

/* --------------------------
   Main Navbar
---------------------------*/
const Navbar = () => {
  const { isCategoryActive, isSubCategoryActive, isEventTypeActive, pathname } = useActiveHelpers();

  return (
    <nav className="w-full">
      <Container>
        <div className="flex items-center h-12 w-full relative border-b border-border">
          <ul className="flex items-center h-full w-full">
            {/* All Events */}
            <li className="h-full group">
              <Link
                to="/browse"
                className={`${navItemStyles} ${
                  pathname === "/browse"
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Events
                <span
                  className={`${mainIndicator} ${
                    pathname === "/browse"
                      ? "w-[70%]"
                      : "w-0 group-hover:w-[60%]"
                  }`}
                />
              </Link>
            </li>

            {/* Visible Nav Items */}
            {visibleItems.map((item) => (
              <li key={item.id} className="h-full group relative">
                <Link
                  to={`/browse/${item.slug}`}
                  className={`${navItemStyles} ${
                    isCategoryActive(item.slug)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.name}
                  <span
                    className={`${mainIndicator} ${
                      isCategoryActive(item.slug)
                        ? "w-[70%]"
                        : "w-0 group-hover:w-[60%]"
                    }`}
                  />
                </Link>

                <CategoriesDropdown
                  categories={item.categories}
                  categorySlug={item.slug}
                  isCategoryActive={isCategoryActive}
                  isSubCategoryActive={isSubCategoryActive}
                  isEventTypeActive={isEventTypeActive}
                  align="left"
                />
              </li>
            ))}

            {/* Others Dropdown */}
            {hiddenItems.length > 0 && (
              <li className="h-full group relative">
                <span
                  className={`${navItemStyles} text-muted-foreground hover:text-foreground`}
                >
                  Others
                  <ChevronDown className="ml-1 h-3 w-3" />
                  <span
                    className={`${mainIndicator} w-0 group-hover:w-[60%]`}
                  />
                </span>

                <div className="absolute top-full right-0 hidden group-hover:block pt-1 z-50">
                  <ul className="bg-popover border border-border rounded-md shadow-lg min-w-[220px] py-1.5">
                    {hiddenItems.map((item) => (
                      <li key={item.id} className="relative group/service">
                        <Link
                          to={`/browse/${item.slug}`}
                          className={`${subItemStyles} relative justify-between ${
                            isCategoryActive(item.slug)
                              ? "text-foreground bg-accent"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          {item.name}
                          {item.categories?.length > 0 && (
                            <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                          )}
                          <span
                            className={`${subIndicator} ${
                              isCategoryActive(item.slug)
                                ? "w-[60%]"
                                : "w-0 group-hover/service:w-[60%]"
                            }`}
                          />
                        </Link>

                        {/* Categories for hidden items — fly out to the left */}
                        {item.categories?.length > 0 && (
                          <div className="absolute left-full top-0 hidden group-hover/service:block pl-1 z-50">
                            <ul className="bg-popover border border-border rounded-md shadow-lg min-w-[200px] py-1.5">
                              {item.categories.map((category) => (
                                <li
                                  key={category.id}
                                  className="relative group/category"
                                >
                                  <Link
                                    to={`/browse/${item.slug}/${category.slug}`}
                                    className={`${subItemStyles} relative justify-between ${
                                      isSubCategoryActive(
                                        item.slug,
                                        category.slug,
                                      )
                                        ? "text-foreground bg-accent"
                                        : "text-muted-foreground hover:bg-accent"
                                    }`}
                                  >
                                    {category.name}
                                    {category.subcategories?.length > 0 && (
                                      <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                                    )}
                                    <span
                                      className={`${subIndicator} ${
                                        isSubCategoryActive(
                                          item.slug,
                                          category.slug,
                                        )
                                          ? "w-[60%]"
                                          : "w-0 group-hover/category:w-[60%]"
                                      }`}
                                    />
                                  </Link>

                                  <SubcategoryDropdown
                                    subcategories={category.subcategories}
                                    categorySlug={item.slug}
                                    subCategorySlug={category.slug}
                                    isEventTypeActive={isEventTypeActive}
                                  />
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            )}
          </ul>
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;