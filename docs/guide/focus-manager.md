# focusManager

The focus manager create a context to manage focusable elements inside a root. You can use the focus manager to retrieve all focusable elements inside the node or to make the first/last child to grab the focus. Other helper method could be added in the future.

## Example

```ts
import { focusManager } from '@chialab/loock';

const root = document.querySelector('dialog');
const manager = focusManager(root);

manager.focusFirst();
```

## Options

Options can be passed as second argument of the `focusManager` function in order to configure the child elements that should be considered as focusable.

### `include`

A list of selectors of tabbable elements to include in the context.

```ts
const manager = focusManager(root, {
    include: 'input, button',
});
```

Default list:

- `a[href]`
- `area[href]`
- `button`
- `input`
- `select`
- `textarea`
- `video[controls]`
- `audio[controls]`
- `embed`
- `iframe`
- `summary`
- `[contenteditable]`
- `[tabindex]`

### `exclude`

A list of selectors of elements to exclude from the context.

```ts
const manager = focusManager(root, {
    include: 'input, button',
    exclude: '[disabled]',
});
```

Default list:

- `[tabindex="-1"]`
- `[disabled]`
- `[hidden]`
- `[aria-hidden="true"]`
- `[aria-disabled="true"]`
- `[inert]`
- `details:not([open]) *:not(summary)`

### `elements`

An array of nodes or a function that returns an array of nodes to use as tabbable elements. It takes precedence over `include` and `exclude` options.

```ts
const manager = focusManager(root, {
    elements: () => Array.from(root.querySelectorAll('input, button')),
});
```

## Methods

### `focusFirst()`

Focus the first child element.

### `focusLast()`

Focus the last child element.

### `findFocusable()`

Find all focusable elements inside the root.
