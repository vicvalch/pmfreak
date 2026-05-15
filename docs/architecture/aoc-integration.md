# PMFreak ↔ AOC Integration Boundary

## Target Architecture

```text
PMFreak (vertical SaaS product)
  ↓ consumes
AOC Enterprise (runtime enforcement, delegated execution governance)
  ↓ consumes
AOC Protocol (capability/delegation/consent semantic contracts)
```

PMFreak is the PMO/product vertical. It owns PM-specific workflows and UX, while consuming AOC contracts/runtime through a narrow boundary.

## Ownership Boundaries

### PMFreak owns
- PM workflows: projects, stakeholders, escalations, risks, changes, lessons learned
- Workspace UX, onboarding, billing, dashboard and copilot product behavior
- Product authorization semantics tied to workspace roles and PM operations

### AOC Enterprise owns (consumed by PMFreak)
- Runtime authorization/enforcement pipeline
- Delegated execution governance
- Runtime audit/governance event handling
- Agent execution authority checks

### AOC Protocol owns (consumed by PMFreak)
- Capability, delegation, consent, policy contract semantics
- Canonical protocol-level decision/result types
- Cross-runtime protocol compatibility guarantees

## Integration Boundary in PMFreak

Primary entry points are now centralized under `src/lib/aoc/`:

- `src/lib/aoc/protocol/types.ts` – protocol type bridge (future canonical import target: `@aoc/protocol`)
- `src/lib/aoc/enterprise/runtime.ts` – runtime enforcement boundary (future canonical import target: `@aoc-enterprise/runtime`)
- `src/lib/aoc/compatibility/*` – temporary migration shims for legacy policy/audit/delegation payloads
- `src/lib/aoc/index.ts` – PMFreak-safe export barrel

## Temporary Compatibility Shims

- `legacy-policy-map.ts` maps pre-boundary policy decisions to protocol decision values.
- `legacy-audit-map.ts` normalizes legacy audit records.
- `legacy-delegation-map.ts` normalizes delegation payload metadata.

These files are transitional and should be deleted once direct AOC package bindings are in place.

## Local Development Linking Strategy

Current state:
- PMFreak uses an internal type bridge at `src/lib/aoc/protocol/types.ts`.
- Runtime boundary delegates to existing PMFreak governance runtime via `src/lib/aoc/enterprise/runtime.ts`.

Next step:
1. Add workspace/local package links for `@aoc/protocol` and `@aoc-enterprise/runtime`.
2. Replace bridge internals with thin re-exports/import adapters.
3. Keep product code importing only from `@/lib/aoc/*` (not direct external deep imports).

## Guardrails to Prevent Regression

- Do not add new protocol contract types under product feature folders.
- Do not deep-import future AOC enterprise internals from feature routes.
- Route all governance runtime access through `src/lib/aoc/enterprise/*`.
- Route all protocol-level type usage through `src/lib/aoc/protocol/*`.

## Migration Plan (Incremental)

1. Inventory + classify local AOC duplication (security/runtime/protocol types).
2. Move protocol-facing type usage to `src/lib/aoc/protocol/*`.
3. Move runtime enforcement calls behind `src/lib/aoc/enterprise/*`.
4. Keep temporary compatibility mappers for legacy payloads.
5. Replace bridge internals with `@aoc/protocol` and `@aoc-enterprise/runtime` package imports.
6. Quarantine/delete redundant local AOC logic once runtime parity is verified.
