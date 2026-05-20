/**
 * Format a phone number for display.
 */
export function formatPhone(phone: string): string {
  return phone.replace(/(\+\d{2})(\d{5})(\d{5})/, '$1 $2 $3');
}

/**
 * Smooth scroll to an element by ID.
 */
export function scrollToSection(id: string): void {
  const el = document.getElementById(id.replace('#', ''));
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Truncate a string to a given length with ellipsis.
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '…';
}

/**
 * Generate a unique ID.
 */
export function uid(): string {
  return Math.random().toString(36).slice(2, 11);
}
