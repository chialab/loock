/**
 * Restore old attribute value or remove it if the new value is null.
 * @param node The element to update.
 * @param name The attribute name.
 * @param value The attribute value.
 */
function restoreAttribute(node: HTMLElement, name: string, value: string | null) {
    if (value === null) {
        node.removeAttribute(name);
    } else {
        node.setAttribute(name, value);
    }
}

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

/**
 * Default focusable selectors.
 */
export const DEFAULT_SELECTORS = [
    'a[href]',
    'area[href]',
    'button',
    'input',
    'select',
    'textarea',
    'video[controls]',
    'audio[controls]',
    'embed',
    'iframe',
    'summary',
    '[contenteditable]',
    '[tabindex]',
];

/**
 * Default ignore selectors.
 */
export const DEFAULT_IGNORE_SELECTORS = [
    '[tabindex="-1"]',
    '[disabled]',
    '[hidden]',
    '[aria-hidden="true"]',
    '[aria-disabled="true"]',
    '[inert]',
    'details:not([open]) *:not(summary)',
];

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

export interface FocusContextOptions {
    /**
     * The selectors to use to find focusable elements.
     */
    include?: string[];
    /**
     * The selectors to use to ignore focusable elements.
     */
    exclude?: string[];
    /**
     * Whether to inert the other elements of the page.
     */
    inert?: boolean;
    /**
     * Whether to restore focus to the previous element.
     */
    restore?: boolean;
    /**
     * Whether to trap the focus.
     */
    trap?: boolean;
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
    onEnter?: (context: FocusContext) => void | Promise<void>;
    /**
     * A function that is called when the focus context is exited.
     */
    onExit?: (context: FocusContext) => void | Promise<void>;
    /**
     * A function that is called before the focus context is exited.
     */
    beforeExit?: (context: FocusContext) => boolean | void | Promise<boolean | void>;
}

/**
 * A Focus Context.
 */
export class FocusContext {
    /**
     * The root node of the focus context.
     */
    private _node: HTMLElement;

    /**
     * Whether the focus context is active.
     */
    private _active = false;

    /**
     * The focus context options.
     */
    private _options: FocusContextOptions = {};

    /**
     * A function that restores tree status.
     */
    private _restoreTreeState: (() => void) | null = null;

    /**
     * The node to restore focus to.
     */
    private _restoreFocusNode: HTMLElement | null = null;

    /**
     * The currently focused node.
     */
    private _currentNode: HTMLElement | null = null;

    /**
     * The start of the focus trap.
     */
    private _trapStart: HTMLElement | null = null;

    /**
     * The end of the focus trap.
     */
    private _trapEnd: HTMLElement | null = null;

    /**
     * Create a new focus context.
     * @param node The root node of the focus context.
     * @param options The focus context options.
     */
    constructor(node: HTMLElement, options: FocusContextOptions = {}) {
        this._node = node;
        this._options = options;

        const { focusContainer = false, trap = true, trapImpl = {} } = options;
        const { useShadowDOM = true, startHelper = null, endHelper = null } = trapImpl;
        if (focusContainer && !node.getAttribute('tabindex')) {
            node.setAttribute('tabindex', '0');
        }
        if (trap) {
            const document = node.ownerDocument;
            this._trapStart = startHelper || createTrapHelper(document);
            this._trapStart.addEventListener(
                'focus',
                (event) => {
                    event.stopImmediatePropagation();
                    event.stopPropagation();
                    event.preventDefault();

                    if (this._currentNode === node) {
                        this.focusFirst();
                    } else if (focusContainer) {
                        this._currentNode = node;
                        node.focus();
                    } else {
                        this.focusLast();
                    }
                },
                true
            );

            this._trapEnd = endHelper || createTrapHelper(document);
            this._trapEnd.addEventListener(
                'focus',
                (event) => {
                    event.stopImmediatePropagation();
                    event.stopPropagation();
                    event.preventDefault();

                    if (this._currentNode === node) {
                        this.focusLast();
                    } else if (focusContainer) {
                        this._currentNode = node;
                        node.focus();
                    } else {
                        this.focusFirst();
                    }
                },
                true
            );

            let root: HTMLElement | DocumentFragment = node;
            if (useShadowDOM) {
                if (node.shadowRoot) {
                    root = node.shadowRoot;
                } else {
                    root = node.attachShadow({ mode: 'closed' });
                    root.append(document.createElement('slot'));
                }
            }
            if (root.firstChild !== this._trapStart) {
                root.prepend(this._trapStart);
            }
            if (root.lastChild !== this._trapEnd) {
                root.append(this._trapEnd);
            }
        }
    }

    /**
     * The root node of the focus context.
     */
    get node() {
        return this._node;
    }

    /**
     * Whether the focus context is active.
     */
    get active() {
        return this._active;
    }

    /**
     * Enter the focus context.
     */
    async enter() {
        if (this.active) {
            throw new Error('Focus context is already active');
        }
        this._active = true;

        const { node } = this;
        const { inert = false, focusContainer = false, onEnter } = this._options;

        // MUST use the `focusin` event because it fires after the bound `focus` on trap helpers
        node.addEventListener('focusin', this.#handleFocusin, true);
        node.addEventListener('keydown', this.#handleKeyDown, true);
        if (this._trapStart) {
            this._trapStart.tabIndex = 0;
        }
        if (this._trapEnd) {
            this._trapEnd.tabIndex = 0;
        }
        this._restoreFocusNode = document.activeElement as HTMLElement;
        if (node.contains(this._restoreFocusNode) && this._restoreFocusNode !== node) {
            this._restoreFocusNode = node;
        } else if (focusContainer) {
            node.focus();
        } else {
            this.focusFirst();
        }
        if (inert) {
            this._restoreTreeState = inertTree(node, node.ownerDocument.body);
        }

        if (onEnter) {
            await onEnter(this);
        }
        node.dispatchEvent(new CustomEvent('focusenter', { detail: this }));
    }

    /**
     * Leave the focus context.
     * @param {boolean} force Whether to force exit.
     */
    async exit(force = false) {
        if (!this.active) {
            throw new Error('Focus context is not active');
        }

        const { node } = this;
        const { restore = true, beforeExit, onExit } = this._options;
        if (!force && beforeExit && (await beforeExit(this)) === false) {
            return;
        }
        this._active = false;

        node.removeEventListener('focusin', this.#handleFocusin, true);
        node.removeEventListener('keydown', this.#handleKeyDown, true);

        if (this._restoreTreeState) {
            this._restoreTreeState();
            this._restoreTreeState = null;
        }
        if (this._restoreFocusNode && restore) {
            this._restoreFocusNode.focus();
        }
        if (this._trapStart) {
            this._trapStart.tabIndex = -1;
        }
        if (this._trapEnd) {
            this._trapEnd.tabIndex = -1;
        }
        this._restoreFocusNode = null;

        if (onExit) {
            await onExit(this);
        }
        node.dispatchEvent(new CustomEvent('focusexit', { detail: this }));
    }

    /**
     * Focus the first focusable child.
     */
    focusFirst() {
        this.findFocusableChildren().shift()?.focus();
    }

    /**
     * Focus the last focusable child.
     */
    focusLast() {
        this.findFocusableChildren().pop()?.focus();
    }

    /**
     * Find all focusable children.
     * @returns The focusable children.
     */
    findFocusableChildren() {
        const { include = DEFAULT_SELECTORS, exclude = DEFAULT_IGNORE_SELECTORS } = this._options;

        return (Array.from(this.node.querySelectorAll(include.join(', '))) as HTMLElement[]).filter((element) => {
            if (exclude.some((selector) => element.matches(selector))) {
                return false;
            }

            if (element.tagName === 'INPUT' && (element as HTMLInputElement).type === 'radio') {
                const name = (element as HTMLInputElement).name;
                const inputs = this.node.querySelectorAll(`input[type="radio"][name="${name}"]`);
                const checked = Array.from(inputs).find((input) => (input as HTMLInputElement).checked);
                if (checked) {
                    if (checked !== element) {
                        return false;
                    }
                } else if (element !== inputs[0]) {
                    return false;
                }
            }

            const { width, height } = element.getBoundingClientRect();
            return !!height && !!width;
        });
    }

    /**
     * Handle focusin events.
     * @param event The focusin event.
     */
    #handleFocusin = (event: FocusEvent) => {
        this._currentNode = event.target as HTMLElement;
    };

    /**
     * Handle keydown events.
     * @param event The keydown event.
     */
    #handleKeyDown = (event: KeyboardEvent) => {
        const { trap = true } = this._options;
        switch (event.key) {
            case 'Esc':
            case 'Escape':
                event.preventDefault();
                this.exit();
                break;
            case 'Tab':
                if (trap && this._currentNode === this.node) {
                    event.preventDefault();

                    if (event.shiftKey) {
                        this.focusLast();
                    } else {
                        this.focusFirst();
                    }
                }
                break;
        }
    };
}
