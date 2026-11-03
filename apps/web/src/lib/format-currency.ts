/**
 * Converts integer minor units (e.g. cents/paise) to human-formatted currency string.
 */
export function formatMinorUnits(
  amountMinor: number,
  currency: string = "INR"
): string {
  const majorUnits = amountMinor / 100;
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(majorUnits);
  } catch {
    return `${currency.toUpperCase()} ${majorUnits.toFixed(2)}`;
  }
}

/**
 * Converts minor integer units to a floating major decimal number.
 */
export function minorToMajor(amountMinor: number): number {
  return amountMinor / 100;
}

/**
 * Converts decimal major units to integer minor units safely.
 */
export function majorToMinor(amountMajor: number): number {
  return Math.round(amountMajor * 100);
}

