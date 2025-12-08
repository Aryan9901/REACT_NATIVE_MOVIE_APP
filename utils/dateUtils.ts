export const formatDisplayTime = (timeStr: string): string => {
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatDate = (date: Date): string => {
  if (!date) return "";
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
};

export const formatShortDate = (date: Date): string => {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const formatFullDate = (date: Date): string => {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const getCurrentHour = (): number => new Date().getHours();

// Check if a date is a weekly off day
export const isWeeklyOffDay = (date: Date, weeklyOffDay: string): boolean => {
  if (!weeklyOffDay) return false;
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = daysOfWeek[date.getDay()];
  const offDays = weeklyOffDay
    .split(";")
    .map((day: string) => day.trim().toLowerCase());
  return offDays.includes(dayName.toLowerCase());
};

// Get next available date (skipping weekly off days)
export const getNextAvailableDate = (
  startDate: Date,
  weeklyOffDay: string
): Date => {
  const currentDate = new Date(startDate);
  while (isWeeklyOffDay(currentDate, weeklyOffDay)) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return currentDate;
};
