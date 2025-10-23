# focusTrapBehavior

A behavior to trap focus inside a context. The trap can be activated or deactivated at any time using `connect()` and `disconnect` methods. Also, pressing the `Escape` key will disconnect the trap.

## Example

```ts
import { focusTrapBehavior } from '@chialab/loock';

const dialog = document.querySelector('dialog');
const trap = focusTrapBehavior(dialog, {
    onExit: () => {
        dialog.open = false;
    },
});

dialog.addEventListener('open', () => {
    trap.connect();
});
```

## How it works

Intercepts keyboard navigation and forces the focus to stay inside the context node.  
When the focus tries to leave the context, it is redirected to the first or last focusable element inside the context, depending on the navigation direction.

## Options

The `trapBehavior` inherits all the options from [`focusManager`](./focus-manager) and adds the following:

### `inert`

Should add the `inert` attribute to the excluded elements when a focus context is active.  
This may be useful for screen readers but it may cause a bit of overhead.

Default: `false`.

### `restore`

Should restore the focus to the previously focused element when the context is exited.

Default: `true`.

### `focusContainer`

Focus the context container when the context is entered if `true`, focus the first child element otherwise.
First child element is detected using the focus manager options.

Default: `false`.

### `onEnter`

A callback that is called when the context is entering.  
The return value is awaited before the context is entered.

### `onExit`

A callback that is called when the context is exiting.  
The return value is awaited before the context is exited.

### `beforeExit`

A callback that is called before the context is exiting.  
The return value is awaited. If the return value is `false`, the context is not exited.  
It can be used to block the context exit when the `ESC` key is pressed.

## Methods

### `connect()`

Enable the focus trap.

### `disconnect()`

Disable the focus trap.
