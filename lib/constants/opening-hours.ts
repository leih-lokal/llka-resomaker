export interface OpeningHours {
  open: number;
  close: number;
}

export const OPENING_HOURS: Record<number, OpeningHours> = {
  1: { open: 15, close: 19 }, // Monday
  4: { open: 15, close: 19 }, // Thursday
  5: { open: 15, close: 19 }, // Friday
  6: { open: 10, close: 14 }, // Saturday
};

export const DAY_NAMES: Record<number, string> = {
  0: "Sonntag",
  1: "Montag",
  2: "Dienstag",
  3: "Mittwoch",
  4: "Donnerstag",
  5: "Freitag",
  6: "Samstag",
};

export function isOpenDay(dayOfWeek: number): boolean {
  return dayOfWeek in OPENING_HOURS;
}

export function getOpeningHoursForDay(
  dayOfWeek: number
): OpeningHours | undefined {
  return OPENING_HOURS[dayOfWeek];
}

export function formatOpeningHours(): { day: string; hours: string }[] {
  const days = [
    { day: "Montag", dayNum: 1 },
    { day: "Dienstag", dayNum: 2 },
    { day: "Mittwoch", dayNum: 3 },
    { day: "Donnerstag", dayNum: 4 },
    { day: "Freitag", dayNum: 5 },
    { day: "Samstag", dayNum: 6 },
    { day: "Sonntag", dayNum: 0 },
  ];

  return days.map(({ day, dayNum }) => {
    const hours = OPENING_HOURS[dayNum];
    return {
      day,
      hours: hours
        ? `${hours.open}:00 - ${hours.close}:00`
        : "Geschlossen",
    };
  });
}

export function getValidPickupSlots(weeksAhead: number = 4): Date[] {
  const slots: Date[] = [];
  const now = new Date();
  const endDate = new Date(
    now.getTime() + weeksAhead * 7 * 24 * 60 * 60 * 1000
  );

  const current = new Date(now);
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    const hours = OPENING_HOURS[dayOfWeek];

    if (hours) {
      for (let hour = hours.open; hour < hours.close; hour++) {
        const slot = new Date(current);
        slot.setHours(hour, 0, 0, 0);
        if (slot > now) {
          slots.push(slot);
        }
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return slots;
}

export function isValidPickupTime(date: Date): boolean {
  const now = new Date();
  if (date <= now) return false;

  const dayOfWeek = date.getDay();
  const hours = OPENING_HOURS[dayOfWeek];
  if (!hours) return false;

  const hour = date.getHours();
  return hour >= hours.open && hour < hours.close;
}

export function formatPickupDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
