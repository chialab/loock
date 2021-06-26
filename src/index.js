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
    'details',
];

/**
 * Interval between keydown triggers.
 */
const TIME_BETWEEN_KEYDOWNS = 150;

/**
 * The tab key descriptor.
 */
export const TAB_KEY = {
    key: 'Tab',
    keyCode: '9',
};

/**
 * The esc key descriptor.
 */
export const ESC_KEY = {
    key: 'Escape',
    altKey: 'Esc',
    keyCode: '27',
};

/**
 * Private symbol to store the context of an element.
 */
const SYM = typeof Symbol !== 'undefined' ? Symbol('loock') : '__look_symbol__';

/**
 * @typedef {(context: Context) => boolean|Promise<boolean>} DismissFunction
 */

/**
 * @typedef {Object} ContextOptions
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
 * @return {Context} The context of the element.
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
     * @param {Loock} [parent] A set of options for the context.
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
        this.ignoredSelectors = [];

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

        if (options.disabled) {
            this.disable();
        } else {
            this.enable();
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
     * @return {Array<HTMLElement>} focusable children of root element.
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
     * @return {void}
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
     * @return {void}
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
     *
     * @return {Promise<void>}
     */
    async enter() {
        if (this.disabled) {
            return;
        }
        if (this.active) {
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
        this.restore();
    }

    /**
     * Restore the focus on the last element.
     * @return {void}
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
     * @return {Promise<boolean>}
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
     * @return {Promise<void>}
     */
    async forceExit() {
        if (this.disabled) {
            return;
        }
        this._active = false;
        this.unsetCurrentElement();
        await dispatchAsyncEvent(this.element, 'focusexit', this);
    }

    /**
     * Set the current element of the context.
     * @param {HTMLElement} element
     */
    setCurrentElement(element) {
        this._currentElement = element;
        element.focus();
    }

    /**
     * Unset the current element of the context.
     */
    unsetCurrentElement() {
        this._currentElement = null;
    }

    /**
     * Attach the context to a Loock instance.
     * @param {Loock} parent The parent loock instance.
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

/**
 * A manager for Loock contexts.
 */
export class Loock {
    /**
     * Create a new Loock instance.
     * @param {Window} root
     */
    constructor(root = window) {
        /**
         * @protected
         */
        this.root = root;

        /**
         * @protected
         * @type {Context[]}
         */
        this.contexts = [];

        /**
         * @protected
         * @type {Context[]}
         */
        this.actives = [];

        /**
         * @protected
         * @type {Context}
         */
        this.defaultContext = undefined;

        /**
         * @protected
         * @type {Context}
         */
        this.activeContext = undefined;

        /**
         * @private
         * @type {HTMLElement}
         */
        this._activeElement = undefined;

        /**
         * @private
         */
        this.onContextEntered = (event) => {
            const context = event.detail;
            this._activeElement = /** @type {HTMLElement} */ (this._activeElement || this.root.document.activeElement);
            this.activeContext = context;
            this.actives.push(context);
        };

        /**
         * @private
         */
        this.onContextExited = (event) => {
            const context = event.detail;
            const isActiveContext = context === this.activeContext;
            const io = this.actives.indexOf(context);
            this.actives.splice(io, 1);

            if (!isActiveContext) {
                return;
            }

            if (this.actives.length) {
                this.activeContext = this.actives[this.actives.length - 1];
                this.activeContext.restore();
                return;
            }

            delete this.activeContext;

            if (this.defaultContext && !this.defaultContext.disabled) {
                this.defaultContext.enter();
                return;
            }

            if (this._activeElement) {
                this._activeElement.focus();
                delete this._activeElement;
            }
        };

        /**
         * @private
         */
        this.onKeyDown = async (event) => {
            if (!this.activeContext) {
                return;
            }
            if (event.key == ESC_KEY.key || event.key == ESC_KEY.altKey) {
                event.preventDefault();
                const result = await this.activeContext.exit();
                if (!result) {
                    return;
                }
            }
            if (event.keyCode == TAB_KEY.keyCode) {
                event.preventDefault();
                // prevent compulsively key holding down in all browsers.
                if ((Date.now() - this._lastKeydownTime) < TIME_BETWEEN_KEYDOWNS) {
                    return;
                }
                this._lastKeydownTime = Date.now();
                const elements = this.activeContext.findFocusableChildren();
                if (elements.length === 0) {
                    const result = await this.activeContext.exit();
                    if (!result) {
                        return;
                    }
                }
                if (event.shiftKey) {
                    this.activeContext.prev();
                } else {
                    this.activeContext.next();
                }
            }
        };

        /**
         * @private
         */
        this.onFocusIn = ({ target }) => {
            const context = this.contexts.find(({ element }) => element === target);
            if (context && !context.active && !context.disabled) {
                context.enter();
                return;
            }

            if (!this.activeContext) {
                return;
            }
            if (target === this.activeContext.element) {
                this.activeContext.unsetCurrentElement();
                return;
            }
            const elements = this.activeContext.findFocusableChildren();
            if (elements.indexOf(target) !== -1) {
                this.activeContext.setCurrentElement(target);
            }
        };

        root.addEventListener('keydown', this.onKeyDown);
        root.addEventListener('focusin', this.onFocusIn);
    }

    /**
     * Create a default context.
     *
     * @param {HTMLElement} element The root of the default context.
     * @param {ContextOptions} options A set of options for the context.
     * @return {Context} New context
     */
    createDefaultContext(element, options = {}) {
        this.defaultContext = this.createContext(element, options);
        if (!this.defaultContext.disabled) {
            this.defaultContext.enter();
        }
        this.contexts.push(this.defaultContext);
        return this.defaultContext;
    }

    /**
     * Create a new context.
     *
     * @param {HTMLElement} element The root element of the context.
     * @param {ContextOptions} options A set of options for the context.
     * @return {Context} New context
     */
    createContext(element, options = {}) {
        const context = new Context(element, options);
        this.addContext(context);
        return context;
    }

    /**
     * Handle a context.
     * @param {Context} context The context to handle.
     */
    addContext(context) {
        const io = this.contexts.indexOf(context);
        if (io !== -1) {
            return;
        }
        this.contexts.push(context);
        context.attach(this);
        context.element.addEventListener('focusenter', this.onContextEntered);
        context.element.addEventListener('focusexit', this.onContextExited);
    }

    /**
     * Unhandle a context.
     * @param {Context} context The context to remove.
     */
    removeContext(context) {
        const io = this.contexts.indexOf(context);
        if (io === -1) {
            return;
        }
        context.disable();
        this.contexts.splice(io, 1);
    }

    /**
     * Destroy the Lock primary context.
     */
    destroy() {
        this.contexts.forEach((context) => {
            this.removeContext(context);
        });
        this.root.removeEventListener('keydown', this.onKeyDown);
        this.root.removeEventListener('focusin', this.onFocusIn);
    }
}
