import { type FocusManagerOptions, focusManager } from './focusManager';
import { inertTree, restoreAttribute } from './helpers';

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
     * The trap start element to use instead of creating one.
     */
    startHelper?: HTMLElement;
    /**
     * The trap end element to use instead of creating one
     */
    endHelper?: HTMLElement;
    /**
     * Whether to use Shadow DOM.
     */
    useShadowDOM?: boolean;
    /**
     * Whether to insert the trap start and end elements.
     */
    insertHelpers?: boolean;
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
     * @deprecated Using trap helpers is deprecated and will be removed in future versions.
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
    beforeExit?: () => boolean | undefined | Promise<boolean | undefined>;
}

/**
 * A Focus Context.
 * @param node The root node of the focus context.
 * @param options The focus context options.
 */
export function focusTrapBehavior(
    node: HTMLElement,
    options: FocusTrapOptions = {}
) {
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
     * @deprecated Using trap helpers is deprecated and will be removed in future versions.
     */
    const startHelper: HTMLElement | null = options.trapImpl
        ? (options.trapImpl.startHelper ?? createTrapHelper(node.ownerDocument))
        : null;

    /**
     * The end of the focus trap.
     * @deprecated Using trap helpers is deprecated and will be removed in future versions.
     */
    const endHelper: HTMLElement | null = options.trapImpl
        ? (options.trapImpl.endHelper ?? createTrapHelper(node.ownerDocument))
        : null;

    const manager = focusManager(node, options);

    /**
     * Enter the focus context.
     */
    const connect = async () => {
        if (connected) {
            return;
        }

        connected = true;

        const {
            trapImpl = {},
            inert = false,
            focusContainer = false,
            onEnter,
        } = options;
        tabIndex = node.getAttribute('tabindex');
        if (focusContainer && !tabIndex) {
            node.setAttribute('tabindex', '0');
        }

        let root: HTMLElement | DocumentFragment = node;
        if (trapImpl) {
            startHelper?.addEventListener(
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

            endHelper?.addEventListener(
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

            if (trapImpl.useShadowDOM) {
                if (node.shadowRoot) {
                    root = node.shadowRoot;
                } else {
                    root = node.attachShadow({ mode: 'open' });
                    root.append(node.ownerDocument.createElement('slot'));
                }
            }
            if (trapImpl.insertHelpers && startHelper && endHelper) {
                startHelper.tabIndex = 0;
                endHelper.tabIndex = 0;
                root.prepend(startHelper);
                root.append(endHelper);
            }
        }

        // MUST use the `focusin` event because it fires after the bound `focus` on trap helpers
        node.addEventListener('focusin', handleFocusIn, true);
        node.addEventListener('focusout', handleFocusOut, true);
        node.addEventListener('keydown', handleKeyDown, true);
        restoreFocusNode = node.ownerDocument.activeElement as HTMLElement;
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
    const disconnect = async (force = false) => {
        if (!connected) {
            return;
        }

        const { restore = true, beforeExit, onExit } = options;
        if (!force && beforeExit && (await beforeExit()) === false) {
            return;
        }

        connected = false;

        restoreAttribute(node, 'tabindex', tabIndex);
        node.removeEventListener('focusin', handleFocusIn, true);
        node.removeEventListener('focusout', handleFocusOut, true);
        node.removeEventListener('keydown', handleKeyDown, true);

        if (restoreTreeState) {
            restoreTreeState();
            restoreTreeState = null;
        }
        if (restoreFocusNode && restore) {
            restoreFocusNode.focus();
        }
        if (startHelper) {
            startHelper.tabIndex = -1;
        }
        if (endHelper) {
            endHelper.tabIndex = -1;
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

    const handleFocusOut = (event: FocusEvent) => {
        const relatedTarget = event.relatedTarget as HTMLElement | null;
        if (relatedTarget && node.contains(relatedTarget)) {
            return;
        }
        restoreFocusNode = null;
        currentNode = null;
        disconnect();
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
            case 'Tab': {
                const focusable = manager.findFocusable();
                if (currentNode) {
                    if (currentNode === node) {
                        event.preventDefault();
                        if (event.shiftKey) {
                            manager.focusLast();
                        } else {
                            manager.focusFirst();
                        }
                    } else {
                        const io = focusable.indexOf(currentNode);
                        if (event.shiftKey && io === 0) {
                            event.preventDefault();
                            manager.focusLast();
                        } else if (
                            !event.shiftKey &&
                            io === focusable.length - 1
                        ) {
                            event.preventDefault();
                            manager.focusFirst();
                        }
                    }
                }
                break;
            }
        }
    };

    return {
        get connected() {
            return connected;
        },
        connect,
        disconnect,
        startHelper,
        endHelper,
    };
}
