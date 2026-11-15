import { signal } from '@preact/signals';
import { buildHref, type SearchParams } from '@/lib/url-state.ts';

/** True while a catalog navigation (Fresh partial request) is in flight. */
export const navPending = signal(false);

/** Open state of the mobile filters drawer, shared by the trigger and drawer islands. */
export const mobileSidebarOpen = signal(false);

/**
 * Programmatically triggers a Fresh partial navigation by clicking a transient
 * anchor inside the `f-client-nav` body. Fresh's document click handler does the rest.
 */
export function navigateCatalog(params: SearchParams) {
  const anchor = document.createElement('a');
  anchor.href = buildHref(params);
  anchor.hidden = true;
  // deno-lint-ignore no-explicit-any
  (anchor as any)._freshIndicator = navPending;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}
