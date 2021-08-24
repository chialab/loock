import { Context } from './Context.js';
import { windowManager } from './Manager.js';

/**
 * @typedef {{ context: Context; onFocusEnter(): void; onFocusExit(): void; onFocusDismiss(): ReturnType<import('./Context.js').DismissFunction> }} FocusTrapMixin
 */

/**
 * Enable focus trap context for components.
 * @template {import('@chialab/dna').ComponentInstance} T
 * @param {import('@chialab/dna').ComponentConstructor<T>} superClass The base component class.
 * @param {import('./Context.js').ContextOptions} [options] Focus trap options.
 * @return An extended constructor.
 */
export const focusTrapMixin = (superClass, options) => {
    const FocusTrapElement = class FocusTrapElement extends (/** @type {import('@chialab/dna').ComponentConstructor} */ (superClass)) {
        /**
         * @inheritdoc
         */
        constructor(...args) {
            super(...args);
            /**
             * The keyboard navigation context.
             * @readonly
             */
            this.context = new Context(this, {
                dismiss: this.onFocusDismiss.bind(this),
                ...options,
            });
            this.addEventListener('focusenter', this.onFocusEnter);
            this.addEventListener('focusexit', this.onFocusExit);
        }

        /**
         * @inheritdoc
         */
        connectedCallback() {
            super.disconnectedCallback();
            windowManager.addContext(this.context);
        }

        /**
         * @inheritdoc
         */
        disconnectedCallback() {
            super.disconnectedCallback();
            windowManager.removeContext(this.context);
        }

        /**
         * Callback invoked on focus enter.
         */
        onFocusEnter() { }

        /**
         * Callback invoked on focus exit.
         */
        onFocusExit() { }

        /**
         * Callback invoked on focus dismiss.
         * @return {ReturnType<import('./Context.js').DismissFunction>}
         */
        onFocusDismiss() {
            return true;
        }
    };

    return /** @type {import('@chialab/dna').ComponentConstructor<T & FocusTrapMixin>} */ (/** @type {unknown} */(FocusTrapElement));
};
