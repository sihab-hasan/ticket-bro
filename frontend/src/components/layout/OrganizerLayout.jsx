import React from "react";

import ControlPanelLayout from "@/components/layout/ControlPanelLayout";
import { PANEL_NAVIGATION } from "@/config/panel-navigation.config";
import { PANELS } from "@/config/panels.config";

const OrganizerLayout = () => (
  <ControlPanelLayout
    panelId={PANELS.ORGANIZER}
    title="Organizer Workspace"
    subtitle="Backend-managed events, bookings, revenue, and organizer settings."
    navigation={PANEL_NAVIGATION[PANELS.ORGANIZER]}
  />
);

export default OrganizerLayout;
