// This page acts as an alias for the root browse page. It's used when
// navigating to `/browse/view-all` from various section "View All" links.
// It simply reuses the main browse layout to display all events with
// filters and pagination.

import React from "react";

// Reuse the BrowsePage component, which renders the hero, filters and
// grid sections for browsing all events. If the folder structure changes,
// update this import accordingly.
import BrowsePage from "../BrowseAllPage.jsx";

const ViewAllPage = () => {
  return <BrowsePage />;
};

export default ViewAllPage;