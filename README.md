<!-- RNA-HEADER -->
<h3 align="center">Loock</h3>


<p align="center">
   An accessibility helper for keyboard navigation on the web.
</p>


<p align="center">
    <a href="https://www.npmjs.com/package/@chialab/loock">
        <img alt="NPM" src="https://img.shields.io/npm/v/@chialab/loock.svg?style=flat-square">
    </a>
     <a href="./LICENSE">
        <img alt="License" src="https://img.shields.io/npm/l/@chialab/loock.svg?style=flat-square">
    </a>
</p>

---

* Organize your web page or web application by navigation areas.
* Never lose the context while navigating the area with the `TAB` key.
* Leave the context with the `ESC` key.
* Use a default context.

## Demo

[Try out the demo!](https://codesandbox.io/s/ypjoj2r1qv)

## Install

```sh
$ npm install @chialab/loock
# OR
$ yarn add @chialab/loock
```

## Usage

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

        <script type="module">
            import Loock from '@chialab/loock';

            const loock = new Loock();

            const mainContext = loock.createDefaultContext(document.getElementById('main'));
            const context = loock.createContext(document.getElementById('navigation'));

            // listen the context
            context.on('enter', () => {
                console.log('entered the navigation context');
            });

            context.on('exit', () => {
                console.log('exited the navigation context');
            });

            // activate the context
            context.enter();
        </script>
    </body>
</html>
```

On page load, the `#navigation` will be automatically focused and you can navigate the links using the `TAB` key without losing focus from the nav element. Press `ESC` to exit the navigation context and skip to the default context, the `#main` element.

<!-- RNA-HEADER -->
<!-- RNA-WORKSPACES -->

<!-- RNA-WORKSPACES -->
<!-- RNA-DEV -->
## Development

### Requirements

* [Node JS](https://nodejs.org/) (>= 10)
* [Yarn](https://yarnpkg.com/) (>= 1.10.0)
* [RNA cli](https://www.npmjs.com/package/@chialab/rna-cli)

### Build the project.

```sh
$ rna install
$ rna run build
```

### Develpment mode.
```sh
$ rna run watch
```

<!-- RNA-DEV -->
