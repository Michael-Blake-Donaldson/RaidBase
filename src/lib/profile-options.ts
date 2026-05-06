export const REGION_OPTIONS = [
  "NA East",
  "NA Central",
  "NA West",
  "EU West",
  "EU Central",
  "EU East",
  "LATAM",
  "South America",
  "Oceania",
  "Middle East",
  "Asia East",
  "Asia Southeast",
] as const;

export const TIMEZONE_OPTIONS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Athens",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
] as const;

export type RegionOption = (typeof REGION_OPTIONS)[number];
export type TimezoneOption = (typeof TIMEZONE_OPTIONS)[number];