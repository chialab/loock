# keyboardNavigationBehavior

This behavior allows to navigate inside a context using keyboard arrows and `Home` and `End` keys.

## Example

```ts
import { keyboardNavigationBehavior } from '@chialab/loock';

const list = document.querySelector('ul');
keyboardNavigationBehavior(list, {
    include: 'li',
}).connect();
```

## Options

The `keyboardNavigationBehavior` inherits all the options from [`focusManager`](./focus-manager) in order to detect the focusable elements inside the context and adds the following configuration options:

### `prevKeys`

A list of keys to navigate to the previous element.

Default: `ArrowUp`, `ArrowLeft`.

### `nextKeys`

A list of keys to navigate to the next element.

Default: `ArrowDown`, `ArrowRight`.

### `firstKeys`

A list of keys to navigate to the first element.

Default: `Home`.

### `lastKeys`

A list of keys to navigate to the last element.

Default: `End`.

## Methods

### `connect()`

Connect the behavior to the context.

### `disconnect()`

Disconnect the behavior from the context.
