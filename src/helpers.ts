/**
 * Restore old attribute value or remove it if the new value is null.
 * @param node The element to update.
 * @param name The attribute name.
 * @param value The attribute value.
 */
export function restoreAttribute(
    node: HTMLElement,
    name: string,
    value: string | null
) {
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
export function inertTree(
    node: HTMLElement,
    until: HTMLElement = document.documentElement
): () => void {
    const parentNode = node.parentNode as HTMLElement;
    if (!parentNode) {
        return () => {};
    }

    let restore =
        until !== parentNode ? inertTree(parentNode, until) : () => {};

    const children = /** @type {HTMLElement[]} */ Array.from(
        parentNode.children
    );
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
