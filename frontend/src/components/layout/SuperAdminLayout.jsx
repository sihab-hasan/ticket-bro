import React from "react";

import ControlPanelLayout from "@/components/layout/ControlPanelLayout";
import { PANEL_NAVIGATION } from "@/config/panel-navigation.config";
import { PANELS } from "@/config/panels.config";

const SuperAdminLayout = () => (
  <ControlPanelLayout
    panelId={PANELS.SUPER_ADMIN}
    title="Super Admin Workspace"
    subtitle="Governance, role assignment, audit visibility, and platform-wide control."
    navigation={PANEL_NAVIGATION[PANELS.SUPER_ADMIN]}
  />
);

export default SuperAdminLayout;
