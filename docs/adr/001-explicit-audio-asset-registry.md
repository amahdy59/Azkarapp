# ADR 001: Explicit audio asset registry

Status: Accepted — 2026-08-01

## Context

The legacy player inferred third-party verse URLs from partial IDs and citations. This produced false matches, truncated complete passages to verse 1, and coupled playback to a mutable screen index.

## Decision

Use stable canonical zikr identities, exact approved assignments, a schema-validated central manifest, immutable playback plans, and one root controller. Formatting-only Arabic normalization validates candidates but never selects production audio. Missing or failed audio remains unavailable until an explicit user action or human-reviewed mapping resolves it.

## Consequences

Unsafe legacy coverage becomes honest unavailability until reviewed recordings are supplied. Content, source/licence evidence, metadata, and human approval become release gates. Recording replacement no longer changes player logic. Validation and reports fail CI for conflicting or incomplete approved data.
