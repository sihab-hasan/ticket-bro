import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const HASH_SCROLL_OFFSET = 112;
const HASH_SCROLL_ATTEMPTS = 8;

const scrollToHashTarget = (hash) => {
  const targetId = hash.replace(/^#/, "");

  if (!targetId) {
    window.scrollTo(0, 0);
    return;
  }

  let attempts = 0;

  const tryScroll = () => {
    const target = document.getElementById(targetId);

    if (target) {
      const top = Math.max(
        target.getBoundingClientRect().top + window.scrollY - HASH_SCROLL_OFFSET,
        0,
      );
      window.scrollTo({ top, behavior: "smooth" });
      return;
    }

    if (attempts < HASH_SCROLL_ATTEMPTS) {
      attempts += 1;
      window.requestAnimationFrame(tryScroll);
    }
  };

  window.requestAnimationFrame(tryScroll);
};

const useRouteScroll = (smoothTopScroll = false) => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      scrollToHashTarget(hash);
      return;
    }

    window.scrollTo({ top: 0, behavior: smoothTopScroll ? "smooth" : "auto" });
  }, [hash, pathname, smoothTopScroll]);
};

export default function ScrollToTop() {
  useRouteScroll(true);
  return null;
}

export function NevigationToTop() {
  useRouteScroll(false);
  return null;
}
