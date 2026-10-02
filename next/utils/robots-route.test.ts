import { describe, expect, it } from "vitest";

import { buildRobotsContent } from "@/utils/robotsContent";

describe("production robots.txt observability protection", () => {
  it("blocks localized dashboards and internal logging endpoints", () => {
    const body = buildRobotsContent({
      isProd: true,
      prodUrl: "https://example.com",
      devUrl: undefined,
    });

    expect(body).toContain("Disallow: /en-BE/telemetry");
    expect(body).toContain("Disallow: /en-BE/test-axiom");
    expect(body).toContain("Disallow: /api/telemetry");
    expect(body).toContain("Disallow: /api/axiom");
    expect(body).toContain("Disallow: /api/axiom-ui");
    expect(body).toContain("Disallow: /monitoring");
  });
});
