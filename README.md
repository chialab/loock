<p align="center">
    <a href="https://www.chialab.io/p/loock">
        <img alt="Loock logo" width="144" height="144" src="https://raw.githack.com/chialab/loock/master/logo.svg" />
    </a>
</p>

<p align="center">
  <strong>Loock</strong> • A focus trap helper for keyboard navigation on the web.
</p>

<p align="center">
    <a href="https://www.npmjs.com/package/@chialab/loock"><img alt="NPM" src="https://img.shields.io/npm/v/@chialab/loock.svg"></a>
</p>

---

## Introducing Loock

* Organize your web page or web application by navigation areas.
* Never lose the context while navigating the area with the `TAB` key.
* Leave the context with the `ESC` key.
* Use a default context.

Medium article - ["How to improve keyboard navigation of your web page"](https://medium.com/chialab-open-source/how-to-improve-keyboard-navigation-of-your-web-page-f11b324adbab)

[Try out the demo!](https://codesandbox.io/s/ypjoj2r1qv)

## Install

```sh
$ npm install @chialab/loock
$ yarn add @chialab/loock
```

Use via cdn:

```html
<script src="https://unpkg.com/@chialab/loock"></script>
```

## Usage

```ts
import { Manager } from '@chialab/loock';

const manager = new Manager();
const mainElem = document.getElementById('main');
const navigationElem = document.getElementById('main');

// define the default context
const mainContext = manager.createDefaultContext(mainElem);

// define one context
const context = manager.createContext(navigationElem);

// listen context state
navigationElem.addEventListener('focusenter', () => {
    console.log('entered the navigation context');
    // do stuff
});

navigationElem.addEventListener('focusexit', () => {
    console.log('exited the navigation context');
    // do stuff
});

// activate the context
context.enter();
```

```html
<html>
    <body>
        <nav id="navigation" aria-label="Main navigation">
            <a href="/">Home</a>
            <a href="/posts">Posts</a>
            <a href="/login">Login</a>
        </nav>
        <section id="main" aria-label="Main content">
            ...
        </section>
    </body>
</html>
```

On page load, the `#navigation` will be automatically focused and you can navigate the links using the `TAB` key without losing focus from the nav element. Press `ESC` to exit the navigation context and skip to the default context, the `#main` element.

For a more complete example, please see the [demo source code](https://codesandbox.io/s/ypjoj2r1qv).

---

## Development

[![Build status](https://github.com/chialab/loock/workflows/Main/badge.svg)](https://github.com/chialab/loock/actions?query=workflow%3ABuild)
[![codecov](https://codecov.io/gh/chialab/loock/branch/master/graph/badge.svg)](https://codecov.io/gh/chialab/loock)

### Build

Install the dependencies and run the `build` script:

```
$ yarn
$ yarn build
```

This will generate the UMD and ESM bundles in the `dist` folder, as well as the declaration file.

### Test

Run the `test` script:

```
$ yarn test
```

### Release

The `release` script uses [Semantic Release](https://github.com/semantic-release/semantic-release) to update package version, create a Github release and publish to the NPM registry.

An environment variable named `GH_TOKEN` with a [generated Github Access Token](https://github.com/settings/tokens/new?scopes=repo) needs to be defined in a local `.env` file.

```sh
$ echo 'export GH_TOKEN="abcxyz"' > .env
```

Now you are ready to run the `release` command:

```sh
$ yarn release
```

---

## License

Loock is released under the [MIT](https://github.com/chialab/loock/blob/master/LICENSE) license.
