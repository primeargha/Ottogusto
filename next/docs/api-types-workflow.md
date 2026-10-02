# API Types Workflow

**RULE: ONLY TYPESCRIPT CHANGES.** No logic or behavior changes.

## Overview

- **React Query** lives in `next/hooks/` (query options, `useQuery`, `useMutation`).
- **Direct API calls** live in `next/services/`.
- Hooks call services; components/pages use hooks.
- When adding or updating an API’s types, follow the steps below and fix **only** TypeScript errors that are related to that API.

## Task Steps

### 1. You provide the API spec

You will provide:

- API path and method (e.g. `GET /api/Config`, `POST /api/Garage`).
- Path parameters (name, type, required).
- Query parameters (if any).
- Body payload for POST/PUT (if any), with field names and types.
- Response structure (full shape or example JSON).

### 2. Add types in `next/type.d.ts`

- Convert the spec into TypeScript types (interfaces / type aliases).
- Use clear names, e.g. `GetConfigResponse`, `PostGaragePayload`, `GarageItem`.
- Match the **actual** API shape (e.g. `{ data: T }` if that’s what the client returns).
- Place types in the appropriate section of `next/type.d.ts` and **export** them.
- Add short JSDoc comments (e.g. “Response for GET /api/…”).

### 3. Add types to `next/hooks/` and `next/services/`

**Services (`next/services/`):**

- Import the new types from `@/type`.
- Type the function parameters (e.g. `id: string`, `body: PostXyzPayload`).
- Type the return (e.g. `Promise<GetXyzResponse>`).
- Use the types in `apiClient.get<T>(...)`, `apiClient.post<T>(...)`, etc.
- No logic changes; only type annotations and replacing `any`.

**Hooks (`next/hooks/`):**

- Query options: ensure `queryFn` return type is the response type (inferred or explicit).
- Mutations: type options as `UseMutationOptions<ResponseType, Error, PayloadType>`.
- No logic changes; only typing so `data` and variables are correctly typed.

### 4. Find where the API is used

- Search for:
  - The hook name (e.g. `useGetConfigQuery`, `useAddUpdateMyCarsToEB`).
  - The query options (e.g. `configQueryOptions`, `carByIdQueryOptions`).
  - The service function (e.g. `getConfig`, `getCarById`) if called outside hooks.
- List all files that use this API (components, pages, other hooks, stores).

### 5. Fix TypeScript errors in those files only

- In **only** the files that use this API:
  - Fix TypeScript errors that come from the new/updated types (e.g. `data` shape, `null` vs `undefined`, missing optional fields).
  - Use type assertions, `?? ''`, optional chaining, or narrow types only where needed for this API’s data.
- Do **not** fix unrelated TypeScript errors in the same file.
- Do **not** change runtime behavior or logic.

## Summary

| Step | Action                                                                                |
| ---- | ------------------------------------------------------------------------------------- |
| 1    | You provide API path, params, body, response.                                         |
| 2    | Types go in `next/type.d.ts` (exported).                                              |
| 3    | Services and hooks in `next/services/` and `next/hooks/` get typed (no logic change). |
| 4    | Search codebase for usages of the hook/service.                                       |
| 5    | Fix only API-related TS errors in those files.                                        |

Use this doc as context when you pass API specs and ask for type additions or fixes.

---

## For new developers: what this flow is and how to add new types

### What we use this flow for

- **Single source of truth for API shapes:** All request/response types for backend APIs live in `next/type.d.ts`. Services and hooks import from `@/type` so the app stays consistently typed.
- **Layering:** API calls live in `next/services/` (e.g. `getOrderById`, `submitSupport`). React Query lives in `next/hooks/` (e.g. `useGetOrderByIdQuery`, `useSubmitSupportMutation`). Components and pages use hooks (or sometimes services directly). This workflow only adds or updates **TypeScript types**; it does **not** change behavior or logic.
- **apiClient convention:** Our `apiClient` (in `next/config/api.ts`) returns `{ data: T }` for successful responses. So when you type `apiClient.get<{ data: MyResponse }>(url)`, the result is `{ data: MyResponse }`. Services that return “the data only” do `return response.data`; otherwise they return the full `response`.

### How to add types for a new API

1. **Get the API spec**  
   You need: path and method (e.g. `GET /api/Stock/{id}`), path/query params, body (for POST/PUT), and response shape (or example JSON).

2. **Add types in `next/type.d.ts`**
   - Define interfaces or type aliases (e.g. `GetStockByIdResponse`, `PostReturnPayload`).
   - Use names that match the API: `GetXxxResponse` for GET responses, `PostXxxPayload` for POST body, etc.
   - Add a short JSDoc (e.g. `/** Response for GET /api/Stock/{id}. apiClient returns { data: GetStockByIdResponse }. */`).
   - **Export** every new type.
   - Put them in a logical place in the file (e.g. near other Order/Return/Parts types).

3. **Type the service in `next/services/`**
   - Import the new types from `@/type`.
   - Type the function parameters (path id, query, body) and return type (e.g. `Promise<{ data: GetStockByIdResponse }>`).
   - Use the types in the call: `apiClient.get<{ data: GetStockByIdResponse }>(url)` or `apiClient.post<{ data: PostXxxResponse }>(url, body)`.
   - Do not change URL building or error handling logic; only add or update type annotations.

4. **Type the hook in `next/hooks/` (if the API is used via React Query)**
   - For **queries:** the `queryFn` return type is inferred from the service; ensure the service return type is correct.
   - For **mutations:** type options as `UseMutationOptions<ResponseType, Error, PayloadType>` (e.g. `UseMutationOptions<{ data: PostSupportResponse }, Error, PostSupportPayload>`).
   - Remove any `any` in the hook that refers to this API.

5. **Find usages and fix only API-related TS errors**
   - Search for the service name and hook name (e.g. `getInstockInformation`, `useGetInstockInformationQuery`).
   - In those files only, fix errors caused by the new types (e.g. `data` shape, optional fields, `null` vs `undefined`).
   - Do not fix unrelated TypeScript issues in the same file and do not change runtime behavior.

**Quick checklist for a new endpoint:**  
Types in `type.d.ts` → service params and return typed → hook options typed (if any) → usages checked and only API-related errors fixed.
