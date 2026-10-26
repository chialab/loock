import { DEFAULT_IGNORE_SELECTORS, DEFAULT_SELECTORS } from './constants';

export interface FocusManagerOptions {
    /**
     * Get the active focused element.
     */
    getActiveElement?: () => HTMLElement | null;
    /**
     * Focus the specified node.
     */
    focusNode?: (node: HTMLElement, options?: FocusOptions) => void;
    /**
     * Blur the specified node.
     */
    blurNode?: (node: HTMLElement) => void;
    /**
     * The focusable elements.
     */
    elements?: HTMLElement[] | (() => HTMLElement[]);
    /**
     * The selectors for focusable nodes.
     */
    include?: string[];
    /**
     * The selectors for ignored nodes.
     */
    exclude?: string[];
}

/**
 * The focus manager interface.
 */
export interface FocusManager {
    getActiveElement(): HTMLElement | null;
    focusNode(node: HTMLElement, options?: FocusOptions): void;
    blurNode(node: HTMLElement): void;
    findFocusable(): HTMLElement[];
    focusFirst(): void;
    focusLast(): void;
}

function isFocusableElement(element: HTMLElement) {
    if (!element.isConnected) {
        return false;
    }
    const { width, height } = element.getBoundingClientRect();
    return !!height && !!width;
}

/**
 * Find all focusable elements by options.
 * @param node The target node.
 * @param options The options.
 */
function findFocusableByOptions(
    node: HTMLElement,
    options: {
        elements?: HTMLElement[] | (() => HTMLElement[]);
        include?: string[];
        exclude?: string[];
    }
) {
    const { include, exclude, elements } = options;
    if (!elements) {
        return findFocusableChildren(node, include, exclude);
    }

    if (typeof elements === 'function') {
        return elements().filter(isFocusableElement);
    }

    return elements.filter(isFocusableElement);
}

/**
 * Find all focusable children of a node.
 * @param node The target node.
 * @param include The selectors to include.
 * @param exclude The selectors to exclude.
 * @returns The focusable children list.
 */
function findFocusableChildren(
    node: Element,
    include: string[] = DEFAULT_SELECTORS,
    exclude: string[] = DEFAULT_IGNORE_SELECTORS
) {
    return (
        Array.from(node.querySelectorAll(include.join(', '))) as HTMLElement[]
    ).filter((element) => {
        if (exclude.some((selector) => element.matches(selector))) {
            return false;
        }

        if (
            element.tagName === 'INPUT' &&
            (element as HTMLInputElement).type === 'radio'
        ) {
            const name = (element as HTMLInputElement).name;
            const inputs = node.querySelectorAll(
                `input[type="radio"][name="${name}"]`
            );
            const checked = Array.from(inputs).find(
                (input) => (input as HTMLInputElement).checked
            );
            if (checked) {
                if (checked !== element) {
                    return false;
                }
            } else if (element !== inputs[0]) {
                return false;
            }
        }

        return isFocusableElement(element);
    });
}

/**
 * Create a focus manager.
 * @param node The target node.
 * @param options The options.
 * @returns The focus manager.
 */
export function focusManager(
    node: HTMLElement,
    options: FocusManagerOptions = {}
): FocusManager {
    const getActiveElement =
        options.getActiveElement ??
        (() => node.ownerDocument.activeElement as HTMLElement | null);
    const focusNode =
        options.focusNode ??
        ((node: HTMLElement, options?: FocusOptions) => node.focus(options));
    const blurNode = options.blurNode ?? ((node: HTMLElement) => node.blur());

    return {
        getActiveElement,
        focusNode,
        blurNode,
        findFocusable() {
            return findFocusableByOptions(node, options);
        },
        focusFirst() {
            const firstElement = this.findFocusable().shift();
            if (firstElement) {
                focusNode(firstElement);
            }
        },
        focusLast() {
            const lastElement = this.findFocusable().pop();
            if (lastElement) {
                focusNode(lastElement);
            }
        },
    };
}
