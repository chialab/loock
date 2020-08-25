export function fireKey(context, key) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const callback = () => {
                context.removeEventListener('keydown', callback);
                setTimeout(() => resolve());
            };
            context.addEventListener('keydown', callback);

            const e = new Event('keydown');
            e.key = key.key;
            e.keyCode = key.keyCode;
            e.which = key.keyCode;
            e.altKey = false;
            e.ctrlKey = true;
            e.shiftKey = false;
            e.metaKey = false;
            e.bubbles = true;
            context.dispatchEvent(e);
        }, 250);
    });
}
