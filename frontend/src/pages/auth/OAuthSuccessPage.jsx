// frontend/src/pages/auth/OAuthSuccessPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { XCircle } from "lucide-react";
import { setAuthFromOAuth } from "@/store/slices/authSlice";
import { storageUtils } from "@/utils/storageUtils";
import authService from "@/api/auth.api";
import { ROUTES } from "@/app/AppRoutes";

import Container from "@/components/layout/Container";
import { PageLoader } from "@/components/shared/Loader";

const OAuthSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError("OAuth login failed — no token received. Please try again.");
      return;
    }

    let cancelled = false;

    const hydrate = async () => {
      try {
        // FIX: Remove the access token from the URL immediately.
        // Leaving it in the URL exposes it in browser history, server logs,
        // and the Referer header of any subsequent navigation.
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        // Store in-memory access token
        storageUtils.setAccessToken(token);

        // Fetch full user profile using the new access token
        const user = await authService.getMe();

        if (cancelled) return;

        // Hydrate Redux — refresh token is already in httpOnly cookie
        dispatch(
          setAuthFromOAuth({
            user,
            accessToken: token,
            // FIX: don't pass refreshToken — it's in the httpOnly cookie, not JS-accessible
          }),
        );

        navigate(ROUTES.HOME, { replace: true });
      } catch (err) {
        if (!cancelled) {
          storageUtils.clearAll();
          setError(
            err.message || "Failed to complete sign in. Please try again.",
          );
        }
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line

  if (!error) {
    return (
      <PageLoader
        text="Signing you in…"
        subtitle="Just a second while we set up your session."
      />
    );
  }

  return (
    <Container>
      <div className="flex flex-col items-center justify-center text-center py-16">
        <div className="w-16 h-16 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center mb-6">
          <XCircle size={28} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2 text-foreground">
          Sign in failed
        </h1>
        <p className="text-muted-foreground text-sm mb-6">{error}</p>
        <button
          onClick={() => navigate(ROUTES.AUTH.LOGIN)}
          className="w-full max-w-xs h-12 rounded-lg bg-lime-400 text-black font-bold text-sm hover:bg-lime-500 transition"
        >
          Back to sign in
        </button>
      </div>
    </Container>
  );
};

export default OAuthSuccessPage;
