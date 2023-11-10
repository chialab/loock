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

Loock attaches a ShadowRoot to the context container. Inside the ShadowRoot, it appends 3 elements:

-   a `<span>` used to detect when the focus ring needs to be moved to the last element of the context when pressing `Shift+TAB` on the first tabbable element
-   a `<slot>` used to render the context content
-   a `<span>` used to detect when the focus ring needs to be moved to the first element of the context when pressing `TAB` on the last tabbable element

The container contents is rendered the same way as before context initialization, but the keyboard navigation is now "wrapped" by the two `span` elements.  
When one of the wrapping elements gets the focus, it redirect the focus ring to the correct sibling.

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
