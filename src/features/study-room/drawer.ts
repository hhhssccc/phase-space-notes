import { registerDrawer } from './drawer-api';
const trigger = document.querySelector<HTMLButtonElement>('[data-study-open]');
const drawer = document.querySelector<HTMLElement>('[data-study-drawer]');
const backdrop = document.querySelector<HTMLElement>('[data-study-backdrop]');
const closeButton = document.querySelector<HTMLButtonElement>('[data-study-close]');
const roomScroll = drawer?.querySelector<HTMLElement>('[data-room-scroll]');
const roomLinks = Array.from(drawer?.querySelectorAll<HTMLButtonElement>('[data-room-jump]') ?? []);
const roomSections = Array.from(drawer?.querySelectorAll<HTMLElement>('[data-room-section]') ?? []);
let body = document.body;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let returnFocus: HTMLElement | null = null;
let invokingTrigger: HTMLElement | null = null;
let closeTimer: number | undefined;
let isOpen = false;
const previousInertStates = new Map<Element, boolean>();
let navigationFrame = 0;
const markRoomSection = (id: string) => {
  roomLinks.forEach(button => {
    if (button.dataset.roomJump === id) button.setAttribute('aria-current', 'location');
    else button.removeAttribute('aria-current');
  });
};
const syncRoomNavigation = () => {
  navigationFrame = 0;
  if (!isOpen || !roomScroll || !roomSections.length) return;
  const top = roomScroll.getBoundingClientRect().top;
  let current = roomSections[0];
  for (const section of roomSections) {
    if (section.getBoundingClientRect().top <= top + 72) current = section;
    else break;
  }
  if (roomScroll.scrollTop + roomScroll.clientHeight >= roomScroll.scrollHeight - 2) current = roomSections[roomSections.length - 1];
  markRoomSection(current.dataset.roomSection || 'reading');
};
roomLinks.forEach(button => button.addEventListener('click', () => {
  if (!roomScroll) return;
  const section = roomSections.find(element => element.dataset.roomSection === button.dataset.roomJump);
  if (!section) return;
  roomScroll.scrollTo({ top: Math.max(0, roomScroll.scrollTop + section.getBoundingClientRect().top - roomScroll.getBoundingClientRect().top - 16), behavior: 'instant' });
  markRoomSection(button.dataset.roomJump || 'reading');
  section.querySelector<HTMLElement>('h3[tabindex], h4[tabindex]')?.focus({ preventScroll: true });
}));
roomScroll?.addEventListener('scroll', () => {
  if (!navigationFrame && isOpen) navigationFrame = requestAnimationFrame(syncRoomNavigation);
}, { passive: true });

const focusableElements = () => {
  if (!drawer) return [];
  return Array.from(drawer.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
  )).filter((element) => !element.hidden && element.getClientRects().length > 0);
};

const focusElement = (element: HTMLElement | null) => {
  if (!element) return;
  try {
    element.focus({ preventScroll: true });
  } catch {
    // Older Safari accepts focus(), but not the FocusOptions overload.
    element.focus();
  }
};

const focusDrawer = () => {
  focusElement(focusableElements()[0] ?? closeButton ?? drawer);
};

const setPageInert = (value: boolean) => {
  if (value) {
    previousInertStates.clear();
    Array.from(body.children).forEach((element) => {
      if (element === drawer || element === backdrop) return;
      previousInertStates.set(element, element.hasAttribute('inert'));
      element.setAttribute('inert', '');
    });
    return;
  }

  previousInertStates.forEach((wasInert, element) => {
    if (wasInert) element.setAttribute('inert', '');
    else element.removeAttribute('inert');
  });
  previousInertStates.clear();
};

const finishClose = () => {
  if (!drawer || !backdrop || isOpen) return;
  drawer.hidden = true;
  backdrop.hidden = true;
};

const openDrawer = (invoker: HTMLElement | null = null) => {
  if (!drawer || !backdrop || !trigger || isOpen) return;
  if (closeTimer !== undefined) window.clearTimeout(closeTimer);
  isOpen = true;
  invokingTrigger = invoker;
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : trigger;
  drawer.hidden = false;
  drawer.inert = false;
  drawer.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
  trigger.setAttribute('aria-expanded', 'true');
  trigger.setAttribute('aria-hidden', 'true');
  trigger.tabIndex = -1;
  body.classList.add('study-room-open');
  setPageInert(true);

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      if (!isOpen) return;
      drawer.dataset.open = '';
      backdrop.dataset.open = '';
      focusDrawer();
      syncRoomNavigation();
    });
  });
};

const closeDrawer = () => {
  if (!drawer || !backdrop || !trigger || !isOpen) return;
  isOpen = false;
  if (navigationFrame) cancelAnimationFrame(navigationFrame);
  navigationFrame = 0;
  drawer.removeAttribute('data-open');
  backdrop.removeAttribute('data-open');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.inert = true;
  trigger.setAttribute('aria-expanded', 'false');
  trigger.removeAttribute('aria-hidden');
  trigger.removeAttribute('tabindex');
  body.classList.remove('study-room-open');
  setPageInert(false);
  const focusTarget = invokingTrigger?.isConnected
    ? invokingTrigger
    : returnFocus?.isConnected
      ? returnFocus
      : trigger;
  focusElement(focusTarget);
  // iOS/Safari can defer the inert-state update until the next frame.
  window.requestAnimationFrame(() => {
    if (!isOpen && document.activeElement !== focusTarget && focusTarget.isConnected) {
      focusElement(focusTarget);
    }
  });
  invokingTrigger = null;
  returnFocus = null;
  const transitionDelay = reducedMotion.matches ? 0 : 230;
  closeTimer = window.setTimeout(finishClose, transitionDelay);
};

document.addEventListener('astro:before-swap', () => {
  closeDrawer();
  window.clearTimeout(closeTimer);
  finishClose();
});
document.addEventListener('astro:after-swap', () => {
  body = document.body;
});

trigger?.addEventListener('click', (event) => {
  openDrawer(event.currentTarget instanceof HTMLElement ? event.currentTarget : trigger);
});
closeButton?.addEventListener('click', closeDrawer);
backdrop?.addEventListener('click', closeDrawer);

document.addEventListener('focusin', (event) => {
  if (!isOpen || !drawer) return;
  if (event.target instanceof Node && drawer.contains(event.target)) return;
  focusDrawer();
});

document.addEventListener('keydown', (event) => {
  if (!isOpen) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeDrawer();
    return;
  }
  if (event.key !== 'Tab') return;

  const focusable = focusableElements();
  if (focusable.length === 0) {
    event.preventDefault();
    closeButton?.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

registerDrawer(closeDrawer);
