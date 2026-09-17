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
    <span
      className={['app-nav-icon', 'app-nav-icon--resources', className].filter(Boolean).join(' ')}
      aria-hidden
    />
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
  const dot = { fill: 'currentColor', stroke: 'none' };
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        {...navStroke}
        d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"
      />
      <circle cx="13.5" cy="6.5" r="1.2" {...dot} />
      <circle cx="17.5" cy="10.5" r="1.2" {...dot} />
      <circle cx="8.5" cy="11.5" r="1.2" {...dot} />
      <circle cx="12" cy="14.5" r="1.2" {...dot} />
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

export function IconAdmin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        {...stroke}
        d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6l7-3z"
      />
      <path {...stroke} d="M9.5 12.2l1.7 1.7 3.5-3.6" />
    </svg>
  );
}

export function IconUsers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <circle {...stroke} cx="9" cy="8" r="3.2" />
      <path {...stroke} d="M2.5 19c.8-3.2 3.4-5 6.5-5s5.7 1.8 6.5 5" />
      <circle {...stroke} cx="17" cy="9" r="2.4" />
      <path {...stroke} d="M15.2 14.2c2.2.4 3.9 1.8 4.5 4.3" />
    </svg>
  );
}

export function IconActivity() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M3 12h4l2.5-6 4 12 2.5-6H21" />
    </svg>
  );
}

export function IconFolder() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path {...stroke} d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9z" />
    </svg>
  );
}

export function IconScheduleEdit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <rect {...stroke} x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path {...stroke} d="M8 3.5v3M16 3.5v3M3.5 10h17" />
      <path {...stroke} d="M14.2 13.2l3.6 3.6-1.4 1.4-3.6-3.6v-1.4h1.4z" />
    </svg>
  );
}
