<p align="center">
    <a href="https://www.chialab.io/p/loock">
        <img alt="Loock logo" width="144" height="144" src="https://raw.githack.com/chialab/loock/master/logo.svg" />
    </a>
</p>

<p align="center">
  <strong>Loock</strong> • An accessibility helper for keyboard navigation on the web.
</p>

<p align="center">
    <a href="https://www.chialab.io/p/loock"><img alt="Documentation link" src="https://img.shields.io/badge/Docs-chialab.io-lightgrey.svg?style=flat-square"></a>
    <a href="https://github.com/chialab/loock"><img alt="Source link" src="https://img.shields.io/badge/Source-GitHub-lightgrey.svg?style=flat-square"></a>
    <a href="https://www.chialab.it"><img alt="Authors link" src="https://img.shields.io/badge/Authors-Chialab-lightgrey.svg?style=flat-square"></a>
    <a href="https://www.npmjs.com/package/@chialab/loock"><img alt="NPM" src="https://img.shields.io/npm/v/@chialab/loock.svg?style=flat-square"></a>
    <a href="https://github.com/chialab/loock/blob/master/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/@chialab/loock.svg?style=flat-square"></a>
</p>

---

* Organize your web page or web application by navigation areas.
* Never lose the context while navigating the area with the `TAB` key.
* Leave the context with the `ESC` key.
* Use a default context.

## Demo

[Try out the demo!](https://codesandbox.io/s/ypjoj2r1qv)

## Introducing Loock

Medium article - ["How to improve keyboard navigation of your web page"](https://medium.com/chialab-open-source/how-to-improve-keyboard-navigation-of-your-web-page-f11b324adbab)

## Install

```sh
$ npm install @chialab/loock
# OR
$ yarn add @chialab/loock
```

Use via cdn:
```html
<script type="text/javascript" src="https://unpkg.com/@chialab/loock"></script>
```

## Usage

```ts
import { Loock } from '@chialab/loock';

const loock = new Loock();

// define the default context
const mainContext = loock.createDefaultContext(document.getElementById('main'));

// define one context
const context = loock.createContext(document.getElementById('navigation'));

// listen context state
context.on('enter', () => {
    console.log('entered the navigation context');
    // do stuff
});

context.on('exit', () => {
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

### Requirements

In order to build Loock, the following requirements are needed:
* [NodeJS](https://nodejs.org/) (>= 10.0.0)
* [Yarn](https://yarnpkg.com)
* [RNA](https://github.com/chialab/rna-cli) (>= 3.0.0)

### Build the project

Install the dependencies and run the `build` script:
```
$ yarn install
$ yarn build
```

This will generate the UMD and ESM bundles in the `dist` folder, as well as the declaration file.

### Test the project

Run the `test` script:

```
$ yarn test
```

---

## License

Loock is released under the [MIT](https://github.com/chialab/loock/blob/master/LICENSE) license.
