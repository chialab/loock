<p align="center">
    <img alt="Loock logo" width="144" height="144" src="https://raw.githack.com/chialab/loock/main/logo.svg" />
</p>

<p align="center">
  <strong>Loock</strong> • Refined keyboard navigation for websites and components.
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
const trap = focusTrapBehavior(dialog, {
    inert: true,
});

dialog.addEventListener('open', () => {
    trap.connect();
});
```

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
