import React from "react";
import { Link } from "react-router-dom";
import { WifiOff, RefreshCw, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

const OfflinePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-muted rounded-full">
            <WifiOff className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold">You're Offline</h1>
          <p className="text-sm text-muted-foreground">
            Please check your internet connection and try again.
          </p>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OfflinePage;
