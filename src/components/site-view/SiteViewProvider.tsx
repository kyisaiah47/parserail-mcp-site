'use client';

/* WHICH VIEW THIS VISITOR IS READING: Console or Simple.
 *
 * Console is the clean-visitor default. A valid `?view=simple|console` wins over the saved
 * choice, and a valid explicit choice is saved. Only the two preferences reach localStorage;
 * drafts and picks live in the in-memory map below, so a view switch never loses them.
 *
 * ⛔ THE VIEW FOLLOWS THE BODY. PageViews registers a route's Simple body here while it is mounted.
 * `view` is Simple only when the visitor chose Simple AND the mounted route has a Simple body, so
 * `data-view` and every reader of `view` say Console on a route that has no Simple body. The saved
 * choice (`chosen`) is kept, so the next route with a Simple body opens in Simple. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { usePathname } from 'next/navigation';

export type SiteView = 'console' | 'simple';

interface ViewContext {
  /** The view this route renders: Simple only when it was chosen and the route has a Simple body. */
  view: SiteView;
  /** The visitor's saved choice, which can be Simple on a Console-only route. */
  chosen: SiteView;
  /** Whether the mounted route has a Simple body. */
  hasSimple: boolean;
  /** Called by PageViews while it holds a Simple body. Returns the unregister. */
  registerSimple: () => () => void;
  choose: (view: SiteView) => void;
  welcome: () => void;
  keys: { view: string; welcomeOff: string; event: string };
}

const Context = createContext<ViewContext | null>(null);
const Memory = createContext<Map<string, unknown> | null>(null);

export function useSiteView() {
  return useContext(Context);
}

/** State that survives a view switch and a client route change, and never reaches storage. */
export function useViewState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const memory = useContext(Memory);
  const [value, setValue] = useState<T>(() => (memory?.has(key) ? (memory.get(key) as T) : initial));
  const update: Dispatch<SetStateAction<T>> = useCallback(
    (next) => {
      setValue((previous) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(previous) : next;
        memory?.set(key, resolved);
        return resolved;
      });
    },
    [key, memory],
  );
  return [value, update];
}

export default function SiteViewProvider({
  slug,
  welcome,
  children,
}: {
  /** The storage prefix: `<slug>:view` and `<slug>:welcome-off`. */
  slug: string;
  welcome: ReactNode;
  children: ReactNode;
}) {
  const keys = { view: `${slug}:view`, welcomeOff: `${slug}:welcome-off`, event: `${slug}:welcome` };
  const [chosen, setView] = useState<SiteView>('console');
  /* A count, not a flag: an old page's unregister and a new page's register can land in either
   * order on a route change. */
  const [simpleBodies, setSimpleBodies] = useState(0);
  const registerSimple = useCallback(() => {
    setSimpleBodies((n) => n + 1);
    return () => setSimpleBodies((n) => Math.max(0, n - 1));
  }, []);
  const hasSimple = simpleBodies > 0;
  const view: SiteView = chosen === 'simple' && hasSimple ? 'simple' : 'console';
  const [memory] = useState(() => new Map<string, unknown>());
  const path = usePathname();

  const choose = useCallback(
    (next: SiteView) => {
      setView(next);
      try {
        localStorage.setItem(`${slug}:view`, next);
      } catch {
        /* a blocked store never breaks the switch */
      }
      const url = new URL(window.location.href);
      if (url.searchParams.has('view')) {
        url.searchParams.set('view', next);
        window.history.replaceState(window.history.state, '', url.href);
      }
    },
    [slug],
  );

  useEffect(() => {
    const explicit = new URLSearchParams(window.location.search).get('view');
    let saved: SiteView = 'console';
    try {
      saved = localStorage.getItem(`${slug}:view`) === 'simple' ? 'simple' : 'console';
    } catch {
      /* storage blocked: Console */
    }
    /* The URL and localStorage are unknown during the server render, so the view is read after
     * mount. Console renders until then. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (explicit === 'simple' || explicit === 'console') choose(explicit);
    else setView(saved);
  }, [path, choose, slug]);

  useEffect(() => {
    document.documentElement.dataset.view = view;
  }, [view]);

  const welcomeOpen = useCallback(() => window.dispatchEvent(new Event(`${slug}:welcome`)), [slug]);

  return (
    <Context.Provider value={{ view, chosen, hasSimple, registerSimple, choose, welcome: welcomeOpen, keys }}>
      <Memory.Provider value={memory}>
        <div className="site-surface" data-view={view}>
          {children}
        </div>
        {welcome}
      </Memory.Provider>
    </Context.Provider>
  );
}
