# Get started

## Install

Loock is published to the NPM registry

::: code-group

```bash [npm]
npm install @chialab/loock
```

```bash [yarn]
yarn add @chialab/loock
```

```bash [pnpm]
pnpm add @chialab/loock
```

:::

### or use a CDN

You can use DNA via CDN thanks to [unpkg](https://unpkg.com/):

```ts
import { focusTrapBehavior } from 'https://unpkg.com/@chialab/loock?module';
```

## Usage

Loock provides a set of utilities and behaviors to manage focus and keyboard navigation:

- [`focusManager`](./focus-manager): manage focusable objects inside a context
- [`focusTrapBehavior`](./focus-trap-behavior): trap focus inside a context
- [`focusEnterBehavior`](./focus-enter-behavior): handle focus entering or exiting a context
- [`focusFirstChildBehavior`](./focus-first-child-behavior): focus the first element when entering a context
- [`keyboardNavigationBehavior`](./keyboard-navigation-behavior): navigate inside a context using keyboard arrows

In the example below, we create a focus trap for a dialog element.

```ts
import { focusTrapBehavior } from '@chialab/loock';

const dialog = document.getElementById('.dialog');
const trap = focusTrapBehavior(dialog, {
    inert: true,
});

dialog.addEventListener('open', () => {
    trap.connect();
});
```
