## [2.2.1](https://github.com/chialab/loock/compare/v2.2.0...v2.2.1) (2021-10-07)

## 4.3.0

### Minor Changes

- 3efefc0: Return `startHelper` and `endHelper` from `focusTrapBehavior` and allow to not automatically insert them in the DOM.

### Patch Changes

- ce0b30b: Add `continuous` config to keyboard navigation.

## 4.2.0

### Minor Changes

- 922183b: Do not restore focus when user clicks outside a trap area.

## 4.1.0

### Minor Changes

- 38921f4: Do not store node's ownerDocument since it can change for imported nodes.

## 4.0.2

### Patch Changes

- 0468372: Filter focusable elements.

## 4.0.1

### Patch Changes

- 4526982: Enhance focusout handler using relatedTarget

## 4.0.0

### Major Changes

- 99940f5: Introduce focus and keyboard navigation behaviors.
- 459a4cb: Refactored the trap mechanism in order to handle video controls and iframe contents.
- f04dd1c: Expose the `focusManager` method.

### Minor Changes

- 858450c: Add focus manager to behaviors.
- 8645f7d: Add `types` entrypoint for exports map.
- 93702f5: Rename `keyboardNavigationBehavior` options.

## 4.0.0-beta.4

### Minor Changes

- 93702f5: Rename `keyboardNavigationBehavior` options.

## 4.0.0-alpha.3

### Major Changes

- f04dd1c: Expose the `focusManager` method.

## 4.0.0-alpha.2

### Minor Changes

- 858450c: Add focus manager to behaviors.

## 4.0.0-alpha.1

### Major Changes

- 99940f5: Introduce focus and keyboard navigation behaviors.

## 4.0.0-alpha.0

### Major Changes

- 459a4cb: Refactored the trap mechanism in order to handle video controls and iframe contents.

### Minor Changes

- 8645f7d: Add `types` entrypoint for exports map.

## 3.3.0

### Minor Changes

- eb8015d: Correctly detect prev and next focusable item.

## 3.2.10

### Patch Changes

- aa3fd32: Fix focus on context enter when target has tabindex equal to -1.

## 3.2.9

### Patch Changes

- 7433466: Handle focus on iframes.

## 3.2.8

### Patch Changes

- 565bb65: Fix contexts chain.

## 3.2.7

### Patch Changes

- 3b813ae: Fix current target on enter.

## 3.2.6

### Patch Changes

- af34660: Check focus target before invoking callbacks

## 3.2.5

### Patch Changes

- 8b23515: Fix default context restore

## 3.2.4

### Patch Changes

- bf7d7f2: Check activeElement on click in context

## 3.2.3

### Patch Changes

- 0cf40d6: Prevent lock from focus hidden details content

## 3.2.2

### Patch Changes

- fa69402: Correctly initialize context

### Bug Fixes

- re-adding the same disabled context ([a450fad](https://github.com/chialab/loock/commit/a450fad228d751f6529fd70f9b738bfbc6ccd3d9))

# [2.2.0](https://github.com/chialab/loock/compare/v2.1.0...v2.2.0) (2021-08-24)

### Bug Fixes

- attach and detach methods ([c9b5878](https://github.com/chialab/loock/commit/c9b5878b53fa22a1dceadeffc77f781787ccfd9d))
- mixin events ([f875e83](https://github.com/chialab/loock/commit/f875e83fc5ea68e5823c5d9227e318d2fe4f89a0))
- mixin typings ([810b029](https://github.com/chialab/loock/commit/810b02977bf58a38b8f3a1820b24c8893a37f601))

### Features

- disabled state ([0746519](https://github.com/chialab/loock/commit/074651931a2b0af3f3b524ced333686ac734d283))
