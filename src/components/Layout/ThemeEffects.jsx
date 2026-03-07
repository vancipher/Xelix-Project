import { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeEffects.css';

/* ── Blurred background tree SVG (olive theme) ───────────────── */
const TREE_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320" fill="none">
    {/* trunk — brown wood */}
    <rect x="88" y="200" width="24" height="120" rx="6" fill="#6B3A1F" opacity="0.92"/>
    {/* bark texture */}
    <path d="M92 220v80" stroke="#4a2510" strokeWidth="2" opacity="0.4"/>
    <path d="M100 210v90" stroke="#4a2510" strokeWidth="1.5" opacity="0.35"/>
    <path d="M106 225v70" stroke="#4a2510" strokeWidth="1.5" opacity="0.3"/>
    {/* roots — brown */}
    <path d="M88 300 Q70 312 52 320" stroke="#5a3018" strokeWidth="7" strokeLinecap="round" opacity="0.7"/>
    <path d="M112 300 Q130 312 148 320" stroke="#5a3018" strokeWidth="7" strokeLinecap="round" opacity="0.7"/>
    <path d="M94 308 Q88 316 82 325" stroke="#5a3018" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
    {/* branches — brown */}
    <path d="M88 230 Q60 218 45 200" stroke="#6B3A1F" strokeWidth="6" strokeLinecap="round" opacity="0.7"/>
    <path d="M112 220 Q140 208 155 195" stroke="#6B3A1F" strokeWidth="5" strokeLinecap="round" opacity="0.65"/>
    <path d="M95 210 Q75 195 60 175" stroke="#6B3A1F" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
    {/* lower canopy — deep green */}
    <ellipse cx="100" cy="185" rx="78" ry="58" fill="#2d6b1a" opacity="0.88"/>
    {/* mid canopy */}
    <ellipse cx="100" cy="142" rx="64" ry="50" fill="#3a8a22" opacity="0.90"/>
    {/* upper canopy */}
    <ellipse cx="100" cy="100" rx="50" ry="42" fill="#48a028" opacity="0.88"/>
    {/* left branch canopy */}
    <ellipse cx="52" cy="196" rx="30" ry="22" fill="#3a8a22" opacity="0.75"/>
    {/* right branch canopy */}
    <ellipse cx="150" cy="190" rx="28" ry="20" fill="#48a028" opacity="0.70"/>
    {/* top crown */}
    <ellipse cx="100" cy="64" rx="34" ry="32" fill="#52b830" opacity="0.90"/>
    {/* tip */}
    <ellipse cx="100" cy="38" rx="18" ry="22" fill="#60c838" opacity="0.85"/>
    {/* canopy highlights */}
    <ellipse cx="78" cy="115" rx="20" ry="16" fill="#6ed840" opacity="0.22"/>
    <ellipse cx="122" cy="150" rx="16" ry="12" fill="#6ed840" opacity="0.18"/>
    <ellipse cx="88" cy="78" rx="12" ry="10" fill="#80f050" opacity="0.20"/>
    {/* shadow patches */}
    <ellipse cx="128" cy="180" rx="30" ry="20" fill="#1a4010" opacity="0.28"/>
    <ellipse cx="72" cy="160" rx="22" ry="16" fill="#1a4010" opacity="0.22"/>
  </svg>
);

/* ── Leaf SVG shapes — realistic with veins ──────────────────── */
const LEAF_GREEN_1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M16 2C8 4 4 12 4 18c0 6 5 12 12 12 1-4 2-8 2-14S17 6 16 2z" fill="#3a8a22" opacity="0.85"/>
  <path d="M16 6v18" stroke="#2a6818" stroke-width="0.8" opacity="0.5"/>
  <path d="M16 10 L10 14" stroke="#2a6818" stroke-width="0.5" opacity="0.35"/>
  <path d="M16 15 L11 19" stroke="#2a6818" stroke-width="0.5" opacity="0.35"/>
  <path d="M16 12 L21 15" stroke="#2a6818" stroke-width="0.5" opacity="0.35"/>
</svg>`;
const LEAF_GREEN_2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M22 6C12 8 6 16 6 22c4 0 10-2 14-6 0 0 3-4 2-10z" fill="#48a028" opacity="0.8"/>
  <path d="M20 8 L8 20" stroke="#2d7018" stroke-width="0.7" opacity="0.4"/>
  <path d="M14 10 L10 14" stroke="#2d7018" stroke-width="0.5" opacity="0.3"/>
  <path d="M18 14 L12 18" stroke="#2d7018" stroke-width="0.5" opacity="0.3"/>
</svg>`;
const LEAF_GREEN_3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <ellipse cx="16" cy="16" rx="8" ry="12" transform="rotate(-25 16 16)" fill="#52b830" opacity="0.8"/>
  <path d="M12 24 L20 8" stroke="#3a8a20" stroke-width="0.7" opacity="0.45"/>
  <path d="M14 12 L11 14" stroke="#3a8a20" stroke-width="0.4" opacity="0.3"/>
  <path d="M16 16 L12 18" stroke="#3a8a20" stroke-width="0.4" opacity="0.3"/>
</svg>`;
/* Autumn / fall leaves */
const LEAF_ORANGE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M16 2C8 4 4 12 4 18c0 6 5 12 12 12 1-4 2-8 2-14S17 6 16 2z" fill="#d4811a" opacity="0.85"/>
  <path d="M16 6v18" stroke="#a05a10" stroke-width="0.8" opacity="0.5"/>
  <path d="M16 11 L10 15" stroke="#a05a10" stroke-width="0.5" opacity="0.35"/>
  <path d="M16 14 L21 17" stroke="#a05a10" stroke-width="0.5" opacity="0.35"/>
</svg>`;
const LEAF_RED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M22 6C12 8 6 16 6 22c4 0 10-2 14-6 0 0 3-4 2-10z" fill="#b83520" opacity="0.8"/>
  <path d="M20 8 L8 20" stroke="#8a2010" stroke-width="0.7" opacity="0.4"/>
  <path d="M15 11 L11 15" stroke="#8a2010" stroke-width="0.5" opacity="0.3"/>
</svg>`;
const LEAF_YELLOW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <ellipse cx="16" cy="16" rx="8" ry="12" transform="rotate(-25 16 16)" fill="#c8a020" opacity="0.82"/>
  <path d="M12 24 L20 8" stroke="#9a7818" stroke-width="0.7" opacity="0.45"/>
  <path d="M14 13 L11 15" stroke="#9a7818" stroke-width="0.4" opacity="0.3"/>
</svg>`;
const LEAF_BROWN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M16 3C9 5 5 12 5 17c0 5 4 11 11 11 1-3 2-7 2-13S17 6 16 3z" fill="#8a5a28" opacity="0.75"/>
  <path d="M16 7v16" stroke="#6a4018" stroke-width="0.7" opacity="0.4"/>
</svg>`;

const NATURE_LEAVES = [LEAF_GREEN_1, LEAF_GREEN_2, LEAF_GREEN_3, LEAF_ORANGE, LEAF_RED, LEAF_YELLOW, LEAF_BROWN];

/* ── Heart SVG ───────────────────────────────────────────────── */
const HEART_SHAPE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z" fill="currentColor"/>
</svg>`;

/* ── Spark / ember ───────────────────────────────────────────── */
const SPARK_SHAPE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.9"/>
</svg>`;

/* ── Bubble (sea theme) ──────────────────────────────────────── */
const BUBBLE_SHAPE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.2" opacity="0.7"/>
  <ellipse cx="9" cy="9" rx="2.5" ry="1.5" fill="currentColor" opacity="0.35" transform="rotate(-30 9 9)"/>
</svg>`;

const FISH_SHAPE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M4 12c4-5 12-5 16 0-4 5-12 5-16 0z" fill="currentColor" opacity="0.6"/>
  <circle cx="16" cy="11.5" r="1" fill="currentColor" opacity="0.9"/>
  <path d="M2 12l3-3v6z" fill="currentColor" opacity="0.5"/>
</svg>`;

/* ── Teddy bear (purple theme) ───────────────────────────────── */
const BEAR_SHAPE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="7" cy="6" r="3.5" fill="currentColor" opacity="0.7"/>
  <circle cx="17" cy="6" r="3.5" fill="currentColor" opacity="0.7"/>
  <circle cx="12" cy="13" r="8" fill="currentColor" opacity="0.8"/>
  <circle cx="9" cy="11" r="1.2" fill="white" opacity="0.5"/>
  <circle cx="15" cy="11" r="1.2" fill="white" opacity="0.5"/>
  <ellipse cx="12" cy="14" rx="2" ry="1.3" fill="white" opacity="0.4"/>
</svg>`;

const STAR_SHAPE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M12 2l2.4 7.2H22l-6 4.4 2.3 7.2L12 16.4 5.7 20.8 8 13.6 2 9.2h7.6z" fill="currentColor" opacity="0.8"/>
</svg>`;

/* ── Parthenon SVG (Athena theme) ─────────────────────────── */
const PARTHENON_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 300" fill="none">
    {/* Steps */}
    <rect x="10"  y="288" width="540" height="12" rx="3" fill="rgba(250,245,232,0.55)"/>
    <rect x="24"  y="276" width="512" height="13" rx="3" fill="rgba(252,248,238,0.52)"/>
    <rect x="38"  y="265" width="484" height="12" rx="3" fill="rgba(248,242,228,0.50)"/>
    {/* Column 1 */}
    <rect x="52"  y="88" width="24" height="177" rx="3" fill="rgba(252,248,238,0.80)"/>
    <line x1="58"  y1="90" x2="58"  y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <line x1="65"  y1="90" x2="65"  y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <line x1="72"  y1="90" x2="72"  y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <rect x="44"  y="77" width="40" height="13" rx="3" fill="rgba(250,245,232,0.86)"/>
    {/* Column 2 */}
    <rect x="118" y="88" width="24" height="177" rx="3" fill="rgba(248,242,228,0.76)"/>
    <line x1="124" y1="90" x2="124" y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <line x1="131" y1="90" x2="131" y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <rect x="110" y="77" width="40" height="13" rx="3" fill="rgba(248,243,230,0.84)"/>
    {/* Column 3 */}
    <rect x="184" y="88" width="24" height="177" rx="3" fill="rgba(252,248,238,0.80)"/>
    <line x1="190" y1="90" x2="190" y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <line x1="197" y1="90" x2="197" y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <rect x="176" y="77" width="40" height="13" rx="3" fill="rgba(250,245,232,0.86)"/>
    {/* Column 4 */}
    <rect x="250" y="88" width="24" height="177" rx="3" fill="rgba(248,242,228,0.76)"/>
    <line x1="256" y1="90" x2="256" y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <line x1="263" y1="90" x2="263" y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <rect x="242" y="77" width="40" height="13" rx="3" fill="rgba(248,243,230,0.84)"/>
    {/* Column 5 */}
    <rect x="316" y="88" width="24" height="177" rx="3" fill="rgba(252,248,238,0.80)"/>
    <line x1="322" y1="90" x2="322" y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <line x1="329" y1="90" x2="329" y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <rect x="308" y="77" width="40" height="13" rx="3" fill="rgba(250,245,232,0.86)"/>
    {/* Column 6 */}
    <rect x="382" y="88" width="24" height="177" rx="3" fill="rgba(248,242,228,0.76)"/>
    <line x1="388" y1="90" x2="388" y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <line x1="395" y1="90" x2="395" y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <rect x="374" y="77" width="40" height="13" rx="3" fill="rgba(248,243,230,0.84)"/>
    {/* Column 7 */}
    <rect x="448" y="88" width="24" height="177" rx="3" fill="rgba(252,248,238,0.80)"/>
    <line x1="454" y1="90" x2="454" y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <line x1="461" y1="90" x2="461" y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <rect x="440" y="77" width="40" height="13" rx="3" fill="rgba(250,245,232,0.86)"/>
    {/* Column 8 */}
    <rect x="490" y="88" width="24" height="177" rx="3" fill="rgba(248,242,228,0.76)"/>
    <line x1="496" y1="90" x2="496" y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <line x1="503" y1="90" x2="503" y2="265" stroke="rgba(185,175,155,0.20)" strokeWidth="2"/>
    <rect x="482" y="77" width="40" height="13" rx="3" fill="rgba(248,243,230,0.84)"/>
    {/* Entablature */}
    <rect x="40"  y="65" width="480" height="15" rx="2" fill="rgba(250,245,232,0.88)"/>
    {/* Frieze */}
    <rect x="40"  y="53" width="480" height="14" rx="2" fill="rgba(244,237,215,0.68)"/>
    {/* Pediment */}
    <polygon
      points="34,53 280,4 526,53"
      fill="rgba(248,242,228,0.60)"
      stroke="rgba(225,215,192,0.60)"
      strokeWidth="2"
    />
    <line x1="34"  y1="53" x2="280" y2="4"  stroke="rgba(255,252,242,0.50)" strokeWidth="1.5"/>
    <line x1="280" y1="4"  x2="526" y2="53" stroke="rgba(255,252,242,0.50)" strokeWidth="1.5"/>
    {/* Acroterion */}
    <ellipse cx="280" cy="5"  rx="9" ry="7" fill="rgba(255,252,242,0.72)"/>
    <ellipse cx="34"  cy="53" rx="5" ry="4" fill="rgba(250,245,232,0.55)"/>
    <ellipse cx="526" cy="53" rx="5" ry="4" fill="rgba(250,245,232,0.55)"/>
  </svg>
);

/* ── Laurel leaf + Owl (Athena theme) ────────────────────────── */
const LAUREL_LEAF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M12 22C7 15 5 10 8 5c2-3 6-4 8-2-1 4-3 8-4 19z" fill="currentColor" opacity="0.80"/>
  <path d="M11 8 L13 20" stroke="rgba(0,0,0,0.18)" stroke-width="0.6" opacity="0.5"/>
  <path d="M10 13 L14 17" stroke="rgba(0,0,0,0.14)" stroke-width="0.5" opacity="0.4"/>
</svg>`;

const OWL_SHAPE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <ellipse cx="12" cy="14" rx="7" ry="7" fill="currentColor" opacity="0.65"/>
  <circle cx="9" cy="11" r="2.4" fill="white" opacity="0.55"/>
  <circle cx="15" cy="11" r="2.4" fill="white" opacity="0.55"/>
  <circle cx="9.5" cy="11.5" r="1.1" fill="currentColor" opacity="0.85"/>
  <circle cx="15.5" cy="11.5" r="1.1" fill="currentColor" opacity="0.85"/>
  <path d="M10 17 L12 15.5 L14 17" stroke="white" stroke-width="0.8" opacity="0.5"/>
  <path d="M9.5 7.5 L11 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
  <path d="M14.5 7.5 L13 9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
</svg>`;

/* ── Hello Kitty (lavender theme) ────────────────────────────── */
const HELLO_KITTY_SHAPE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <ellipse cx="12" cy="14" rx="8" ry="7" fill="currentColor" opacity="0.7"/>
  <polygon points="4,10 6,3 9,9" fill="currentColor" opacity="0.7"/>
  <polygon points="20,10 18,3 15,9" fill="currentColor" opacity="0.7"/>
  <circle cx="5" cy="4" r="2.5" fill="currentColor" opacity="0.8"/>
  <circle cx="3.5" cy="3" r="1.2" fill="currentColor" opacity="0.8"/>
  <circle cx="6.5" cy="3" r="1.2" fill="currentColor" opacity="0.8"/>
  <circle cx="9.5" cy="12.5" r="1" fill="white" opacity="0.6"/>
  <circle cx="14.5" cy="12.5" r="1" fill="white" opacity="0.6"/>
  <ellipse cx="12" cy="14.5" rx="1" ry="0.7" fill="white" opacity="0.5"/>
  <line x1="6" y1="13.5" x2="2" y2="12.5" stroke="white" stroke-width="0.5" opacity="0.4"/>
  <line x1="6" y1="14.5" x2="2" y2="15" stroke="white" stroke-width="0.5" opacity="0.4"/>
  <line x1="18" y1="13.5" x2="22" y2="12.5" stroke="white" stroke-width="0.5" opacity="0.4"/>
  <line x1="18" y1="14.5" x2="22" y2="15" stroke="white" stroke-width="0.5" opacity="0.4"/>
</svg>`;

/* ── Sun ray (sun theme) ─────────────────────────────────────── */
const SUNFLARE_SHAPE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="5" fill="currentColor" opacity="0.85"/>
  <path d="M12 1v4M12 19v4M1 12h4M19 12h4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M4.2 19.8l2.8-2.8M17 7l2.8-2.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
</svg>`;

const CLOUD_SHAPE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <ellipse cx="12" cy="14" rx="8" ry="4" fill="currentColor" opacity="0.4"/>
  <circle cx="9" cy="11" r="4" fill="currentColor" opacity="0.35"/>
  <circle cx="15" cy="11" r="3" fill="currentColor" opacity="0.3"/>
</svg>`;

function createParticle(container, config, randomStart = false) {
  const el = document.createElement('div');
  el.className = 'txfx-particle';

  const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
  const startX = Math.random() * 100; // vw %
  const delay = Math.random() * config.spawnDelay;
  const duration = config.minDur + Math.random() * config.durRange;
  const rotStart = Math.random() * 360;
  const opacity = config.minOpacity + Math.random() * (config.maxOpacity - config.minOpacity);

  const shapeIdx = Math.floor(Math.random() * config.shapes.length);
  el.innerHTML = config.shapes[shapeIdx];

  if (config.wander) {
    // Random position anywhere on screen, drift in random direction, loop forever
    const startY = Math.random() * 90; // vh
    const angle  = Math.random() * Math.PI * 2;
    const dist   = config.drift * (0.5 + Math.random() * 0.5);
    const driftX = Math.cos(angle) * dist;
    const driftY = Math.sin(angle) * dist;
    const rotEnd = rotStart + (Math.random() - 0.5) * 40;

    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${startX}vw;
      top: ${startY}vh;
      color: ${config.color};
      opacity: ${opacity};
      animation: txfxWander ${duration}s ${delay}s ease-in-out infinite alternate;
      --rot-start: ${rotStart}deg;
      --rot-end:   ${rotEnd}deg;
      --drift-x:   ${driftX}px;
      --drift-y:   ${driftY}px;
    `;
    container.appendChild(el);
    // no removal — infinite animation, cleaned up on theme change
    return;
  }

  // Wind — blow left to right with gentle downward drift
  if (config.windRight) {
    const startY = randomStart ? Math.random() * 80 : (Math.random() * 70 + 5); // vh
    const windDur = config.minDur + Math.random() * config.durRange;
    const driftY = 30 + Math.random() * 80; // gentle fall
    const rotEnd = rotStart + (Math.random() > 0.5 ? 1 : -1) * (60 + Math.random() * 200);
    const startLeft = randomStart ? Math.random() * 60 : -(size / 10); // vw, start off-left or scattered

    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${startLeft}vw;
      top: ${startY}vh;
      color: ${config.color};
      opacity: ${opacity};
      animation: txfxWindRight ${windDur}s ${delay}s linear forwards;
      --rot-start: ${rotStart}deg;
      --rot-end:   ${rotEnd}deg;
      --drift-y:   ${driftY}px;
    `;
    container.appendChild(el);
    const total = (windDur + delay) * 1000 + 200;
    setTimeout(() => el.remove(), total);
    return;
  }

  const rotEnd = rotStart + (Math.random() > 0.5 ? 1 : -1) * (90 + Math.random() * 180);
  const driftX = (Math.random() - 0.5) * config.drift;

  const animName = config.floatUp ? 'txfxFloat' : 'txfxFall';
  const posStyle = config.floatUp
    ? `bottom: ${randomStart ? Math.random() * 80 + 'vh' : `-${size + 20}px`}; top: auto;`
    : `top: -${size + 20}px;`;

  el.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    left: ${startX}vw;
    ${posStyle}
    color: ${config.color};
    opacity: ${opacity};
    animation: ${animName} ${duration}s ${delay}s linear forwards;
    --rot-start: ${rotStart}deg;
    --rot-end:   ${rotEnd}deg;
    --drift-x:   ${driftX}px;
  `;

  container.appendChild(el);

  // Remove after animation ends
  const total = (duration + delay) * 1000 + 200;
  setTimeout(() => el.remove(), total);
}

const CONFIGS = {
  nature: {
    shapes: NATURE_LEAVES,
    color: 'inherit',
    minSize: 18, maxSize: 40,
    minOpacity: 0.40, maxOpacity: 0.80,
    spawnDelay: 0,
    minDur: 5, durRange: 8,
    drift: 120,
    interval: 500,
    maxParticles: 26,
    windRight: true,
  },
  lavender: {
    shapes: [HEART_SHAPE, HELLO_KITTY_SHAPE],
    color: 'var(--accent)',
    minSize: 10, maxSize: 24,
    minOpacity: 0.28, maxOpacity: 0.60,
    spawnDelay: 0,
    minDur: 10, durRange: 8,
    drift: 180,
    interval: 600,
    maxParticles: 18,
    wander: true,
  },
  orange: {
    shapes: [SPARK_SHAPE],
    color: 'var(--accent)',
    minSize: 5, maxSize: 14,
    minOpacity: 0.40, maxOpacity: 0.90,
    spawnDelay: 0,
    minDur: 3, durRange: 5,
    drift: 80,
    interval: 350,
    maxParticles: 28,
  },
  sea: {
    shapes: [BUBBLE_SHAPE, FISH_SHAPE],
    color: 'var(--accent)',
    minSize: 10, maxSize: 30,
    minOpacity: 0.25, maxOpacity: 0.65,
    spawnDelay: 0,
    minDur: 7, durRange: 8,
    drift: 100,
    interval: 700,
    maxParticles: 20,
    floatUp: true,
  },
  purple: {
    shapes: [BEAR_SHAPE, HEART_SHAPE, STAR_SHAPE],
    color: 'var(--accent)',
    minSize: 12, maxSize: 28,
    minOpacity: 0.22, maxOpacity: 0.55,
    spawnDelay: 0,
    minDur: 10, durRange: 8,
    drift: 160,
    interval: 650,
    maxParticles: 18,
    wander: true,
  },
  sun: {
    shapes: [SUNFLARE_SHAPE, CLOUD_SHAPE],
    color: 'var(--accent)',
    minSize: 14, maxSize: 34,
    minOpacity: 0.25, maxOpacity: 0.60,
    spawnDelay: 0,
    minDur: 8, durRange: 7,
    drift: 120,
    interval: 800,
    maxParticles: 16,
    wander: true,
  },
  gold: {
    shapes: [STAR_SHAPE, SPARK_SHAPE],
    color: '#c9a227',
    minSize: 6, maxSize: 20,
    minOpacity: 0.30, maxOpacity: 0.75,
    spawnDelay: 0,
    minDur: 4, durRange: 6,
    drift: 100,
    interval: 99999,
    maxParticles: 0,
  },
  athena: {
    shapes: [LAUREL_LEAF, OWL_SHAPE],
    color: '#5a8a25',
    minSize: 8, maxSize: 24,
    minOpacity: 0.30, maxOpacity: 0.65,
    spawnDelay: 0,
    minDur: 8, durRange: 7,
    drift: 90,
    interval: 750,
    maxParticles: 20,
  },
};

export default function ThemeEffects() {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear any leftover particles from previous theme
    container.innerHTML = '';
    clearInterval(timerRef.current);

    const cfg = CONFIGS[theme];
    if (!cfg) return; // white / black — no particles

    // Seed a batch immediately so screen isn't empty on load
    for (let i = 0; i < 8; i++) {
      createParticle(container, cfg, true);
    }

    timerRef.current = setInterval(() => {
      const count = container.children.length;
      if (count < cfg.maxParticles) {
        createParticle(container, cfg);
      }
    }, cfg.interval);

    return () => {
      clearInterval(timerRef.current);
      container.innerHTML = '';
    };
  }, [theme]);

  return (
    <>
      {/* Blurred tree background — olive theme only */}
      {theme === 'nature' && (
        <div className="txfx-tree-bg" aria-hidden="true">
          <div className="txfx-tree txfx-tree--left">{TREE_SVG}</div>
          <div className="txfx-tree txfx-tree--right">{TREE_SVG}</div>
          <div className="txfx-tree txfx-tree--center">{TREE_SVG}</div>
          <div className="txfx-mist" />
        </div>
      )}

      {/* Lava blobs — ember/orange theme */}
      {theme === 'orange' && (
        <div className="txfx-lava-bg" aria-hidden="true">
          <div className="txfx-lava-blobs">
            <div className="txfx-lava-blob txfx-lava-blob--1" />
            <div className="txfx-lava-blob txfx-lava-blob--2" />
            <div className="txfx-lava-blob txfx-lava-blob--3" />
            <div className="txfx-lava-blob txfx-lava-blob--4" />
            <div className="txfx-lava-blob txfx-lava-blob--5" />
          </div>
          <div className="txfx-lava-floor" />
        </div>
      )}

      {/* Sea waves — ocean/sea theme */}
      {theme === 'sea' && (
        <div className="txfx-sea-bg" aria-hidden="true">
          <div className="txfx-sea-caustic" />
          <div className="txfx-sea-wave txfx-sea-wave--1" />
          <div className="txfx-sea-wave txfx-sea-wave--2" />
          <div className="txfx-sea-wave txfx-sea-wave--3" />
          <div className="txfx-sea-floor" />
        </div>
      )}

      {/* Purple dreamy clouds */}
      {theme === 'purple' && (
        <div className="txfx-purple-bg" aria-hidden="true">
          <div className="txfx-purple-orb txfx-purple-orb--1" />
          <div className="txfx-purple-orb txfx-purple-orb--2" />
          <div className="txfx-purple-orb txfx-purple-orb--3" />
        </div>
      )}

      {/* Sun orb + rays */}
      {theme === 'sun' && (
        <div className="txfx-sun-bg" aria-hidden="true">
          <div className="txfx-sun-orb" />
          <div className="txfx-sun-rays" />
          <div className="txfx-sun-haze" />
        </div>
      )}

      {/* Gold royal glow */}
      {theme === 'gold' && (
        <div className="txfx-gold-bg" aria-hidden="true">
          <div className="txfx-gold-glow txfx-gold-glow--bottom" />
          <div className="txfx-gold-glow txfx-gold-glow--left" />
          <div className="txfx-gold-glow txfx-gold-glow--right" />
          <div className="txfx-gold-lines" />
        </div>
      )}

      {/* Athena — Mediterranean landscape */}
      {theme === 'athena' && (
        <div className="txfx-athena-bg" aria-hidden="true">
          <div className="txfx-athena-sky" />
          <div className="txfx-athena-col txfx-athena-col--1" />
          <div className="txfx-athena-col txfx-athena-col--2" />
          <div className="txfx-athena-col txfx-athena-col--3" />
          <div className="txfx-athena-col txfx-athena-col--4" />
          <div className="txfx-athena-laurel" />
          <div className="txfx-athena-ground" />
        </div>
      )}

      {/* Particle container */}
      <div
        ref={containerRef}
        className="txfx-container"
        aria-hidden="true"
      />
    </>
  );
}
