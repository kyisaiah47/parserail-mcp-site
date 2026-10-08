'use client';
import { useEffect, useLayoutEffect, type ReactNode } from 'react';
import { useSiteView } from './SiteViewProvider';

/* Layout effect in the browser so the provider's view flips in the same frame as the body. */
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** One of the two compositions of a route. Console renders until the provider reads a Simple choice.
 *  A route that passes a `simpleView` registers it, which is what lets the provider report Simple. */
export default function PageViews({ consoleView, simpleView }: { consoleView: ReactNode; simpleView?: ReactNode }) {
  const ctx = useSiteView();
  const has = simpleView !== undefined;
  const register = ctx?.registerSimple;
  useIsoLayoutEffect(() => {
    if (!has || !register) return;
    return register();
  }, [has, register]);
  return ctx?.chosen === 'simple' && has ? simpleView : consoleView;
}
