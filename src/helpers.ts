/**
 * Restore old attribute value or remove it if the new value is null.
 * @param node The element to update.
 * @param name The attribute name.
 * @param value The attribute value.
 */
export function restoreAttribute(node: HTMLElement, name: string, value: string | null) {
    if (value === null) {
        node.removeAttribute(name);
    } else {
        node.setAttribute(name, value);
    }
}
