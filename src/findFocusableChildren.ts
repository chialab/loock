import { DEFAULT_IGNORE_SELECTORS, DEFAULT_SELECTORS } from './constants';

/**
 * Find all focusable children of a node.
 * @param node The target node.
 * @param include The selectors to include.
 * @param exclude The selectors to exclude.
 * @returns The focusable children list.
 */
export function findFocusableChildren(
    node: Element,
    include: string[] = DEFAULT_SELECTORS,
    exclude: string[] = DEFAULT_IGNORE_SELECTORS
) {
    return (Array.from(node.querySelectorAll(include.join(', '))) as HTMLElement[]).filter((element) => {
        if (exclude.some((selector) => element.matches(selector))) {
            return false;
        }

        if (element.tagName === 'INPUT' && (element as HTMLInputElement).type === 'radio') {
            const name = (element as HTMLInputElement).name;
            const inputs = node.querySelectorAll(`input[type="radio"][name="${name}"]`);
            const checked = Array.from(inputs).find((input) => (input as HTMLInputElement).checked);
            if (checked) {
                if (checked !== element) {
                    return false;
                }
            } else if (element !== inputs[0]) {
                return false;
            }
        }

        const { width, height } = element.getBoundingClientRect();
        return !!height && !!width;
    });
}
