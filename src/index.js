import { Factory } from '@chialab/proteins';

/**
 * Default focusable selectors.
 */
const SELECTORS = [
    'button',
    'input',
    'select',
    'textarea',
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
 * @typedef {Object} ContextOptions
 * @property {string[]} ignore A list of selectors to ignore.
 */

/**
 * Loock context class.
 * @property {Loock} parent The Loock instance to bound.
 * @property {boolean} isActive The context state.
 */
export class Context extends Factory.Emitter {
    /**
     * Create a new context.
     * @param {HTMLElement} element The root element of the context.
     * @param {ContextOptions} options A set of options for the context.
     */
    constructor(element, options = {}, parent = null) {
        super();
        this.attach(parent);
        this.root = element;
        this.isActive = false;
        this.currentIndex = null;
        this.currentElement = null;
        this.ignore = options.ignore;
        this.lastKeydownTime = Date.now();

        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
        if (!element.hasAttribute('aria-label')) {
            // eslint-disable-next-line
            console.warn('created a Context without aria-label', this);
        }
    }

    /**
     * Returns focusable children elements.
     *
     * @return {Array<HTMLElement>} focusable children of root element.
     */
    findFocusableChildren() {
        const elements = [...this.root.querySelectorAll(
            SELECTORS.map((selector) => `${selector}:not([tabindex="-1"]):not([disabled]):not([aria-hidden]):not([display=none])`).join(', ')
        )];
        const ignore = this.ignore ? [...this.root.querySelectorAll(this.ignore)] : [];

        return elements
            .filter((elem) => {
                const rect = elem.getBoundingClientRect();
                return rect.height && rect.width;
            })
            .filter((elem) => !ignore.some((area) => elem === area || area.contains(elem)));
    }

    /**
     * Active previous focusable element.
     *
     * @return {void}
     */
    prev() {
        let children = this.findFocusableChildren();
        if (!children.length) {
            this.restore();
            return;
        }
        let io = children.indexOf(this.currentElement);
        if (io === 0) {
            io = children.length - 1;
        } else if (io !== -1) {
            io = io - 1;
        } else {
            io = Math.min(children.length - 1, this.currentIndex || 0);
        }
        this.currentIndex = io;
        this.currentElement = children[io];
        this.currentElement.focus();
    }

    /**
     * Active next focusable element.
     *
     * @return {void}
     */
    next() {
        let children = this.findFocusableChildren();
        if (!children.length) {
            this.restore();
            return;
        }
        let io = children.indexOf(this.currentElement);
        if (io === children.length - 1) {
            io = 0;
        } else if (io !== -1) {
            io = io + 1;
        } else {
            io = Math.min(children.length - 1, this.currentIndex || 0);
        }
        this.currentIndex = io;
        this.currentElement = children[io];
        this.currentElement.focus();
    }

    /**
     * Entering the context.
     *
     * @return {void}
     */
    enter() {
        if (this.isActive) {
            return;
        }
        this.isActive = true;
        this.trigger('enter', this);
        this.restore();
    }

    /**
     * Restore the focus on the last element.
     * @return {void}
     */
    restore() {
        if (this.currentElement) {
            this.currentElement.focus();
        } else {
            this.root.focus();
        }
    }

    /**
     * Exit from the context.
     *
     * @return {void}
     */
    exit() {
        if (!this.isActive) {
            return;
        }
        this.isActive = false;
        this.currentIndex = null;
        this.currentElement = null;
        this.trigger('exit', this);
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
        if (this.parent) {
            if (context.isActive) {
                context.close();
            }
            this.parent.removeContext(this);
            this.parent = null;
        }
    }
}

/**
 * A manager for Loock contexts.
 */
export class Loock {
    /**
     * Create a new Loock instance.
     * @param {EventTarget} root
     */
    constructor(root = window) {
        this.contexts = [];
        this.actives = [];
        this.onContextEntered = this.onContextEntered.bind(this);
        this.onContextExited = this.onContextExited.bind(this);
        root.addEventListener('keydown', (event) => {
            if (!this.activeContext) {
                return;
            }
            if (event.key == ESC_KEY.key || event.key == ESC_KEY.altKey) {
                event.preventDefault();
                this.activeContext.exit();
            }
            if (event.keyCode == TAB_KEY.keyCode) {
                event.preventDefault();
                // prevent compulsively key holding down in all browsers.
                if ((Date.now() - this.lastKeydownTime) < TIME_BETWEEN_KEYDOWNS) {
                    return;
                }
                this.lastKeydownTime = Date.now();
                let elements = this.activeContext.findFocusableChildren();
                if (elements.length === 0) {
                    this.activeContext.exit();
                    return;
                }
                if (event.shiftKey) {
                    this.activeContext.prev();
                } else {
                    this.activeContext.next();
                }
            }
        });

        root.addEventListener('focusin', ({ target }) => {
            let context = this.contexts.find(({ root }) => root === target);
            if (context && !context.isActive) {
                context.enter();
                return;
            }
            if (!this.activeContext) {
                return;
            }
            if (target === this.activeContext.root) {
                this.activeContext.currentElement = null;
                return;
            }
            const elements = this.activeContext.findFocusableChildren();
            if (elements.indexOf(target) !== -1) {
                this.activeContext.currentElement = target;
            }
        });
    }

    /**
     * Flag the active context.
     * @private
     * @param {Context} context The context to flag.
     */
    onContextEntered(context) {
        this._activeElement = this._activeElement || this.root.document.activeElement;
        this.activeContext = context;
        this.actives.push(context);
    }

    /**
     * Unflag the active context.
     * @private
     * @param {Context} context The context to unflag.
     */
    onContextExited(context) {
        let isActiveContext = context === this.activeContext;
        let io = this.actives.indexOf(context);
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

        if (this.defaultContext) {
            this.defaultContext.enter();
            return;
        }

        if (this._activeElement) {
            this._activeElement.focus();
            delete this._activeElement;
        }
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
        this.defaultContext.enter();
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
        let context = new Context(element, options);
        this.addContext(context);
        return context;
    }

    /**
     * Handle a context.
     * @param {Context} context The context to handle.
     */
    addContext(context) {
        let io = this.contexts.indexOf(context);
        if (io !== -1) {
            return;
        }
        this.contexts.push(context);
        context.attach(this);
        context.on('enter', this.onContextEntered);
        context.on('exit', this.onContextExited);
    }

    /**
     * Unhandle a context.
     * @param {Context} context The context to remove.
     */
    removeContext(context) {
        let io = this.contexts.indexOf(context);
        if (io === -1) {
            return;
        }
        context.detach();
        this.contexts.splice(io, 1);
    }
}
