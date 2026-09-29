let close = () => { };
export function registerDrawer(closeDrawer: () => void) { close = closeDrawer; }
export function closeStudyRoom() { close(); }
