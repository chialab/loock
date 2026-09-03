import { focusTrapBehavior } from '@chialab/loock';

const dialog = document.querySelector('#dialog') as HTMLDialogElement;
const openButton = document.querySelector('#open-dialog') as HTMLButtonElement;
const closeButton = document.querySelector(
    '#close-dialog'
) as HTMLButtonElement;

const trap = focusTrapBehavior(dialog, {
    inert: true,
    exitOnFocusOut: false,
    onExit: () => {
        dialog.close();
    },
});

openButton.addEventListener('click', () => {
    openButton.focus();
    dialog.showModal();
    trap.connect();
});

closeButton.addEventListener('click', () => {
    trap.disconnect();
});
