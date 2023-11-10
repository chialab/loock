# focusEnterBehavior

A behavior to handle focus entering or exiting a context. It can be useful to change the state of the root container when a context is active.

## Example

```ts
import { focusEnterBehavior } from '@chialab/loock';

const root = document.querySelector('dialog');

class MyCustomElement extends HTMLElement {
    _internals = this.attachInternals();

    focusEnterBehavior = focusEnterBehavior(root, {
        onEnter: () => {
            this._internals.states.add('--focused');
        },
        onExit: () => {
            this._internals.states.delete('--focused');
        },
    });

    connectedCallback() {
        this.focusEnterBehavior.connect();
    }

    disconnectedCallback() {
        this.focusEnterBehavior.disconnect();
    }
}
```

## How it works

This behavior acts differently from listening `focus` and `blur` events. In facts, those events fire only when the target is the node itself, not when the focus is moving from a child to another elements.

Loock attaches two listeners for the `focusin` and the `focusout` events:

-   when `focusin` fires, Loock triggers then `onEnter` callback if the context was not already entered
-   when `focusout` fires, Loock triggers then `onExit` callback if not followed by another `focusin` event.

## Options

### `onEnter`

A callback that is called when the context is entering.

### `onExit`

A callback that is called when the context is exiting.

## Methods

### `connect()`

Connect the behavior to the context.

### `disconnect()`

Disconnect the behavior from the context.
