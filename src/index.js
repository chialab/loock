/**
 * Restore old attribute value or remove it if the new value is null.
 * @param {HTMLElement} node The element to update.
 * @param {string} name The attribute name.
 * @param {string|null} value The attribute value.
 */
function restoreAttribute(node, name, value) {
    if (value === null) {
        node.removeAttribute(name);
    } else {
        node.setAttribute(name, value);
    }
}

/**
 * Inert node ancestors up to the root node.
 * @param {HTMLElement} node The node to start from.
 * @param {HTMLElement} until The root node.
 * @returns {() => void} A list of functions to restore the original state.
 */
function inertTree(node, until = document.documentElement) {
    const parentNode = /** @type {HTMLElement} */ (node.parentNode);
    if (!parentNode) {
        return () => {};
    }

    let restore = until !== parentNode ? inertTree(parentNode, until) : () => {};

    const children = /** @type {HTMLElement[]} */ (Array.from(parentNode.children));
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
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
 * @param {Document} doc The document to create the span in.
 * @returns {HTMLElement} The focus trap helper span.
 */
function createTrapHelper(doc) {
    const span = doc.createElement('span');
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

/**
 * @typedef {Object} FocusTrapImpl
 * @property {boolean} [useShadowDOM] Whether to use Shadow DOM.
 * @property {HTMLElement} [startHelper] The trap start element to use instead of creating one.
 * @property {HTMLElement} [endHelper] The trap end element to use instead of creating one
 */

/**
 * @typedef {Object} FocusContextOptions
 * @property {string[]} [include] The selectors to use to find focusable elements.
 * @property {string[]} [exclude] The selectors to use to ignore focusable elements.
 * @property {boolean} [inert] Whether to inert the other elements of the page.
 * @property {boolean} [restore] Whether to restore focus to the previous element.
 * @property {boolean} [trap] Whether to trap the focus.
 * @property {FocusTrapImpl} [trapImpl] The focus trap implementation configuration.
 * @property {boolean} [focusContainer] Whether to focus the container when entering the focus context.
 * @property {(context: FocusContext) => void|Promise<void>} [onEnter] A function that is called when the focus context is entered.
 * @property {(context: FocusContext) => void|Promise<void>} [onExit] A function that is called when the focus context is exited.
 * @property {(context: FocusContext) => boolean|void|Promise<boolean|void>} [beforeExit] A function that is called before the focus context is exited.
 */

/**
 * A Focus Context.
 */
export class FocusContext {
    /**
     * The root node of the focus context.
     * @type {HTMLElement}
     */
    #node;

    /**
     * Whether the focus context is active.
     */
    #active = false;

    /**
     * The focus context options.
     * @type {FocusContextOptions}
     */
    #options = {};

    /**
     * A function that restores tree status.
     * @type {(() => void)|null}
     */
    #restoreTreeState = null;

    /**
     * The node to restore focus to.
     * @type {HTMLElement|null}
     */
    #restoreFocusNode = null;

    /**
     * The currently focused node.
     * @type {HTMLElement|null}
     */
    #currentNode = null;

    /**
     * The start of the focus trap.
     * @type {HTMLElement|null}
     */
    #trapStart = null;

    /**
     * The end of the focus trap.
     * @type {HTMLElement|null}
     */
    #trapEnd = null;

    /**
     * Create a new focus context.
     * @param {HTMLElement} node The root node of the focus context.
     * @param {FocusContextOptions} [options] The focus context options.
     */
    constructor(node, options = {}) {
        this.#node = node;
        this.#options = options;

        const { focusContainer = false, trap = true, trapImpl = {} } = options;
        const { useShadowDOM = true, startHelper = null, endHelper = null } = trapImpl;
        if (focusContainer && !node.getAttribute('tabindex')) {
            node.setAttribute('tabindex', '0');
        }
        if (trap) {
            const document = node.ownerDocument;
            this.#trapStart = startHelper || createTrapHelper(document);
            this.#trapStart.addEventListener(
                'focus',
                (event) => {
                    event.stopImmediatePropagation();
                    event.stopPropagation();
                    event.preventDefault();

                    if (this.#currentNode === node) {
                        this.focusFirst();
                    } else if (focusContainer) {
                        this.#currentNode = node;
                        node.focus();
                    } else {
                        this.focusLast();
                    }
                },
                true
            );

            this.#trapEnd = endHelper || createTrapHelper(document);
            this.#trapEnd.addEventListener(
                'focus',
                (event) => {
                    event.stopImmediatePropagation();
                    event.stopPropagation();
                    event.preventDefault();

                    if (this.#currentNode === node) {
                        this.focusLast();
                    } else if (focusContainer) {
                        this.#currentNode = node;
                        node.focus();
                    } else {
                        this.focusFirst();
                    }
                },
                true
            );

            let root = /** @type {HTMLElement|DocumentFragment} */ (node);
            if (useShadowDOM) {
                if (node.shadowRoot) {
                    root = node.shadowRoot;
                } else {
                    root = node.attachShadow({ mode: 'open' });
                    root.append(document.createElement('slot'));
                }
            }
            if (root.firstChild !== this.#trapStart) {
                root.prepend(this.#trapStart);
            }
            if (root.lastChild !== this.#trapEnd) {
                root.append(this.#trapEnd);
            }
        }
    }

    /**
     * The root node of the focus context.
     */
    get node() {
        return this.#node;
    }

    /**
     * Whether the focus context is active.
     */
    get active() {
        return this.#active;
    }

    /**
     * Enter the focus context.
     */
    async enter() {
        if (this.active) {
            throw new Error('Focus context is already active');
        }
        this.#active = true;

        const { node } = this;
        const { inert = false, focusContainer = false, onEnter } = this.#options;

        // MUST use the `focusin` event because it fires after the bound `focus` on trap helpers
        node.addEventListener('focusin', this.#handleFocusin, true);
        node.addEventListener('keydown', this.#handleKeyDown, true);
        if (this.#trapStart) {
            this.#trapStart.tabIndex = 0;
        }
        if (this.#trapEnd) {
            this.#trapEnd.tabIndex = 0;
        }
        this.#restoreFocusNode = /** @type {HTMLElement} */ (document.activeElement);
        if (node.contains(this.#restoreFocusNode)) {
            this.#restoreFocusNode = node;
        } else if (focusContainer) {
            node.focus();
        } else {
            this.focusFirst();
        }
        if (inert) {
            this.#restoreTreeState = inertTree(node, node.ownerDocument.body);
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
        const { restore = true, beforeExit, onExit } = this.#options;
        if (!force && beforeExit && (await beforeExit(this)) === false) {
            return;
        }
        this.#active = false;

        node.removeEventListener('focusin', this.#handleFocusin, true);
        node.removeEventListener('keydown', this.#handleKeyDown, true);

        if (this.#restoreTreeState) {
            this.#restoreTreeState();
            this.#restoreTreeState = null;
        }
        if (this.#restoreFocusNode && restore) {
            this.#restoreFocusNode.focus();
        }
        if (this.#trapStart) {
            this.#trapStart.tabIndex = -1;
        }
        if (this.#trapEnd) {
            this.#trapEnd.tabIndex = -1;
        }
        this.#restoreFocusNode = null;

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
     * @returns {HTMLElement[]} The focusable children.
     */
    findFocusableChildren() {
        const { include = DEFAULT_SELECTORS, exclude = DEFAULT_IGNORE_SELECTORS } = this.#options;

        return /** @type {HTMLElement[]} */ (Array.from(this.node.querySelectorAll(include.join(', '))))
            .filter((element) => !exclude.some((selector) => element.matches(selector)))
            .filter((element) => {
                const { width, height } = element.getBoundingClientRect();

                return !!height && !!width;
            });
    }

    /**
     * Handle focusin events.
     * @param {FocusEvent} event The focusin event.
     */
    #handleFocusin = (event) => {
        this.#currentNode = /** @type {HTMLElement} */ (event.target);
    };

    /**
     * Handle keydown events.
     * @param {KeyboardEvent} event The keydown event.
     */
    #handleKeyDown = (event) => {
        const { trap = false } = this.#options;
        switch (event.key) {
            case 'Esc':
            case 'Escape':
                event.preventDefault();
                this.exit();
                break;
            case 'Tab':
                if (trap && this.#currentNode === this.node) {
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
