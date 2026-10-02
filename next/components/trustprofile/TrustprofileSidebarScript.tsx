"use client";

import { useEffect, useRef } from "react";
import { TRUSTPROFILE_CONFIG } from "@/config/trustprofile";

const SCRIPT_ID = "trustprofile-sidebar-script";
const POPUP_GAP = 8;

/**
 * sidebar.js anchors the reviews card under the badge. Near the footer that
 * hangs into the empty area below the page, so flip it above the badge when
 * the card does not fit underneath.
 */
function placeTrustprofilePopup() {
  const trigger = document.querySelector("a.trustprofilePopup");
  if (!trigger) return;

  const triggerRect = trigger.getBoundingClientRect();
  document.querySelectorAll<HTMLElement>(".wwk-sidebar-popup").forEach((popup) => {
    const rect = popup.getBoundingClientRect();
    if (rect.width < 40 || rect.left < -500 || rect.height < 40) return;

    const spaceBelow = window.innerHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const needed = rect.height + POPUP_GAP;
    const fitsBelow = spaceBelow >= needed;

    if (fitsBelow) {
      if (popup.dataset.ogPopupFlip === "above") {
        popup.style.removeProperty("top");
        popup.style.removeProperty("bottom");
        delete popup.dataset.ogPopupFlip;
      }
      return;
    }

    if (spaceAbove <= spaceBelow) return;

    const top = Math.max(POPUP_GAP, triggerRect.top - rect.height - POPUP_GAP);
    if (popup.dataset.ogPopupFlip === "above" && Math.abs(parseFloat(popup.style.top) - top) < 1) {
      return;
    }

    popup.dataset.ogPopupFlip = "above";
    popup.style.setProperty("position", "fixed", "important");
    popup.style.setProperty("top", `${top}px`, "important");
    popup.style.setProperty("bottom", "auto", "important");
  });
}

/**
 * Loads Trustprofile sidebar.js once so trustprofilePopup badges open the trust profile.
 */
export default function TrustprofileSidebarScript() {
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current || document.getElementById(SCRIPT_ID)) return;
    hasInitialized.current = true;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(".trustprofilePopup, .wwk-sidebar")) return;
      requestAnimationFrame(() => requestAnimationFrame(placeTrustprofilePopup));
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("resize", placeTrustprofilePopup);
    window.addEventListener("scroll", placeTrustprofilePopup, true);

    const observer = new MutationObserver(() => placeTrustprofilePopup());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    const { sidebarScriptBaseUrl, webshopId } = TRUSTPROFILE_CONFIG;

    const cacheBuster = (intervalMinutes: number, id: number) => {
      const now = Date.now();
      const intervalMs = intervalMinutes * 60_000;
      const offset = (Math.sin(id) || 0) * intervalMs;
      return Math.floor((now + offset) / intervalMs);
    };

    const loadScript = () => {
      if (document.getElementById(SCRIPT_ID)) return;
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `${sidebarScriptBaseUrl}/sidebar.js?id=${webshopId}&c=${cacheBuster(10, webshopId)}`;
      document.head.appendChild(script);
    };

    // Defer to idle time so this third-party widget can't inject/animate
    // into the page during the initial render window and contribute to CLS.
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(loadScript, { timeout: 3000 });
    } else {
      window.setTimeout(loadScript, 2000);
    }

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("resize", placeTrustprofilePopup);
      window.removeEventListener("scroll", placeTrustprofilePopup, true);
      observer.disconnect();
    };
  }, []);

  return null;
}
