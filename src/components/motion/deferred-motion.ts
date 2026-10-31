/** Start optional effects near the viewport; never download them for reduced motion. */
export function observeMotion(
  element: HTMLElement,
  setup: (isCurrent: () => boolean) => Promise<(() => void) | undefined>,
) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let generation = 0;
  let disposed = false;
  let observer: IntersectionObserver | undefined;
  let cleanup: (() => void) | undefined;

  function reset() {
    generation++;
    observer?.disconnect();
    cleanup?.();
    cleanup = undefined;
    if (disposed || preference.matches || !("IntersectionObserver" in window))
      return;
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer?.disconnect();
        const current = ++generation;
        const isCurrent = () =>
          !disposed && current === generation && element.isConnected;
        void setup(isCurrent)
          .then((revert) => {
            if (isCurrent()) cleanup = revert;
            else revert?.();
          })
          .catch(() => {
            // All content is already visible in the server HTML. Motion is optional.
          });
      },
      { rootMargin: "0px 0px 120px 0px" },
    );
    observer.observe(element);
  }

  preference.addEventListener("change", reset);
  reset();
  return () => {
    disposed = true;
    generation++;
    observer?.disconnect();
    cleanup?.();
    preference.removeEventListener("change", reset);
  };
}

export async function loadScrollMotion() {
  const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  gsap.registerPlugin(ScrollTrigger);
  return gsap;
}
