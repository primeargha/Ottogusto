export interface VinValidationResult {
  isValid: boolean;
  error: string;
}

export const validateVIN = (vin: string): VinValidationResult => {
  // Handle empty string
  if (!vin || vin.trim() === "") {
    return {
      isValid: false,
      error: "",
    };
  }

  // Remove any spaces and convert to uppercase
  const cleanVin = vin.trim().toUpperCase();

  // Check basic format (17 characters, no I,O,Q)
  const formatRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
  if (!formatRegex.test(cleanVin)) {
    return {
      isValid: false,
      error:
        "Invalid VIN format. A valid VIN must be 17 characters long and contain only uppercase alphanumeric characters (excluding I, O, and Q).",
    };
  }

  // Transliteration values for check digit calculation
  const transliterationValues: Record<string, number> = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    F: 6,
    G: 7,
    H: 8,
    J: 1,
    K: 2,
    L: 3,
    M: 4,
    N: 5,
    P: 7,
    R: 9,
    S: 2,
    T: 3,
    U: 4,
    V: 5,
    W: 6,
    X: 7,
    Y: 8,
    Z: 9,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "0": 0,
  };

  // For European VINs (starting with V), we can skip check digit validation
  if (cleanVin.startsWith("V")) {
    return {
      isValid: true,
      error: "",
    };
  }

  // Weight factors for each position (only for non-European VINs)
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    // `charAt` always returns a string ("" if out of range), which keeps TS happy.
    const char = cleanVin.charAt(i);
    const value = transliterationValues[char] ?? 0;
    const weight = weights[i] ?? 0;
    sum += value * weight;
  }

  const remainder = sum % 11;
  const expectedCheckDigit = remainder === 10 ? "X" : remainder.toString();
  const actualCheckDigit = cleanVin[8];

  if (expectedCheckDigit !== actualCheckDigit) {
    return {
      isValid: false,
      error: "The VIN's check digit is invalid. Please re-enter the VIN.",
    };
  }

  return {
    isValid: true,
    error: "",
  };
};
