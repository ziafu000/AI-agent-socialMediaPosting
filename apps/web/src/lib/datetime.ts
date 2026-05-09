export const APP_TIME_ZONE = "Asia/Ho_Chi_Minh";

function hasExplicitTimeZone(value: string) {
  return /(?:Z|[+-]\d{2}:\d{2})$/i.test(value);
}

function parseAppDateTime(value: string | null | undefined) {
  const rawValue = value?.trim();

  if (!rawValue) {
    return null;
  }

  const normalizedValue = rawValue.replace(" ", "T");
  const isoValue = hasExplicitTimeZone(normalizedValue)
    ? normalizedValue
    : `${normalizedValue}+07:00`;
  const parsedDate = new Date(isoValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function getDateParts(value: string | null | undefined) {
  const parsedDate = parseAppDateTime(value);

  if (!parsedDate) {
    return null;
  }

  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(parsedDate);

  const getPartValue = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: getPartValue("year"),
    month: getPartValue("month"),
    day: getPartValue("day"),
    hour: getPartValue("hour"),
    minute: getPartValue("minute"),
  };
}

export function formatDateTime(value: string | null | undefined) {
  const parsedDate = parseAppDateTime(value);

  if (!parsedDate) {
    return value ?? "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsedDate);
}

export function toDatetimeLocalValue(value: string | null | undefined) {
  const parts = getDateParts(value);

  if (!parts) {
    return "";
  }

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
