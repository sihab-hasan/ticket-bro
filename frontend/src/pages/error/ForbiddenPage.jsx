import React from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, Home, ArrowLeft, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

const ForbiddenPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="p-6 bg-destructive/10 rounded-full">
              <Lock className="h-16 w-16 text-destructive" />
            </div>
            <div className="absolute -top-2 -right-2 p-3 bg-destructive/20 rounded-full">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </div>

        {/* Error Code */}
        <div className="space-y-2">
          <h1 className="text-7xl font-heading font-bold text-destructive">
            403
          </h1>
          <h2 className="text-2xl font-heading font-semibold">
            Access Forbidden
          </h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page. Please contact your
            administrator if you believe this is a mistake.
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-muted/30 rounded-lg p-4 flex items-center gap-3 text-left">
          <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            This attempt has been logged. If you need access, please request
            proper permissions.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full">
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>

        {/* Help Link */}
        <div className="text-sm text-muted-foreground border-t pt-6">
          <p>
            Need help?{" "}
            <Link to="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
