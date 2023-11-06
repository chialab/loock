import { expect, wait } from '@chialab/ginsenghino';
import { Manager } from '@chialab/loock';
import userEvent from '@testing-library/user-event';

describe('Loock Tests', function () {
    this.timeout(10 * 1000);

    let manager;
    beforeEach(() => {
        document.body.innerHTML = `<div aria-label="section" name="alphabet" class="loock alphabet">
                <button name="buttonA">A</button>
                <button name="buttonB">B</button>
                <button name="buttonC">C</button>
            </div>
            <div aria-label="section" name="numeric" class="loock numeric">
                <button name="button1">1</button>
                <button name="button2">2</button>
                <button name="button3">3</button>
            </div>`;

        document.body.setAttribute('aria-label', 'main');
        manager = new Manager();
        manager.createDefaultContext(document.body);
    });

    afterEach(async () => {
        // reset all 3 levels of contexts so tests can start in a clean way.
        await userEvent.keyboard('{Esc}');
        await userEvent.keyboard('{Esc}');
        await userEvent.keyboard('{Esc}');
        manager.destroy();
    });

    it('should initially focus on default context', () => {
        expect(document.activeElement).to.equal(document.body);
    });

    it('should navigate within default context', async () => {
        await userEvent.keyboard('{Esc}');
        expect(document.activeElement).to.equal(document.body);
    });

    it('should navigate within context', async () => {
        const alphabetDiv = document.querySelector('.alphabet');
        manager.createContext(alphabetDiv);

        await wait(250);
        await userEvent.tab();
        expect(document.activeElement).to.equal(alphabetDiv);
        await wait(250);
        await userEvent.tab();
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonA"]'));
        await wait(250);
        await userEvent.tab();
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonB"]'));
        await wait(250);
        await userEvent.tab();
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonC"]'));
        await wait(250);
        await userEvent.tab();
        expect(document.activeElement).to.equal(document.querySelector('button[name="buttonA"]'));
        await userEvent.keyboard('{Esc}');
        expect(document.activeElement).to.equal(alphabetDiv);
    });
});
