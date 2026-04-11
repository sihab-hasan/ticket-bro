const BROWSE_REFRESH_EVENT = "ticketbro:browse-refresh";
const BROWSE_REFRESH_STORAGE_KEY = "ticketbro:browse-refresh";
const BROWSE_REFRESH_CHANNEL = "ticketbro:browse-sync";

let browseRefreshChannel = null;

const getBrowseRefreshChannel = () => {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }

  if (!browseRefreshChannel) {
    browseRefreshChannel = new BroadcastChannel(BROWSE_REFRESH_CHANNEL);
  }

  return browseRefreshChannel;
};

export const broadcastBrowseRefresh = (detail = {}) => {
  const payload = {
    ...detail,
    timestamp: detail.timestamp || Date.now(),
  };

  if (typeof window === "undefined") {
    return payload;
  }

  window.dispatchEvent(
    new CustomEvent(BROWSE_REFRESH_EVENT, {
      detail: payload,
    }),
  );

  try {
    window.localStorage.setItem(
      BROWSE_REFRESH_STORAGE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // Ignore storage write failures in private browsing or restricted environments.
  }

  getBrowseRefreshChannel()?.postMessage(payload);

  return payload;
};

export const subscribeToBrowseRefresh = (handler) => {
  if (typeof window === "undefined" || typeof handler !== "function") {
    return () => {};
  }

  const handleWindowEvent = (event) => {
    handler(event?.detail || {});
  };

  const handleStorageEvent = (event) => {
    if (event.key !== BROWSE_REFRESH_STORAGE_KEY || !event.newValue) {
      return;
    }

    try {
      handler(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed payloads written by older clients.
    }
  };

  const channel = getBrowseRefreshChannel();
  const handleChannelMessage = (event) => {
    handler(event?.data || {});
  };

  window.addEventListener(BROWSE_REFRESH_EVENT, handleWindowEvent);
  window.addEventListener("storage", handleStorageEvent);
  channel?.addEventListener("message", handleChannelMessage);

  return () => {
    window.removeEventListener(BROWSE_REFRESH_EVENT, handleWindowEvent);
    window.removeEventListener("storage", handleStorageEvent);
    channel?.removeEventListener("message", handleChannelMessage);
  };
};

export {
  BROWSE_REFRESH_CHANNEL,
  BROWSE_REFRESH_EVENT,
  BROWSE_REFRESH_STORAGE_KEY,
};
