<p align="center">
    <img alt="Loock logo" width="144" height="144" src="https://raw.githack.com/chialab/loock/main/logo.svg" />
</p>

<p align="center">
  <strong>Loock</strong> • A focus trap helper for keyboard navigation on the web.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@chialab/loock"><img alt="NPM" src="https://img.shields.io/npm/v/@chialab/loock.svg"></a>
</p>

---

## Introducing Loock

-   Organize your web page or web application by navigation areas.
-   Never lose the context while navigating the area with the `TAB` key.
-   Leave the context with the `ESC` key.

<!-- Medium article - ["How to improve keyboard navigation of your web page"](https://medium.com/chialab-open-source/how-to-improve-keyboard-navigation-of-your-web-page-f11b324adbab)

[Try out the demo!](https://codesandbox.io/s/ypjoj2r1qv) -->

## Install

### NPM

```
npm install @chialab/loock
```

```
yarn add @chialab/loock
```

### CDN

```ts
import { focusTrapBehavior } from 'https://unpkg.com/@chialab/loock?module';
```

## Usage

```ts
import { focusTrapBehavior } from '@chialab/loock';

const dialog = document.getElementById('.dialog');
const trap = focusTrapBehavior(dialog);

dialog.addEventListener('open', () => {
    trap.connect();
});
```

### Options

#### `include`

A list of selectors of tabbable elements to include in the context.

Default: `a[href], area[href], button, input, select, textarea, video[controls], audio[controls], embed, iframe, summary, [contenteditable], [tabindex]`.

#### `exclude`

A list of selectors of elements to exclude from the context.

Default: `[tabindex="-1"], [disabled], [hidden], [aria-hidden="true"], [aria-disabled="true"], [inert], details:not([open]) *:not(summary)`.

#### `inert`

Should add the `inert` attribute to the excluded elements when a focus context is active.  
This may be useful for screen readers but it may cause a bit of overhead.

Default: `false`.

#### `restore`

Should restore the focus to the previously focused element when the context is exited.

Default: `true`.

#### `trap`

Should trap the focus inside the context when the context is active.

Default: `true`.

#### `focusContainer`

Focus the context container when the context is entered.

Default: `true`.

#### `onEnter`

A callback that is called when the context is entering.  
The return value is awaited before the context is entered.

#### `onExit`

A callback that is called when the context is exiting.  
The return value is awaited before the context is exited.

#### `beforeExit`

A callback that is called before the context is exiting.  
The return value is awaited. If the return value is `false`, the context is not exited.  
It can be used to block the context exit when the `ESC` key is pressed.

### How "trap" works

Loock attaches a ShadowRoot to the context container. Inside the ShadowRoot, it appends 3 elements:

-   a `<span>` used to detect when the focus ring needs to be moved to the last element of the context when pressing `Shift+TAB` on the first tabbable element
-   a `<slot>` used to render the context content
-   a `<span>` used to detect when the focus ring needs to be moved to the first element of the context when pressing `TAB` on the last tabbable element

The container contents is rendered the same way as before context initialization, but the keyboard navigation is now "wrapped" by the two `span` elements.  
When one of the wrapping elements gets the focus, it redirect the focus ring to the correct sibling.

---

## Development

[![Build status](https://github.com/chialab/loock/workflows/Main/badge.svg)](https://github.com/chialab/loock/actions?query=workflow%3AMain)

### Build

Install the dependencies and run the `build` script:

```
yarn install
```

```
yarn build
```

This will generate the bundles in the `dist` folder, as well as the declaration file.

### Test

Run the `test` script:

```
yarn test
```

---

## License

**Loock** is released under the [MIT](https://github.com/chialab/loock/blob/main/LICENSE) license.
