"use client";

import { debounce } from "lodash";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

interface DataRevalidatorProps {
  /**
   * The timeout in milliseconds to wait before revalidating the data.
   */
  timeout?: number;
  children?: React.ReactNode;
}

// How it works

// Calling router.refresh() causes a few things to happen:
// A fetch to the server to get the current page in it’s entirety (this includes <html> down to the content, it’s everything on the page but as RSC Payload instead of HTML.
// Purges all router caches
// The prefetch cache (holds all prefetches)
// The router navigation cache (the 30s one)
// The component cache (holds all segments you navigated to, it’s used to allow partial rendering and back/forward with preserved scroll position)
// Applies the fetched RSC Payload to the purged cache, making it the only path in the component cache.
// The mutations others trigger
// Data source changes
// The other side of the mutations story, what if my colleague makes an update in the CMS instead of doing it myself. If that mutation is backed by revalidatePath / revalidateTag it would invalidate the Full Route Cache and Data Cache, but those are server-side, and the Router Cache in my browser tab might still have the previous result from the server, instead of the very latest data.

export function DataRevalidator({
  timeout = 5000,
  children,
}: DataRevalidatorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getRefresher = useCallback(
    () =>
      debounce(
        () => {
          // Can be removed, just to showcase when it triggers refresh
          console.log(
            `[${new Date().toLocaleTimeString()}] Triggering router.refresh()...`
          );
          router.refresh();
        },
        timeout,
        { leading: false, trailing: true }
      ),
    [router, timeout]
  );

  // Trigger router.refresh() whenever `pathname` changes.
  // Note: this does not cover searchParams, you can add `useSearchParams` if needed.
  useEffect(() => {
    const refresher = getRefresher();
    refresher();
    //@ts-ignore
  }, [pathname]);

  // Trigger router.refresh() when focus goes back to the window (similar to useSWR / react-query)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      return;
    }

    const refresher = getRefresher();

    window.addEventListener("focus", refresher);
    return () => {
      refresher.cancel();
      window.removeEventListener("focus", refresher);
    };
    //@ts-ignore
  }, []);

  return <>{children}</>;
}
