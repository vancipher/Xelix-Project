import { registerSW } from 'virtual:pwa-register';

/** Background poll while the app stays open */
const UPDATE_CHECK_MS = 15 * 60 * 1000;
/** Throttle checks when returning to the app (iPad home-screen reopen) */
const MIN_CHECK_INTERVAL_MS = 30 * 1000;

let forceReload = null;
let lastCheck = 0;
let refreshing = false;

const boundRegistrations = new WeakSet();

function waitForInstalling(worker) {
  return new Promise((resolve) => {
    if (worker.state === 'installed') {
      resolve();
      return;
    }
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') resolve();
    });
  });
}

function promoteWaitingWorker(registration) {
  registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
}

function checkForUpdates(registration) {
  if (!registration) return;
  const now = Date.now();
  if (now - lastCheck < MIN_CHECK_INTERVAL_MS) return;
  lastCheck = now;
  registration.update().catch(() => {});
}

function bindRegistrationLifecycle(registration) {
  if (!registration) return;

  checkForUpdates(registration);

  if (!boundRegistrations.has(registration)) {
    boundRegistrations.add(registration);
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          promoteWaitingWorker(registration);
        }
      });
    });
  }

  if (registration.waiting && navigator.serviceWorker.controller) {
    promoteWaitingWorker(registration);
  }
}

function bindAutoReload() {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}

function bindAppResumeChecks() {
  const onResume = () => {
    navigator.serviceWorker.getRegistration().then(bindRegistrationLifecycle);
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') onResume();
  });
  window.addEventListener('focus', onResume);
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) onResume();
  });
}

export function initPwaUpdates() {
  if (!('serviceWorker' in navigator)) return;

  bindAutoReload();
  bindAppResumeChecks();

  forceReload = registerSW({
    immediate: true,
    onRegistered(registration) {
      bindRegistrationLifecycle(registration);
      window.setInterval(() => checkForUpdates(registration), UPDATE_CHECK_MS);
    },
  });
}

/**
 * Manual update from More menu — same path as auto-update, with reload fallback.
 */
export async function applyAppUpdate() {
  if (!('serviceWorker' in navigator)) {
    window.location.reload();
    return 'reload';
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      if (forceReload) forceReload(true);
      else window.location.reload();
      return 'reload';
    }

    lastCheck = 0;
    await registration.update();
    bindRegistrationLifecycle(registration);

    if (registration.waiting) {
      promoteWaitingWorker(registration);
      return 'updated';
    }

    if (registration.installing) {
      await waitForInstalling(registration.installing);
      if (registration.waiting) {
        promoteWaitingWorker(registration);
        return 'updated';
      }
    }

    if (forceReload) forceReload(true);
    else window.location.reload();
    return 'reload';
  } catch {
    window.location.reload();
    return 'error';
  }
}
