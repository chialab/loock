export const TAB_KEY = {
    key: 'Tab',
    keyCode: '9',
};
export const ESC_KEY = {
    key: 'Escape',
    keyCode: '27',
};

export async function fireKey(context, key) {
    return await new Promise((resolve) => {
        const callback = () => {
            // context.removeEventListener('keydown', callback);
            resolve();
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
    });
}
