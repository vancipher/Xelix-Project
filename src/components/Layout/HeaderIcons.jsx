/** Shared 24×24 stroke icons for the header toolbar */
const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const navStroke = {
  ...stroke,
  strokeWidth: 2,
};

export function IconResources({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path {...navStroke} d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path {...navStroke} d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path {...navStroke} d="M8 7h8M8 11h6" />
    </svg>
  );
}

export function IconRefresh() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path {...stroke} d="M21 3v6h-6" />
    </svg>
  );
}

export function IconPalette({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        {...navStroke}
        d="M12 2a10 10 0 0 0-1 20 1.5 1.5 0 0 0 1.5-1.5 1.75 1.75 0 0 1 1.75-1.75H16a4 4 0 0 0 4-4 10 10 0 0 0-8-13.75z"
      />
      <circle cx="7.5" cy="10.5" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.5" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="10.5" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="16" r="1.35" fill="currentColor" stroke="none" />
      <circle {...navStroke} cx="15.5" cy="18.5" r="2" />
    </svg>
  );
}

export function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden className="header-chevron">
      <path {...stroke} d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconGlobe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <circle {...stroke} cx="12" cy="12" r="10" />
      <path {...stroke} d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function IconCalendar({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <rect {...navStroke} x="3" y="5" width="18" height="16" rx="2.5" />
      <path {...navStroke} d="M16 3v4M8 3v4M3 11h18" />
      <circle cx="8" cy="15" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="16" cy="15" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMore({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <circle {...navStroke} cx="6" cy="12" r="1.75" />
      <circle {...navStroke} cx="12" cy="12" r="1.75" />
      <circle {...navStroke} cx="18" cy="12" r="1.75" />
    </svg>
  );
}

export function IconLogin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path {...stroke} d="M10 17l5-5-5-5" />
      <path {...stroke} d="M15 12H3" />
    </svg>
  );
}

export function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <circle {...stroke} cx="12" cy="8" r="4" />
      <path {...stroke} d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6" />
    </svg>
  );
}
