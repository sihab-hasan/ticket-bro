import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Home, ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

const HttpVersionNotSupportedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-destructive/10 rounded-full">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold">
            505 - HTTP Version Not Supported
          </h1>
          <p className="text-sm text-muted-foreground">
            The server does not support the HTTP protocol version used in the
            request.
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-3 text-left">
          <p className="text-xs text-muted-foreground">
            This typically happens when using an outdated browser or proxy.
            Please update your browser or try a different connection.
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

export default HttpVersionNotSupportedPage;
