import React from "react";
import { Link } from "react-router-dom";
import { Server, RefreshCw, Home, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

const ServerErrorPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-destructive/10 rounded-full">
            <Server className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold">
            500 - Server Error
          </h1>
          <p className="text-sm text-muted-foreground">
            Something went wrong on our end. Please try again later.
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-3 flex items-center gap-2 text-left">
          <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Our team has been notified. We're working to fix the issue.
          </p>
        </div>

        <div className="space-y-2">
          <Button className="w-full" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Page
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

export default ServerErrorPage;
