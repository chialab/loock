import { dispatchAsyncEvent } from '@chialab/dna';

/**
 * Default focusable selectors.
 */
export const DEFAULT_SELECTORS = [
    'button',
    'input',
    'select',
    'textarea',
    '[contenteditable=""]',
    '[contenteditable="true"]',
    'a[href]',
    '[tabindex]',
    'summary',
];

/**
 * Default ignore selectors.
 */
export const DEFAULT_IGNORE_SELECTORS = [
    'details:not([open]) *:not(summary)',
];

/**
 * Private symbol to store the context of an element.
 */
const SYM = typeof Symbol !== 'undefined' ? Symbol('loock') : '__look_symbol__';

/**
 * @typedef {(context: Context) => boolean|Promise<boolean>} DismissFunction
 */

/**
 * @typedef {Object} ContextOptions
 * @property {boolean} [initialize] Self initialize the context.
 * @property {string|string[]} [selectors] A list of focusable selectors.
 * @property {string|string[]} [ignore] A list of selectors to ignore.
 * @property {boolean|DismissFunction} [dismiss] A dismiss rule for the context.
 * @property {boolean} [disabled] Disabled state of the context.
 */

/**
 * Store the context of the element.
 * @param {HTMLElement} element The root element of the context.
 * @param {Context} context The context.
 */
export function setContext(element, context) {
    element[SYM] = context;
}

/**
 * Get the context of the element.
 * @param {HTMLElement} element The root element of the context.
 * @returns {Context} The context of the element.
 */
export function getContext(element) {
    return element[SYM];
}

/**
 * Loock context class.
 * @property {Loock} parent The Loock instance to bound.
 * @property {boolean} isActive The context state.
 */
export class Context {
    /**
     * Active state of the context.
     */
    get active() {
        return this._active;
    }

    /**
     * Disabled state of the context.
     */
    get disabled() {
        return this._disabled || !this.element.isConnected;
    }

    /**
     * Create a new context.
     * @param {HTMLElement} element The root element of the context.
     * @param {ContextOptions} options A set of options for the context.
     * @param {import('./Manager.js').Manager} [parent] A set of options for the context.
     */
    constructor(element, options = {}, parent) {
        this.element = element;
        setContext(element, this);

        /**
         * @protected
         */
        this.focusableSelectors = DEFAULT_SELECTORS;

        /**
         * @protected
         */
        this.ignoredSelectors = DEFAULT_IGNORE_SELECTORS;

        /**
         * @protected
         * @type {boolean|DismissFunction}
         */
        this.dismiss = true;

        /**
         * @protected
         */
        this.parent = parent;

        /**
         * @private
         */
        this._active = false;

        /**
         * @private
         */
        this._currentElement = null;

        /**
         * @private
         */
        this._lastKeydownTime = Date.now();

        /**
         * @private
         */
        this._tabIndex = element.getAttribute('tabindex') || '0';

        if (options.selectors) {
            this.setFocusableSelectors(options.selectors);
        }
        if (options.ignore) {
            this.setIgnoredSelectors(options.ignore);
        }
        if (options.dismiss != null) {
            this.setDismiss(options.dismiss);
        }

        /**
         * @private
         */
        this.onClick = (event) => {
            if (this.disabled) {
                return;
            }
            const elements = this.findFocusableChildren();
            const activeElement = /** @type {HTMLElement} */ (this.parent.root.document.activeElement);
            if (activeElement && elements.indexOf(activeElement) !== -1) {
                return;
            }
            let target = event.target;
            while (element.contains(target) || target === element) {
                if (elements.indexOf(target) !== -1) {
                    target.focus();
                    break;
                }
                if (target === element) {
                    element.focus();
                    break;
                }
                target = target.parentNode;
            }
        };

        if (options.initialize !== false) {
            if (options.disabled) {
                this.disable();
            } else {
                this.enable();
            }
        }
    }

    /**
     * Set focusable selectors.
     * @param {string|string[]} selectors The selectors to set.
     */
    setFocusableSelectors(selectors) {
        if (Array.isArray(selectors)) {
            this.focusableSelectors = selectors;
        } else if (typeof selectors === 'string' && selectors) {
            this.focusableSelectors = selectors.split(',');
        } else {
            throw new Error('invalid selectors list');
        }
    }

    /**
     * Set selectors for elements to ignore.
     * @param {string|string[]} selectors The selectors to ignore,
     */
    setIgnoredSelectors(selectors) {
        if (Array.isArray(selectors)) {
            this.ignoredSelectors = selectors;
        } else if (typeof selectors === 'string' && selectors) {
            this.ignoredSelectors = selectors.split(',');
        } else {
            throw new Error('invalid selectors list');
        }
    }

    /**
     * Returns focusable children elements.
     *
     * @returns {HTMLElement[]} focusable children of root element.
     */
    findFocusableChildren() {
        const focusable = this.element.querySelectorAll(
            this.focusableSelectors.map((selector) => `${selector}:not([type=hidden]):not([tabindex="-1"]):not([disabled]):not([aria-hidden]):not([display=none])`).join(', ')
        );
        const elements = [].slice.call(focusable);
        const ignore = this.ignoredSelectors.length ? [].slice.call(this.element.querySelectorAll(this.ignoredSelectors.join(','))) : [];

        return elements
            .filter((elem) => !ignore.some((area) => elem === area || area.contains(elem)))
            .filter((elem) => {
                const { width, height } = elem.getBoundingClientRect();
                return !!height && !!width;
            });
    }

    /**
     *
     * @param {boolean|DismissFunction} dismiss
     */
    setDismiss(dismiss) {
        this.dismiss = dismiss;
    }

    /**
     * Active previous focusable element.
     *
     * @returns {void}
     */
    prev() {
        if (this.disabled) {
            return;
        }
        const children = this.findFocusableChildren();
        if (!children.length) {
            this.restore();
            return;
        }
        let io = children.indexOf(this._currentElement);
        if (io === 0) {
            io = children.length - 1;
        } else if (io !== -1) {
            io = io - 1;
        } else {
            io = children.length - 1;
        }
        this.setCurrentElement(children[io]);
    }

    /**
     * Active next focusable element.
     *
     * @returns {void}
     */
    next() {
        if (this.disabled) {
            return;
        }
        const children = this.findFocusableChildren();
        if (!children.length) {
            this.restore();
            return;
        }
        let io = children.indexOf(this._currentElement);
        if (io === children.length - 1) {
            io = 0;
        } else if (io !== -1) {
            io = io + 1;
        } else {
            io = 0;
        }
        this.setCurrentElement(children[io]);
    }

    /**
     * Entering the context.
     * @param {HTMLElement} [target] The target element to focus.
     * @returns {Promise<void>}
     */
    async enter(target) {
        if (this.disabled || this.active) {
            return;
        }
        const element = this.element;
        this._active = true;
        if (!element.hasAttribute('aria-label') &&
            !element.hasAttribute('aria-labelledby') &&
            !element.hasAttribute('aria-describedby')) {
            // eslint-disable-next-line
            console.warn('created a Context without aria-label', this);
        }
        await dispatchAsyncEvent(element, 'focusenter', this);
        if (element.contains(target)) {
            this.setCurrentElement(target, false);
        }
        this.restore();
    }

    /**
     * Restore the focus on the last element.
     * @returns {void}
     */
    restore() {
        if (this.disabled) {
            return;
        }
        if (this._currentElement) {
            this._currentElement.focus();
        } else {
            this.element.focus();
        }
    }

    /**
     * Exit from the context.
     *
     * @returns {Promise<boolean>}
     */
    async exit() {
        if (this.disabled) {
            return false;
        }
        if (!this.active) {
            return false;
        }
        if (this.dismiss === false) {
            return false;
        }
        if (typeof this.dismiss === 'function') {
            const result = await this.dismiss(this);
            if (result === false) {
                return false;
            }
        }
        await this.forceExit();
        return true;
    }

    /**
     * Force exit from the context.
     *
     * @returns {Promise<void>}
     */
    async forceExit() {
        if (this.disabled) {
            return;
        }
        this._active = false;
        this.unsetCurrentElement(false);
        await dispatchAsyncEvent(this.element, 'focusexit', this);
    }

    /**
     * Set the current element of the context.
     * @param {HTMLElement} element
     * @param {boolean} focus Should focus the element.
     */
    setCurrentElement(element, focus = true) {
        this._currentElement = element;
        if (focus) {
            element.focus();
        }
    }

    /**
     * Unset the current element of the context.
     * @param {boolean} restore Should restore focus to container element.
     */
    unsetCurrentElement(restore = true) {
        this._currentElement = null;
        if (restore) {
            this.restore();
        }
    }

    /**
     * Check if the context has a focused child.
     *
     * @returns {boolean}
     */
    hasCurrentElement() {
        return this._currentElement !== null;
    }

    /**
     * Attach the context to a Loock instance.
     * @param {import('./Manager.js').Manager} parent The parent loock instance.
     */
    attach(parent) {
        if (this.parent && this.parent !== parent) {
            this.detach();
        }
        this.parent = parent;
    }

    /**
     * Detach the context from the current Loock instance.
     */
    detach() {
        this.forceExit();
        this.parent.removeContext(this);
        this.parent = null;
    }

    /**
     * Enable the context that has been disabled.
     */
    enable() {
        if (this._disabled === false) {
            return;
        }

        this._disabled = false;
        this.element.setAttribute('tabindex', this._tabIndex);
        this.element.addEventListener('click', this.onClick);
    }

    /**
     * Disable the context.
     */
    disable() {
        if (this._disabled) {
            return;
        }

        this.forceExit();
        this._disabled = true;
        this.element.setAttribute('tabindex', '-1');
        this.element.removeEventListener('click', this.onClick);
    }
}
