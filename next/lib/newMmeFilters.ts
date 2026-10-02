import type { CarsFiltersPayload, CarsFiltersResponse } from "@/services/cars";
import type {
  NewMmeField,
  NewMmeOption,
  NewMmeOptionsState,
  NewMmeSelectedState,
} from "@/stores/useNewMmeStore";

export const FIELD_ORDER: NewMmeField[] = [
  "make",
  "model",
  "body",
  "variant",
  "engine",
  "engineCode",
  "gearBox",
  "gearBoxCode",
];

export const AUTO_PREFILL_FIELDS: NewMmeField[] = [
  "body",
  "variant",
  "engine",
  "engineCode",
  "gearBox",
  "gearBoxCode",
];

export type VisibleField = NewMmeField;

export const FIELD_CONFIG: Record<
  VisibleField,
  { labelKey: string; fallbackLabel: string; placeholderKey: string; fallbackPlaceholder: string }
> = {
  make: {
    labelKey: "select_make",
    fallbackLabel: "Select make",
    placeholderKey: "select_make",
    fallbackPlaceholder: "Select make",
  },

  model: {
    labelKey: "select_model",
    fallbackLabel: "Select model",
    placeholderKey: "select_model",
    fallbackPlaceholder: "Select model",
  },
  body: {
    labelKey: "select_body",
    fallbackLabel: "Selected body",
    placeholderKey: "select_body",
    fallbackPlaceholder: "Select body",
  },
  variant: {
    labelKey: "select_variant",
    fallbackLabel: "Selected variant",
    placeholderKey: "select_variant",
    fallbackPlaceholder: "Select variant",
  },
  engine: {
    labelKey: "select_engine",
    fallbackLabel: "Selected engine",
    placeholderKey: "select_engine",
    fallbackPlaceholder: "Select engine",
  },
  engineCode: {
    labelKey: "select_engine_code",
    fallbackLabel: "Engine code",
    placeholderKey: "select_engine_code",
    fallbackPlaceholder: "Select engine code",
  },
  gearBox: {
    labelKey: "select_gearbox",
    fallbackLabel: "Selected gearbox",
    placeholderKey: "select_gearbox",
    fallbackPlaceholder: "Select gearbox",
  },
  gearBoxCode: {
    labelKey: "select_gearbox_code",
    fallbackLabel: "Gearbox code",
    placeholderKey: "select_gearbox_code",
    fallbackPlaceholder: "Select gearbox code",
  },
};

export const emptyPayload: CarsFiltersPayload = {
  make: null,
  model: null,
  body: null,
  engine: null,
  engineCode: null,
  variant: null,
  gearBox: null,
  gearBoxCode: null,
  vin: null,
};

export function mapDictionaryToOptions(dictionary?: Record<string, string>): NewMmeOption[] {
  if (!dictionary || typeof dictionary !== "object") return [];
  return Object.entries(dictionary).map(([key, value]) => ({ key, value: value ?? key }));
}

export function optionsForField(field: NewMmeField, options: NewMmeOptionsState): NewMmeOption[] {
  switch (field) {
    case "make":
      return options.makes;
    case "model":
      return options.models;
    case "variant":
      return options.variants;
    case "body":
      return options.bodys;
    case "engine":
      return options.engines;
    case "gearBox":
      return options.gearBoxes;
    case "engineCode":
      return options.engineCodes;
    case "gearBoxCode":
      return options.gearBoxCodes;
    default:
      return [];
  }
}

export function optionsFromCarsFiltersResponse(response: CarsFiltersResponse): NewMmeOptionsState {
  return {
    makes: mapDictionaryToOptions(response.makes),
    models: mapDictionaryToOptions(response.models),
    variants: mapDictionaryToOptions(response.variants),
    bodys: mapDictionaryToOptions(response.bodys),
    engines: mapDictionaryToOptions(response.engines),
    gearBoxes: mapDictionaryToOptions(response.gearBoxes),
    engineCodes: mapDictionaryToOptions(response.engineCodes),
    gearBoxCodes: mapDictionaryToOptions(response.gearBoxCodes),
  };
}

export function isValueInOptions(value: string | null, opts: NewMmeOption[]): boolean {
  if (!value) return false;
  return opts.some((option) => option.key === value);
}

/** Map a raw string to an option key (match key first, then display value). */
export function resolveToOptionKey(raw: string | null, opts: NewMmeOption[]): string | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();
  if (opts.some((o) => o.key === trimmed)) return trimmed;
  const byValue = opts.find((o) => o.value === trimmed);
  return byValue?.key ?? null;
}

/** Ensure every selected field holds a dictionary key, not a display label. */
export function coerceSelectedToKeys(
  selected: NewMmeSelectedState,
  options: NewMmeOptionsState,
): NewMmeSelectedState {
  const next = { ...selected };
  for (const field of FIELD_ORDER) {
    const fieldOptions = optionsForField(field, options);
    if (!next[field]) continue;
    const resolved = resolveToOptionKey(next[field], fieldOptions);
    next[field] = resolved;
  }
  return next;
}

export function buildPayload(
  selected: NewMmeSelectedState,
  options?: NewMmeOptionsState,
): CarsFiltersPayload {
  const coerced = options ? coerceSelectedToKeys(selected, options) : selected;
  return {
    make: coerced.make,
    model: coerced.model,
    body: coerced.body,
    engine: coerced.engine,
    engineCode: coerced.engineCode,
    variant: coerced.variant,
    gearBox: coerced.gearBox,
    gearBoxCode: coerced.gearBoxCode,
    // Never attach VIN after the user (or progressive loop) drives MME — VIN overrules selection.
    vin: null,
  };
}

/**
 * First-hydrate only: POST /Cars with VIN and empty MME fields.
 * Do not reuse after any Make/Model/… change (backend VIN overrules other body fields).
 */
export function buildVinBootstrapPrefillPayload(vin: string): CarsFiltersPayload {
  const trimmed = vin.trim().toUpperCase();
  return {
    ...emptyPayload,
    vin: trimmed || null,
  };
}

export function clearDependentFields(
  selected: NewMmeSelectedState,
  _changedField: VisibleField,
): NewMmeSelectedState {
  // Do not clear any previously selected values on field changes.
  // Invalid values are pruned by reconcileSelected() after Cars API responds.
  return selected;
}

function resolveResponseScalar(
  raw: string | null | undefined,
  fieldOptions: NewMmeOption[],
): string | null {
  if (raw == null) return null;
  return resolveToOptionKey(raw, fieldOptions);
}

export function reconcileSelected(
  selectedBefore: NewMmeSelectedState,
  response: CarsFiltersResponse,
  preserveCandidates?: Partial<NewMmeSelectedState>,
): NewMmeSelectedState {
  const normalizedOptions: NewMmeOptionsState = optionsFromCarsFiltersResponse(response);

  const nextSelected: NewMmeSelectedState = { ...selectedBefore };

  FIELD_ORDER.forEach((field) => {
    const fieldOptions = optionsForField(field, normalizedOptions);
    const fromResponse = resolveResponseScalar(
      response[field as keyof CarsFiltersResponse] as string | null | undefined,
      fieldOptions,
    );
    if (fromResponse) {
      nextSelected[field] = fromResponse;
    }
  });

  FIELD_ORDER.forEach((field) => {
    const fieldOptions = optionsForField(field, normalizedOptions);
    if (fieldOptions.length === 0) {
      nextSelected[field] = null;
      return;
    }

    const coerced = resolveToOptionKey(nextSelected[field], fieldOptions);
    nextSelected[field] = coerced;

    if (!nextSelected[field] && preserveCandidates?.[field]) {
      const candidate = resolveToOptionKey(
        preserveCandidates[field] as string | null,
        fieldOptions,
      );
      if (candidate) {
        nextSelected[field] = candidate;
      }
    }
  });

  AUTO_PREFILL_FIELDS.forEach((field) => {
    const fieldOptions = optionsForField(field, normalizedOptions);
    if (!nextSelected[field] && fieldOptions.length === 1) {
      const firstOption = fieldOptions[0];
      if (firstOption) {
        nextSelected[field] = firstOption.key;
      }
    }
  });

  return nextSelected;
}

/** Cars API filter keys are 64-char hex hashes; GET /Cars/{id} may return display labels instead. */
export function looksLikeMmeFilterKey(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  return /^[a-f0-9]{64}$/i.test(value.trim());
}

/**
 * Edit bootstrap POST payload: coerce fields only when an option list exists;
 * pass through raw GET /Cars/{id} values otherwise (labels or keys).
 */
export function buildBootstrapPrefillPayload(
  merged: NewMmeSelectedState,
  options: NewMmeOptionsState,
): CarsFiltersPayload {
  const payload: CarsFiltersPayload = { ...emptyPayload, vin: null };
  for (const field of FIELD_ORDER) {
    const raw = merged[field];
    if (!raw?.trim()) continue;
    const fieldOptions = optionsForField(field, options);
    payload[field] = fieldOptions.length > 0 ? resolveToOptionKey(raw, fieldOptions) : raw.trim();
  }
  return payload;
}

/**
 * Single POST /Cars response → options + selected (edit bootstrap fast path).
 */
export function applyBootstrapPrefillFromCarsResponse(
  mergedSelected: NewMmeSelectedState,
  response: CarsFiltersResponse,
  preserveCandidates?: Partial<NewMmeSelectedState>,
): { selected: NewMmeSelectedState; options: NewMmeOptionsState } {
  const options = optionsFromCarsFiltersResponse(response);
  const coerced = coerceSelectedToKeys(mergedSelected, options);
  const selected = reconcileSelected(coerced, response, preserveCandidates ?? mergedSelected);
  return { selected, options };
}

/** Edit prefill succeeded at least through make + model (valid keys in options). */
export function isMmeBootstrapPrefillComplete(
  selected: NewMmeSelectedState,
  options: NewMmeOptionsState,
): boolean {
  const make = selected.make?.trim();
  const model = selected.model?.trim();
  if (!make || !model) return false;
  return isValueInOptions(make, options.makes) && isValueInOptions(model, options.models);
}

/**
 * E2E: URL / resolved set with 2–5 `carIds` shares one Make+Model super-set.
 * Edit (and URL VIN warm-up) must prefill **only** Make + Model — not body/engine/….
 * Single `carIds` in URL stays full deep prefill.
 */
export function shouldE2EPrefillMakeModelOnly(urlCarIds: string[] | null | undefined): boolean {
  if (!Array.isArray(urlCarIds)) return false;
  const n = urlCarIds.map((id) => String(id).trim()).filter(Boolean).length;
  return n >= 2 && n <= 5;
}

/** Keep Make + Model; clear all deeper progressive selections. */
export function toMakeModelOnlySelected(selected: NewMmeSelectedState): NewMmeSelectedState {
  return {
    make: selected.make,
    model: selected.model,
    variant: null,
    body: null,
    engine: null,
    gearBox: null,
    engineCode: null,
    gearBoxCode: null,
  };
}

/** Save / Find car parts CTA is enabled when the Cars API returned at least one resolved car id. */
export function isNewMmeSearchCtaEnabled(carIds: string[] | null | undefined): boolean {
  if (!Array.isArray(carIds) || carIds.length === 0) return false;
  return carIds.some((id) => Boolean(String(id).trim()));
}

const PROGRESSIVE_FIELDS = FIELD_ORDER.slice(2);

/** Progressive dropdown list shown in sidebar / drawer (make → model → optional steps). */
export function getVisibleMmeFields(
  selected: NewMmeSelectedState,
  options: NewMmeOptionsState,
): VisibleField[] {
  const list: VisibleField[] = ["make", "model"];

  if (selected.make && selected.model) {
    for (const field of PROGRESSIVE_FIELDS) {
      if (optionsForField(field, options).length > 0) {
        list.push(field);
      }
    }
  }

  return list;
}

/** Field is interactive when all prior visible fields in FIELD_ORDER have a selection. */
export function isMmeFieldEnabled(
  field: VisibleField,
  visibleFields: VisibleField[],
  selected: NewMmeSelectedState,
): boolean {
  if (!visibleFields.includes(field)) return false;
  const fieldIndex = FIELD_ORDER.indexOf(field);
  for (const prior of FIELD_ORDER.slice(0, fieldIndex)) {
    if (!visibleFields.includes(prior)) continue;
    if (!selected[prior]?.trim()) return false;
  }
  return true;
}

/** Every currently visible dropdown has a valid option selected. */
export function areAllVisibleMmeFieldsSelected(
  visibleFields: VisibleField[],
  selected: NewMmeSelectedState,
  options: NewMmeOptionsState,
): boolean {
  if (visibleFields.length === 0) return false;
  return visibleFields.every((field) => {
    const value = selected[field];
    if (!value?.trim()) return false;
    return isValueInOptions(value, optionsForField(field, options));
  });
}

/** Full apply readiness: resolved `carIds` from Cars API + all visible fields filled. */
export function isNewMmeApplyCtaEnabled(
  carIds: string[] | null | undefined,
  visibleFields: VisibleField[],
  selected: NewMmeSelectedState,
  options: NewMmeOptionsState,
): boolean {
  return (
    isNewMmeSearchCtaEnabled(carIds) &&
    areAllVisibleMmeFieldsSelected(visibleFields, selected, options)
  );
}

/**
 * E2E flow (`end_to_end_vin_flow_feature_flag`): CTA follows `carIds.length` only.
 * Enabled for 1–5 ids even when later progressive fields (e.g. gearbox) are still empty —
 * Cars/VIN API already resolved vehicles. Disabled for `[]` or `> 5`.
 */
export function isE2EMmeApplyCtaEnabled(carIds: string[] | null | undefined): boolean {
  if (!Array.isArray(carIds)) return false;
  if (carIds.length < 1 || carIds.length > 5) return false;
  return isNewMmeSearchCtaEnabled(carIds);
}

/** Label text: emphasis when a value is selected, muted when showing placeholder only. */
export function getNewMmeDropdownLabelClass(
  hasSelection: boolean,
  size: "xs" | "sm" = "sm",
): string {
  const sizeClass = size === "xs" ? "text-xs" : "text-sm";
  const colorClass = hasSelection ? "text-color-text-emphasis" : "text-color-text-muted";
  return `truncate ${sizeClass} ${colorClass}`;
}

/** Default empty search text map for all visible MME fields. */
export const EMPTY_MME_SEARCH_TEXT: Record<VisibleField, string> = {
  make: "",
  model: "",
  body: "",
  variant: "",
  engine: "",
  engineCode: "",
  gearBox: "",
  gearBoxCode: "",
};

export function emptyMmeSearchText(): Record<VisibleField, string> {
  return { ...EMPTY_MME_SEARCH_TEXT };
}
