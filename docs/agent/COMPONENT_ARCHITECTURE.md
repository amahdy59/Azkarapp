# Component Architecture Plan

## Objective

Create a small set of reusable, accessible components so Home, Library, Progress and Settings do not independently reinvent cards, controls, states and layout rules.

## Inventory-first rule

Before creating any component, the agent must search:

- `src/app/components`
- `src/app/components/ui`
- Relevant screens
- Existing tests
- Existing design-system documentation

Refactor or extend an existing component when its responsibility is already close to the required behavior.

## Proposed component families

### Actions

- `Button`
- `IconButton`
- `LinkButton` only when semantics truly remain navigation
- `ActionRow`

### Selection

- `Tabs`
- `SegmentedControl` or radio-card group
- `RadioCard`
- `SwitchRow`

### Navigation

- `NavigationItem`
- `BottomNavigation`
- `NavigationRail`
- `DesktopSidebar`
- `PageHeader`

### Content

- `Card`
- `SectionCard`
- `RoutineRow`
- `CategoryCard`
- `SettingsRow`
- `SettingsSection`
- `StatCard`
- `StatusBadge`

### Feedback

- `ProgressBar`
- `InlineStatus`
- `EmptyState`
- `ErrorState`
- `OfflineState`
- `LoadingSkeleton`
- `Toast`/status messaging using existing infrastructure

### Overlays

- `Dialog`
- `Sheet`
- `Menu`

Use existing Radix primitives where already adopted.

## Component contract template

Each shared component should document or encode:

- Purpose
- Semantic element/role
- Props and variants
- Keyboard behavior
- Accessible-name behavior
- Focus behavior
- RTL/LTR behavior
- Responsive behavior
- Loading/disabled/error states
- Token usage
- Test coverage

## RoutineRow target anatomy

- Leading category icon at the reading start side according to the visual grid
- Title
- Count and estimated duration
- Explicit state
- One interaction model
- Optional compact action only when distinct from row navigation

Do not combine a full-row navigation target, a duplicate “start” button and a duplicate chevron for the same action.

## CategoryCard target anatomy

- Icon
- Category title
- Count
- State-specific progress presentation
- Clear disclosure action

State behavior:

- Not started: no empty decorative progress bar
- In progress: progress bar plus numeric value
- Complete: completion state and text

## SettingsRow target anatomy

- Icon where useful
- Label
- Current value/description
- Disclosure indicator or control
- One clear action target

## Test expectations

Shared components require:

- Keyboard interaction tests
- Accessible-name/state tests
- RTL/LTR rendering checks where directional
- Disabled/loading behavior tests
- Touch-target or geometry checks where relevant
- Integration coverage in at least one screen
