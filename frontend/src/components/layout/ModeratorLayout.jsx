import React from "react";

import ControlPanelLayout from "@/components/layout/ControlPanelLayout";
import { PANEL_NAVIGATION } from "@/config/panel-navigation.config";
import { PANELS } from "@/config/panels.config";

const ModeratorLayout = () => (
  <ControlPanelLayout
    panelId={PANELS.MODERATOR}
    title="Moderator Workspace"
    subtitle="Backend-enforced trust, safety, reports, and event review workflows."
    navigation={PANEL_NAVIGATION[PANELS.MODERATOR]}
  />
);

export default ModeratorLayout;
