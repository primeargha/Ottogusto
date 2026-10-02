import { describe, expect, it } from "vitest";
import {
  buildAllMayFitItems,
  buildGuaranteedVinCheckSupportMessage,
  buildPartQueryUnverifiedSupportMessage,
  buildPdpGuaranteedVinCheckSupportMessage,
  buildPdpManualVinSupportMessage,
  deriveVinCheckUiCase,
  mapLocaleToSupportLanguageLabel,
  parseVinCheckResponseItems,
} from "./vinCheck";

describe("vinCheck Case 7", () => {
  it("buildAllMayFitItems maps every cart id to MAY_FIT", () => {
    const items = buildAllMayFitItems(["a", "b"]);
    expect(items).toEqual([
      { id: "a", isMatch: "MAY_FIT" },
      { id: "b", isMatch: "MAY_FIT" },
    ]);
    expect(deriveVinCheckUiCase(items)).toBe(4);
  });

  it("7b: all isMatch null or missing property → all Maybe → Case 4", () => {
    const parsed = parseVinCheckResponseItems(
      [{ id: "1", isMatch: null }, { id: "2" }, { id: "3", isMatch: "" }],
      ["1", "2", "3"],
    );
    expect(parsed.every((i) => i.isMatch === "MAY_FIT")).toBe(true);
    expect(deriveVinCheckUiCase(parsed)).toBe(4);
  });

  it("7c: mixed null, missing, Maybe, Yes, No → Case 6", () => {
    const parsed = parseVinCheckResponseItems(
      [
        { id: "1", isMatch: null },
        { id: "2" },
        { id: "3", isMatch: "Maybe" },
        { id: "4", isMatch: "Yes" },
        { id: "5", isMatch: "No" },
      ],
      ["1", "2", "3", "4", "5"],
    );
    expect(deriveVinCheckUiCase(parsed)).toBe(6);
  });

  it("7c: after removing No lines, Maybe/null remain → Case 4", () => {
    const parsed = parseVinCheckResponseItems(
      [
        { id: "1", isMatch: null },
        { id: "2" },
        { id: "3", isMatch: "Maybe" },
        { id: "4", isMatch: "Yes" },
      ],
      ["1", "2", "3", "4"],
    );
    expect(deriveVinCheckUiCase(parsed)).toBe(4);
  });

  it("7c: only Yes remains → Case 3", () => {
    const parsed = parseVinCheckResponseItems([{ id: "4", isMatch: "Yes" }], ["4"]);
    expect(deriveVinCheckUiCase(parsed)).toBe(3);
  });

  it("cart line missing from API response → Maybe", () => {
    const parsed = parseVinCheckResponseItems([{ id: "1", isMatch: "Yes" }], ["1", "2"]);
    expect(parsed).toEqual([
      { id: "1", isMatch: "FIT" },
      { id: "2", isMatch: "MAY_FIT" },
    ]);
  });

  it("buildGuaranteedVinCheckSupportMessage includes structured fields and May Fit Items", () => {
    const message = buildGuaranteedVinCheckSupportMessage({
      contact: { firstName: "John", lastName: "Doe", email: "john@example.com" },
      orderId: "OG002636",
      vin: "JTPAAAAA20R067972",
      mayFitItems: [
        { id: "a", isMatch: "MAY_FIT" },
        { id: "b", isMatch: "MAY_FIT" },
      ],
      cartItems: [
        { id: "a", partname: "INSULATOR, HOOD", oeReference: "53341-42010" },
        { id: "b", name: "LOCKRING", oeReference: "90904-19003" },
      ],
    });

    expect(message.startsWith("<br /><br />Name: John Doe,")).toBe(true);
    expect(message).toContain("Name: John Doe,");
    expect(message).toContain("Email: john@example.com,");
    expect(message).toContain("OrderID: OG002636,");
    expect(message).toContain("Category: GuaranteedVinCheck,");
    expect(message).toContain("language: English,");
    expect(message).toContain("VIN: JTPAAAAA20R067972,");
    expect(message).toContain("Source: Checkout page.");
    expect(message).toContain("May Fit Items:");
    expect(message).toContain("- INSULATOR, HOOD — OE Ref: 53341-42010");
    expect(message).toContain("- LOCKRING — OE Ref: 90904-19003");
    expect(message).toContain(
      "Message: MAY FIT – need confirmation for the products to confirm if these OE refs are matching with the provided VIN.",
    );
    expect(message).not.toContain("Maybe items:");
    expect(message).not.toContain("(a)");
  });

  it("buildGuaranteedVinCheckSupportMessage includes provided language label", () => {
    const message = buildGuaranteedVinCheckSupportMessage({
      contact: { firstName: "John", lastName: "Doe", email: "john@example.com" },
      orderId: "OG002810",
      vin: "ZAREAECU2H7516593",
      mayFitItems: [{ id: "a", isMatch: "NO_FIT" }],
      cartItems: [{ id: "a", partname: "PSA - COMPLETE TIMING KIT", oeReference: "1654515680" }],
      matchType: "NO_FIT",
      language: "French",
    });

    expect(message).toContain("language: French,");
    expect(message).toContain("Category: GuaranteedVinCheck,");
    expect(message).toContain("VIN: ZAREAECU2H7516593,");
  });

  it("buildGuaranteedVinCheckSupportMessage supports matchType NO_FIT with No Fit Items", () => {
    const message = buildGuaranteedVinCheckSupportMessage({
      contact: { firstName: "John", lastName: "Doe", email: "john@example.com" },
      orderId: "OG002636",
      vin: "JTPAAAAA20R067972",
      mayFitItems: [{ id: "a", isMatch: "NO_FIT" }],
      cartItems: [{ id: "a", partname: "INSULATOR, HOOD", oeReference: "53341-42010" }],
      matchType: "NO_FIT",
    });

    expect(message).toContain("Category: GuaranteedVinCheck,");
    expect(message).toContain("No Fit Items:");
    expect(message).toContain("- INSULATOR, HOOD — OE Ref: 53341-42010");
    expect(message).toContain(
      "Message: NO FIT – these products do not match the provided VIN, please assist the customer with compatible alternatives or further verification.",
    );
    expect(message).not.toContain("May Fit Items:");
  });

  it("buildGuaranteedVinCheckSupportMessage falls back when oeReference is missing", () => {
    const message = buildGuaranteedVinCheckSupportMessage({
      contact: { firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
      orderId: "OG001",
      vin: "12345678901234567",
      mayFitItems: [{ id: "a", isMatch: "MAY_FIT" }],
      cartItems: [{ id: "a", partname: "PART WITHOUT OE" }],
    });
    expect(message).toContain("- PART WITHOUT OE — OE Ref: —");
  });

  it("buildPartQueryUnverifiedSupportMessage includes structured fields for unverified VIN", () => {
    const message = buildPartQueryUnverifiedSupportMessage({
      contact: { firstName: "John", lastName: "Doe", email: "john@example.com" },
      orderId: "OG002636",
      vin: "JTPAAAAA20R067972",
      language: "English",
      flow: "vin_api_unverified",
      source: "Checkout VIN API Flow",
      cartItems: [
        {
          id: "macgvxkqdbfkah",
          partname: "Motorolie",
          title: "Selenia WR Pure Energy 5W-30",
          oeReference: "SEL13891639",
          price: 32.5,
          quantity: 2,
        },
        {
          id: "m3hfbcmr42wywz",
          name: "Oliefilter",
          oeReference: "55224598",
          unitPriceIncVat: "12.99",
          quantity: 1,
        },
      ],
    });

    expect(message.startsWith("<br /><br />Name: John Doe,")).toBe(true);
    expect(message).toContain("Name: John Doe,");
    expect(message).toContain("Email: john@example.com,");
    expect(message).toContain("OrderID: OG002636,");
    expect(message).toContain("Category: PartQuery,");
    expect(message).toContain("language: English,");
    expect(message).toContain("VIN: JTPAAAAA20R067972,");
    expect(message).toContain("Source: Checkout VIN API Flow.");
    expect(message).toContain("Items:");
    expect(message).toContain(
      "- id: macgvxkqdbfkah, name: Motorolie, title: Selenia WR Pure Energy 5W-30, oeRef: SEL13891639, price: 32.5, quantity: 2",
    );
    expect(message).toContain(
      "- id: m3hfbcmr42wywz, name: Oliefilter, title: —, oeRef: 55224598, price: 12.99, quantity: 1",
    );
    expect(message).toContain(
      "Message: Customer entered VIN JTPAAAAA20R067972 but did not click Verify VIN before placing the order. Please verify vehicle compatibility manually.",
    );
    expect(message).not.toContain("May Fit Items:");
  });

  it("buildPartQueryUnverifiedSupportMessage uses Manual VIN Flow message when flow is manual_vin", () => {
    const message = buildPartQueryUnverifiedSupportMessage({
      contact: { firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
      orderId: "OG001",
      vin: "12345678901234567",
      language: "French",
      flow: "manual_vin",
      source: "Checkout Manual VIN Flow",
    });
    expect(message).toContain("language: French,");
    expect(message).toContain("Source: Checkout Manual VIN Flow.");
    expect(message).toContain(
      "Message: Customer requested VIN compatibility verification through the Manual VIN Flow. Please verify vehicle compatibility for VIN 12345678901234567.",
    );
  });

  it("buildPdpManualVinSupportMessage includes language and PDP manual VIN source", () => {
    const message = buildPdpManualVinSupportMessage({
      contact: { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" },
      vin: "ABCDEFGHJKLMNPRST",
      productTitle: "Oil Filter",
      language: "Dutch",
      productMessage:
        "Hi, I'd like to confirm if Oil Filter is compatible with my car. VIN entered above.",
    });
    expect(message).toContain("Category: PartQuery,");
    expect(message).toContain("language: Dutch,");
    expect(message).toContain("VIN: ABCDEFGHJKLMNPRST,");
    expect(message).toContain("Source: PDP manual VIN Verification.");
    expect(message).toContain(
      "Message: Hi, I'd like to confirm if Oil Filter is compatible with my car. VIN entered above.",
    );
  });

  it("buildPartQueryUnverifiedSupportMessage falls back when cart is empty", () => {
    const message = buildPartQueryUnverifiedSupportMessage({
      contact: { firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
      orderId: "OG001",
      vin: "12345678901234567",
    });
    expect(message).toContain("Items:");
    expect(message).toContain("- (no cart items)");
  });

  it("buildGuaranteedVinCheckSupportMessage includes firstName and lastName for authenticated users", () => {
    const message = buildGuaranteedVinCheckSupportMessage({
      contact: { firstName: "Victor", lastName: "Ribeiro", email: "victor@example.com" },
      orderId: "OG002636",
      vin: "JTPAAAAA20R067972",
      mayFitItems: [{ id: "a", isMatch: "MAY_FIT" }],
      cartItems: [{ id: "a", partname: "BOLT" }],
      isAuthenticated: true,
    });

    expect(message).toContain("FirstName: Victor,");
    expect(message).toContain("LastName: Ribeiro,");
    expect(message).not.toContain("Name: Victor Ribeiro,");
  });

  it("buildPartQueryUnverifiedSupportMessage includes firstName and lastName for authenticated users", () => {
    const message = buildPartQueryUnverifiedSupportMessage({
      contact: { firstName: "Victor", lastName: "Ribeiro", email: "victor@example.com" },
      orderId: "OG002636",
      vin: "JTPAAAAA20R067972",
      isAuthenticated: true,
    });

    expect(message).toContain("FirstName: Victor,");
    expect(message).toContain("LastName: Ribeiro,");
    expect(message).not.toContain("Name: Victor Ribeiro,");
  });

  it("explicit Yes/Maybe/No still map correctly", () => {
    const parsed = parseVinCheckResponseItems(
      [
        { id: "a", isMatch: "Yes" },
        { id: "b", isMatch: "Maybe" },
        { id: "c", isMatch: "No" },
      ],
      ["a", "b", "c"],
    );
    expect(parsed).toEqual([
      { id: "a", isMatch: "FIT" },
      { id: "b", isMatch: "MAY_FIT" },
      { id: "c", isMatch: "NO_FIT" },
    ]);
  });
});

describe("PDP GuaranteedVinCheck support message", () => {
  it("mapLocaleToSupportLanguageLabel maps en/fr/nl/de and full locales", () => {
    expect(mapLocaleToSupportLanguageLabel("en")).toBe("English");
    expect(mapLocaleToSupportLanguageLabel("en-BE")).toBe("English");
    expect(mapLocaleToSupportLanguageLabel("fr")).toBe("French");
    expect(mapLocaleToSupportLanguageLabel("fr-BE")).toBe("French");
    expect(mapLocaleToSupportLanguageLabel("nl")).toBe("Dutch");
    expect(mapLocaleToSupportLanguageLabel("nl-NL")).toBe("Dutch");
    expect(mapLocaleToSupportLanguageLabel("de")).toBe("German");
    expect(mapLocaleToSupportLanguageLabel("de-DE")).toBe("German");
    expect(mapLocaleToSupportLanguageLabel("xx")).toBe("English");
    expect(mapLocaleToSupportLanguageLabel("")).toBe("English");
  });

  it("buildPdpGuaranteedVinCheckSupportMessage includes language and product fields", () => {
    const message = buildPdpGuaranteedVinCheckSupportMessage({
      contact: { firstName: "John", lastName: "Doe", email: "john@example.com" },
      vin: "ZFA3120000J123647",
      productId: "macgvxkqdbfkah",
      name: "Motorolie",
      title: "Selenia WR Pure Energy 5W-30",
      oeReference: "SEL13891639",
      price: 32.5,
      language: "English",
    });

    expect(message).toContain("language: English,");
    expect(message).toContain("Category: GuaranteedVinCheck,");
    expect(message).toContain("VIN: ZFA3120000J123647,");
    expect(message).toContain("Source: PDP page.");
    expect(message).toContain(
      "- id: macgvxkqdbfkah, name: Motorolie, title: Selenia WR Pure Energy 5W-30, oeRef: SEL13891639, price: 32.5",
    );
    expect(message).toContain(
      "Message: MAY FIT – need confirmation for the products to confirm if these OE refs are matching with the provided VIN.",
    );
  });

  it("buildPdpGuaranteedVinCheckSupportMessage falls back missing product fields", () => {
    const message = buildPdpGuaranteedVinCheckSupportMessage({
      contact: { firstName: "", lastName: "", email: "guest@example.com" },
      vin: "ZFA3120000J123647",
      productId: "part-1",
      language: "French",
    });

    expect(message).toContain("language: French,");
    expect(message).toContain("- id: part-1, name: —, title: —, oeRef: —, price: —");
  });
});
