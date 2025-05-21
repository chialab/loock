import { focusEnterBehavior } from './focusEnterBehavior';
import { type FocusManagerOptions, focusManager } from './focusManager';
import { restoreAttribute } from './helpers';

/**
 * Focus first option on focus enter.
 * @param node The target element.
 * @param options The options.
 * @returns The behavior controller.
 */
export function focusFirstChildBehavior(
    node: HTMLElement,
    options: FocusManagerOptions = {}
) {
    let activeElement: HTMLElement | null = null;
    let connected = false;
    let tabIndex: string | null = null;

    const manager = focusManager(node, options);
    const enterBehavior = focusEnterBehavior(node, {
        ...options,
        onEnter() {
            tabIndex = node.getAttribute('tabindex');
            node.setAttribute('tabindex', '-1');
        },
        onExit() {
            restoreAttribute(node, 'tabindex', tabIndex);
        },
    });

    const onFocus = () => {
        const elements = manager.findFocusable();
        const target = node.ownerDocument.activeElement as HTMLElement;
        if (target === node) {
            if (activeElement && node.contains(activeElement)) {
                activeElement.focus();
                return;
            }

            elements[0]?.focus();
            return;
        }
        if (elements.includes(target)) {
            activeElement = target;
        }
    };

    return {
        get connected() {
            return connected;
        },
        connect() {
            if (connected) {
                return;
            }
            enterBehavior.connect();
            connected = true;
            activeElement = null;
            if (
                node.ownerDocument.activeElement &&
                node.contains(node.ownerDocument.activeElement)
            ) {
                onFocus();
            }
            node.addEventListener('focus', onFocus, true);
        },
        disconnect() {
            if (!connected) {
                return;
            }
            enterBehavior.disconnect();
            connected = false;
            activeElement = null;
            node.removeEventListener('focus', onFocus, true);
        },
    };
}
