import { describe, expect, it } from "vitest";
import {
  canAccessTranslationKeysLanguage,
  canShowTranslationKeys,
  containsUnresolvedLabelPlaceholders,
  isCp2StaffEmail,
  isTranslationKeysLang,
  safeNextImageSrc,
  safeNextLinkHref,
  stripShowCodeFromLabels,
} from "./translationDisplayMode";

describe("translationDisplayMode", () => {
  it("requires Key language and cp2 email", () => {
    expect(canAccessTranslationKeysLanguage({ email: "a@cp2.org" })).toBe(true);
    expect(canAccessTranslationKeysLanguage({ email: "a@test.com" })).toBe(false);
    expect(canShowTranslationKeys("key", { email: "a@cp2.org" })).toBe(true);
    expect(canShowTranslationKeys("en", { email: "a@cp2.org" })).toBe(false);
    expect(canShowTranslationKeys("key", { email: "a@test.com" })).toBe(false);
  });

  it("detects Key language", () => {
    expect(isTranslationKeysLang("key-BE")).toBe(true);
    expect(isTranslationKeysLang("nl")).toBe(false);
  });

  it("strips show_code from API payload", () => {
    expect(stripShowCodeFromLabels({ a: "1", show_code: "1" })).toEqual({ a: "1" });
  });

  it("matches cp2 in email", () => {
    expect(isCp2StaffEmail("user@CP2digital.com")).toBe(true);
    expect(isCp2StaffEmail("user@other.com")).toBe(false);
  });

  it("safeNextLinkHref blocks translation key placeholders", () => {
    expect(containsUnresolvedLabelPlaceholders("[footer_link_1_url]")).toBe(true);
    expect(
      containsUnresolvedLabelPlaceholders("https://dev.qverde.com/key-BE/[ribbon_url_redirect_01]"),
    ).toBe(true);
    expect(safeNextLinkHref("/[footer_link_1_url]")).toBe("#");
    expect(safeNextLinkHref("/en-BE/support")).toBe("/en-BE/support");
  });

  it("safeNextImageSrc falls back when src is a translation key", () => {
    expect(safeNextImageSrc("[landing_page_hero_image_1]?height=410&width=668")).toBe(
      "/assets/Frame.svg",
    );
    expect(safeNextImageSrc("https://cdn.example.com/a.jpg?w=1")).toBe(
      "https://cdn.example.com/a.jpg?w=1",
    );
    expect(safeNextImageSrc("/hero.jpg?q=1")).toBe("/hero.jpg?q=1");
  });
});
