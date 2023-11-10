# focusFirstChildBehavior

This behavior focuses the first child element when entering a context. If the user navigates using `TAB` or the `.focus()` method of the root is invoked programmatically, the focus is automatically moved to the first child element.

## Example

```ts
import { focusFirstChildBehavior } from '@chialab/loock';

const dialog = document.querySelector('dialog');
const trap = focusFirstChildBehavior(dialog);

dialog.addEventListener('open', () => {
    trap.connect();
});

dialog.addEventListener('close', () => {
    trap.disconnect();
});
```

## Options

The `focusFirstChildBehavior` inherits all the options from [`focusManager`](./focus-manager) in order to detect the first child element to focus.

## Methods

### `connect()`

Connect the behavior to the context.

### `disconnect()`

Disconnect the behavior from the context.
