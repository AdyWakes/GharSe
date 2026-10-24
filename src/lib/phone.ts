// Normalises Indian mobile numbers to E.164 (+91XXXXXXXXXX).
// Returns null when the input cannot be a valid Indian mobile number.
export function normalizeIndianPhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  let local: string;
  if (digits.length === 10) local = digits;
  else if (digits.length === 11 && digits.startsWith("0")) local = digits.slice(1);
  else if (digits.length === 12 && digits.startsWith("91")) local = digits.slice(2);
  else return null;
  if (!/^[6-9]\d{9}$/.test(local)) return null;
  return `+91${local}`;
}
