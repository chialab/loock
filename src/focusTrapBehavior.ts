import { focusManager, type FocusManagerOptions } from './focusManager';
import { restoreAttribute } from './helpers';

/**
 * Inert node ancestors up to the root node.
 * @param node The node to start from.
 * @param until The root node.
 * @returns A list of functions to restore the original state.
 */
function inertTree(node: HTMLElement, until: HTMLElement = document.documentElement): () => void {
    const parentNode = node.parentNode as HTMLElement;
    if (!parentNode) {
        return () => {};
    }

    let restore = until !== parentNode ? inertTree(parentNode, until) : () => {};

    const children = /** @type {HTMLElement[]} */ Array.from(parentNode.children);
    for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        if (child === node) {
            continue;
        }

        const inert = child.inert;
        const tabindex = child.getAttribute('tabindex');
        const ariaHidden = child.getAttribute('aria-hidden');
        // Inert elements are not focusable nor clickable
        child.inert = true;
        // Some inert elements, like video, disable click but not tabbing
        child.setAttribute('tabindex', '-1');
        // Fallback for browsers that don't support inert
        child.setAttribute('aria-hidden', 'true');
        restore = ((prev) => () => {
            prev();
            child.inert = inert;
            restoreAttribute(child, 'tabindex', tabindex);
            restoreAttribute(child, 'aria-hidden', ariaHidden);
        })(restore);
    }

    return restore;
}

/**
 * Create a focus trap helper span.
 * @param document The document to create the span in.
 * @returns The focus trap helper span.
 */
function createTrapHelper(document: Document) {
    const span = document.createElement('span');
    span.tabIndex = -1;
    span.ariaHidden = 'true';
    span.style.position = 'absolute';
    span.style.opacity = '0';

    return span;
}

export interface FocusTrapImpl {
    /**
     * Whether to use Shadow DOM.
     */
    useShadowDOM?: boolean;
    /**
     * The trap start element to use instead of creating one.
     */
    startHelper?: HTMLElement;
    /**
     * The trap end element to use instead of creating one
     */
    endHelper?: HTMLElement;
}

export interface FocusTrapOptions extends FocusManagerOptions {
    /**
     * Whether to inert the other elements of the page.
     */
    inert?: boolean;
    /**
     * Whether to restore focus to the previous element.
     */
    restore?: boolean;
    /**
     * The focus trap implementation configuration.
     */
    trapImpl?: FocusTrapImpl;
    /**
     * Whether to focus the container when entering the focus context.
     */
    focusContainer?: boolean;
    /**
     * A function that is called when the focus context is entered.
     */
    onEnter?: () => void | Promise<void>;
    /**
     * A function that is called when the focus context is exited.
     */
    onExit?: () => void | Promise<void>;
    /**
     * A function that is called before the focus context is exited.
     */
    beforeExit?: () => boolean | void | Promise<boolean | void>;
}

/**
 * A Focus Context.
 * @param node The root node of the focus context.
 * @param options The focus context options.
 */
export function focusTrapBehavior(node: HTMLElement, options: FocusTrapOptions = {}) {
    /**
     * Whether the focus context is active.
     */
    let connected = false;

    /**
     * The tabindex of the root node.
     */
    let tabIndex: string | null = null;

    /**
     * A function that restores tree status.
     */
    let restoreTreeState: (() => void) | null = null;

    /**
     * The node to restore focus to.
     */
    let restoreFocusNode: HTMLElement | null = null;

    /**
     * The currently focused node.
     */
    let currentNode: HTMLElement | null = null;

    /**
     * The start of the focus trap.
     */
    let trapStart: HTMLElement | null = null;

    /**
     * The end of the focus trap.
     */
    let trapEnd: HTMLElement | null = null;

    const manager = focusManager(node, options);

    /**
     * Enter the focus context.
     */
    const connect = async () => {
        if (connected) {
            return;
        }

        connected = true;

        const { trapImpl = {}, inert = false, focusContainer = false, onEnter } = options;
        const { useShadowDOM = true, startHelper = null, endHelper = null } = trapImpl;
        tabIndex = node.getAttribute('tabindex');
        if (focusContainer && !tabIndex) {
            node.setAttribute('tabindex', '0');
        }

        const document = node.ownerDocument;
        trapStart = startHelper || createTrapHelper(document);
        trapStart.addEventListener(
            'focus',
            (event) => {
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();

                if (currentNode === node) {
                    manager.focusFirst();
                } else if (focusContainer) {
                    currentNode = node;
                    node.focus();
                } else {
                    manager.focusLast();
                }
            },
            true
        );

        trapEnd = endHelper || createTrapHelper(document);
        trapEnd.addEventListener(
            'focus',
            (event) => {
                event.stopImmediatePropagation();
                event.stopPropagation();
                event.preventDefault();

                if (currentNode === node) {
                    manager.focusLast();
                } else if (focusContainer) {
                    currentNode = node;
                    node.focus();
                } else {
                    manager.focusFirst();
                }
            },
            true
        );

        let root: HTMLElement | DocumentFragment = node;
        if (useShadowDOM) {
            if (node.shadowRoot) {
                root = node.shadowRoot;
            } else {
                root = node.attachShadow({ mode: 'open' });
                root.append(document.createElement('slot'));
            }
        }
        if (root.firstChild !== trapStart) {
            root.prepend(trapStart);
        }
        if (root.lastChild !== trapEnd) {
            root.append(trapEnd);
        }

        // MUST use the `focusin` event because it fires after the bound `focus` on trap helpers
        node.ownerDocument.addEventListener('focus', handleFocusOut, true);
        node.addEventListener('focusin', handleFocusIn, true);
        node.addEventListener('keydown', handleKeyDown, true);
        if (trapStart) {
            trapStart.tabIndex = 0;
        }
        if (trapEnd) {
            trapEnd.tabIndex = 0;
        }
        restoreFocusNode = document.activeElement as HTMLElement;
        if (node.contains(restoreFocusNode) && restoreFocusNode !== node) {
            restoreFocusNode = node;
        } else if (focusContainer) {
            node.focus();
        } else {
            manager.focusFirst();
        }
        if (inert) {
            restoreTreeState = inertTree(node, node.ownerDocument.body);
        }

        if (onEnter) {
            await onEnter();
        }
        node.dispatchEvent(new CustomEvent('focusenter'));
    };

    /**
     * Leave the focus context.
     * @param force Whether to force exit.
     */
    const disconnect = async (force: boolean = false) => {
        if (!connected) {
            return;
        }

        const { restore = true, beforeExit, onExit } = options;
        if (!force && beforeExit && (await beforeExit()) === false) {
            return;
        }

        connected = false;

        restoreAttribute(node, 'tabindex', tabIndex);
        node.ownerDocument.removeEventListener('focus', handleFocusOut, true);
        node.removeEventListener('focusin', handleFocusIn, true);
        node.removeEventListener('keydown', handleKeyDown, true);

        if (restoreTreeState) {
            restoreTreeState();
            restoreTreeState = null;
        }
        if (restoreFocusNode && restore) {
            restoreFocusNode.focus();
        }
        if (trapStart) {
            trapStart.tabIndex = -1;
        }
        if (trapEnd) {
            trapEnd.tabIndex = -1;
        }
        restoreFocusNode = null;

        if (onExit) {
            await onExit();
        }
        node.dispatchEvent(new CustomEvent('focusexit'));
    };

    /**
     * Handle focusin events.
     * @param event The focusin event.
     */
    const handleFocusIn = (event: FocusEvent) => {
        currentNode = event.target as HTMLElement;
    };

    /**
     * Handle focus events on document in order to prevent focus exits the active context.
     * @param event The focusin event.
     */
    const handleFocusOut = (event: FocusEvent) => {
        const element = event.target as HTMLElement;
        if (!node.contains(element)) {
            const { focusContainer = false } = options;
            if (focusContainer) {
                node.focus();
            } else {
                manager.focusFirst();
            }
        }
    };

    /**
     * Handle keydown events.
     * @param event The keydown event.
     */
    const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
            case 'Esc':
            case 'Escape':
                event.preventDefault();
                disconnect();
                break;
            case 'Tab':
                if (currentNode === node) {
                    event.preventDefault();

                    if (event.shiftKey) {
                        manager.focusLast();
                    } else {
                        manager.focusFirst();
                    }
                }
                break;
        }
    };

    return {
        get connected() {
            return connected;
        },
        connect,
        disconnect,
        manager,
    };
}
