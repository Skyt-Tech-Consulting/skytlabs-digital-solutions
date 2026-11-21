type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Overlays stored content on top of the defaults.
 *
 * - Keys missing from `stored` (e.g. fields added after content was saved) fall back to defaults.
 * - Arrays are taken from `stored` as-is so editors can add/remove items.
 * - Values with the wrong primitive type are ignored to keep the page renderable.
 */
export function mergeWithDefaults<T>(defaults: T, stored: unknown): T {
  if (stored === undefined || stored === null) return defaults;

  if (Array.isArray(defaults)) {
    if (!Array.isArray(stored)) return defaults;
    const template = defaults[0];
    if (template === undefined) return stored as T;
    return stored.map((item) => mergeWithDefaults(template, item)) as T;
  }

  if (isPlainObject(defaults)) {
    if (!isPlainObject(stored)) return defaults;
    const result: PlainObject = {};
    for (const key of Object.keys(defaults)) {
      result[key] = mergeWithDefaults(defaults[key], stored[key]);
    }
    return result as T;
  }

  if (typeof defaults === typeof stored) return stored as T;
  return defaults;
}

/** Splits a multi-paragraph text block on blank lines. */
export function toParagraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
