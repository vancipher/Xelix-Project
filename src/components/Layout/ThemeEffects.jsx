import { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeEffects.css';

/* ── Blurred background tree SVG (olive theme) ───────────────── */
const TREE_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320" fill="none">
    {/* trunk */}
    <rect x="88" y="210" width="24" height="110" rx="8" fill="#2d5a1b" opacity="0.9"/>
    {/* roots */}
    <path d="M88 300 Q70 310 55 320" stroke="#2d5a1b" strokeWidth="6" strokeLinecap="round" opacity="0.7"/>
    <path d="M112 300 Q130 310 145 320" stroke="#2d5a1b" strokeWidth="6" strokeLinecap="round" opacity="0.7"/>
    <path d="M95 310 Q90 318 85 325" stroke="#2d5a1b" strokeWidth="4" strokeLinecap="round" opacity="0.5"/>
    {/* lower canopy */}
    <ellipse cx="100" cy="190" rx="72" ry="54" fill="#3a7a22" opacity="0.85"/>
    {/* mid canopy */}
    <ellipse cx="100" cy="148" rx="58" ry="46" fill="#459128" opacity="0.9"/>
    {/* upper canopy */}
    <ellipse cx="100" cy="108" rx="44" ry="38" fill="#52a830" opacity="0.88"/>
    {/* top crown */}
    <ellipse cx="100" cy="72" rx="30" ry="30" fill="#5ebc36" opacity="0.92"/>
    {/* tip */}
    <ellipse cx="100" cy="44" rx="16" ry="20" fill="#6ed040" opacity="0.85"/>
    {/* canopy highlights (lighter patches) */}
    <ellipse cx="80" cy="120" rx="18" ry="14" fill="#7de84a" opacity="0.25"/>
    <ellipse cx="120" cy="155" rx="14" ry="10" fill="#7de84a" opacity="0.20"/>
    <ellipse cx="90" cy="85" rx="10" ry="8" fill="#9cfb60" opacity="0.22"/>
    {/* shadow patches */}
    <ellipse cx="125" cy="185" rx="28" ry="18" fill="#1a4010" opacity="0.30"/>
    <ellipse cx="75" cy="165" rx="20" ry="14" fill="#1a4010" opacity="0.22"/>
  </svg>
);

/* ── Leaf SVG shapes ─────────────────────────────────────────── */
const LEAF_SHAPES = [
  // oval leaf
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12 2C6 2 2 8 2 12c0 5 4 10 10 10 1-3 2-6 2-10s-1-7-2-10z" fill="currentColor"/>
   </svg>`,
  // simple leaf
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M17 8C8 10 5 16 5 19c3 0 7-1 10-4 0 0 2-3 2-7z" fill="currentColor"/>
   </svg>`,
  // round leaf
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <ellipse cx="12" cy="13" rx="7" ry="9" transform="rotate(-20 12 13)" fill="currentColor"/>
   </svg>`,
];

/* ── Heart SVG ───────────────────────────────────────────────── */
const HEART_SHAPE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <path d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z" fill="currentColor"/>
</svg>`;

/* ── Spark / ember ───────────────────────────────────────────── */
const SPARK_SHAPE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.9"/>
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
    shapes: LEAF_SHAPES,
    color: 'var(--accent)',
    minSize: 16, maxSize: 36,
    minOpacity: 0.35, maxOpacity: 0.75,
    spawnDelay: 0,
    minDur: 6, durRange: 8,
    drift: 120,
    interval: 600,
    maxParticles: 22,
    floatUp: true,
  },
  lavender: {
    shapes: [HEART_SHAPE],
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

      {/* Blurred giant X — dark/crimson theme */}
      {theme === 'black' && (
        <div className="txfx-dark-bg" aria-hidden="true">
          <div className="txfx-x txfx-x--main">X</div>
          <div className="txfx-x txfx-x--echo">X</div>
          <div className="txfx-crimson-glow" />
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

      {/* Particle container */}
      <div
        ref={containerRef}
        className="txfx-container"
        aria-hidden="true"
      />
    </>
  );
}
