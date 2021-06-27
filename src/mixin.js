import { Context } from './Context.js';
import { windowManager } from './Manager.js';

/**
 * Enable focus trap context for components.
 * @param {import('@chialab/dna').ComponentConstructor<HTMLElement>} superClass The base component class.
 * @param {import('./Context.js').ContextOptions} [options] Focus trap options.
 * @return An extended constructor.
 */
export const focusTrapMixin = (superClass, options) => class FocusTrapElement extends superClass {
    static get listeners() {
        return {
            'focusenter'() {
                this.onFocusEnter();
            },
            'focusexit'() {
                this.onFocusExit();
            },
        };
    }

    /**
     * The keyboard navigation context.
     * @readonly
     */
    context = new Context(this, {
        dismiss: this.onFocusDismiss.bind(this),
        ...options,
    });

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
    onFocusEnter() {}

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
