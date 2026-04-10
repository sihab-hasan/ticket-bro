const DEFAULT_DO_NOT_DISTURB = {
  enabled: false,
  startTime: '22:00',
  endTime: '08:00',
};

const audioCache = new Map();

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const parseTimeToMinutes = (value, fallback) => {
  const [hoursText, minutesText] = String(value || fallback).split(':');
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return fallback;
  }

  return (hours * 60) + minutes;
};

export const isDoNotDisturbActive = (doNotDisturb = DEFAULT_DO_NOT_DISTURB, now = new Date()) => {
  if (!doNotDisturb?.enabled) {
    return false;
  }

  const currentMinutes = (now.getHours() * 60) + now.getMinutes();
  const startMinutes = parseTimeToMinutes(
    doNotDisturb.startTime,
    parseTimeToMinutes(DEFAULT_DO_NOT_DISTURB.startTime, 22 * 60),
  );
  const endMinutes = parseTimeToMinutes(
    doNotDisturb.endTime,
    parseTimeToMinutes(DEFAULT_DO_NOT_DISTURB.endTime, 8 * 60),
  );

  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
};

export const canPlayAppSound = ({ soundEnabled = true, doNotDisturb } = {}) => {
  if (typeof window === 'undefined' || !soundEnabled) {
    return false;
  }

  return !isDoNotDisturbActive(doNotDisturb);
};

const getAudio = (src) => {
  if (!audioCache.has(src)) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audioCache.set(src, audio);
  }

  return audioCache.get(src);
};

export const playAppSound = (
  src,
  { volume = 0.5, soundEnabled = true, doNotDisturb } = {},
) => {
  if (!src || !canPlayAppSound({ soundEnabled, doNotDisturb })) {
    return false;
  }

  try {
    const audio = getAudio(src);
    audio.pause();
    audio.currentTime = 0;
    audio.volume = clamp(volume, 0, 1);
    audio.play()?.catch?.(() => {});
    return true;
  } catch {
    return false;
  }
};
