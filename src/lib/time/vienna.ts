const viennaFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Vienna",
  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  hourCycle: "h23",
});

function partsAt(date: Date) {
  const parts = Object.fromEntries(viennaFormatter.formatToParts(date).map((part) => [part.type, part.value]));
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
}

export function parseViennaDateTime(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value !== "string") return new Date(Number.NaN);
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return new Date(Number.NaN);
  const target = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]));
  let utc = target;
  for (let index = 0; index < 3; index += 1) utc += target - partsAt(new Date(utc));
  return partsAt(new Date(utc)) === target ? new Date(utc) : new Date(Number.NaN);
}
