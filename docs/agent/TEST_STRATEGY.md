# Test and Evidence Strategy

## Testing layers

### 1. Static checks

- Prettier
- ESLint including JSX accessibility rules
- TypeScript

### 2. Unit/component tests

Use Vitest and Testing Library for:

- State transitions
- Component semantics
- Keyboard behavior
- i18n rendering
- Progress calculations
- Persistence normalization
- Domain logic

### 3. Browser tests

Use Playwright for:

- Navigation and browser history
- Core reading flow
- Search
- Settings
- Responsive layout
- RTL/LTR
- PWA-related UI where testable
- axe scans
- Touch-target checks

### 4. Visual evidence

Capture at minimum:

#### Mobile

- 320×700
- 390×844

#### Tablet

- 768×1024
- 1024×768

#### Desktop

- 1280×800
- 1440×900

For major screen phases, capture:

- Arabic light
- Arabic dark/midnight
- English light
- English dark/midnight
- Large text
- Empty state
- In-progress state
- Complete state

### 5. Manual accessibility

- Keyboard only
- 200% text zoom
- Browser/OS high contrast or forced colors where available
- Reduced motion
- Screen reader on desktop
- Screen reader on mobile
- Text over images
- Logical reading and focus order

### 6. Performance

Record:

- Production build size and budget result
- Cold-load observation on representative mobile hardware or throttling
- Main interaction responsiveness
- Large-list behavior
- Image and font loading
- React Profiler evidence for suspected render problems

Do not optimize based only on intuition. Measure before and after.

## Baseline artifact location

Store generated reports under a non-production evidence location such as:

```text
docs/agent/evidence/<phase>/<date>/
```

Avoid committing very large binary evidence unless repository policy allows it. Link to CI artifacts or issue attachments when better.

## Commands

During implementation:

```bash
pnpm lint
pnpm typecheck
pnpm test:run
```

Before phase completion:

```bash
pnpm check
pnpm test:e2e
```

Before release:

```bash
pnpm build:pages
pnpm audit:prod
```

## Failure policy

- Report the exact failing command and relevant output.
- Determine whether the failure is introduced by the phase or pre-existing.
- Do not delete or weaken a test to make a failure disappear.
- Do not claim completion while required gates fail.
