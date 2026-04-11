const isValidDate = (value) =>
  value instanceof Date && !Number.isNaN(value.getTime());

export const parseEventDate = (value) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return isValidDate(date) ? date : null;
};

export const startOfDay = (value) => {
  const date = parseEventDate(value);
  if (!date) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const endOfDay = (value) => {
  const date = parseEventDate(value);
  if (!date) {
    return null;
  }

  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
};

export const getEventDateRange = (event) => {
  const start = parseEventDate(event?.startDate);
  if (!start) {
    return null;
  }

  const parsedEnd = parseEventDate(event?.endDate);
  const end = parsedEnd && parsedEnd >= start ? parsedEnd : start;

  return { start, end };
};

export const eventOverlapsRange = (event, rangeStart, rangeEnd = rangeStart) => {
  const eventRange = getEventDateRange(event);
  const normalizedStart = startOfDay(rangeStart);
  const normalizedEnd = endOfDay(rangeEnd);

  if (!eventRange || !normalizedStart || !normalizedEnd) {
    return false;
  }

  return eventRange.start <= normalizedEnd && eventRange.end >= normalizedStart;
};

export const eventOverlapsDay = (event, day) => eventOverlapsRange(event, day, day);

export const getEventDaysInMonth = (event, year, month) => {
  const eventRange = getEventDateRange(event);
  if (!eventRange) {
    return [];
  }

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);

  if (eventRange.start > monthEnd || eventRange.end < monthStart) {
    return [];
  }

  const overlapStart = eventRange.start > monthStart ? eventRange.start : monthStart;
  const overlapEnd = eventRange.end < monthEnd ? eventRange.end : monthEnd;
  const cursor = startOfDay(overlapStart);
  const finalDay = startOfDay(overlapEnd);
  const days = [];

  while (cursor && finalDay && cursor <= finalDay) {
    days.push(cursor.getDate());
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

export const formatEventDateSpanLabel = (event, locale = "en-US") => {
  const eventRange = getEventDateRange(event);
  if (!eventRange) {
    return "Date TBA";
  }

  const startLabel = eventRange.start.toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const endLabel = eventRange.end.toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const startDay = startOfDay(eventRange.start);
  const endDay = startOfDay(eventRange.end);
  if (startDay && endDay && startDay.getTime() === endDay.getTime()) {
    return startLabel;
  }

  return `${startLabel} - ${endLabel}`;
};
