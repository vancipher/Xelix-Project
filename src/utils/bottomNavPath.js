/** Floating pill with a smooth center valley for the FAB. */
export const NAV_PILL_H = 64;
export const NAV_PILL_R = 32;
export const NAV_BUBBLE = 58;
export const NAV_VALLEY_W = 108;
export const NAV_VALLEY_D = 28;

function n(value) {
  return Number(value.toFixed(2));
}

/**
 * Capsule path with a U-shaped dip in the top edge (always centered).
 * @param {number} width
 * @param {number} [height]
 */
export function buildBottomNavPath(width, height = NAV_PILL_H) {
  if (!width || !height) return '';

  const w = width;
  const h = height;
  const r = Math.min(NAV_PILL_R, h / 2);
  const cx = w / 2;
  const half = Math.min(NAV_VALLEY_W / 2, Math.max(24, (w - r * 2) / 2 - 8));
  const d = NAV_VALLEY_D;
  const x0 = cx - half;
  const x1 = cx + half;
  const topHandle = half * 0.22;
  const bottomHandle = half * 0.52;

  return [
    `M 0 ${n(r)}`,
    `A ${n(r)} ${n(r)} 0 0 1 ${n(r)} 0`,
    `L ${n(x0)} 0`,
    `C ${n(x0 + topHandle)} 0 ${n(cx - bottomHandle)} ${n(d)} ${n(cx)} ${n(d)}`,
    `C ${n(cx + bottomHandle)} ${n(d)} ${n(x1 - topHandle)} 0 ${n(x1)} 0`,
    `L ${n(w - r)} 0`,
    `A ${n(r)} ${n(r)} 0 0 1 ${w} ${n(r)}`,
    `L ${w} ${n(h - r)}`,
    `A ${n(r)} ${n(r)} 0 0 1 ${n(w - r)} ${h}`,
    `L ${n(r)} ${h}`,
    `A ${n(r)} ${n(r)} 0 0 1 0 ${n(h - r)}`,
    'Z',
  ].join(' ');
}
