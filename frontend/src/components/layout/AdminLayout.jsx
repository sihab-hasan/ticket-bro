import React from "react";

import ControlPanelLayout from "@/components/layout/ControlPanelLayout";
import { PANEL_NAVIGATION } from "@/config/panel-navigation.config";
import { PANELS } from "@/config/panels.config";

const AdminLayout = () => (
  <ControlPanelLayout
    panelId={PANELS.ADMIN}
    title="Admin Workspace"
    subtitle="Backend-controlled operations, finance, security, and platform management."
    navigation={PANEL_NAVIGATION[PANELS.ADMIN]}
  />
);

export default AdminLayout;
