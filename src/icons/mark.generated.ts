/* GENERATED FILE. DO NOT EDIT, AND DO NOT DRAW THIS MARK ANYWHERE ELSE.
 *
 * A sync script writes this file from one shared mark registry. The registry holds the only
 * source drawing of this app's mark. The browser tab, this app's header and the product tile
 * on the studio site all use that one drawing. To change the mark, edit it in the registry and
 * run the sync again. Edits made here are overwritten.
 *
 * A gate fails the nightly check when this file stops matching the registry. It also fails
 * when a component draws the mark by hand.
 */
export const MARK_SLUG = "parserail-mcp-site";
export const MARK_VIEWBOX = "0 0 64 64";
export const MARK_WIDTH = 64;
export const MARK_HEIGHT = 64;
/** The root <svg>'s own fill, where the registry file sets one. */
export const MARK_ROOT_FILL: string | null = null;
/** The ink the glyph is painted in, this product's accent. null when it draws in currentColor. */
export const MARK_INK: string | null = "#82C57E";
/** Everything inside the registry file's own <svg>. */
export const MARK_INNER = "<rect width=\"64\" height=\"64\" fill=\"#0b0d0d\"/><rect x=\"12\" y=\"12\" width=\"40\" height=\"40\" fill=\"#82C57E\"/><path d=\"M24 20h10c8 0 12 4 12 10s-4 10-12 10h-4v5h-6V20Zm6 6v8h4c4 0 6-1 6-4s-2-4-6-4h-4Z\" fill=\"#102313\"/>";
/** The plate the family paints behind the glyph, where this mark has one. */
export const MARK_PLATE: string | null = "<rect width=\"64\" height=\"64\" fill=\"#0b0d0d\"/>";
/** The glyph without that plate, for a header that paints its own ground. */
export const MARK_GLYPH = "<rect x=\"12\" y=\"12\" width=\"40\" height=\"40\" fill=\"#82C57E\"/><path d=\"M24 20h10c8 0 12 4 12 10s-4 10-12 10h-4v5h-6V20Zm6 6v8h4c4 0 6-1 6-4s-2-4-6-4h-4Z\" fill=\"#102313\"/>";
/** The registry file entire, for a header that injects the whole mark. */
export const MARK_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\"><rect width=\"64\" height=\"64\" fill=\"#0b0d0d\"/><rect x=\"12\" y=\"12\" width=\"40\" height=\"40\" fill=\"#82C57E\"/><path d=\"M24 20h10c8 0 12 4 12 10s-4 10-12 10h-4v5h-6V20Zm6 6v8h4c4 0 6-1 6-4s-2-4-6-4h-4Z\" fill=\"#102313\"/></svg>";

/** The same markup with the ink swapped, for a header that recolours the mark. */
export function markInner(color?: string): string {
  return color && MARK_INK ? MARK_INNER.split(MARK_INK).join(color) : MARK_INNER;
}

/** The glyph alone, ink swapped the same way. */
export function markGlyph(color?: string): string {
  return color && MARK_INK ? MARK_GLYPH.split(MARK_INK).join(color) : MARK_GLYPH;
}
