/**
 * Global Mouse Spotlight Utility for BuildAsset Logistics
 * Dynamically tracks mouse pointer coordinates and applies --mouse-x / --mouse-y CSS variables
 * to hovered .lightable, .lightable-border, and .lightable-btn elements for smooth 60fps lighting effects.
 */

export function initMouseSpotlight() {
  if (typeof window === "undefined") return;

  const handlePointerMove = (e) => {
    // Find closest lightable target or container
    const target = e.target.closest(
      ".lightable, .lightable-border, .lightable-btn, .spotlight-card, [data-lightable]"
    );

    if (target) {
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      target.style.setProperty("--mouse-x", `${x}px`);
      target.style.setProperty("--mouse-y", `${y}px`);
    }

    // Also update global document variables for ambient background light if needed
    document.documentElement.style.setProperty("--cursor-x", `${e.clientX}px`);
    document.documentElement.style.setProperty("--cursor-y", `${e.clientY}px`);
  };

  window.addEventListener("pointermove", handlePointerMove, { passive: true });

  return () => {
    window.removeEventListener("pointermove", handlePointerMove);
  };
}
