import React from "react";
import { Link } from "react-router-dom";
import { Wrench, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full">
            <Wrench className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold">Under Maintenance</h1>
          <p className="text-sm text-muted-foreground">
            We'll be back shortly. Thank you for your patience.
          </p>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
