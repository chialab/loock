# Loock

Keyboard navigation for Web Apps and Components.

[![NPM](https://img.shields.io/npm/v/@chialab/loock.svg)](https://www.npmjs.com/package/@chialab/loock)

## Features

Loock provides a set of behaviors to manage focus and keyboard navigation for web apps and components.

### Navigation areas

Organize your web page or web application by navigation areas.

### Persistent context

Never lose the context while navigating the area with the `TAB` key.

### Escape hatch

Leave the context with the `ESC` key.

## Get the library

Install via NPM:

```
npm install @chialab/loock
```

```
yarn add @chialab/loock
```

```
pnpm add @chialab/loock
```

### CDN

Load via [esm.run](https://esm.run/):

```ts
import { focusTrapBehavior } from 'https://esm.run/@chialab/loock';
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

## Development

[![Build status](https://github.com/chialab/loock/workflows/Main/badge.svg)](https://github.com/chialab/loock/actions?query=workflow%3AMain)

### Build

Install the dependencies and run the `build` script:

```
pnpm install
```

```
pnpm build
```

This will generate the bundles in the `dist` folder, as well as the declaration files.

### Test

Run the `test` script:

```
pnpm test
```

---

## License

**Loock** is released under the [MIT](https://github.com/chialab/loock/blob/main/LICENSE) license.
