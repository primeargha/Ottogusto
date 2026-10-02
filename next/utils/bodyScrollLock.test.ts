import { afterEach, describe, expect, it } from "vitest";

import { lockBodyScroll, resetBodyScrollLock, unlockBodyScroll } from "./bodyScrollLock";

describe("bodyScrollLock", () => {
  afterEach(() => {
    resetBodyScrollLock();
  });

  it("locks body overflow on first lock", () => {
    document.body.style.overflow = "";
    lockBodyScroll();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("keeps lock while nested overlays are open", () => {
    lockBodyScroll(); // sidebar
    lockBodyScroll(); // delete modal
    unlockBodyScroll(); // modal closes
    expect(document.body.style.overflow).toBe("hidden");
    unlockBodyScroll(); // sidebar closes
    expect(document.body.style.overflow).toBe("");
  });

  it("does not restore a nested-captured hidden overflow after both close", () => {
    // Simulate the old race: outer lock, then inner lock that would have
    // saved "hidden" as its restore target.
    lockBodyScroll();
    lockBodyScroll();
    unlockBodyScroll();
    unlockBodyScroll();
    expect(document.body.style.overflow).not.toBe("hidden");
  });
});
