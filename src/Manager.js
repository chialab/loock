import { window } from '@chialab/dna';
import { Context } from './Context.js';
import { ESC_KEY, TAB_KEY } from './keys.js';

/**
 * Interval between keydown triggers.
 */
const TIME_BETWEEN_KEYDOWNS = 150;

/**
 * A manager for Loock contexts.
 */
export class Manager {
    /**
     * Create a new Loock instance.
     * @param {Window} root
     */
    constructor(root = window) {
        /**
         * @readonly
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
         * @type {WeakMap<Context, { onFocusEnter: (event: Event) => void; onFocusExit: (event: Event) => void; }>}
         */
        this._listeners = new WeakMap();

        /**
         * @private
         */
        this.onKeyDown = async (event) => {
            if (!this.activeContext) {
                return;
            }
            if (event.key == ESC_KEY.key || event.key == ESC_KEY.altKey) {
                if (this.activeContext === this.defaultContext) {
                    if (!this.activeContext.hasCurrentElement()) {
                        return;
                    }
                    this.activeContext.unsetCurrentElement();
                    return;
                }
                event.preventDefault();
                const result = await this.activeContext.exit();
                if (!result) {
                    return;
                }
            } else if (event.keyCode == TAB_KEY.keyCode) {
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
            const context = this.contexts
                .filter(({ element }) => element === target || element.contains(target))
                .sort(({ element: match1 }, { element: match2 }) => (match1.contains(match2) ? 1 : -1))[0];

            if (context && !context.active && !context.disabled) {
                context.enter(target);
                return;
            }

            if (!this.activeContext) {
                return;
            }
            if (target === this.activeContext.element) {
                this.activeContext.unsetCurrentElement(false);
                return;
            }
            const elements = this.activeContext.findFocusableChildren();
            if (elements.indexOf(target) !== -1) {
                this.activeContext.setCurrentElement(target);
            } else {
                this.activeContext.exit();
            }
        };

        root.addEventListener('keydown', this.onKeyDown);
        root.addEventListener('focusin', this.onFocusIn);
    }

    /**
     * Create a default context.
     *
     * @param {HTMLElement} element The root of the default context.
     * @param {import('./Context.js').ContextOptions} options A set of options for the context.
     * @returns {Context} New context
     */
    createDefaultContext(element, options = {}) {
        const context = this.defaultContext = this.createContext(element, options);
        if (!context.disabled) {
            context.enter();
        }
        return this.defaultContext;
    }

    /**
     * Create a new context.
     *
     * @param {HTMLElement} element The root element of the context.
     * @param {import('./Context.js').ContextOptions} options A set of options for the context.
     * @returns {Context} New context
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
        context.enable();
        this._listenContext(context);
    }

    /**
     * Listen context events.
     * @private
     * @param {Context} context The context to listen.
     */
    _listenContext(context) {
        const onFocusEnter = (event) => {
            if ((/** @type {CustomEvent} */ (event)).detail !== context) {
                return;
            }
            this._activeElement = /** @type {HTMLElement} */ (this._activeElement || this.root.document.activeElement);
            this.activeContext = context;
            this.actives.push(context);
        };

        const onFocusExit = (event) => {
            if ((/** @type {CustomEvent} */ (event)).detail !== context) {
                return;
            }

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

            if (this.defaultContext === this.activeContext) {
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

        this._listeners.set(context, {
            onFocusEnter,
            onFocusExit,
        });
        context.element.addEventListener('focusenter', onFocusEnter);
        context.element.addEventListener('focusexit', onFocusExit);
    }

    /**
     * Unlisten context events.
     * @private
     * @param {Context} context The context to unlisten.
     */
    _unlistenContext(context) {
        const listeners = this._listeners.get(context);
        if (listeners) {
            context.element.removeEventListener('focusenter', listeners.onFocusEnter);
            context.element.removeEventListener('focusexit', listeners.onFocusExit);
            this._listeners.delete(context);
        }
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
        this._unlistenContext(context);
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

/**
 * The window manager instance.
 */
export const windowManager = new Manager(window);
